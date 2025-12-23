// // // // // // // // app/api/verify-payment/route.ts   ← ONLY THIS FILE, EXACT PATH

// // // // // // // import { NextRequest, NextResponse } from 'next/server';
// // // // // // // import Stripe from 'stripe';
// // // // // // // import { createClient } from '@supabase/supabase-js';

// // // // // // // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
// // // // // // //   apiVersion: '2023-10-16',
// // // // // // // });

// // // // // // // const supabaseAdmin = createClient(
// // // // // // //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
// // // // // // //   process.env.SUPABASE_SERVICE_ROLE_KEY!,
// // // // // // //   {
// // // // // // //     auth: {
// // // // // // //       autoRefreshToken: false,
// // // // // // //       persistSession: false,
// // // // // // //     },
// // // // // // //   }
// // // // // // // );

// // // // // // // export async function POST(request: NextRequest) {
// // // // // // //   try {
// // // // // // //     const { session_id } = await request.json();

// // // // // // //     if (!session_id) {
// // // // // // //       return NextResponse.json({ error: 'No session ID' }, { status: 400 });
// // // // // // //     }

// // // // // // //     console.log('Verifying payment for session:', session_id);

// // // // // // //     const session = await stripe.checkout.sessions.retrieve(session_id);

// // // // // // //     if (session.payment_status !== 'paid') {
// // // // // // //       return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
// // // // // // //     }

// // // // // // //     const userId = session.client_reference_id;
// // // // // // //     if (!userId) {
// // // // // // //       return NextResponse.json({ error: 'No user ID' }, { status: 400 });
// // // // // // //     }

// // // // // // //     // Get credits from metadata (we send this from checkout)
// // // // // // //     const creditsToAdd = Number(session.metadata?.credits || 0);

// // // // // // //     if (!creditsToAdd || creditsToAdd <= 0) {
// // // // // // //       console.error('No credits in metadata:', session.metadata);
// // // // // // //       return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 });
// // // // // // //     }

// // // // // // //     // Get current user credits
// // // // // // //     const { data: user, error: fetchError } = await supabaseAdmin
// // // // // // //       .from('users')
// // // // // // //       .select('credits')
// // // // // // //       .eq('id', userId)
// // // // // // //       .single();

// // // // // // //     let newBalance: number;

// // // // // // //     if (fetchError || !user) {
// // // // // // //       // Create user with initial credits
// // // // // // //       const { error: insertError } = await supabaseAdmin
// // // // // // //         .from('users')
// // // // // // //         .insert({
// // // // // // //           id: userId,
// // // // // // //           credits: creditsToAdd,
// // // // // // //           email: session.customer_email || undefined,
// // // // // // //         });

// // // // // // //       if (insertError) throw insertError;
// // // // // // //       newBalance = creditsToAdd;
// // // // // // //     } else {
// // // // // // //       newBalance = (user.credits || 0) + creditsToAdd;

// // // // // // //       const { error: updateError } = await supabaseAdmin
// // // // // // //         .from('users')
// // // // // // //         .update({ credits: newBalance })
// // // // // // //         .eq('id', userId);

// // // // // // //       if (updateError) throw updateError;
// // // // // // //     }

// // // // // // //     console.log(`Added ${creditsToAdd} credits → New balance: ${newBalance}`);

// // // // // // //     return NextResponse.json({
// // // // // // //       success: true,
// // // // // // //       new_balance: newBalance,
// // // // // // //       credits_added: creditsToAdd,
// // // // // // //     });

// // // // // // //   } catch (error: any) {
// // // // // // //     console.error('Verify payment failed:', error);
// // // // // // //     return NextResponse.json(
// // // // // // //       { error: error.message || 'Server error' },
// // // // // // //       { status: 500 }
// // // // // // //     );
// // // // // // //   }
// // // // // // // }

// // // // // // // app/api/verify-payment/route.ts  

// // // // // // import { NextRequest, NextResponse } from 'next/server';
// // // // // // import Stripe from 'stripe';
// // // // // // import { createClient } from '@supabase/supabase-js';

// // // // // // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
// // // // // //   apiVersion: '2023-10-16',
// // // // // // });

// // // // // // const supabase = createClient(
// // // // // //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
// // // // // //   process.env.SUPABASE_SERVICE_ROLE_KEY!,
// // // // // //   {
// // // // // //     auth: {
// // // // // //       autoRefreshToken: false,
// // // // // //       persistSession: false,
// // // // // //     },
// // // // // //   }
// // // // // // );

// // // // // // export async function POST(request: NextRequest) {
// // // // // //   try {
// // // // // //     const { session_id } = await request.json();
// // // // // //     if (!session_id) {
// // // // // //       return NextResponse.json({ error: 'No session ID' }, { status: 400 });
// // // // // //     }

// // // // // //     const session = await stripe.checkout.sessions.retrieve(session_id);
// // // // // //     if (session.payment_status !== 'paid') {
// // // // // //       return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
// // // // // //     }

// // // // // //     const userId = session.client_reference_id;
// // // // // //     if (!userId) {
// // // // // //       return NextResponse.json({ error: 'No user ID' }, { status: 400 });
// // // // // //     }

// // // // // //     const creditsToAdd = Number(session.metadata?.credits || 0);
// // // // // //     if (!creditsToAdd || creditsToAdd <= 0) {
// // // // // //       return NextResponse.json({ error: 'No credits in metadata' }, { status: 400 });
// // // // // //     }

// // // // // //     console.log(`Adding ${creditsToAdd} credits to user ${userId}`);

// // // // // //     // USE YOUR OWN FUNCTION — THIS IS THE KEY!
// // // // // //     const { data, error } = await supabase.rpc('add_credit_transaction', {
// // // // // //       p_user_id: userId,
// // // // // //       p_transaction_type: 'purchase',
// // // // // //       p_amount: creditsToAdd,
// // // // // //       p_description: `Purchased ${session.metadata?.plan_name || 'Plan'} via Stripe`,
// // // // // //       p_metadata: {
// // // // // //         stripe_session_id: session_id,
// // // // // //         plan_id: session.metadata?.plan_id,
// // // // // //       },
// // // // // //     });

// // // // // //     if (error) {
// // // // // //       console.error('add_credit_transaction error:', error);
// // // // // //       return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
// // // // // //     }

// // // // // //     console.log('Credits added successfully via function!');

// // // // // //     return NextResponse.json({
// // // // // //       success: true,
// // // // // //       new_balance: data, // This returns the transaction ID, but we don't need balance here
// // // // // //       credits_added: creditsToAdd,
// // // // // //     });

// // // // // //   } catch (error: any) {
// // // // // //     console.error('Verify payment error:', error);
// // // // // //     return NextResponse.json(
// // // // // //       { error: error.message || 'Server error' },
// // // // // //       { status: 500 }
// // // // // //     );
// // // // // //   }
// // // // // // }

// // // // // // app/api/verify-payment/route.ts
// // // // // import { NextRequest, NextResponse } from 'next/server';
// // // // // import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// // // // // import { cookies } from 'next/headers';
// // // // // import Stripe from 'stripe';

// // // // // // Use the latest stable Stripe version that works with current TypeScript
// // // // // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
// // // // //   apiVersion: '2024-06-20', // ← Fixed: valid & supported version
// // // // // });

// // // // // export async function POST(request: NextRequest) {
// // // // //   try {
// // // // //     const { session_id } = await request.json();

// // // // //     if (!session_id) {
// // // // //       return NextResponse.json(
// // // // //         { error: 'Missing session_id' },
// // // // //         { status: 400 }
// // // // //       );
// // // // //     }

// // // // //     // Verify Stripe Checkout Session
// // // // //     const session = await stripe.checkout.sessions.retrieve(session_id, {
// // // // //       expand: ['payment_intent'],
// // // // //     });

// // // // //     if (session.payment_status !== 'paid') {
// // // // //       return NextResponse.json(
// // // // //         { error: 'Payment not completed' },
// // // // //         { status: 400 }
// // // // //       );
// // // // //     }

// // // // //     const userId = session.client_reference_id;
// // // // //     if (!userId) {
// // // // //       return NextResponse.json(
// // // // //         { error: 'No user associated with this payment' },
// // // // //         { status: 400 }
// // // // //       );
// // // // //     }

// // // // //     const creditsToAdd = session.metadata?.credits
// // // // //       ? parseInt(session.metadata.credits, 10)
// // // // //       : 0;

// // // // //     if (creditsToAdd <= 0) {
// // // // //       return NextResponse.json(
// // // // //         { error: 'Invalid credit amount' },
// // // // //         { status: 400 }
// // // // //       );
// // // // //     }

// // // // //     // Correct Supabase client for App Router (Next.js 13+)
// // // // //     const supabase = createRouteHandlerClient({ cookies });

// // // // //     // This matches your CURRENT SQL function signature exactly:
// // // // //     // (p_user_id, p_transaction_type, p_amount, p_description, p_metadata)
// // // // //     const { data: transactionId, error } = await supabase.rpc('add_credit_transaction', {
// // // // //       p_user_id: userId,
// // // // //       p_transaction_type: 'purchase',
// // // // //       p_amount: creditsToAdd,
// // // // //       p_description: `Purchased ${creditsToAdd} credits via Stripe`,
// // // // //       p_metadata: {
// // // // //         stripe_session_id: session_id,
// // // // //         payment_intent: session.payment_intent?.id || null,
// // // // //         customer_email: session.customer_details?.email || null,
// // // // //       },
// // // // //     });

// // // // //     if (error) {
// // // // //       console.error('Supabase RPC error:', error);
// // // // //       return NextResponse.json(
// // // // //         { error: 'Failed to add credits', details: error.message },
// // // // //         { status: 500 }
// // // // //       );
// // // // //     }

// // // // //     // Get updated balance
// // // // //     const { data: userData } = await supabase
// // // // //       .from('users')
// // // // //       .select('credit_balance')
// // // // //       .eq('id', userId)
// // // // //       .single();

// // // // //     return NextResponse.json({
// // // // //       success: true,
// // // // //       new_balance: userData?.credit_balance ?? creditsToAdd,
// // // // //       credits_added: creditsToAdd,
// // // // //       transaction_id: transactionId, // UUID returned from your function
// // // // //     });

// // // // //   } catch (error: any) {
// // // // //     console.error('Verify payment error:', error);
// // // // //     return NextResponse.json(
// // // // //       { error: error.message || 'Internal server error' },
// // // // //       { status: 500 }
// // // // //     );
// // // // //   }
// // // // // }

// // // // // // Optional: Disable body parsing if using webhook-style calls
// // // // // export const config = {
// // // // //   api: {
// // // // //     bodyParser: true,
// // // // //   },
// // // // // };

// // // // // // app/api/verify-payment/route.ts
// // // // // import { NextRequest, NextResponse } from 'next/server';
// // // // // import { createServerClient } from '@supabase/ssr'; // ← Correct import for App Router
// // // // // import { cookies } from 'next/headers';
// // // // // import Stripe from 'stripe';

// // // // // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
// // // // //   apiVersion: '2024-06-20' as any,
// // // // // });

// // // // // // This line is REQUIRED in Next.js App Router
// // // // // export const dynamic = 'force-dynamic';

// // // // // export async function POST(request: NextRequest) {
// // // // //   // Correct way to create Supabase client in Route Handlers (Next.js 13+ App Router)
// // // // //   const supabase = createServerClient(
// // // // //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
// // // // //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
// // // // //     { cookies }
// // // // //   );

// // // // //   try {
// // // // //     const { session_id } = await request.json();

// // // // //     if (!session_id) {
// // // // //       return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
// // // // //     }

// // // // //     // Verify Stripe session
// // // // //     const session = await stripe.checkout.sessions.retrieve(session_id);

// // // // //     if (session.payment_status !== 'paid') {
// // // // //       return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
// // // // //     }

// // // // //     const userId = session.client_reference_id;
// // // // //     if (!userId) {
// // // // //       return NextResponse.json({ error: 'No user ID found' }, { status: 400 });
// // // // //     }

// // // // //     const creditsToAdd = Number(session.metadata?.credits || 0);
// // // // //     if (creditsToAdd <= 0) {
// // // // //       return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 });
// // // // //     }

// // // // //     // This matches your CURRENT SQL function exactly
// // // // //     const { data: transactionId, error } = await supabase.rpc('add_credit_transaction', {
// // // // //       p_user_id: userId,
// // // // //       p_transaction_type: 'purchase',
// // // // //       p_amount: creditsToAdd,
// // // // //       p_description: `Purchased ${creditsToAdd} credits via Stripe`,
// // // // //       p_metadata: { stripe_session_id: session_id },
// // // // //     });

// // // // //     if (error) {
// // // // //       console.error('Supabase RPC error:', error);
// // // // //       return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
// // // // //     }

// // // // //     // Get updated balance
// // // // //     const { data: user } = await supabase
// // // // //       .from('users')
// // // // //       .select('credit_balance')
// // // // //       .eq('id', userId)
// // // // //       .single();

// // // // //     return NextResponse.json({
// // // // //       success: true,
// // // // //       new_balance: user?.credit_balance || creditsToAdd,
// // // // //       credits_added: creditsToAdd,
// // // // //       transaction_id: transactionId,
// // // // //     });

// // // // //   } catch (err: any) {
// // // // //     console.error('Payment verification failed:', err);
// // // // //     return NextResponse.json(
// // // // //       { error: err.message || 'Server error' },
// // // // //       { status: 500 }
// // // // //     );
// // // // //   }
// // // // // }

// // // // // app/api/verify-payment/route.ts
// // // // // import { NextResponse } from 'next/server';
// // // // // import { createServerClient } from '@supabase/ssr';
// // // // // import { cookies } from 'next/headers';
// // // // // import Stripe from 'stripe';

// // // // // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
// // // // //   apiVersion: '2024-06-20' as any,
// // // // // });

// // // // // export const dynamic = 'force-dynamic';

// // // // // export async function POST(request: Request) {
// // // // //   const cookieStore = cookies();

// // // // //   const supabase = createServerClient(
// // // // //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
// // // // //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
// // // // //     {
// // // // //       cookies: {
// // // // //         getAll() {
// // // // //           return cookieStore.getAll();
// // // // //         },
// // // // //         setAll(cookiesToSet) {
// // // // //           cookiesToSet.forEach(({ name, value, options }) => {
// // // // //             try {
// // // // //               cookieStore.set(name, value, options);
// // // // //             } catch {
// // // // //               // Safe to ignore
// // // // //             }
// // // // //           });
// // // // //         },
// // // // //       },
// // // // //     }
// // // // //   );

// // // // // // app/api/verify-payment/route.ts
// // // // // import { NextResponse } from 'next/server';
// // // // // import { createServerClient } from '@supabase/ssr';
// // // // // import { cookies } from 'next/headers';
// // // // // import Stripe from 'stripe';

// // // // // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
// // // // //   apiVersion: '2024-06-20' as any,
// // // // // });

// // // // // export const dynamic = 'force-dynamic';

// // // // // export async function POST(request: Request) {
// // // // //   const cookieStore = await cookies(); // ← THIS LINE WAS MISSING

// // // // //   const supabase = createServerClient(
// // // // //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
// // // // //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
// // // // //     {
// // // // //       cookies: {
// // // // //         getAll() { return cookieStore.getAll(); },
// // // // //         setAll(cookiesToSet) {
// // // // //           cookiesToSet.forEach(({ name, value, options }) => {
// // // // //             try { cookieStore.set(name, value, options); } catch {}
// // // // //           });
// // // // //         },
// // // // //       },
// // // // //     }
// // // // //   );

// // // // //   try {
// // // // //     const { session_id } = await request.json();

// // // // //     if (!session_id) {
// // // // //       return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
// // // // //     }

// // // // //     const session = await stripe.checkout.sessions.retrieve(session_id);

// // // // //     if (session.payment_status !== 'paid') {
// // // // //       return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
// // // // //     }

// // // // //     const userId = session.client_reference_id;
// // // // //     if (!userId) {
// // // // //       return NextResponse.json({ error: 'No user ID' }, { status: 400 });
// // // // //     }

// // // // //     const creditsToAdd = Number(session.metadata?.credits || 0);
// // // // //     if (creditsToAdd <= 0) {
// // // // //       return NextResponse.json({ error: 'Invalid credits' }, { status: 400 });
// // // // //     }

// // // // //     const { data: transactionId, error } = await supabase.rpc('add_credit_transaction', {
// // // // //       p_user_id: userId,
// // // // //       p_transaction_type: 'purchase',
// // // // //       p_amount: creditsToAdd,
// // // // //       p_description: `Purchased ${creditsToAdd} credits`,
// // // // //       p_metadata: { stripe_session_id: session_id },
// // // // //     });

// // // // //     if (error) {
// // // // //       console.error('Supabase RPC error:', error);
// // // // //       return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
// // // // //     }

// // // // //     const { data: user } = await supabase
// // // // //       .from('users')
// // // // //       .select('credit_balance')
// // // // //       .eq('id', userId)
// // // // //       .single();

// // // // //     return NextResponse.json({
// // // // //       success: true,
// // // // //       new_balance: user?.credit_balance || creditsToAdd,
// // // // //       credits_added: creditsToAdd,
// // // // //       transaction_id: transactionId,
// // // // //     });

// // // // //   } catch (err: any) {
// // // // //     console.error('Verify payment error:', err);
// // // // //     return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
// // // // //   }
// // // // // }

// // // // // app/api/verify-payment/route.ts
// // // // import { NextResponse } from 'next/server';
// // // // import { createServerClient } from '@supabase/ssr';
// // // // import { cookies } from 'next/headers';
// // // // import Stripe from 'stripe';

// // // // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
// // // //   apiVersion: '2024-06-20' as any,
// // // // });

// // // // export const dynamic = 'force-dynamic';

// // // // export async function POST(request: Request) {
// // // //   const cookieStore = await cookies();

// // // //   const supabase = createServerClient(
// // // //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
// // // //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
// // // //     {
// // // //       cookies: {
// // // //         getAll() { return cookieStore.getAll(); },
// // // //         setAll(cookiesToSet) {
// // // //           cookiesToSet.forEach(({ name, value, options }) => {
// // // //             try { cookieStore.set(name, value, options); } catch {}
// // // //           });
// // // //         },
// // // //       },
// // // //     }
// // // //   );

// // // //   try {
// // // //     const { session_id } = await request.json();

// // // //     if (!session_id) {
// // // //       return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
// // // //     }

// // // //     // Verify Stripe payment
// // // //     const session = await stripe.checkout.sessions.retrieve(session_id);

// // // //     if (session.payment_status !== 'paid') {
// // // //       return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
// // // //     }

// // // //     const userId = session.client_reference_id;
// // // //     if (!userId) {
// // // //       return NextResponse.json({ error: 'No user ID' }, { status: 400 });
// // // //     }

// // // //     const creditsToAdd = Number(session.metadata?.credits || 0);
// // // //     if (creditsToAdd <= 0) {
// // // //       return NextResponse.json({ error: 'Invalid credits' }, { status: 400 });
// // // //     }

// // // //     // === DIRECT DATABASE OPERATIONS (NO RPC) ===
    
// // // //     // 1. Get current user balance
// // // //     const { data: currentUser, error: fetchError } = await supabase
// // // //       .from('users')
// // // //       .select('credit_balance, total_credits_purchased')
// // // //       .eq('id', userId)
// // // //       .single();

// // // //     if (fetchError || !currentUser) {
// // // //       console.error('Failed to fetch user:', fetchError);
// // // //       return NextResponse.json({ error: 'User not found' }, { status: 404 });
// // // //     }

// // // //     const currentBalance = currentUser.credit_balance || 0;
// // // //     const newBalance = currentBalance + creditsToAdd;

// // // //     // 2. Update user balance
// // // //     const { error: updateError } = await supabase
// // // //       .from('users')
// // // //       .update({
// // // //         credit_balance: newBalance,
// // // //         total_credits_purchased: (currentUser.total_credits_purchased || 0) + creditsToAdd,
// // // //         updated_at: new Date().toISOString(),
// // // //       })
// // // //       .eq('id', userId);

// // // //     if (updateError) {
// // // //       console.error('Failed to update user balance:', updateError);
// // // //       return NextResponse.json({ 
// // // //         error: 'Failed to update balance',
// // // //         details: updateError.message 
// // // //       }, { status: 500 });
// // // //     }

// // // //     // 3. Insert transaction record
// // // //     const { data: transaction, error: transactionError } = await supabase
// // // //       .from('credit_transactions')
// // // //       .insert({
// // // //         user_id: userId,
// // // //         transaction_type: 'purchase',
// // // //         amount: creditsToAdd,
// // // //         balance_after: newBalance,
// // // //         description: `Purchased ${creditsToAdd} credits`,
// // // //         metadata: { stripe_session_id: session_id },
// // // //       })
// // // //       .select('id')
// // // //       .single();

// // // //     if (transactionError) {
// // // //       console.error('Failed to insert transaction:', transactionError);
// // // //       // Balance was updated, so we still return success
// // // //       // but log the transaction insert failure
// // // //     }

// // // //     return NextResponse.json({
// // // //       success: true,
// // // //       new_balance: newBalance,
// // // //       credits_added: creditsToAdd,
// // // //       transaction_id: transaction?.id || null,
// // // //     });

// // // //   } catch (err: any) {
// // // //     console.error('Verify payment error:', err);
// // // //     return NextResponse.json({ 
// // // //       error: err.message || 'Server error' 
// // // //     }, { status: 500 });
// // // //   }
// // // // }

// // // // app/api/verify-payment/route.ts
// // // import { NextResponse } from 'next/server';
// // // import { createServerClient } from '@supabase/ssr';
// // // import { cookies } from 'next/headers';
// // // import Stripe from 'stripe';

// // // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
// // //   apiVersion: '2024-06-20' as any,
// // // });

// // // export const dynamic = 'force-dynamic';

// // // export async function POST(request: Request) {
// // //   const cookieStore = await cookies();

// // //   // Use Service Role Key for admin operations (bypasses RLS)
// // //   const supabase = createServerClient(
// // //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
// // //     process.env.SUPABASE_SERVICE_ROLE_KEY!,
// // //     {
// // //       cookies: {
// // //         getAll() { return cookieStore.getAll(); },
// // //         setAll(cookiesToSet) {
// // //           cookiesToSet.forEach(({ name, value, options }) => {
// // //             try { cookieStore.set(name, value, options); } catch {}
// // //           });
// // //         },
// // //       },
// // //     }
// // //   );

// // //   try {
// // //     const { session_id } = await request.json();

// // //     if (!session_id) {
// // //       return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
// // //     }

// // //     // Verify Stripe payment
// // //     const session = await stripe.checkout.sessions.retrieve(session_id);

// // //     if (session.payment_status !== 'paid') {
// // //       return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
// // //     }

// // //     const userId = session.client_reference_id;
// // //     if (!userId) {
// // //       return NextResponse.json({ error: 'No user ID' }, { status: 400 });
// // //     }

// // //     const creditsToAdd = Number(session.metadata?.credits || 0);
// // //     if (creditsToAdd <= 0) {
// // //       return NextResponse.json({ error: 'Invalid credits' }, { status: 400 });
// // //     }

// // //     // === DIRECT DATABASE OPERATIONS (NO RPC) ===
    
// // //     // 1. First, ensure user exists in public.users table
// // //     let currentUser = null;
    
// // //     // Try to get existing user
// // //     const { data: existingUser, error: fetchError } = await supabase
// // //       .from('users')
// // //       .select('credit_balance, total_credits_purchased, email')
// // //       .eq('id', userId)
// // //       .single();

// // //     if (fetchError && fetchError.code !== 'PGRST116') {
// // //       // PGRST116 means no rows found, which is fine
// // //       console.error('Error fetching user:', fetchError);
// // //       return NextResponse.json({ error: 'Database error' }, { status: 500 });
// // //     }

// // //     if (!existingUser) {
// // //       // User doesn't exist in public.users, so create them
// // //       console.log('User not found in public.users, creating profile...');
      
// // //       // Get user email from Stripe session
// // //       const userEmail = session.customer_details?.email || session.customer_email;
      
// // //       if (!userEmail) {
// // //         return NextResponse.json({ 
// // //           error: 'Cannot create user profile without email' 
// // //         }, { status: 400 });
// // //       }

// // //       const { data: newUser, error: createError } = await supabase
// // //         .from('users')
// // //         .insert({
// // //           id: userId,
// // //           email: userEmail,
// // //           credit_balance: 0, // Start with 0, we'll add credits next
// // //           total_credits_purchased: 0,
// // //         })
// // //         .select('credit_balance, total_credits_purchased, email')
// // //         .single();

// // //       if (createError) {
// // //         console.error('Failed to create user profile:', createError);
// // //         return NextResponse.json({ 
// // //           error: 'Failed to create user profile',
// // //           details: createError.message 
// // //         }, { status: 500 });
// // //       }

// // //       currentUser = newUser;
// // //       console.log('User profile created successfully');
// // //     } else {
// // //       currentUser = existingUser;
// // //     }

// // //     const currentBalance = currentUser.credit_balance || 0;
// // //     const newBalance = currentBalance + creditsToAdd;

// // //     // 2. Update user balance
// // //     const { error: updateError } = await supabase
// // //       .from('users')
// // //       .update({
// // //         credit_balance: newBalance,
// // //         total_credits_purchased: (currentUser.total_credits_purchased || 0) + creditsToAdd,
// // //         updated_at: new Date().toISOString(),
// // //       })
// // //       .eq('id', userId);

// // //     if (updateError) {
// // //       console.error('Failed to update user balance:', updateError);
// // //       return NextResponse.json({ 
// // //         error: 'Failed to update balance',
// // //         details: updateError.message 
// // //       }, { status: 500 });
// // //     }

// // //     // 3. Insert transaction record
// // //     const { data: transaction, error: transactionError } = await supabase
// // //       .from('credit_transactions')
// // //       .insert({
// // //         user_id: userId,
// // //         transaction_type: 'purchase',
// // //         amount: creditsToAdd,
// // //         balance_after: newBalance,
// // //         description: `Purchased ${creditsToAdd} credits`,
// // //         metadata: { stripe_session_id: session_id },
// // //       })
// // //       .select('id')
// // //       .single();

// // //     if (transactionError) {
// // //       console.error('Failed to insert transaction:', transactionError);
// // //       // Balance was updated, so we still return success
// // //       // but log the transaction insert failure
// // //     }

// // //     return NextResponse.json({
// // //       success: true,
// // //       new_balance: newBalance,
// // //       credits_added: creditsToAdd,
// // //       transaction_id: transaction?.id || null,
// // //     });

// // //   } catch (err: any) {
// // //     console.error('Verify payment error:', err);
// // //     return NextResponse.json({ 
// // //       error: err.message || 'Server error' 
// // //     }, { status: 500 });
// // //   }
// // // }

// // // app/api/verify-payment/route.ts
// // import { NextResponse } from 'next/server';
// // import Stripe from 'stripe';

// // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
// //   apiVersion: '2024-06-20' as any,
// // });

// // export const dynamic = 'force-dynamic';

// // // Helper function to execute raw SQL
// // async function executeSQL(query: string, params: any[] = []) {
// //   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// //   const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
// //   const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
// //     method: 'POST',
// //     headers: {
// //       'Content-Type': 'application/json',
// //       'apikey': serviceKey,
// //       'Authorization': `Bearer ${serviceKey}`,
// //     },
// //     body: JSON.stringify({ query, params }),
// //   });

// //   if (!response.ok) {
// //     const error = await response.text();
// //     throw new Error(`SQL execution failed: ${error}`);
// //   }

// //   return response.json();
// // }

// // export async function POST(request: Request) {
// //   try {
// //     const { session_id } = await request.json();

// //     if (!session_id) {
// //       return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
// //     }

// //     // Verify Stripe payment
// //     const session = await stripe.checkout.sessions.retrieve(session_id);

// //     if (session.payment_status !== 'paid') {
// //       return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
// //     }

// //     const userId = session.client_reference_id;
// //     if (!userId) {
// //       return NextResponse.json({ error: 'No user ID' }, { status: 400 });
// //     }

// //     const creditsToAdd = Number(session.metadata?.credits || 0);
// //     if (creditsToAdd <= 0) {
// //       return NextResponse.json({ error: 'Invalid credits' }, { status: 400 });
// //     }

// //     const userEmail = session.customer_details?.email || session.customer_email || '';

// //     // === USE DIRECT POSTGRES CONNECTION ===
// //     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// //     const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// //     // 1. Upsert user (create if doesn't exist, get if exists)
// //     const upsertUserResponse = await fetch(`${supabaseUrl}/rest/v1/users?on_conflict=id`, {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json',
// //         'apikey': serviceKey,
// //         'Authorization': `Bearer ${serviceKey}`,
// //         'Prefer': 'resolution=merge-duplicates,return=representation',
// //       },
// //       body: JSON.stringify({
// //         id: userId,
// //         email: userEmail,
// //         credit_balance: 0,
// //         total_credits_purchased: 0,
// //       }),
// //     });

// //     if (!upsertUserResponse.ok) {
// //       const errorText = await upsertUserResponse.text();
// //       console.error('Upsert user failed:', errorText);
// //       return NextResponse.json({ 
// //         error: 'Failed to create/get user',
// //         details: errorText 
// //       }, { status: 500 });
// //     }

// //     const userData = await upsertUserResponse.json();
// //     const currentUser = Array.isArray(userData) ? userData[0] : userData;

// //     const currentBalance = currentUser.credit_balance || 0;
// //     const newBalance = currentBalance + creditsToAdd;
// //     const newTotalPurchased = (currentUser.total_credits_purchased || 0) + creditsToAdd;

// //     // 2. Update user balance
// //     const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
// //       method: 'PATCH',
// //       headers: {
// //         'Content-Type': 'application/json',
// //         'apikey': serviceKey,
// //         'Authorization': `Bearer ${serviceKey}`,
// //       },
// //       body: JSON.stringify({
// //         credit_balance: newBalance,
// //         total_credits_purchased: newTotalPurchased,
// //         updated_at: new Date().toISOString(),
// //       }),
// //     });

// //     if (!updateResponse.ok) {
// //       const errorText = await updateResponse.text();
// //       console.error('Update balance failed:', errorText);
// //       return NextResponse.json({ 
// //         error: 'Failed to update balance',
// //         details: errorText 
// //       }, { status: 500 });
// //     }

// //     // 3. Insert transaction record
// //     const transactionResponse = await fetch(`${supabaseUrl}/rest/v1/credit_transactions`, {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json',
// //         'apikey': serviceKey,
// //         'Authorization': `Bearer ${serviceKey}`,
// //         'Prefer': 'return=representation',
// //       },
// //       body: JSON.stringify({
// //         user_id: userId,
// //         transaction_type: 'purchase',
// //         amount: creditsToAdd,
// //         balance_after: newBalance,
// //         description: `Purchased ${creditsToAdd} credits`,
// //         metadata: { stripe_session_id: session_id },
// //       }),
// //     });

// //     let transactionId = null;
// //     if (transactionResponse.ok) {
// //       const transactionData = await transactionResponse.json();
// //       transactionId = Array.isArray(transactionData) ? transactionData[0]?.id : transactionData?.id;
// //     } else {
// //       console.error('Transaction insert failed, but balance was updated');
// //     }

// //     return NextResponse.json({
// //       success: true,
// //       new_balance: newBalance,
// //       credits_added: creditsToAdd,
// //       transaction_id: transactionId,
// //     });

// //   } catch (err: any) {
// //     console.error('Verify payment error:', err);
// //     return NextResponse.json({ 
// //       error: err.message || 'Server error' 
// //     }, { status: 500 });
// //   }
// // }

// // app/api/verify-payment/route.ts
// import { NextResponse } from 'next/server';
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20' as any,
// });

// export const dynamic = 'force-dynamic';

// // Helper function to execute raw SQL
// async function executeSQL(query: string, params: any[] = []) {
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
//   const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
//   const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'apikey': serviceKey,
//       'Authorization': `Bearer ${serviceKey}`,
//     },
//     body: JSON.stringify({ query, params }),
//   });

//   if (!response.ok) {
//     const error = await response.text();
//     throw new Error(`SQL execution failed: ${error}`);
//   }

//   return response.json();
// }

// export async function POST(request: Request) {
//   try {
//     const { session_id } = await request.json();

//     if (!session_id) {
//       return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
//     }

//     // Verify Stripe payment
//     const session = await stripe.checkout.sessions.retrieve(session_id);

//     if (session.payment_status !== 'paid') {
//       return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
//     }

//     const userId = session.client_reference_id;
//     if (!userId) {
//       return NextResponse.json({ error: 'No user ID' }, { status: 400 });
//     }

//     const creditsToAdd = Number(session.metadata?.credits || 0);
//     if (creditsToAdd <= 0) {
//       return NextResponse.json({ error: 'Invalid credits' }, { status: 400 });
//     }

//     const planType = session.metadata?.plan || 'free';
//     const billingCycle = session.metadata?.billing_cycle || 'one-time';
//     const userEmail = session.customer_details?.email || session.customer_email || '';

//     // Map plan IDs to database-compatible values
//     const planMapping: Record<string, string> = {
//       'free': 'free',
//       'plus': 'starter',
//       'max': 'creator',
//       'generative': 'creator',
//       'team': 'agency',
//     };
    
//     const dbPlanType = planMapping[planType] || 'free';

//     // === USE DIRECT POSTGRES CONNECTION ===
//     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
//     const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

//     // 1. Upsert user (create if doesn't exist, get if exists)
//     const upsertUserResponse = await fetch(`${supabaseUrl}/rest/v1/users?on_conflict=id`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'apikey': serviceKey,
//         'Authorization': `Bearer ${serviceKey}`,
//         'Prefer': 'resolution=merge-duplicates,return=representation',
//       },
//       body: JSON.stringify({
//         id: userId,
//         email: userEmail,
//         credit_balance: 0,
//         total_credits_purchased: 0,
//       }),
//     });

//     if (!upsertUserResponse.ok) {
//       const errorText = await upsertUserResponse.text();
//       console.error('Upsert user failed:', errorText);
//       return NextResponse.json({ 
//         error: 'Failed to create/get user',
//         details: errorText 
//       }, { status: 500 });
//     }

//     const userData = await upsertUserResponse.json();
//     const currentUser = Array.isArray(userData) ? userData[0] : userData;

//     const currentBalance = currentUser.credit_balance || 0;
//     const newBalance = currentBalance + creditsToAdd;
//     const newTotalPurchased = (currentUser.total_credits_purchased || 0) + creditsToAdd;

//     // 2. Update user balance AND plan
//     const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//         'apikey': serviceKey,
//         'Authorization': `Bearer ${serviceKey}`,
//       },
//       body: JSON.stringify({
//         credit_balance: newBalance,
//         total_credits_purchased: newTotalPurchased,
//         plan_type: dbPlanType,
//         subscription_status: 'active',
//         updated_at: new Date().toISOString(),
//       }),
//     });

//     if (!updateResponse.ok) {
//       const errorText = await updateResponse.text();
//       console.error('Update balance failed:', errorText);
//       return NextResponse.json({ 
//         error: 'Failed to update balance',
//         details: errorText 
//       }, { status: 500 });
//     }

//     // 3. Insert transaction record
//     const transactionResponse = await fetch(`${supabaseUrl}/rest/v1/credit_transactions`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'apikey': serviceKey,
//         'Authorization': `Bearer ${serviceKey}`,
//         'Prefer': 'return=representation',
//       },
//       body: JSON.stringify({
//         user_id: userId,
//         transaction_type: 'purchase',
//         amount: creditsToAdd,
//         balance_after: newBalance,
//         description: `Purchased ${creditsToAdd} credits - ${planType} plan (${billingCycle})`,
//         metadata: { 
//           stripe_session_id: session_id,
//           plan: planType,
//           billing_cycle: billingCycle,
//         },
//       }),
//     });

//     let transactionId = null;
//     if (transactionResponse.ok) {
//       const transactionData = await transactionResponse.json();
//       transactionId = Array.isArray(transactionData) ? transactionData[0]?.id : transactionData?.id;
//     } else {
//       console.error('Transaction insert failed, but balance was updated');
//     }

//     return NextResponse.json({
//       success: true,
//       new_balance: newBalance,
//       credits_added: creditsToAdd,
//       transaction_id: transactionId,
//     });

//   } catch (err: any) {
//     console.error('Verify payment error:', err);
//     return NextResponse.json({ 
//       error: err.message || 'Server error' 
//     }, { status: 500 });
//   }
// }

// app/api/verify-payment/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

export async function POST(request: Request) {
  try {
    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Verify Stripe payment
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const userId = session.client_reference_id;
    if (!userId) {
      return NextResponse.json({ error: 'No user ID' }, { status: 400 });
    }

    const creditsToAdd = Number(session.metadata?.credits || 0);
    if (creditsToAdd <= 0) {
      return NextResponse.json({ error: 'Invalid credits' }, { status: 400 });
    }

    const planType = session.metadata?.plan || 'free';
    const billingCycle = session.metadata?.billing_cycle || 'one-time';
    const userEmail = session.customer_details?.email || session.customer_email || '';

    // Map plan IDs to database-compatible values
    const planMapping: Record<string, string> = {
      'free': 'free',
      'plus': 'starter',
      'max': 'creator',
      'generative': 'creator',
      'team': 'agency',
    };
    
    const dbPlanType = planMapping[planType] || 'free';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 1. First, GET the existing user (don't upsert with credit_balance: 0)
    const getUserResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    });

    let currentBalance = 0;
    let currentTotalPurchased = 0;
    let userExists = false;

    if (getUserResponse.ok) {
      const existingUsers = await getUserResponse.json();
      if (existingUsers && existingUsers.length > 0) {
        userExists = true;
        currentBalance = existingUsers[0].credit_balance || 0;
        currentTotalPurchased = existingUsers[0].total_credits_purchased || 0;
        console.log('Existing user found. Current balance:', currentBalance);
      }
    }

    const newBalance = currentBalance + creditsToAdd;
    const newTotalPurchased = currentTotalPurchased + creditsToAdd;

    console.log('Credits calculation:', {
      currentBalance,
      creditsToAdd,
      newBalance,
    });

    // 2. If user doesn't exist, create them first
    if (!userExists) {
      console.log('Creating new user:', userId);
      const createUserResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          id: userId,
          email: userEmail,
          credit_balance: creditsToAdd,  // Set directly for new user
          total_credits_purchased: creditsToAdd,
          plan_type: dbPlanType,
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      if (!createUserResponse.ok) {
        const errorText = await createUserResponse.text();
        console.error('Create user failed:', errorText);
        return NextResponse.json({ 
          error: 'Failed to create user',
          details: errorText 
        }, { status: 500 });
      }

      // Insert transaction record for new user
      await fetch(`${supabaseUrl}/rest/v1/credit_transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
          transaction_type: 'purchase',
          amount: creditsToAdd,
          balance_after: creditsToAdd,
          description: `Purchased ${creditsToAdd} credits - ${planType} plan (${billingCycle})`,
          metadata: { 
            stripe_session_id: session_id,
            plan: planType,
            billing_cycle: billingCycle,
          },
        }),
      });

      return NextResponse.json({
        success: true,
        new_balance: creditsToAdd,
        credits_added: creditsToAdd,
        previous_balance: 0,
      });
    }

    // 3. User exists - UPDATE their balance (ADD credits)
    console.log('Updating existing user balance from', currentBalance, 'to', newBalance);
    
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        credit_balance: newBalance,
        total_credits_purchased: newTotalPurchased,
        plan_type: dbPlanType,
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Update balance failed:', errorText);
      return NextResponse.json({ 
        error: 'Failed to update balance',
        details: errorText 
      }, { status: 500 });
    }

    // 4. Insert transaction record
    const transactionResponse = await fetch(`${supabaseUrl}/rest/v1/credit_transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        transaction_type: 'purchase',
        amount: creditsToAdd,
        balance_after: newBalance,
        description: `Purchased ${creditsToAdd} credits - ${planType} plan (${billingCycle})`,
        metadata: { 
          stripe_session_id: session_id,
          plan: planType,
          billing_cycle: billingCycle,
        },
      }),
    });

    let transactionId = null;
    if (transactionResponse.ok) {
      const transactionData = await transactionResponse.json();
      transactionId = Array.isArray(transactionData) ? transactionData[0]?.id : transactionData?.id;
    } else {
      console.error('Transaction insert failed, but balance was updated');
    }

    return NextResponse.json({
      success: true,
      new_balance: newBalance,
      credits_added: creditsToAdd,
      previous_balance: currentBalance,
      transaction_id: transactionId,
    });

  } catch (err: any) {
    console.error('Verify payment error:', err);
    return NextResponse.json({ 
      error: err.message || 'Server error' 
    }, { status: 500 });
  }
}