// app/dashboard/_components/Sidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Layout, Video, Image as ImageIcon,
  Settings, Moon, Sun, LogOut, ChevronDown, X, Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface UserData {
  email: string;
  full_name: string | null;
  credit_balance: number;
  plan_type: string;
  subscription_status: string | null;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Fetch user data from Supabase
  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Auth error:', authError);
          router.push('/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('email, full_name, credit_balance, plan_type, subscription_status')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          return;
        }

        setUserData(profile);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();

    const channel = supabase
      .channel('user-credits')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('User credits updated!', payload);
          setUserData((prev) => prev ? { 
            ...prev, 
            credit_balance: payload.new.credit_balance,
            plan_type: payload.new.plan_type,
            subscription_status: payload.new.subscription_status
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  // Dark mode handling with localStorage persistence
  useEffect(() => {
    if (!mounted) return;
    
    // Save to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Apply theme
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
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Dispatch custom event to sync with other components
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { isDark: !isDarkMode } }));
  };

  const navItems = [
    { icon: Layout, label: 'Home', href: '/dashboard' },
    { icon: ImageIcon, label: 'Media', href: '/dashboard/media' },
  ];

  const tools = [
    { icon: Video, label: 'AI Videos', href: '/dashboard/tools/ai-video-generator' },
  ];

  const getUserInitials = () => {
    if (!userData) return 'U';
    if (userData.full_name) {
      const names = userData.full_name.trim().split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return userData.email[0].toUpperCase();
  };

  const displayName = userData?.full_name || userData?.email?.split('@')[0] || 'User';
  const displayEmail = userData?.email || '';

  const PAID_PLAN_TYPES = ['plus', 'max', 'generative', 'team', 'pro', 'premium', 'starter', 'creator', 'agency'];
  const isPaidUser = (
    userData?.subscription_status === 'active' ||
    (userData?.plan_type && PAID_PLAN_TYPES.includes(userData.plan_type.toLowerCase())) ||
    (userData?.credit_balance && userData.credit_balance > 0)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isDarkMode ? 'bg-[#0a0a0a] border-r border-gray-900' : 'bg-white border-r border-gray-200'}`}>
        {/* Logo */}
        <div className={`p-10 flex items-center justify-between ${isDarkMode ? 'border-b border-gray-900' : 'border-b border-gray-200'}`}>
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-35 h-35 flex items-center justify-center">
              <img 
                src="/WhatsApp Image 2025-12-03 at 15.22.59.png" 
                alt="AIShortz Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}></span>
          </Link>
          <button onClick={onToggle} className={`lg:hidden transition ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onToggle}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active 
                      ? isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                      : isDarkMode ? 'text-gray-400 hover:bg-gray-800/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8">
            <p className={`text-xs font-semibold uppercase tracking-wider px-4 mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tools</p>
            <div className="space-y-1">
              {tools.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onToggle}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active 
                        ? isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                        : isDarkMode ? 'text-gray-400 hover:bg-gray-800/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className={`p-4 space-y-4 ${isDarkMode ? 'border-t border-gray-900' : 'border-t border-gray-200'}`}>
          {/* Credits */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded mb-3"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-white">{userData?.credit_balance || 0}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white capitalize">
                    {userData?.plan_type || 'Free'}
                  </span>
                </div>
                <p className="text-xs text-white/80 mb-3">Credits available</p>
              </>
            )}
            {!isPaidUser && (
              <Link
                href="/pricing"
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition font-medium text-white text-sm"
              >
                <Sparkles className="w-5 h-5" />
                Upgrade to Pro
              </Link>
            )}
            {isPaidUser && (
              <Link
                href="/pricing"
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition font-medium text-white text-sm"
              >
                <Sparkles className="w-5 h-5" />
                Buy More Credits
              </Link>
            )}
          </div>

          {/* User Profile + Dropdown */}
          <div className="relative user-menu-container">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {getUserInitials()}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{displayName}</p>
                <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{displayEmail}</p>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className={`absolute bottom-full left-4 right-4 mb-2 rounded-lg shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowUserMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>

                <button
                  onClick={() => {
                    toggleTheme();
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDarkMode ? 'Light mode' : 'Dark mode'}
                </button>

                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-red-400`}
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}