// // app/dashboard/_components/Header.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Menu } from 'lucide-react';
// import { createClient } from '@/lib/supabase/client';

// interface HeaderProps {
//   onMenuToggle: () => void;
// }

// interface UserData {
//   credit_balance: number;
//   plan_type: string | null;
//   subscription_status: string | null;
// }

// const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
//   const pathname = usePathname();
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState(true);
  
//   const supabase = createClient();

//   useEffect(() => {
//     async function fetchUserData() {
//       try {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) return;

//         const { data: profile } = await supabase
//           .from('users')
//           .select('credit_balance, plan_type, subscription_status')
//           .eq('id', user.id)
//           .single();

//         if (profile) {
//           setUserData(profile);
//         }
//       } catch (err) {
//         console.error('Header: Failed to fetch user data:', err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchUserData();

//     // Subscribe to real-time updates
//     const channel = supabase
//       .channel('header-user-updates')
//       .on(
//         'postgres_changes',
//         {
//           event: 'UPDATE',
//           schema: 'public',
//           table: 'users',
//         },
//         (payload) => {
//           setUserData((prev) => prev ? {
//             ...prev,
//             credit_balance: payload.new.credit_balance,
//             plan_type: payload.new.plan_type,
//             subscription_status: payload.new.subscription_status,
//           } : null);
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [supabase]);

//   const getBreadcrumb = (): string[] => {
//     if (pathname === '/dashboard') return ['Dashboard'];
    
//     const parts = pathname.split('/').filter(Boolean);
//     return parts;
//   };

//   const breadcrumb = getBreadcrumb();

//   // Check if user is on a paid plan
//   const PAID_PLAN_TYPES = ['plus', 'max', 'generative', 'team', 'pro', 'premium', 'starter', 'creator', 'agency'];
//   const isPaidUser = (
//     userData?.subscription_status === 'active' ||
//     (userData?.plan_type && PAID_PLAN_TYPES.includes(userData.plan_type.toLowerCase())) ||
//     (userData?.credit_balance && userData.credit_balance > 0)
//   );

//   return (
//     <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
//       <div className="px-6 py-4 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <button 
//             onClick={onMenuToggle}
//             className="lg:hidden text-gray-400 hover:text-white"
//           >
//             <Menu className="w-6 h-6" />
//           </button>
//           <div className="flex items-center gap-2 text-sm">
//             {breadcrumb.map((item, index) => (
//               <React.Fragment key={index}>
//                 {index > 0 && <span className="text-gray-600">›</span>}
//                 <span className={index === breadcrumb.length - 1 ? 'text-white font-medium' : 'text-gray-400'}>
//                   {item}
//                 </span>
//               </React.Fragment>
//             ))}
//           </div>
//         </div>
        
//         <div className="flex items-center gap-4">
//           {/* Only show Free Plan banner for non-paid users */}
//           {!loading && !isPaidUser && (
//             <>
//               <div className="hidden md:flex items-center gap-3 bg-purple-600/10 border border-purple-500/20 px-4 py-2 rounded-full">
//                 <span className="text-sm text-purple-400">You&apos;re on Free Plan</span>
//                 <span className="text-xs text-purple-400/60">Upgrade to export videos and more.</span>
//               </div>
//               <Link 
//                 href="/pricing"
//                 className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-2 rounded-full transition"
//               >
//                 Upgrade
//               </Link>
//             </>
//           )}
          
//           {/* Show Buy Credits button for paid users */}
//           {!loading && isPaidUser && (
//             <Link 
//               href="/pricing"
//               className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-2 rounded-full transition"
//             >
//               Buy Credits
//             </Link>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

// app/dashboard/_components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  onMenuToggle: () => void;
}

interface UserData {
  credit_balance: number;
  plan_type: string | null;
  subscription_status: string | null;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const pathname = usePathname();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const supabase = createClient();

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Listen for theme changes
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

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('users')
          .select('credit_balance, plan_type, subscription_status')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserData(profile);
        }
      } catch (err) {
        console.error('Header: Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();

    const channel = supabase
      .channel('header-user-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          setUserData((prev) => prev ? {
            ...prev,
            credit_balance: payload.new.credit_balance,
            plan_type: payload.new.plan_type,
            subscription_status: payload.new.subscription_status,
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const getBreadcrumb = (): string[] => {
    if (pathname === '/dashboard') return ['Dashboard'];
    
    const parts = pathname.split('/').filter(Boolean);
    return parts;
  };

  const breadcrumb = getBreadcrumb();

  const PAID_PLAN_TYPES = ['plus', 'max', 'generative', 'team', 'pro', 'premium', 'starter', 'creator', 'agency'];
  const isPaidUser = (
    userData?.subscription_status === 'active' ||
    (userData?.plan_type && PAID_PLAN_TYPES.includes(userData.plan_type.toLowerCase())) ||
    (userData?.credit_balance && userData.credit_balance > 0)
  );

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-xl border-b ${isDarkMode ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuToggle}
            className={`lg:hidden ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            {breadcrumb.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}>›</span>}
                <span className={index === breadcrumb.length - 1 
                  ? isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium'
                  : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }>
                  {item}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {!loading && !isPaidUser && (
            <>
              <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-full ${isDarkMode ? 'bg-purple-600/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
                <span className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>You&apos;re on Free Plan</span>
                <span className={`text-xs ${isDarkMode ? 'text-purple-400/60' : 'text-purple-500'}`}>Upgrade to export videos and more.</span>
              </div>
              <Link 
                href="/pricing"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-2 rounded-full transition"
              >
                Upgrade
              </Link>
            </>
          )}
          
          {!loading && isPaidUser && (
            <Link 
              href="/pricing"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-2 rounded-full transition"
            >
              Buy Credits
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;