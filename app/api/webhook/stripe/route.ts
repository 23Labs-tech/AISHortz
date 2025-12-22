// app/api/webhooks/stripe/route.ts

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Get metadata from session
      const userId = session.metadata?.user_id;
      const credits = parseInt(session.metadata?.credits || '0');
      const plan = session.metadata?.plan || 'free';
      const billingCycle = session.metadata?.billing_cycle || 'one-time';

      if (!userId || !credits) {
        console.error('Missing metadata in webhook');
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // Update user credits and plan using service role key
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      // 1. Get current balance
      const userResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=credit_balance,total_credits_purchased`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      });

      const users = await userResponse.json();
      const currentUser = users[0];

      if (!currentUser) {
        console.error('User not found:', userId);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const newBalance = (currentUser.credit_balance || 0) + credits;
      const newTotalPurchased = (currentUser.total_credits_purchased || 0) + credits;

      // 2. Update user
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          credit_balance: newBalance,
          total_credits_purchased: newTotalPurchased,
          plan_type: plan,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        }),
      });

      if (!updateResponse.ok) {
        console.error('Failed to update user');
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
      }

      // 3. Create transaction record
      await fetch(`${supabaseUrl}/rest/v1/credit_transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          user_id: userId,
          transaction_type: 'purchase',
          amount: credits,
          balance_after: newBalance,
          description: `Purchased ${credits} credits - ${plan} plan (${billingCycle})`,
          metadata: {
            stripe_session_id: session.id,
            plan: plan,
            billing_cycle: billingCycle,
          },
        }),
      });

      console.log(`✅ Credits updated for user ${userId}: +${credits} credits`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id;

      if (userId) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString(),
          }),
        });

        console.log(`❌ Subscription cancelled for user ${userId}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}