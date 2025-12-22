// //app/page.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { createBrowserClient } from '@supabase/ssr';
// import { Sparkles, PlayCircle, Image, Mic, Music, MessageSquare, Cloud, ChevronRight, Check, Menu, X, Sun, Moon } from 'lucide-react';
// import Link from 'next/link';
// import { useRouter, usePathname } from 'next/navigation';

// export default function StoryShortLanding() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [mounted, setMounted] = useState(false);
//   const [isYearly, setIsYearly] = useState(false);
//   const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

//   const router = useRouter();
//   const pathname = usePathname();

//   // Create Supabase client
//   const supabase = createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   );

//   // Load theme from localStorage on mount
//   useEffect(() => {
//     setMounted(true);
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme) {
//       setIsDarkMode(savedTheme === 'dark');
//     }
//   }, []);

//   // Check scroll for navbar
//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 50);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Check auth state
//   useEffect(() => {
//     let isMounted = true;

//     const checkUser = async () => {
//       try {
//         const { data: { session }, error } = await supabase.auth.getSession();
        
//         if (error) {
//           console.error('Session error:', error);
//           if (isMounted) setUser(null);
//         } else if (session?.user) {
//           console.log('Landing page: User logged in:', session.user.email);
//           if (isMounted) setUser(session.user);
//         } else {
//           console.log('Landing page: No user session');
//           if (isMounted) setUser(null);
//         }
//       } catch (err) {
//         console.error('Auth check error:', err);
//         if (isMounted) setUser(null);
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     checkUser();

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         console.log('Landing page auth event:', event, session?.user?.email);
        
//         if (isMounted) {
//           if (session?.user) {
//             setUser(session.user);
//           } else {
//             setUser(null);
//           }
//           setLoading(false);
//         }
//       }
//     );

//     return () => {
//       isMounted = false;
//       subscription.unsubscribe();
//     };
//   }, [pathname]);

//   // Dark mode handling with localStorage persistence
//   useEffect(() => {
//     if (!mounted) return;
    
//     // Save to localStorage
//     localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
//     // Apply theme
//     if (isDarkMode) {
//       document.documentElement.classList.add('dark');
//       document.body.classList.add('bg-black', 'text-white');
//       document.body.classList.remove('bg-white', 'text-black');
//     } else {
//       document.documentElement.classList.remove('dark');
//       document.body.classList.remove('bg-black', 'text-white');
//       document.body.classList.add('bg-white', 'text-black');
//     }
//   }, [isDarkMode, mounted]);

//   // Listen for theme changes from other tabs/pages
//   useEffect(() => {
//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === 'theme') {
//         setIsDarkMode(e.newValue === 'dark');
//       }
//     };
    
//     const handleThemeChange = (e: CustomEvent) => {
//       setIsDarkMode(e.detail.isDark);
//     };
    
//     window.addEventListener('storage', handleStorageChange);
//     window.addEventListener('themeChange', handleThemeChange as EventListener);
    
//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//       window.removeEventListener('themeChange', handleThemeChange as EventListener);
//     };
//   }, []);

//   const toggleTheme = () => {
//     setIsDarkMode(!isDarkMode);
//     window.dispatchEvent(new CustomEvent('themeChange', { detail: { isDark: !isDarkMode } }));
//   };

//   // Handle checkout
//   const handleCheckout = async (planKey: string) => {
//     if (!user) {
//       router.push('/login');
//       return;
//     }

//     setCheckoutLoading(planKey);
    
//     try {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (session) {
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

//   // Pricing plans data
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
//       key: 'starter',
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
//       key: 'growth',
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
//       key: 'pro',
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

//   // Example videos from public folder
//   const exampleVideos = [
//     { src: '/ai-short-1.mp4'},
//     { src: '/ai-short-2.mp4'},
//     { src: '/ai-short-3.mp4'},
//     { src: '/ai-short-4.mp4'},
//     { src: '/ai-short-5.mp4'},
//     { src: '/ai-short-6.mp4'},
//   ];

//   const isLoggedIn = !!user;

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} overflow-x-hidden`}>
//       {/* Navigation */}
//       <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? `py-3 ${isDarkMode ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-md` : `py-5 ${isDarkMode ? 'bg-black' : 'bg-white'}`}`}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between">
//             <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
//               <div className="w-35 h-35 flex items-center justify-center">
//                 <img 
//                   src="/WhatsApp Image 2025-12-03 at 15.22.59.png" 
//                   alt="AIShortz Logo" 
//                   className="w-full h-full object-contain"
//                 />
//               </div>
//             </Link>

//             <div className="hidden md:flex items-center space-x-10">
//               <a href="#features" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'} transition`}>Features</a>
//               <a href="#pricing" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'} transition`}>Pricing</a>
//               <a href="#examples" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'} transition`}>Examples</a>
//             </div>

//             <div className="hidden md:flex items-center space-x-4">
//               <button
//                 onClick={toggleTheme}
//                 className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition`}
//                 aria-label="Toggle theme"
//               >
//                 {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-700" />}
//               </button>

//               {isLoggedIn ? (
//                 <Link href="/dashboard" className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-full font-semibold transition text-white">
//                   Dashboard
//                 </Link>
//               ) : (
//                 <>
//                   <Link href="/login" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'} transition`}>Sign in</Link>
//                   <Link href="/login" className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-full font-semibold transition text-white">
//                     Start Free Trial
//                   </Link>
//                 </>
//               )}
//             </div>

//             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
//               {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
//             </button>
//           </div>
//         </div>

//         {mobileMenuOpen && (
//           <div className={`md:hidden ${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-t`}>
//             <div className="px-6 py-6 space-y-5 text-center">
//               <a href="#features" className={`block ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Features</a>
//               <a href="#pricing" className={`block ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Pricing</a>
//               <a href="#examples" className={`block ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Examples</a>
              
//               <button
//                 onClick={toggleTheme}
//                 className={`w-full py-3 rounded-full font-semibold ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition flex items-center justify-center gap-2`}
//               >
//                 {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
//                 {isDarkMode ? 'Light Mode' : 'Dark Mode'}
//               </button>

//               {isLoggedIn ? (
//                 <Link href="/dashboard" className="block w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-full font-semibold text-white">
//                   Dashboard
//                 </Link>
//               ) : (
//                 <>
//                   <Link href="/login" className={`block ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Sign in</Link>
//                   <Link href="/login" className="block w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-full font-semibold text-white">
//                     Start Free Trial
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Hero Section */}
//       <section className="pt-32 pb-20 px-4">
//         <div className="max-w-7xl mx-auto text-center">
//           <div className={`inline-flex items-center gap-2 ${isDarkMode ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-100 border-purple-300'} border rounded-full px-4 py-2 mb-8`}>
//             <Sparkles className="text-purple-400" size={18} />
//             <span className={`${isDarkMode ? 'text-purple-300' : 'text-purple-700'} text-sm`}>The #1 AI Shorts & Reels Generator in 2025</span>
//           </div>

//           <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
//             Turn Any Idea Into<br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
//               Viral Short Videos
//             </span><br />
//             in 60 Seconds
//           </h1>

//           <p className={`text-xl md:text-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto mb-10`}>
//             Generate faceless videos for TikTok, YouTube Shorts & Instagram Reels with AI — no editing skills needed.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link href={isLoggedIn ? "/dashboard" : "/login"} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-10 py-5 rounded-full font-bold text-lg transition transform hover:scale-105 text-white">
//               {isLoggedIn ? "Go to Dashboard" : "Start Creating Free"}
//             </Link>
//             <a href="#examples" className={`border ${isDarkMode ? 'border-gray-700 hover:border-purple-500' : 'border-gray-300 hover:border-purple-500'} px-10 py-5 rounded-full font-bold text-lg transition flex items-center justify-center gap-2`}>
//               Watch Examples <ChevronRight size={20} />
//             </a>
//           </div>

//           <div className="mt-16">
//             <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Trusted by 150,000+ creators</p>
//             <div className="flex justify-center gap-8 text-3xl">
//               <span>★★★★★</span>
//               <span className="text-yellow-400">4.9/5</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className={`py-20 px-4 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
//             <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Powerful AI tools to create viral content</p>
//           </div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {[
//               { icon: PlayCircle, title: 'AI Video Generation', desc: 'Create stunning videos from text prompts in seconds' },
//               // { icon: Image, title: 'AI Image Generation', desc: 'Generate unique visuals for your content' },
//               { icon: Mic, title: 'AI Voice Over', desc: 'Natural-sounding voiceovers in 50+ languages' },
//               { icon: Music, title: 'Background Music', desc: 'Royalty-free music that fits your content' },
//               { icon: MessageSquare, title: 'Auto Captions', desc: 'Engaging captions generated automatically' },
//               { icon: Cloud, title: 'Cloud Storage', desc: 'All your content saved securely in the cloud' },
//             ].map((feature, index) => (
//               <div key={index} className={`p-8 rounded-2xl transition ${isDarkMode ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-100 border border-gray-200'}`}>
//                 <feature.icon className="text-purple-400 mb-4" size={40} />
//                 <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
//                 <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{feature.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Examples Section with Real Videos */}
//       <section id="examples" className={`py-20 px-4 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold mb-4">See What&apos;s Possible</h2>
//             <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real videos created with AIShortz</p>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//             {exampleVideos.map((video, index) => (
//               <div key={index} className={`aspect-[9/16] rounded-2xl overflow-hidden relative group ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
//                 <video
//                   src={video.src}
//                   className="w-full h-full object-cover"
//                   muted
//                   loop
//                   playsInline
//                   onMouseEnter={(e) => e.currentTarget.play()}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.pause();
//                     e.currentTarget.currentTime = 0;
//                   }}
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
//                   <p className="text-white text-sm font-medium">{video.title}</p>
//                 </div>
//                 <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
//                   <PlayCircle size={48} className="text-white/80" />
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="text-center mt-12">
//             <Link 
//               href={isLoggedIn ? "/dashboard/tools/ai-video-generator" : "/login"}
//               className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-10 py-5 rounded-full font-bold text-lg transition text-white"
//             >
//               Create Your Own Video
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Pricing Section with Full Cards */}
//       <section id="pricing" className={`py-20 px-4 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-5xl md:text-6xl font-bold mb-4">
//               The right plans, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">for the right price</span>
//             </h2>
//             <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>365 DAYS UNLIMITED — Nano banana 2 image generation</p>
//           </div>

//           {/* Yearly Toggle */}
//           <div className="flex justify-center items-center gap-4 mb-12">
//             <span className={`text-lg ${!isYearly ? 'font-bold' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Monthly</span>
//             <button
//               onClick={() => setIsYearly(!isYearly)}
//               className={`relative w-16 h-9 rounded-full transition ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
//             >
//               <div className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md transition ${isYearly ? 'translate-x-7' : ''}`} />
//             </button>
//             <span className={`text-lg ${isYearly ? 'font-bold' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
//               Yearly <span className="text-green-500 text-sm font-bold">up to 20% off</span>
//             </span>
//           </div>

//           {/* Pricing Grid */}
//           <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
//             {plans.map((plan) => {
//               const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
//               const displayPrice = plan.name === 'Free' ? '$0' : `$${price}`;

//               return (
//                 <div
//                   key={plan.name}
//                   className={`relative rounded-3xl border-2 p-6 transition-all ${
//                     plan.highlighted
//                       ? isDarkMode 
//                         ? 'border-purple-500 bg-gradient-to-b from-purple-900/30 to-gray-900 shadow-2xl shadow-purple-500/20 scale-105'
//                         : 'border-purple-600 bg-gradient-to-b from-purple-50 to-white shadow-xl scale-105'
//                       : isDarkMode 
//                         ? 'border-gray-800 bg-gray-900 hover:border-gray-700'
//                         : 'border-gray-200 bg-white hover:border-gray-300'
//                   }`}
//                 >
//                   {plan.highlighted && (
//                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
//                       {plan.badge}
//                     </div>
//                   )}

//                   <div className="text-center mb-4">
//                     <h3 className="text-xl font-bold">{plan.name}</h3>
//                     {/* {plan.perCredit && (
//                       <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>${plan.perCredit} per credit</p>
//                     )} */}
//                   </div>

//                   <div className="mb-6 text-center">
//                     <span className="text-4xl font-bold">{displayPrice}</span>
//                     <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>/month</span>
//                     {plan.credits && <p className="text-purple-500 font-medium mt-2 text-sm">{plan.credits}</p>}
//                   </div>

//                   <ul className="space-y-3 mb-6">
//                     {plan.features.slice(0, 5).map((feature, i) => (
//                       <li key={i} className="flex items-start gap-2 text-sm">
//                         <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
//                         <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
//                       </li>
//                     ))}
//                   </ul>

//                   {plan.name === 'Free' ? (
//                     <Link
//                       href={user ? '/dashboard' : '/login'}
//                       className={`block w-full text-center py-3 rounded-full font-bold transition ${
//                         isDarkMode 
//                           ? 'bg-white text-black hover:bg-gray-200' 
//                           : 'bg-black text-white hover:bg-gray-800'
//                       }`}
//                     >
//                       {plan.cta}
//                     </Link>
//                   ) : (
//                     <button
//                       onClick={() => handleCheckout(plan.key)}
//                       disabled={checkoutLoading === plan.key}
//                       className={`block w-full text-center py-3 rounded-full font-bold transition ${
//                         plan.highlighted
//                           ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
//                           : isDarkMode 
//                             ? 'bg-white text-black hover:bg-gray-200' 
//                             : 'bg-black text-white hover:bg-gray-800'
//                       } disabled:opacity-70`}
//                     >
//                       {checkoutLoading === plan.key ? 'Loading...' : plan.cta}
//                     </button>
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           {/* Enterprise Section */}
//           <div className="mt-12">
//             <div className={`rounded-3xl border-2 p-10 text-center ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
//               <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
//               <p className="text-4xl font-bold mb-6">Custom</p>
//               <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//                 Custom solutions for large organizations. Advanced security and flexible pricing.
//               </p>
//               <Link href="/contact" className={`inline-block px-8 py-4 rounded-full font-bold transition ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
//                 Contact us
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className={`py-20 px-4 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Go Viral?</h2>
//           <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-10`}>
//             Join 150,000+ creators already using AIShortz to grow their audience.
//           </p>
//           <Link 
//             href={isLoggedIn ? "/dashboard" : "/login"}
//             className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-12 py-5 rounded-full font-bold text-xl transition transform hover:scale-105 text-white"
//           >
//             {isLoggedIn ? "Go to Dashboard" : "Start Creating Free"}
//           </Link>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className={`py-16 border-t ${isDarkMode ? 'bg-black text-gray-400 border-gray-900' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
//         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
//           <div>
//             <div className="flex items-center gap-3 mb-6">
//               <img src="/WhatsApp Image 2025-12-03 at 15.22.59.png" alt="AIShortz" className="w-35 h-35 object-contain" />
//             </div>
//             <p className="text-sm">Copyright © 2025 AIShortz<br />All rights reserved</p>
//           </div>

//           <div>
//             <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product</h4>
//             <ul className="space-y-3 text-sm">
//               <li><Link href="/pricing" className={`transition ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>Pricing</Link></li>
//               <li><Link href="/contact" className={`transition ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>Contact</Link></li>
//             </ul>
//           </div>

//           <div>
//             <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Legal</h4>
//             <ul className="space-y-3 text-sm">
//               <li><Link href="/privacy" className={`transition ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>Privacy Policy</Link></li>
//               <li><Link href="/terms" className={`transition ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>Terms of Service</Link></li>
//               <li><Link href="/refund" className={`transition ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>Refund Policy</Link></li>
//             </ul>
//           </div>

//           <div>
//             {/* <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Program</h4> */}
//             <ul className="space-y-3 text-sm">
//               <li>
//                 {/* <Link href="/affiliate" className={`flex items-center gap-2 transition ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>
//                   Affiliate Program <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded">NEW</span>
//                 </Link> */}
//               </li>
//             </ul>
            
//             {/* Social Media Icons */}
//             <h1>Follow us on</h1>
//             <div className="flex items-center gap-3 mt-6">
//               {/* TikTok */}
//               <a 
//                 href="https://www.tiktok.com/@aishortz_app" 
//                 target="_blank" 
//                 rel="noopener noreferrer" 
//                 className={`w-11 h-11 border rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 ${
//                   isDarkMode 
//                     ? 'bg-white/5 border-white/10 hover:bg-black hover:border-black' 
//                     : 'bg-gray-100 border-gray-200 hover:bg-black hover:border-black hover:text-white'
//                 }`}
//                 aria-label="TikTok"
//               >
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
//                 </svg>
//               </a>
              
//               {/* Instagram */}
//               <a 
//                 href="https://www.instagram.com/aishortz.app?igsh=MTdyYm1qdmRobnZyZg==" 
//                 target="_blank" 
//                 rel="noopener noreferrer" 
//                 className={`w-11 h-11 border rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 ${
//                   isDarkMode 
//                     ? 'bg-white/5 border-white/10 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 hover:border-pink-500' 
//                     : 'bg-gray-100 border-gray-200 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 hover:border-pink-500 hover:text-white'
//                 }`}
//                 aria-label="Instagram"
//               >
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
//                 </svg>
//               </a>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Sparkles, PlayCircle, Mic, Music, MessageSquare, Cloud, ChevronRight, Check, Menu, X, Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function StoryShortLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const router = useRouter();
  const pathname = usePathname();

  // Create Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Check scroll for navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check auth state
  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (isMounted) setUser(null);
        } else if (session?.user) {
          console.log('Landing page: User logged in:', session.user.email);
          if (isMounted) setUser(session.user);
        } else {
          console.log('Landing page: No user session');
          if (isMounted) setUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Landing page auth event:', event, session?.user?.email);
        
        if (isMounted) {
          if (session?.user) {
            setUser(session.user);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname]);

  // Dark mode handling with localStorage persistence
  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-black', 'text-white');
      document.body.classList.remove('bg-white', 'text-black');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-black', 'text-white');
      document.body.classList.add('bg-white', 'text-black');
    }
  }, [isDarkMode, mounted]);

  // Listen for theme changes from other tabs/pages
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        setIsDarkMode(e.newValue === 'dark');
      }
    };
    
    const handleThemeChange = (e: CustomEvent) => {
      setIsDarkMode(e.detail.isDark);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { isDark: !isDarkMode } }));
  };

  // Handle checkout
  const handleCheckout = async (planKey: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setCheckoutLoading(planKey);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.setItem('supabase_access_token', session.access_token);
        localStorage.setItem('supabase_refresh_token', session.refresh_token);
        localStorage.setItem('checkout_user_id', user.id);
        localStorage.setItem('checkout_timestamp', Date.now().toString());
      }

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          userId: user.id,
          billingCycle: isYearly ? 'yearly' : 'monthly',
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Checkout failed. Please try again.');
      }
    } catch (err) {
      alert('Error connecting to payment. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Pricing plans data
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
      key: 'starter',
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
      key: 'growth',
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
      key: 'pro',
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

  // Example videos from public folder
  const exampleVideos = [
    { src: '/ai-short-1.mp4', title: 'AI Generated Short 1' },
    { src: '/ai-short-2.mp4', title: 'AI Generated Short 2' },
    { src: '/ai-short-3.mp4', title: 'AI Generated Short 3' },
    { src: '/ai-short-4.mp4', title: 'AI Generated Short 4' },
    { src: '/ai-short-5.mp4', title: 'AI Generated Short 5' },
    { src: '/ai-short-6.mp4', title: 'AI Generated Short 6' },
  ];

  // Simple video play/pause handlers
  const playVideo = (index: number) => {
    // Pause all other videos
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Play this video
    const video = videoRefs.current[index];
    if (video) {
      video.muted = isMuted;
      video.play().catch(err => {
        console.log('Video play failed:', err);
        // Try playing muted if unmuted fails
        video.muted = true;
        video.play().catch(e => console.log('Muted play also failed:', e));
      });
      setActiveVideo(index);
    }
  };

  const stopVideo = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setActiveVideo(null);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Update all videos
    videoRefs.current.forEach(video => {
      if (video) {
        video.muted = !isMuted;
      }
    });
  };

  const isLoggedIn = !!user;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} overflow-x-hidden`}>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? `py-3 ${isDarkMode ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-md` : `py-5 ${isDarkMode ? 'bg-black' : 'bg-white'}`}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
              <div className="w-35 h-35 flex items-center justify-center">
                <img 
                  src="/WhatsApp%20Image%202025-12-03%20at%2015.22.59.png" 
                  alt="AIShortz Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'} transition`}>Features</a>
              <a href="#pricing" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'} transition`}>Pricing</a>
              <a href="#examples" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'} transition`}>Examples</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-700" />}
              </button>

              {isLoggedIn ? (
                <Link href="/dashboard" className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-full font-semibold transition text-white">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'} transition`}>Sign in</Link>
                  <Link href="/login" className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-full font-semibold transition text-white">
                    Start Free Trial
                  </Link>
                </>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={`md:hidden ${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-t`}>
            <div className="px-6 py-6 space-y-5 text-center">
              <a href="#features" className={`block ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Features</a>
              <a href="#pricing" className={`block ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Pricing</a>
              <a href="#examples" className={`block ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Examples</a>
              
              <button
                onClick={toggleTheme}
                className={`w-full py-3 rounded-full font-semibold ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition flex items-center justify-center gap-2`}
              >
                {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>

              {isLoggedIn ? (
                <Link href="/dashboard" className="block w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-full font-semibold text-white">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className={`block ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Sign in</Link>
                  <Link href="/login" className="block w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-full font-semibold text-white">
                    Start Free Trial
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 ${isDarkMode ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-100 border-purple-300'} border rounded-full px-4 py-2 mb-8`}>
            <Sparkles className="text-purple-400" size={18} />
            <span className={`${isDarkMode ? 'text-purple-300' : 'text-purple-700'} text-sm`}>The #1 AI Shorts & Reels Generator in 2025</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
            Turn Any Idea Into<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Viral Short Videos
            </span><br />
            in 60 Seconds
          </h1>

          <p className={`text-xl md:text-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto mb-10`}>
            Generate faceless videos for TikTok, YouTube Shorts & Instagram Reels with AI — no editing skills needed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isLoggedIn ? "/dashboard" : "/login"} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-10 py-5 rounded-full font-bold text-lg transition transform hover:scale-105 text-white">
              {isLoggedIn ? "Go to Dashboard" : "Start Creating Free"}
            </Link>
            <a href="#examples" className={`border ${isDarkMode ? 'border-gray-700 hover:border-purple-500' : 'border-gray-300 hover:border-purple-500'} px-10 py-5 rounded-full font-bold text-lg transition flex items-center justify-center gap-2`}>
              Watch Examples <ChevronRight size={20} />
            </a>
          </div>

          <div className="mt-16">
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Trusted by 150,000+ creators</p>
            <div className="flex justify-center gap-8 text-3xl">
              <span>★★★★★</span>
              <span className="text-yellow-400">4.9/5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-20 px-4 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Powerful AI tools to create viral content</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: PlayCircle, title: 'AI Video Generation', desc: 'Create stunning videos from text prompts in seconds' },
              { icon: Mic, title: 'AI Voice Over', desc: 'Natural-sounding voiceovers in 50+ languages' },
              { icon: Music, title: 'Background Music', desc: 'Royalty-free music that fits your content' },
              { icon: MessageSquare, title: 'Auto Captions', desc: 'Engaging captions generated automatically' },
              { icon: Cloud, title: 'Cloud Storage', desc: 'All your content saved securely in the cloud' },
            ].map((feature, index) => (
              <div key={index} className={`p-8 rounded-2xl transition ${isDarkMode ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-100 border border-gray-200'}`}>
                <feature.icon className="text-purple-400 mb-4" size={40} />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section with Real Videos */}
      <section id="examples" className={`py-20 px-4 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">See What&apos;s Possible</h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real videos created with AIShortz</p>
          </div>

          {/* Sound Toggle Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={toggleMute}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {isMuted ? (
                <>
                  <VolumeX size={20} />
                  <span>Sound Off - Click to Enable</span>
                </>
              ) : (
                <>
                  <Volume2 size={20} className="text-purple-500" />
                  <span>Sound On</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {exampleVideos.map((video, index) => (
              <div 
                key={index} 
                className={`aspect-[9/16] rounded-2xl overflow-hidden relative group cursor-pointer ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
                onMouseEnter={() => playVideo(index)}
                onMouseLeave={() => stopVideo(index)}
                onClick={() => playVideo(index)}
              >
                <video
                  ref={el => { videoRefs.current[index] = el; }}
                  src={video.src}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="auto"
                />
                
                {/* Title overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity flex items-end p-4 ${activeVideo === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <p className="text-white text-sm font-medium">{video.title}</p>
                </div>
                
                {/* Play icon overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${activeVideo === index ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="bg-black/40 rounded-full p-3">
                    <PlayCircle size={40} className="text-white" />
                  </div>
                </div>

                {/* Playing indicator */}
                {activeVideo === index && (
                  <div className="absolute top-3 right-3 bg-purple-600 rounded-full p-2 animate-pulse">
                    {isMuted ? <VolumeX size={14} className="text-white" /> : <Volume2 size={14} className="text-white" />}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href={isLoggedIn ? "/dashboard/tools/ai-video-generator" : "/login"}
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-10 py-5 rounded-full font-bold text-lg transition text-white"
            >
              Create Your Own Video
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`py-20 px-4 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              The right plans, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">for the right price</span>
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>365 DAYS UNLIMITED — Nano banana 2 image generation</p>
          </div>

          {/* Yearly Toggle */}
          <div className="flex justify-center items-center gap-4 mb-12">
            <span className={`text-lg ${!isYearly ? 'font-bold' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-16 h-9 rounded-full transition ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md transition ${isYearly ? 'translate-x-7' : ''}`} />
            </button>
            <span className={`text-lg ${isYearly ? 'font-bold' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Yearly <span className="text-green-500 text-sm font-bold">up to 20% off</span>
            </span>
          </div>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {plans.map((plan) => {
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const displayPrice = plan.name === 'Free' ? '$0' : `$${price}`;

              return (
                <div
                  key={plan.name}
                  className={`relative rounded-3xl border-2 p-6 transition-all ${
                    plan.highlighted
                      ? isDarkMode 
                        ? 'border-purple-500 bg-gradient-to-b from-purple-900/30 to-gray-900 shadow-2xl shadow-purple-500/20 scale-105'
                        : 'border-purple-600 bg-gradient-to-b from-purple-50 to-white shadow-xl scale-105'
                      : isDarkMode 
                        ? 'border-gray-800 bg-gray-900 hover:border-gray-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      {plan.badge}
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>

                  <div className="mb-6 text-center">
                    <span className="text-4xl font-bold">{displayPrice}</span>
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>/month</span>
                    {plan.credits && <p className="text-purple-500 font-medium mt-2 text-sm">{plan.credits}</p>}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.name === 'Free' ? (
                    <Link
                      href={user ? '/dashboard' : '/login'}
                      className={`block w-full text-center py-3 rounded-full font-bold transition ${
                        isDarkMode 
                          ? 'bg-white text-black hover:bg-gray-200' 
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleCheckout(plan.key)}
                      disabled={checkoutLoading === plan.key}
                      className={`block w-full text-center py-3 rounded-full font-bold transition ${
                        plan.highlighted
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                          : isDarkMode 
                            ? 'bg-white text-black hover:bg-gray-200' 
                            : 'bg-black text-white hover:bg-gray-800'
                      } disabled:opacity-70`}
                    >
                      {checkoutLoading === plan.key ? 'Loading...' : plan.cta}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Enterprise Section */}
          <div className="mt-12">
            <div className={`rounded-3xl border-2 p-10 text-center ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
              <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
              <p className="text-4xl font-bold mb-6">Custom</p>
              <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Custom solutions for large organizations. Advanced security and flexible pricing.
              </p>
              <Link href="/contact" className={`inline-block px-8 py-4 rounded-full font-bold transition ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 px-4 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Go Viral?</h2>
          <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-10`}>
            Join 150,000+ creators already using AIShortz to grow their audience.
          </p>
          <Link 
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-12 py-5 rounded-full font-bold text-xl transition transform hover:scale-105 text-white"
          >
            {isLoggedIn ? "Go to Dashboard" : "Start Creating Free"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 border-t ${isDarkMode ? 'bg-black text-gray-400 border-gray-900' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src="/WhatsApp%20Image%202025-12-03%20at%2015.22.59.png" alt="AIShortz" className="w-35 h-35 object-contain" />
            </div>
            <p className="text-sm">Copyright © 2025 AIShortz<br />All rights reserved</p>
          </div>

          <div>
            <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/pricing" className={`transition ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>Pricing</Link></li>
              <li><Link href="/contact" className={`transition ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy" className={`transition ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={`transition ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>Terms of Service</Link></li>
              <li><Link href="/refund" className={`transition ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Follow us on</h4>
            <div className="flex items-center gap-3 mt-2">
              <a 
                href="https://www.tiktok.com/@aishortz_app" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`w-11 h-11 border rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 hover:bg-black hover:border-black' 
                    : 'bg-gray-100 border-gray-200 hover:bg-black hover:border-black hover:text-white'
                }`}
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              
              <a 
                href="https://www.instagram.com/aishortz.app?igsh=MTdyYm1qdmRobnZyZg==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`w-11 h-11 border rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 hover:border-pink-500' 
                    : 'bg-gray-100 border-gray-200 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 hover:border-pink-500 hover:text-white'
                }`}
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}