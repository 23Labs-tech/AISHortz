// // app/pricing/page.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { createBrowserClient } from '@supabase/ssr';
// import { Check, ArrowLeft } from 'lucide-react';

// export default function PricingPage() {
//   const supabase = createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   );

//   const router = useRouter();
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [isYearly, setIsYearly] = useState(false);
//   const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

//   useEffect(() => {
//     const checkUser = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       setUser(session?.user || null);
//       setLoading(false);
//     };
//     checkUser();

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       (event, session) => {
//         setUser(session?.user || null);
//       }
//     );

//     return () => subscription.unsubscribe();
//   }, [supabase]);

//   const handleCheckout = async (planKey: string) => {
//     if (!user) {
//       router.push('/login');
//       return;
//     }

//     setCheckoutLoading(planKey);
    
//     try {
//       // IMPORTANT: Store session info before going to Stripe
//       const { data: { session } } = await supabase.auth.getSession();
//       if (session) {
//         // Store tokens in localStorage for recovery after Stripe redirect
//         localStorage.setItem('supabase_access_token', session.access_token);
//         localStorage.setItem('supabase_refresh_token', session.refresh_token);
//         localStorage.setItem('checkout_user_id', user.id);
//         localStorage.setItem('checkout_timestamp', Date.now().toString());
//       }

//       const res = await fetch('/api/create-checkout', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           plan: planKey,
//           userId: user.id,
//           billingCycle: isYearly ? 'yearly' : 'monthly',
//         }),
//       });

//       const data = await res.json();
//       if (data.url) {
//         window.location.href = data.url;
//       } else {
//         alert('Checkout failed. Please try again.');
//       }
//     } catch (err) {
//       alert('Error connecting to payment. Please try again.');
//     } finally {
//       setCheckoutLoading(null);
//     }
//   };

//   const plans = [
//     {
//       name: 'Free',
//       key: 'free',
//       monthlyPrice: 0,
//       yearlyPrice: 0,
//       credits: '1 AI credit/week',
//       features: [
//         '2 Video mins + 1 AI credit per week',
//         '1 Express avatar',
//         '4 Exports per week with watermark',
//         'No access to generative features',
//       ],
//       cta: 'Try for free',
//       highlighted: false,
//     },
//     {
//       name: 'Starter',
//       key: 'Starter',
//       monthlyPrice: 30,
//       yearlyPrice: 24,
//       // perCredit: '2.2',
//       credits: '50 Credits',
//       features: [
//         '50 Video mins + 95 iStock',
//         '2 UGC product asset ads',
//         '30 secs of generative video',
//         '2 express clones',
//         '3 users, 100GB storage',
//         'Unlimited exports',
//       ],
//       cta: 'Get Starter',
//       highlighted: false,
//     },
//     {
//       name: 'Growth',
//       key: 'Growth',
//       monthlyPrice: 75,
//       yearlyPrice: 60,
//       // perCredit: '1.3',
//       credits: '150 Credits',
//       features: [
//         '200 Video mins + 320 iStock',
//         '8 UGC product asset ads',
//         '120 secs of generative video',
//         '5 express clones',
//         '3 users, 400GB storage',
//         'Unlimited exports',
//       ],
//       cta: 'Get Growth',
//       highlighted: false,
//     },
//     {
//       name: 'Pro',
//       key: 'Pro',
//       monthlyPrice: 110,
//       yearlyPrice: 88,
//       // perCredit: '1',
//       credits: '250 Credits',
//       features: [
//         '200 Video mins + 320 iStock',
//         '5 generative UGC ads',
//         '300 secs of generative video',
//         '8 express clones',
//         '3 users, 400GB storage',
//         'Unlimited exports',
//       ],
//       cta: 'Get Pro',
//       highlighted: true,
//       badge: 'Best Value',
//     },
//     {
//       name: 'Max',
//       key: 'max',
//       monthlyPrice: 190,
//       yearlyPrice: 152,
//       // perCredit: '0.9',
//       credits: '500 Credits',
//       features: [
//         '2000 Video mins + 3200 iStock',
//         '50 generative UGC ads',
//         '60 mins of generative videos',
//         '40 express clones',
//         '1 seat, 4TB storage',
//         'Unlimited exports',
//       ],
//       cta: 'Get Max',
//       highlighted: false,
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white text-black">
//       {/* Header */}
//       <header className="border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur-md z-50">
//         <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
//           <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-3">
//             {/* <img src="/WhatsApp Image 2025-12-03 at 15.22.59.jpeg" alt="AIShortz" className="w-10 h-10 object-contain" /> */}
//             {/* <span className="text-2xl font-bold">AIShortz</span> */}
//           </Link>
//           {user ? (
//             <Link href="/dashboard" className="text-gray-600 hover:text-black flex items-center gap-2">
//               <ArrowLeft size={20} /> Back to Dashboard
//             </Link>
//           ) : (
//             <Link href="/login" className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition">
//               Get Started
//             </Link>
//           )}
//         </div>
//       </header>

//       {/* Hero */}
//       <section className="pt-16 pb-12 text-center">
//         <h1 className="text-5xl md:text-6xl font-bold mb-4">
//           The right plans, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">for the right price</span>
//         </h1>

//         {/* Yearly Toggle */}
//         <div className="flex items-center justify-center gap-4 mt-8">
//           <span className={`text-lg ${!isYearly ? 'font-semibold' : 'text-gray-500'}`}>Monthly</span>
//           <button
//             onClick={() => setIsYearly(!isYearly)}
//             className="relative w-14 h-8 bg-gray-300 rounded-full transition"
//           >
//             <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition ${isYearly ? 'translate-x-6' : 'translate-x-1'}`} />
//           </button>
//           <span className={`text-lg ${isYearly ? 'font-semibold' : 'text-gray-500'}`}>
//             Yearly <span className="text-green-600 text-sm font-bold">up to 20% off</span>
//           </span>
//         </div>
//       </section>

//       {/* Pricing Grid */}
//       <section className="px-6 pb-20">
//         <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-5 gap-6">
//           {plans.map((plan) => {
//             const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
//             const displayPrice = plan.name === 'Free' ? '$0' : `$${price}`;
//             const displayPeriod = isYearly ? '/year' : '/month';

//             return (
//               <div
//                 key={plan.name}
//                 className={`relative rounded-3xl border-2 p-8 transition-all ${
//                   plan.highlighted
//                     ? 'border-purple-600 bg-gradient-to-b from-purple-50 to-white shadow-xl scale-105'
//                     : 'border-gray-200 bg-white'
//                 }`}
//               >
//                 {plan.highlighted && (
//                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
//                     {plan.badge}
//                   </div>
//                 )}

//                 <div className="text-center mb-6">
//                   <h3 className="text-2xl font-bold">{plan.name}</h3>
//                   {/* {plan.perCredit && (
//                     <p className="text-sm text-gray-500 mt-1">${plan.perCredit} per credit</p>
//                   )} */}
//                 </div>

//                 <div className="mb-8 text-center">
//                   <span className="text-5xl font-bold">{displayPrice}</span>
//                   <span className="text-gray-500">{displayPeriod}</span>
//                   {plan.credits && <p className="text-purple-600 font-medium mt-2">{plan.credits}</p>}
//                 </div>

//                 <ul className="space-y-4 mb-10">
//                   {plan.features.map((feature, i) => (
//                     <li key={i} className="flex items-start gap-3 text-sm">
//                       <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
//                       <span className="text-gray-700">{feature}</span>
//                     </li>
//                   ))}
//                 </ul>

//                 {plan.name === 'Free' ? (
//                   <Link
//                     href={user ? '/dashboard' : '/login'}
//                     className="block w-full text-center py-4 rounded-full font-bold text-lg bg-black text-white hover:bg-gray-800 transition"
//                   >
//                     {plan.cta}
//                   </Link>
//                 ) : (
//                   <button
//                     onClick={() => handleCheckout(plan.key)}
//                     disabled={checkoutLoading === plan.key}
//                     className={`block w-full text-center py-4 rounded-full font-bold text-lg transition ${
//                       plan.highlighted
//                         ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
//                         : 'bg-black text-white hover:bg-gray-800'
//                     } disabled:opacity-70`}
//                   >
//                     {checkoutLoading === plan.key ? 'Loading...' : plan.cta}
//                   </button>
//                 )}

//                 {isYearly && plan.yearlyPrice > 0 && (
//                   <p className="text-center text-sm text-gray-500 mt-4">
//                     Billed ${(plan.yearlyPrice * 12).toLocaleString()} yearly
//                   </p>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* Enterprise */}
//         <div className="max-w-7xl mx-auto mt-12">
//           <div className="rounded-3xl border-2 border-gray-200 bg-white p-10 text-center">
//             <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
//             <p className="text-4xl font-bold mb-6">Custom</p>
//             <p className="text-gray-600 mb-8">
//               Custom solutions for large organizations. Advanced security and flexible pricing based on your needs.
//             </p>
//             <Link href="/contact" className="inline-block bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition">
//               Contact us
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="py-12 text-center text-gray-500 text-sm border-t">
//         <div className="max-w-7xl mx-auto">
//           <p>© 2025 AIShortz. All rights reserved.</p>
//         </div>
//       </footer>
//     </div>
//   );
// }

// app/pricing/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Check, ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleCheckout = async (planKey: string) => {
    // Skip checkout for free plan
    if (planKey === 'free') {
      router.push(user ? '/dashboard' : '/login');
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    setCheckoutLoading(planKey);
    
    try {
      // Store session info before going to Stripe
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.setItem('supabase_access_token', session.access_token);
        localStorage.setItem('supabase_refresh_token', session.refresh_token);
        localStorage.setItem('checkout_user_id', user.id);
        localStorage.setItem('checkout_timestamp', Date.now().toString());
      }

      const requestBody = {
        plan: planKey,
        billingCycle: isYearly ? 'yearly' : 'monthly',
      };

      console.log('=== CHECKOUT REQUEST ===');
      console.log('Plan:', planKey);
      console.log('Billing Cycle:', isYearly ? 'yearly' : 'monthly');
      console.log('Request Body:', JSON.stringify(requestBody));

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      
      if (!res.ok) {
        console.error('Checkout error:', data);
        alert('Checkout failed: ' + (data.error || 'Unknown error'));
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Checkout failed. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Error connecting to payment. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  // ✅ FIXED: All plan keys are now lowercase to match the API
  const plans = [
    {
      name: 'Free',
      key: 'free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      credits: '1 AI credit/week',
      features: [
        '2 Video mins + 1 AI credit per week',
        '1 Express avatar',
        '4 Exports per week with watermark',
        'No access to generative features',
      ],
      cta: 'Try for free',
      highlighted: false,
    },
    {
      name: 'Starter',
      key: 'starter',  // ✅ FIXED: was 'Starter'
      monthlyPrice: 30,
      yearlyPrice: 24,
      credits: '50 Credits',
      features: [
        '50 Video mins + 95 iStock',
        '2 UGC product asset ads',
        '30 secs of generative video',
        '2 express clones',
        '3 users, 100GB storage',
        'Unlimited exports',
      ],
      cta: 'Get Starter',
      highlighted: false,
    },
    {
      name: 'Growth',
      key: 'growth',  // ✅ FIXED: was 'Growth'
      monthlyPrice: 75,
      yearlyPrice: 60,
      credits: '150 Credits',
      features: [
        '200 Video mins + 320 iStock',
        '8 UGC product asset ads',
        '120 secs of generative video',
        '5 express clones',
        '3 users, 400GB storage',
        'Unlimited exports',
      ],
      cta: 'Get Growth',
      highlighted: false,
    },
    {
      name: 'Pro',
      key: 'pro',  // ✅ FIXED: was 'Pro'
      monthlyPrice: 110,
      yearlyPrice: 88,
      credits: '250 Credits',
      features: [
        '200 Video mins + 320 iStock',
        '5 generative UGC ads',
        '300 secs of generative video',
        '8 express clones',
        '3 users, 400GB storage',
        'Unlimited exports',
      ],
      cta: 'Get Pro',
      highlighted: true,
      badge: 'Best Value',
    },
    {
      name: 'Max',
      key: 'max',
      monthlyPrice: 190,
      yearlyPrice: 152,
      credits: '500 Credits',
      features: [
        '2000 Video mins + 3200 iStock',
        '50 generative UGC ads',
        '60 mins of generative videos',
        '40 express clones',
        '1 seat, 4TB storage',
        'Unlimited exports',
      ],
      cta: 'Get Max',
      highlighted: false,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-3">
            {/* Logo can go here */}
          </Link>
          {user ? (
            <Link href="/dashboard" className="text-gray-600 hover:text-black flex items-center gap-2">
              <ArrowLeft size={20} /> Back to Dashboard
            </Link>
          ) : (
            <Link href="/login" className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition">
              Get Started
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          The right plans, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">for the right price</span>
        </h1>

        {/* Yearly Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-lg ${!isYearly ? 'font-semibold' : 'text-gray-500'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-8 bg-gray-300 rounded-full transition"
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition ${isYearly ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`text-lg ${isYearly ? 'font-semibold' : 'text-gray-500'}`}>
            Yearly <span className="text-green-600 text-sm font-bold">up to 20% off</span>
          </span>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const displayPrice = plan.name === 'Free' ? '$0' : `$${price}`;
            const displayPeriod = '/month';

            return (
              <div
                key={plan.key}
                className={`relative rounded-3xl border-2 p-8 transition-all ${
                  plan.highlighted
                    ? 'border-purple-600 bg-gradient-to-b from-purple-50 to-white shadow-xl scale-105'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    {plan.badge}
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                </div>

                <div className="mb-8 text-center">
                  <span className="text-5xl font-bold">{displayPrice}</span>
                  <span className="text-gray-500">{displayPeriod}</span>
                  {plan.credits && <p className="text-purple-600 font-medium mt-2">{plan.credits}</p>}
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.key === 'free' ? (
                  <Link
                    href={user ? '/dashboard' : '/login'}
                    className="block w-full text-center py-4 rounded-full font-bold text-lg bg-black text-white hover:bg-gray-800 transition"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={checkoutLoading === plan.key}
                    className={`block w-full text-center py-4 rounded-full font-bold text-lg transition ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                        : 'bg-black text-white hover:bg-gray-800'
                    } disabled:opacity-70`}
                  >
                    {checkoutLoading === plan.key ? 'Loading...' : plan.cta}
                  </button>
                )}

                {isYearly && plan.yearlyPrice > 0 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Billed ${(plan.yearlyPrice * 12).toLocaleString()} yearly
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Enterprise */}
        <div className="max-w-7xl mx-auto mt-12">
          <div className="rounded-3xl border-2 border-gray-200 bg-white p-10 text-center">
            <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
            <p className="text-4xl font-bold mb-6">Custom</p>
            <p className="text-gray-600 mb-8">
              Custom solutions for large organizations. Advanced security and flexible pricing based on your needs.
            </p>
            <Link href="/contact" className="inline-block bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition">
              Contact us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-500 text-sm border-t">
        <div className="max-w-7xl mx-auto">
          <p>© 2025 AIShortz. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}