// app/dashboard/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { LogOut, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [planType, setPlanType] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

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
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user data from database
          const { data: userData } = await supabase
            .from('users')
            .select('credit_balance, plan_type, subscription_status')
            .eq('id', session.user.id)
            .single();
          
          if (userData) {
            setCredits(userData.credit_balance || 0);
            setPlanType(userData.plan_type || 'free');
            setSubscriptionStatus(userData.subscription_status);
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase, router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  const userEmail = user?.email || '';
  const userName = user?.user_metadata?.full_name || userEmail.split('@')[0];

  // Check if user is on paid plan
  const PAID_PLAN_TYPES = ['plus', 'max', 'generative', 'team', 'pro', 'premium', 'starter', 'creator', 'agency'];
  const isPaidUser = (
    subscriptionStatus === 'active' ||
    (planType && PAID_PLAN_TYPES.includes(planType.toLowerCase())) ||
    credits > 0
  );

  // Get display plan name
  const displayPlanName = planType 
    ? planType.charAt(0).toUpperCase() + planType.slice(1) 
    : 'Free';

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{userEmail}</p>
        </div>

        {/* Plan Section */}
        <div className={`rounded-2xl p-6 mb-6 ${isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your plan</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{displayPlanName}</p>
              {subscriptionStatus === 'active' && (
                <span className="inline-block mt-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>
            {!isPaidUser ? (
              <Link
                href="/pricing"
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-full font-semibold transition text-white"
              >
                Upgrade
                <ArrowUpRight size={18} />
              </Link>
            ) : (
              <Link
                href="/pricing"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-full font-semibold transition text-white"
              >
                Buy More Credits
                <ArrowUpRight size={18} />
              </Link>
            )}
          </div>

          {/* Credits Display */}
          <div className={`mt-6 pt-6 ${isDarkMode ? 'border-t border-gray-800' : 'border-t border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Credits available</p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{credits}</p>
              </div>
              <Link
                href="/pricing"
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                Get more credits →
              </Link>
            </div>
          </div>
        </div>

        {/* Billing Section */}
        <div className={`rounded-2xl p-6 mb-6 ${isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <button
            className={`flex items-center gap-3 text-left w-full p-4 rounded-lg transition ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}
            onClick={() => router.push('/pricing')}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Manage Billing</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>View your subscription and billing history</p>
            </div>
            <ArrowUpRight size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
          </button>
        </div>

        {/* Account Section */}
        <div className={`rounded-2xl p-6 mb-6 ${isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Account</h2>
          
          {/* User Info */}
          <div className="space-y-4">
            <div>
              <label className={`text-sm block mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</label>
              <div className={`rounded-lg px-4 py-3 ${isDarkMode ? 'bg-gray-800/50 border border-gray-700 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}>
                {userName}
              </div>
            </div>
            
            <div>
              <label className={`text-sm block mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</label>
              <div className={`rounded-lg px-4 py-3 ${isDarkMode ? 'bg-gray-800/50 border border-gray-700 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}>
                {userEmail}
              </div>
            </div>

            <div>
              <label className={`text-sm block mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Timezone</label>
              <div className={`rounded-lg px-4 py-3 ${isDarkMode ? 'bg-gray-800/50 border border-gray-700 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}>
                {Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900/10 border border-red-900/30 rounded-2xl p-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 px-6 py-4 rounded-lg transition text-left"
          >
            <LogOut size={20} className="text-red-400" />
            <div>
              <p className="font-semibold text-red-400">Logout</p>
              <p className="text-sm text-red-300/70">Sign out of your account</p>
            </div>
          </button>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className={`transition ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}