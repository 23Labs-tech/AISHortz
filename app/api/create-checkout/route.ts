// // app/api/create-checkout/route.ts
// import { NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import { createServerClient } from '@supabase/ssr';
// import { cookies } from 'next/headers';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20' as any,
// });

// export const dynamic = 'force-dynamic';

// const PLANS = {
//   plus: { 
//     monthlyPrice: 28, 
//     yearlyPrice: 22, 
//     credits: 10, 
//     name: 'Plus Plan' 
//   },
//   max: { 
//     monthlyPrice: 50, 
//     yearlyPrice: 40, 
//     credits: 40, 
//     name: 'Max Plan' 
//   },
//   generative: { 
//     monthlyPrice: 100, 
//     yearlyPrice: 80, 
//     credits: 100, 
//     name: 'Generative Plan' 
//   },
//   team: { 
//     monthlyPrice: 899, 
//     yearlyPrice: 719, 
//     credits: 1000, 
//     name: 'Team Plan' 
//   },
// } as const;

// export async function POST(request: Request) {
//   try {
//     const cookieStore = await cookies();

//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         cookies: {
//           getAll: () => cookieStore.getAll(),
//           setAll: (cookiesToSet) => {
//             cookiesToSet.forEach(({ name, value, options }) => {
//               try { cookieStore.set(name, value, options); } catch {}
//             });
//           },
//         },
//       }
//     );

//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//     const { plan, billingCycle = 'yearly' } = await request.json();

//     const planConfig = PLANS[plan as keyof typeof PLANS];
//     if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

//     // Get the correct price based on billing cycle
//     const price = billingCycle === 'yearly' ? planConfig.yearlyPrice : planConfig.monthlyPrice;
    
//     // Determine if this is a subscription or one-time payment
//     const isSubscription = billingCycle === 'monthly' || billingCycle === 'yearly';
    
//     // For yearly billing, we need to show monthly price but charge annually
//     // So we multiply by 12 for the annual total
//     const stripeAmount = billingCycle === 'yearly' ? price * 12 : price;
//     const stripeInterval = 'year'; // Always yearly interval for yearly plans

//     const sessionConfig: Stripe.Checkout.SessionCreateParams = {
//       payment_method_types: ['card'],
//       line_items: [{
//         price_data: {
//           currency: 'usd',
//           product_data: { 
//             name: planConfig.name,
//             description: billingCycle === 'yearly' 
//               ? `${planConfig.credits} AI Video Credits - ${price}/month billed yearly (${stripeAmount}/year total)`
//               : `${planConfig.credits} AI Video Credits - Billed monthly`,
//           },
//           unit_amount: stripeAmount * 100,
//           ...(isSubscription && {
//             recurring: {
//               interval: stripeInterval as 'month' | 'year',
//             },
//           }),
//         },
//         quantity: 1,
//       }],
//       mode: isSubscription ? 'subscription' : 'payment',
//       success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/buy-credits/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/buy-credits?canceled=true`,
//       client_reference_id: user.id,
//       customer_email: user.email,
//       metadata: {
//         user_id: user.id,
//         credits: planConfig.credits.toString(),
//         plan: plan,
//         billing_cycle: billingCycle,
//       },
//     };

//     const session = await stripe.checkout.sessions.create(sessionConfig);

//     return NextResponse.json({ url: session.url });

//   } catch (error: any) {
//     console.error('Checkout error:', error);
//     return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
//   }
// }

// // app/api/create-checkout/route.ts
// import { NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import { createServerClient } from '@supabase/ssr';
// import { cookies } from 'next/headers';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20' as any,
// });

// export const dynamic = 'force-dynamic';

// const PLANS = {
//   plus: { 
//     monthlyPrice: 28, 
//     yearlyPrice: 264,
//     credits: 10, 
//     name: 'Plus Plan' 
//   },
//   max: { 
//     monthlyPrice: 50, 
//     yearlyPrice: 480,
//     credits: 40, 
//     name: 'Max Plan' 
//   },
//   generative: { 
//     monthlyPrice: 100, 
//     yearlyPrice: 960,
//     credits: 100, 
//     name: 'Generative Plan' 
//   },
//   team: { 
//     monthlyPrice: 899, 
//     yearlyPrice: 8628,
//     credits: 1000, 
//     name: 'Team Plan' 
//   },
// } as const;

// export async function POST(request: Request) {
//   try {
//     const cookieStore = await cookies();

//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         cookies: {
//           getAll: () => cookieStore.getAll(),
//           setAll: (cookiesToSet) => {
//             cookiesToSet.forEach(({ name, value, options }) => {
//               try { cookieStore.set(name, value, options); } catch {}
//             });
//           },
//         },
//       }
//     );

//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
    
//     // Extract and validate billingCycle - FORCE it to be 'monthly' or 'yearly'
//     const plan = body.plan;
//     let billingCycle = body.billingCycle;
    
//     // If billingCycle is not provided or invalid, check if amount suggests monthly/yearly
//     if (!billingCycle || (billingCycle !== 'monthly' && billingCycle !== 'yearly')) {
//       // Try to detect from amount if provided
//       const planConfig = PLANS[plan as keyof typeof PLANS];
//       if (planConfig && body.amount) {
//         if (body.amount === planConfig.monthlyPrice) {
//           billingCycle = 'monthly';
//         } else {
//           billingCycle = 'yearly';
//         }
//       } else {
//         // Default to monthly if nothing else works
//         billingCycle = 'monthly';
//       }
//     }

//     console.log('=== CHECKOUT DEBUG ===');
//     console.log('Plan:', plan);
//     console.log('Received billingCycle:', body.billingCycle);
//     console.log('Final billingCycle:', billingCycle);

//     const planConfig = PLANS[plan as keyof typeof PLANS];
//     if (!planConfig) {
//       return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
//     }

//     // Calculate correct price and interval
//     let stripeAmount: number;
//     let stripeInterval: 'month' | 'year';
//     let description: string;

//     if (billingCycle === 'monthly') {
//       stripeAmount = planConfig.monthlyPrice;
//       stripeInterval = 'month';
//       description = `${planConfig.credits} AI Video Credits - Billed $${stripeAmount}/month`;
//       console.log('Creating MONTHLY checkout:', stripeAmount, '/month');
//     } else {
//       stripeAmount = planConfig.yearlyPrice;
//       stripeInterval = 'year';
//       description = `${planConfig.credits} AI Video Credits - Billed $${stripeAmount}/year (Save 20%)`;
//       console.log('Creating YEARLY checkout:', stripeAmount, '/year');
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [{
//         price_data: {
//           currency: 'usd',
//           product_data: { 
//             name: `${planConfig.name} - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
//             description: description,
//           },
//           unit_amount: stripeAmount * 100,
//           recurring: {
//             interval: stripeInterval,
//           },
//         },
//         quantity: 1,
//       }],
//       mode: 'subscription',
//       success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/buy-credits/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/buy-credits?canceled=true`,
//       client_reference_id: user.id,
//       customer_email: user.email,
//       metadata: {
//         user_id: user.id,
//         credits: planConfig.credits.toString(),
//         plan: plan,
//         billing_cycle: billingCycle,
//       },
//     });

//     return NextResponse.json({ url: session.url });

//   } catch (error: any) {
//     console.error('Checkout error:', error);
//     return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
//   }
// }

// // app/api/create-checkout/route.ts
// import { NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import { createServerClient } from '@supabase/ssr';
// import { cookies } from 'next/headers';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20' as any,
// });

// export const dynamic = 'force-dynamic';

// const PLANS = {
//   starter: { 
//     monthlyPrice: 30, 
//     yearlyPrice: 288,  // $24 × 12
//     credits: 50, 
//     name: 'Starter Plan' 
//   },
//   growth: { 
//     monthlyPrice: 75, 
//     yearlyPrice: 720,  // $60 × 12
//     credits: 150, 
//     name: 'Growth Plan' 
//   },
//   pro: { 
//     monthlyPrice: 110, 
//     yearlyPrice: 1056,  // $88 × 12
//     credits: 250, 
//     name: 'Pro Plan' 
//   },
//   max: { 
//     monthlyPrice: 190, 
//     yearlyPrice: 1824,  // $152 × 12
//     credits: 500, 
//     name: 'Max Plan' 
//   },
// } as const;

// export async function POST(request: Request) {
//   try {
//     const cookieStore = await cookies();

//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         cookies: {
//           getAll: () => cookieStore.getAll(),
//           setAll: (cookiesToSet) => {
//             cookiesToSet.forEach(({ name, value, options }) => {
//               try { cookieStore.set(name, value, options); } catch {}
//             });
//           },
//         },
//       }
//     );

//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//     const body = await request.json();
//     const plan = body.plan;
//     let billingCycle = body.billingCycle;

//     // Validate billing cycle
//     if (!billingCycle || (billingCycle !== 'monthly' && billingCycle !== 'yearly')) {
//       billingCycle = 'monthly';
//     }

//     const planConfig = PLANS[plan as keyof typeof PLANS];
//     if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

//     // Set correct price and interval based on billing cycle
//     let stripeAmount: number;
//     let stripeInterval: 'month' | 'year';
//     let description: string;

//     if (billingCycle === 'monthly') {
//       stripeAmount = planConfig.monthlyPrice;
//       stripeInterval = 'month';
//       description = `${planConfig.credits} AI Video Credits - Billed $${stripeAmount}/month`;
//     } else {
//       stripeAmount = planConfig.yearlyPrice;
//       stripeInterval = 'year';
//       description = `${planConfig.credits} AI Video Credits - Billed $${stripeAmount}/year (Save 20%)`;
//     }

//     console.log('=== CHECKOUT ===');
//     console.log('Plan:', plan);
//     console.log('Billing Cycle:', billingCycle);
//     console.log('Amount:', stripeAmount);
//     console.log('Interval:', stripeInterval);

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [{
//         price_data: {
//           currency: 'usd',
//           product_data: { 
//             name: `${planConfig.name} - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
//             description: description,
//           },
//           unit_amount: stripeAmount * 100,
//           recurring: {
//             interval: stripeInterval,
//           },
//         },
//         quantity: 1,
//       }],
//       mode: 'subscription',
//       success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/buy-credits/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
//       client_reference_id: user.id,
//       customer_email: user.email,
//       metadata: {
//         user_id: user.id,
//         credits: planConfig.credits.toString(),
//         plan: plan,
//         billing_cycle: billingCycle,
//       },
//     });

//     return NextResponse.json({ url: session.url });

//   } catch (error: any) {
//     console.error('Checkout error:', error);
//     return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
//   }
// }

// // app/api/create-checkout/route.ts
// export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs';
// import { NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import { createServerClient } from '@supabase/ssr';
// import { cookies } from 'next/headers';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20' as any,
// });

// // ✅ All plan keys are lowercase
// const PLANS = {
//   starter: { 
//     monthlyPrice: 30, 
//     yearlyPrice: 288,  // $24 × 12
//     credits: 50, 
//     name: 'Starter Plan' 
//   },
//   growth: { 
//     monthlyPrice: 75, 
//     yearlyPrice: 720,  // $60 × 12
//     credits: 150, 
//     name: 'Growth Plan' 
//   },
//   pro: { 
//     monthlyPrice: 110, 
//     yearlyPrice: 1056,  // $88 × 12
//     credits: 250, 
//     name: 'Pro Plan' 
//   },
//   max: { 
//     monthlyPrice: 190, 
//     yearlyPrice: 1824,  // $152 × 12
//     credits: 500, 
//     name: 'Max Plan' 
//   },
// } as const;

// type PlanKey = keyof typeof PLANS;

// export async function POST(request: Request) {
//   console.log('=== CREATE CHECKOUT CALLED ===');
  
//   try {
//     // ============================================
//     // PARSE REQUEST BODY
//     // ============================================
//     let body;
//     try {
//       body = await request.json();
//     } catch (parseError) {
//       console.error('Failed to parse request body:', parseError);
//       return NextResponse.json(
//         { error: 'Invalid JSON in request body' }, 
//         { status: 400 }
//       );
//     }

//     console.log('Request body:', JSON.stringify(body, null, 2));

//     // ============================================
//     // AUTHENTICATE USER
//     // ============================================
//     const cookieStore = await cookies();

//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         cookies: {
//           getAll: () => cookieStore.getAll(),
//           setAll: (cookiesToSet) => {
//             cookiesToSet.forEach(({ name, value, options }) => {
//               try { cookieStore.set(name, value, options); } catch {}
//             });
//           },
//         },
//       }
//     );

//     const { data: { user }, error: authError } = await supabase.auth.getUser();
    
//     if (authError) {
//       console.error('Auth error:', authError);
//       return NextResponse.json(
//         { error: 'Authentication failed', details: authError.message }, 
//         { status: 401 }
//       );
//     }
    
//     if (!user) {
//       console.error('No user found');
//       return NextResponse.json(
//         { error: 'Unauthorized - Please log in' }, 
//         { status: 401 }
//       );
//     }

//     console.log('User authenticated:', user.id);

//     // ============================================
//     // VALIDATE PLAN
//     // ============================================
//     // Convert to lowercase to handle case mismatches
//     const planInput = body?.plan;
//     const plan = typeof planInput === 'string' ? planInput.toLowerCase() : planInput;
    
//     console.log('Plan input:', planInput);
//     console.log('Plan (normalized):', plan);
//     console.log('Valid plans:', Object.keys(PLANS));

//     if (!plan) {
//       console.error('No plan provided');
//       return NextResponse.json({ 
//         error: 'No plan specified',
//         received: body,
//         validPlans: Object.keys(PLANS)
//       }, { status: 400 });
//     }

//     const planConfig = PLANS[plan as PlanKey];
    
//     if (!planConfig) {
//       console.error(`Invalid plan: "${plan}"`);
//       return NextResponse.json({ 
//         error: `Invalid plan: "${planInput}"`,
//         validPlans: Object.keys(PLANS),
//         received: body
//       }, { status: 400 });
//     }

//     // ============================================
//     // VALIDATE BILLING CYCLE
//     // ============================================
//     let billingCycle = body?.billingCycle;
    
//     if (!billingCycle || (billingCycle !== 'monthly' && billingCycle !== 'yearly')) {
//       console.log(`Invalid billing cycle "${billingCycle}", defaulting to monthly`);
//       billingCycle = 'monthly';
//     }

//     // ============================================
//     // CALCULATE PRICE
//     // ============================================
//     let stripeAmount: number;
//     let stripeInterval: 'month' | 'year';
//     let description: string;

//     if (billingCycle === 'monthly') {
//       stripeAmount = planConfig.monthlyPrice;
//       stripeInterval = 'month';
//       description = `${planConfig.credits} AI Video Credits - Billed $${stripeAmount}/month`;
//     } else {
//       stripeAmount = planConfig.yearlyPrice;
//       stripeInterval = 'year';
//       const monthlyEquivalent = Math.round(stripeAmount / 12);
//       description = `${planConfig.credits} AI Video Credits - Billed $${stripeAmount}/year ($${monthlyEquivalent}/mo)`;
//     }

//     console.log('=== CHECKOUT DETAILS ===');
//     console.log('Plan:', plan);
//     console.log('Plan Config:', planConfig);
//     console.log('Billing Cycle:', billingCycle);
//     console.log('Amount:', stripeAmount);
//     console.log('Interval:', stripeInterval);

//     // ============================================
//     // CREATE STRIPE CHECKOUT SESSION
//     // ============================================
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
//                     process.env.NEXT_PUBLIC_APP_URL || 
//                     'http://localhost:3000';

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [{
//         price_data: {
//           currency: 'usd',
//           product_data: { 
//             name: `${planConfig.name} - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
//             description: description,
//           },
//           unit_amount: stripeAmount * 100, // Stripe uses cents
//           recurring: {
//             interval: stripeInterval,
//           },
//         },
//         quantity: 1,
//       }],
//       mode: 'subscription',
//       success_url: `${baseUrl}/buy-credits/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${baseUrl}/pricing?canceled=true`,
//       client_reference_id: user.id,
//       customer_email: user.email,
//       metadata: {
//         user_id: user.id,
//         credits: planConfig.credits.toString(),
//         plan: plan,
//         billing_cycle: billingCycle,
//       },
//     });

//     console.log('Stripe session created:', session.id);
//     console.log('Checkout URL:', session.url);

//     return NextResponse.json({ 
//       url: session.url,
//       sessionId: session.id 
//     });

//   } catch (error: any) {
//     console.error('=== CHECKOUT ERROR ===');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
    
//     // Check for specific Stripe errors
//     if (error.type === 'StripeInvalidRequestError') {
//       return NextResponse.json({ 
//         error: 'Stripe configuration error',
//         details: error.message 
//       }, { status: 500 });
//     }
    
//     return NextResponse.json({ 
//       error: error.message || 'Failed to create checkout session' 
//     }, { status: 500 });
//   }
// }

// app/api/create-checkout/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getStripe } from '@/lib/stripe';

// ✅ All plan keys are lowercase
const PLANS = {
  starter: { 
    monthlyPrice: 30, 
    yearlyPrice: 288,  // $24 × 12
    credits: 50, 
    name: 'Starter Plan' 
  },
  growth: { 
    monthlyPrice: 75, 
    yearlyPrice: 720,  // $60 × 12
    credits: 150, 
    name: 'Growth Plan' 
  },
  pro: { 
    monthlyPrice: 110, 
    yearlyPrice: 1056,  // $88 × 12
    credits: 250, 
    name: 'Pro Plan' 
  },
  max: { 
    monthlyPrice: 190, 
    yearlyPrice: 1824,  // $152 × 12
    credits: 500, 
    name: 'Max Plan' 
  },
} as const;

type PlanKey = keyof typeof PLANS;

export async function POST(request: Request) {
  console.log('=== CREATE CHECKOUT CALLED ===');
  
  try {
    // Initialize Stripe inside the handler
    const stripe = getStripe();
    
    // ============================================
    // PARSE REQUEST BODY
    // ============================================
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' }, 
        { status: 400 }
      );
    }

    console.log('Request body:', JSON.stringify(body, null, 2));

    // ============================================
    // AUTHENTICATE USER
    // ============================================
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              try { cookieStore.set(name, value, options); } catch {}
            });
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message }, 
        { status: 401 }
      );
    }
    
    if (!user) {
      console.error('No user found');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' }, 
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id);

    // ============================================
    // VALIDATE PLAN
    // ============================================
    // Convert to lowercase to handle case mismatches
    const planInput = body?.plan;
    const plan = typeof planInput === 'string' ? planInput.toLowerCase() : planInput;
    
    console.log('Plan input:', planInput);
    console.log('Plan (normalized):', plan);
    console.log('Valid plans:', Object.keys(PLANS));

    if (!plan) {
      console.error('No plan provided');
      return NextResponse.json({ 
        error: 'No plan specified',
        received: body,
        validPlans: Object.keys(PLANS)
      }, { status: 400 });
    }

    const planConfig = PLANS[plan as PlanKey];
    
    if (!planConfig) {
      console.error(`Invalid plan: "${plan}"`);
      return NextResponse.json({ 
        error: `Invalid plan: "${planInput}"`,
        validPlans: Object.keys(PLANS),
        received: body
      }, { status: 400 });
    }

    // ============================================
    // VALIDATE BILLING CYCLE
    // ============================================
    let billingCycle = body?.billingCycle;
    
    if (!billingCycle || (billingCycle !== 'monthly' && billingCycle !== 'yearly')) {
      console.log(`Invalid billing cycle "${billingCycle}", defaulting to monthly`);
      billingCycle = 'monthly';
    }

    // ============================================
    // CALCULATE PRICE
    // ============================================
    let stripeAmount: number;
    let stripeInterval: 'month' | 'year';
    let description: string;

    if (billingCycle === 'monthly') {
      stripeAmount = planConfig.monthlyPrice;
      stripeInterval = 'month';
      description = `${planConfig.credits} AI Video Credits - Billed $${stripeAmount}/month`;
    } else {
      stripeAmount = planConfig.yearlyPrice;
      stripeInterval = 'year';
      const monthlyEquivalent = Math.round(stripeAmount / 12);
      description = `${planConfig.credits} AI Video Credits - Billed $${stripeAmount}/year ($${monthlyEquivalent}/mo)`;
    }

    console.log('=== CHECKOUT DETAILS ===');
    console.log('Plan:', plan);
    console.log('Plan Config:', planConfig);
    console.log('Billing Cycle:', billingCycle);
    console.log('Amount:', stripeAmount);
    console.log('Interval:', stripeInterval);

    // ============================================
    // CREATE STRIPE CHECKOUT SESSION
    // ============================================
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.NEXT_PUBLIC_APP_URL || 
                    'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { 
            name: `${planConfig.name} - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
            description: description,
          },
          unit_amount: stripeAmount * 100, // Stripe uses cents
          recurring: {
            interval: stripeInterval,
          },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${baseUrl}/buy-credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        credits: planConfig.credits.toString(),
        plan: plan,
        billing_cycle: billingCycle,
      },
    });

    console.log('Stripe session created:', session.id);
    console.log('Checkout URL:', session.url);

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    });

  } catch (error: any) {
    console.error('=== CHECKOUT ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ 
        error: 'Stripe configuration error',
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Failed to create checkout session' 
    }, { status: 500 });
  }
}