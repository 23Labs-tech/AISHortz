// // app/buy-credits/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { CreditCard, Check, Loader2, ArrowLeft } from 'lucide-react';
// import { createClient } from '@/lib/supabase/client';

// type PlanId = 'free' | 'starter' | 'growth' | 'pro' | 'max';
// type BillingCycle = 'monthly' | 'yearly';

// interface PlanConfig {
//   id: PlanId;
//   name: string;
//   monthlyPrice: number;
//   yearlyPrice: number;
//   credits: number;
//   badge?: string;
//   popular?: boolean;
//   features: string[];
//   buttonText: string;
//   buttonVariant: 'purple' | 'black';
// }

// const PLANS: PlanConfig[] = [
//   {
//     id: 'free',
//     name: 'Free',
//     monthlyPrice: 0,
//     yearlyPrice: 0,
//     // pricePerCredit: 'Free',
//     credits: 1,
//     features: [
//       '2 Video mins + 1 AI credit per week',
//       '1 Express avatar',
//       '4 Exports per week with watermark',
//       'No access to generative features',
//     ],
//     buttonText: 'Try for free',
//     buttonVariant: 'black',
//   },
//   {
//     id: 'starter',
//     name: 'Starter',
//     monthlyPrice: 30,
//     yearlyPrice: 288, // $24/month × 12 = $264/year
//     // pricePerCredit: '$1.67 per credit',
//     credits: 50,
//     features: [
//       '50 Video mins + 95 iStock',
//       '2 UGC product asset ads',
//       '30 secs of generative video',
//       '2 express clones',
//       '3 users, 100GB storage',
//       'Unlimited exports',
//     ],
//     buttonText: 'Get Starter',
//     buttonVariant: 'black',
//   },
//   {
//     id: 'growth',
//     name: 'Growth',
//     monthlyPrice: 75,
//     yearlyPrice: 720, // $60/month × 12 = $480/year
//     // pricePerCredit: '$1.3 per credit',
//     credits: 150,
//     features: [
//       '200 Video mins + 320 iStock',
//       '8 UGC product asset ads',
//       '120 secs of generative video',
//       '5 express clones',
//       '3 users, 400GB storage',
//       'Unlimited exports',
//     ],
//     buttonText: 'Get Growth',
//     buttonVariant: 'black',
//   },
//   {
//     id: 'pro',
//     name: 'Pro',
//     monthlyPrice: 110,
//     yearlyPrice: 1056, // $88/month × 12 = $960/year
//     // pricePerCredit: '$1 per credit',
//     credits: 250,
//     badge: 'Best Value',
//     popular: true,
//     features: [
//       '200 Video mins + 320 iStock',
//       '5 generative UGC ads',
//       '300 secs of generative video',
//       '8 express clones',
//       '3 users, 400GB storage',
//       'Unlimited exports',
//     ],
//     buttonText: 'Get Pro',
//     buttonVariant: 'purple',
//   },
//   {
//     id: 'max',
//     name: 'Max',
//     monthlyPrice: 190,
//     yearlyPrice: 1824, // $152/month × 12
//     // pricePerCredit: '$0.9 per credit',
//     credits: 500,
//     features: [
//       '2000 Video mins + 3200 iStock',
//       '50 generative UGC ads',
//       '60 mins of generative videos',
//       '40 express clones',
//       '1 seat, 4TB storage',
//       'Unlimited exports',
//     ],
//     buttonText: 'Get Max',
//     buttonVariant: 'black',
//   },
// ];

// export default function BuyCreditsPage() {
//   const router = useRouter();
//   const supabase = createClient();
//   const [selectedPlan, setSelectedPlan] = useState<PlanId>('pro');
//   const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
//   const [isLoading, setIsLoading] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);

//   const currentPlan = PLANS.find(p => p.id === selectedPlan)!;
//   const currentPrice = billingCycle === 'yearly' ? currentPlan.yearlyPrice : currentPlan.monthlyPrice;

//   useEffect(() => {
//     async function getUser() {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         setUserId(user.id);
//       } else {
//         router.push('/login');
//       }
//     }
//     getUser();
//   }, [supabase, router]);

//   const handleCheckout = async () => {
//     if (selectedPlan === 'free') {
//       alert('Free plan is already active!');
//       return;
//     }

//     if (!userId) {
//       alert('Please log in first');
//       router.push('/login');
//       return;
//     }

//     setIsLoading(true);

//     // Debug logs
//     console.log('=== CHECKOUT DEBUG ===');
//     console.log('Selected Plan:', selectedPlan);
//     console.log('Billing Cycle:', billingCycle);
//     console.log('Price:', currentPrice);

//     try {
//       const requestBody = {
//         plan: selectedPlan,
//         billingCycle: billingCycle,
//       };

//       console.log('Request Body:', JSON.stringify(requestBody));

//       const res = await fetch('/api/create-checkout', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(requestBody),
//       });

//       const data = await res.json();

//       if (data.url) {
//         window.location.href = data.url;
//       } else {
//         alert('Error: ' + (data.error || 'Something went wrong'));
//       }
//     } catch (err) {
//       console.error(err);
//       alert('Failed to start checkout. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const calculateSavings = () => {
//     if (billingCycle === 'monthly' || currentPlan.monthlyPrice === 0) return 0;
//     const yearlyTotal = currentPlan.yearlyPrice;
//     const monthlyTotal = currentPlan.monthlyPrice * 12;
//     return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
//       {/* Header */}
//       <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
//         <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
//               AS
//             </div>
//             <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//               AI Shortz
//             </span>
//           </div>
//           <button
//             onClick={() => router.push('/dashboard')}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             Back to Dashboard
//           </button>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-6 py-16">
//         {/* Hero */}
//         <div className="text-center mb-8">
//           <h1 className="text-5xl font-bold text-gray-900 mb-4">
//             Choose Your Perfect Plan
//           </h1>
//           <p className="text-xl text-gray-600 mb-8">
//             Flexible pricing for credits that never expire
//           </p>

//           {/* Billing Cycle Toggle */}
//           <div className="inline-flex items-center gap-4 bg-white rounded-full p-2 shadow-lg">
//             <button
//               onClick={() => setBillingCycle('monthly')}
//               className={`px-8 py-3 rounded-full font-semibold transition-all ${
//                 billingCycle === 'monthly'
//                   ? 'bg-gray-900 text-white'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Monthly
//             </button>
//             <button
//               onClick={() => setBillingCycle('yearly')}
//               className={`px-8 py-3 rounded-full font-semibold transition-all ${
//                 billingCycle === 'yearly'
//                   ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Yearly
//               <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
//                 Save 20%
//               </span>
//             </button>
//           </div>
//         </div>

//         {/* Pricing Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
//           {PLANS.map((plan) => {
//             const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            
//             return (
//               <div
//                 key={plan.id}
//                 onClick={() => setSelectedPlan(plan.id)}
//                 className={`relative cursor-pointer transition-all duration-300 ${
//                   selectedPlan === plan.id
//                     ? 'ring-4 ring-purple-400 scale-105'
//                     : 'hover:scale-102'
//                 } ${plan.popular ? 'lg:-mt-6 lg:mb-6' : ''}`}
//               >
//                 <div
//                   className={`h-full bg-white rounded-3xl shadow-xl p-8 border-2 transition-all ${
//                     selectedPlan === plan.id
//                       ? 'border-purple-500 shadow-2xl'
//                       : 'border-gray-200'
//                   } ${plan.popular ? 'ring-4 ring-purple-200 ring-opacity-50' : ''}`}
//                 >
//                   {plan.badge && (
//                     <div className="absolute -top-4 left-1/2 -translate-x-1/2">
//                       <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
//                         {plan.badge}
//                       </span>
//                     </div>
//                   )}

//                   <div className="text-center mb-6">
//                     <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
//                     {/* <p className="text-sm text-gray-500 mt-1">{plan.pricePerCredit}</p> */}
//                     <div className="mt-4">
//                       <span className="text-5xl font-bold text-gray-900">
//                         ${price}
//                       </span>
//                       {price > 0 && (
//                         <span className="text-gray-500 text-base ml-2">
//                           /{billingCycle === 'yearly' ? 'year' : 'month'}
//                         </span>
//                       )}
//                     </div>
//                     {price === 0 ? (
//                       <p className="text-lg text-gray-600 mt-2">1 AI credit/week</p>
//                     ) : (
//                       <>
//                         <p className="text-2xl font-bold text-purple-600 mt-2">
//                           {plan.credits} Credits
//                         </p>
//                         {billingCycle === 'yearly' && (
//                           <p className="text-sm text-green-600 font-semibold mt-1">
//                             Save {calculateSavings()}% yearly
//                           </p>
//                         )}
//                       </>
//                     )}
//                   </div>

//                   <ul className="space-y-3 mb-8">
//                     {plan.features.map((feature, i) => (
//                       <li key={i} className="flex items-start gap-3">
//                         <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
//                         <span className="text-gray-700 text-sm">{feature}</span>
//                       </li>
//                     ))}
//                   </ul>

//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setSelectedPlan(plan.id);
//                     }}
//                     className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
//                       plan.buttonVariant === 'purple'
//                         ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
//                         : 'bg-gray-900 hover:bg-gray-800 text-white'
//                     } ${selectedPlan === plan.id ? 'ring-4 ring-purple-300' : ''}`}
//                   >
//                     {plan.buttonText}
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* CHECKOUT BUTTON - THIS WAS MISSING! */}
//         <div className="mt-12 text-center">
//           <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md mx-auto">
//             <h3 className="text-xl font-bold text-gray-900 mb-2">
//               Selected: {currentPlan.name}
//             </h3>
//             <p className="text-gray-600 mb-4">
//               {billingCycle === 'monthly' ? 'Billed monthly' : 'Billed yearly (Save 20%)'}
//             </p>
//             <p className="text-4xl font-bold text-purple-600 mb-6">
//               ${currentPrice}
//               <span className="text-lg text-gray-500">
//                 /{billingCycle === 'yearly' ? 'year' : 'month'}
//               </span>
//             </p>
            
//             <button
//               onClick={handleCheckout}
//               disabled={isLoading || selectedPlan === 'free'}
//               className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl rounded-2xl shadow-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="w-6 h-6 animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <CreditCard className="w-6 h-6" />
//                   Proceed to Checkout
//                 </>
//               )}
//             </button>
            
//             {selectedPlan === 'free' && (
//               <p className="mt-4 text-sm text-gray-500">
//                 Free plan is already active
//               </p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// app/buy-credits/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Check, Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type PlanId = 'free' | 'starter' | 'growth' | 'pro' | 'max';
type BillingCycle = 'monthly' | 'yearly';

interface PlanConfig {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  credits: number;
  badge?: string;
  popular?: boolean;
  features: string[];
  buttonText: string;
  buttonVariant: 'purple' | 'black';
}

// ✅ All plan IDs are lowercase to match the API
const PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 1,
    features: [
      '2 Video mins + 1 AI credit per week',
      '1 Express avatar',
      '4 Exports per week with watermark',
      'No access to generative features',
    ],
    buttonText: 'Try for free',
    buttonVariant: 'black',
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 30,
    yearlyPrice: 288,
    credits: 50,
    features: [
      '50 Video mins + 95 iStock',
      '2 UGC product asset ads',
      '30 secs of generative video',
      '2 express clones',
      '3 users, 100GB storage',
      'Unlimited exports',
    ],
    buttonText: 'Get Starter',
    buttonVariant: 'black',
  },
  {
    id: 'growth',
    name: 'Growth',
    monthlyPrice: 75,
    yearlyPrice: 720,
    credits: 150,
    features: [
      '200 Video mins + 320 iStock',
      '8 UGC product asset ads',
      '120 secs of generative video',
      '5 express clones',
      '3 users, 400GB storage',
      'Unlimited exports',
    ],
    buttonText: 'Get Growth',
    buttonVariant: 'black',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 110,
    yearlyPrice: 1056,
    credits: 250,
    badge: 'Best Value',
    popular: true,
    features: [
      '200 Video mins + 320 iStock',
      '5 generative UGC ads',
      '300 secs of generative video',
      '8 express clones',
      '3 users, 400GB storage',
      'Unlimited exports',
    ],
    buttonText: 'Get Pro',
    buttonVariant: 'purple',
  },
  {
    id: 'max',
    name: 'Max',
    monthlyPrice: 190,
    yearlyPrice: 1824,
    credits: 500,
    features: [
      '2000 Video mins + 3200 iStock',
      '50 generative UGC ads',
      '60 mins of generative videos',
      '40 express clones',
      '1 seat, 4TB storage',
      'Unlimited exports',
    ],
    buttonText: 'Get Max',
    buttonVariant: 'black',
  },
];

export default function BuyCreditsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('pro');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = PLANS.find(p => p.id === selectedPlan)!;

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        router.push('/login');
      }
    }
    getUser();
  }, [supabase, router]);

  const handleCheckout = async () => {
    // Clear previous errors
    setError(null);

    if (selectedPlan === 'free') {
      alert('Free plan is already active!');
      return;
    }

    if (!userId) {
      alert('Please log in first');
      router.push('/login');
      return;
    }

    setIsLoading(true);

    // Debug logs
    console.log('=== CHECKOUT DEBUG ===');
    console.log('Selected Plan:', selectedPlan);
    console.log('Billing Cycle:', billingCycle);

    try {
      // Store session before redirect
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.setItem('supabase_access_token', session.access_token);
        localStorage.setItem('supabase_refresh_token', session.refresh_token);
        localStorage.setItem('checkout_user_id', userId);
        localStorage.setItem('checkout_timestamp', Date.now().toString());
      }

      const requestBody = {
        plan: selectedPlan,
        billingCycle: billingCycle,
      };

      console.log('Request Body:', JSON.stringify(requestBody));

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      console.log('Response status:', res.status);
      console.log('Response data:', data);

      if (!res.ok) {
        const errorMsg = data.error || `Request failed with status ${res.status}`;
        console.error('Checkout error:', errorMsg);
        setError(errorMsg);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('No checkout URL received from server');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to connect to payment server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate display price (monthly equivalent)
  const getDisplayPrice = (plan: PlanConfig) => {
    if (billingCycle === 'yearly') {
      return Math.round(plan.yearlyPrice / 12);
    }
    return plan.monthlyPrice;
  };

  // Calculate savings percentage
  const calculateSavings = (plan: PlanConfig) => {
    if (plan.monthlyPrice === 0) return 0;
    const monthlyTotal = plan.monthlyPrice * 12;
    const yearlyTotal = plan.yearlyPrice;
    return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
  };

  // Get checkout price (actual amount to charge)
  const getCheckoutPrice = () => {
    if (billingCycle === 'yearly') {
      return currentPlan.yearlyPrice;
    }
    return currentPlan.monthlyPrice;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              AS
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Shortz
            </span>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Flexible pricing for credits that never expire
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-4 bg-white rounded-full p-2 shadow-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {PLANS.map((plan) => {
            const displayPrice = getDisplayPrice(plan);
            const savings = calculateSavings(plan);
            
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? 'ring-4 ring-purple-400 scale-105'
                    : 'hover:scale-102'
                } ${plan.popular ? 'lg:-mt-6 lg:mb-6' : ''}`}
              >
                <div
                  className={`h-full bg-white rounded-3xl shadow-xl p-8 border-2 transition-all ${
                    selectedPlan === plan.id
                      ? 'border-purple-500 shadow-2xl'
                      : 'border-gray-200'
                  } ${plan.popular ? 'ring-4 ring-purple-200 ring-opacity-50' : ''}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="text-5xl font-bold text-gray-900">
                        ${displayPrice}
                      </span>
                      {displayPrice > 0 && (
                        <span className="text-gray-500 text-base ml-2">
                          /month
                        </span>
                      )}
                    </div>
                    {plan.monthlyPrice === 0 ? (
                      <p className="text-lg text-gray-600 mt-2">1 AI credit/week</p>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-purple-600 mt-2">
                          {plan.credits} Credits
                        </p>
                        {billingCycle === 'yearly' && savings > 0 && (
                          <p className="text-sm text-green-600 font-semibold mt-1">
                            Save {savings}% (${plan.yearlyPrice}/year)
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan.id);
                    }}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                      plan.buttonVariant === 'purple'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    } ${selectedPlan === plan.id ? 'ring-4 ring-purple-300' : ''}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout Summary */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Selected: {currentPlan.name}
            </h3>
            <p className="text-gray-600 mb-4">
              {billingCycle === 'monthly' ? 'Billed monthly' : 'Billed yearly (Save 20%)'}
            </p>
            
            {/* Price Display */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-purple-600">
                ${getDisplayPrice(currentPlan)}
                <span className="text-lg text-gray-500">/month</span>
              </p>
              {billingCycle === 'yearly' && currentPlan.yearlyPrice > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  ${currentPlan.yearlyPrice} billed annually
                </p>
              )}
              {currentPlan.credits > 1 && (
                <p className="text-lg text-purple-500 font-semibold mt-2">
                  {currentPlan.credits} Credits included
                </p>
              )}
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <p className="font-medium">Checkout Error</p>
                <p>{error}</p>
              </div>
            )}
            
            <button
              onClick={handleCheckout}
              disabled={isLoading || selectedPlan === 'free'}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl rounded-2xl shadow-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6" />
                  Proceed to Checkout
                </>
              )}
            </button>
            
            {selectedPlan === 'free' && (
              <p className="mt-4 text-sm text-gray-500">
                Free plan is already active
              </p>
            )}
            
            {/* Trust badges */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                🔒 Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}