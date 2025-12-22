// app/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface UserData {
  full_name: string | null;
  credit_balance: number;
  plan_type: string | null;
  subscription_status: string | null;
}

interface VideoData {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  prompt: string;
  created_at: string;
  status: string;
  model_used: string;
  credits_used: number;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recentVideos, setRecentVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
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
    async function checkAuthAndFetchData() {
      try {
        const fromPayment = localStorage.getItem('payment_success');
        
        await new Promise(resolve => setTimeout(resolve, 300));

        let { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          const { data: refreshData } = await supabase.auth.refreshSession();
          session = refreshData?.session || null;
        }

        if (!session && fromPayment) {
          localStorage.removeItem('payment_success');
          localStorage.removeItem('credits_added');
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: retryData } = await supabase.auth.getSession();
          session = retryData?.session || null;
        }

        if (fromPayment) {
          localStorage.removeItem('payment_success');
          localStorage.removeItem('credits_added');
        }

        if (!session) {
          router.push('/login');
          return;
        }

        setAuthChecking(false);
        const user = session.user;

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('full_name, credit_balance, plan_type, subscription_status')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
        } else {
          setUserData(profile);
        }

        const { data: videos, error: videosError } = await supabase
          .from('generated_videos')
          .select('id, video_url, thumbnail_url, prompt, created_at, status, model_used, credits_used')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6);

        if (videosError) {
          console.error('Videos error:', videosError);
        } else {
          setRecentVideos(videos || []);
        }

      } catch (err) {
        console.error('Failed to fetch data:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndFetchData();

    let userChannel: any;
    let videosChannel: any;

    const setupRealtimeSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      userChannel = supabase
        .channel('user-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            setUserData((prev) => ({
              ...prev,
              credit_balance: payload.new.credit_balance,
              plan_type: payload.new.plan_type,
              subscription_status: payload.new.subscription_status,
              full_name: payload.new.full_name,
            } as UserData));
          }
        )
        .subscribe();

      videosChannel = supabase
        .channel('videos-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'generated_videos',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            checkAuthAndFetchData();
          }
        )
        .subscribe();
    };

    const subscriptionTimeout = setTimeout(() => {
      setupRealtimeSubscriptions();
    }, 1000);

    return () => {
      clearTimeout(subscriptionTimeout);
      if (userChannel) supabase.removeChannel(userChannel);
      if (videosChannel) supabase.removeChannel(videosChannel);
    };
  }, [supabase, router]);

  const displayName = userData?.full_name || 'there';
  
  const PAID_PLAN_TYPES = ['starter', 'growth', 'pro', 'team', 'max', 'premium', 'starter', 'creator', 'agency'];
  const isPaidUser = (
    userData?.subscription_status === 'active' ||
    (userData?.plan_type && PAID_PLAN_TYPES.includes(userData.plan_type.toLowerCase())) ||
    (userData?.credit_balance && userData.credit_balance > 0)
  );
  const isFreePlan = !isPaidUser;
  
  const getPlanDisplayName = () => {
    if (!userData?.plan_type || userData.plan_type === 'free') {
      if (userData?.credit_balance && userData.credit_balance > 0) {
        return 'Paid';
      }
      return 'Free';
    }
    return userData.plan_type.charAt(0).toUpperCase() + userData.plan_type.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600/20 text-green-400';
      case 'generating':
        return 'bg-yellow-600/20 text-yellow-400';
      case 'failed':
        return 'bg-red-600/20 text-red-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };

  if (authChecking && loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Top Banner - Only show for FREE users with 0 credits */}
      {!loading && userData && isFreePlan && (!userData.credit_balance || userData.credit_balance === 0) && (
        <div className={`border-b ${isDarkMode ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30' : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200'}`}>
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <p className={`text-sm ${isDarkMode ? 'text-white/90' : 'text-gray-700'}`}>
              You're on <span className="font-semibold">Free Plan</span> • Upgrade to export videos and more.
            </p>
            <Link
              href="/pricing"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-full font-semibold text-sm transition text-white"
            >
              Upgrade
            </Link>
          </div>
        </div>
      )}

      {/* Credit Balance Display */}
      {!loading && userData && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="flex items-center gap-4">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${isDarkMode ? 'bg-purple-900/30 border border-purple-500/30' : 'bg-purple-100 border border-purple-200'}`}>
              <span className={isDarkMode ? 'text-purple-400' : 'text-purple-600'}>Credits:</span>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.credit_balance || 0}</span>
            </div>
            {isPaidUser && (
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${isDarkMode ? 'bg-green-900/30 border border-green-500/30' : 'bg-green-100 border border-green-200'}`}>
                <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>Plan:</span>
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getPlanDisplayName()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative mx-auto max-w-7xl px-6 pt-10 lg:px-8">
        <div className={`relative overflow-hidden rounded-3xl backdrop-blur-xl border p-10 lg:p-16 ${isDarkMode ? 'bg-gradient-to-br from-gray-900/50 via-black/90 to-gray-900/50 border-gray-800' : 'bg-gradient-to-br from-white via-gray-50 to-white border-gray-200'}`}>
          {/* Background Image */}
          <div className="absolute inset-0 opacity-30">
            <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-t from-black via-black/70 to-transparent' : 'bg-gradient-to-t from-white via-white/70 to-transparent'}`} />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-2xl">
            <h1 className={`text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome to AIShortz, {displayName}
              <span className="ml-4 inline-block">👋</span>
            </h1>
            <p className={`text-xl lg:text-2xl mb-10 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Create faceless videos on Auto-Pilot for any purpose using AI, in seconds.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard/tools/ai-video-generator"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-2xl text-white"
              >
                Create New Video
              </Link>
              <button className={`inline-flex items-center gap-3 backdrop-blur px-8 py-4 rounded-full font-medium text-lg transition-all border ${isDarkMode ? 'bg-gray-800/80 hover:bg-gray-700/80 border-gray-700 text-white' : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-900'}`}>
                Tutorials
              </button>
            </div>
          </div>

          {/* Right Side Video */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="relative w-96 h-96">
              <video
                src="/1%20(31).mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover rounded-2xl"
                poster="/globe.svg"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Videos */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent videos</h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Recently created videos</p>
          </div>
          {recentVideos.length > 0 && (
            <Link href="/dashboard/media" className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2">
              View all →
            </Link>
          )}
        </div>

        {loading ? (
          <div className={`backdrop-blur border rounded-3xl p-16 text-center ${isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="animate-pulse">
              <div className={`mx-auto w-20 h-20 rounded-full mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
              <div className={`h-8 rounded w-48 mx-auto mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
              <div className={`h-4 rounded w-64 mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            </div>
          </div>
        ) : recentVideos.length === 0 ? (
          <div className={`backdrop-blur border rounded-3xl p-16 text-center ${isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <svg className={`w-10 h-10 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M7 4h10M7 20h10" />
              </svg>
            </div>
            <h3 className={`text-2xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No video found</h3>
            <p className={`mb-8 max-w-md mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              You didn't create any video yet. Start creating amazing AI videos now!
            </p>
            <Link
              href="/dashboard/tools/ai-video-generator"
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-medium transition-all ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
            >
              + Create a single video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentVideos.map((video) => (
              <div key={video.id} className={`backdrop-blur border rounded-2xl overflow-hidden transition-all group ${isDarkMode ? 'bg-gray-900/40 border-gray-800 hover:border-purple-500/50' : 'bg-white border-gray-200 hover:border-purple-300'}`}>
                <div className={`relative aspect-video ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  {video.thumbnail_url ? (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.prompt}
                      fill
                      className="object-cover"
                    />
                  ) : video.video_url && video.video_url !== 'EMPTY' ? (
                    <video
                      src={video.video_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    {video.video_url && video.video_url !== 'EMPTY' && (
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 bg-purple-600 hover:bg-purple-700 rounded-full p-3 transition-all"
                      >
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <p className={`text-sm line-clamp-2 mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{video.prompt}</p>
                  <div className={`flex items-center justify-between text-xs mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span>{video.model_used}</span>
                    <span>{video.credits_used || 0} credits</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(video.status)}`}>
                      {video.status}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(video.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}