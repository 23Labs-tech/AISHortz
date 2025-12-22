// ============================================
// FILE: app/dashboard/settings/connections/page.tsx
// ============================================
// This is the UI page where users manage their connected social accounts
// Shows TikTok and Instagram connection status with connect/disconnect buttons

'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ExternalLink, 
  Trash2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface SocialAccount {
  id: string;
  provider: string;
  provider_account_id: string;
  username: string;
  display_name: string;
  profile_image_url: string | null;
  token_expires_at: string;
  metadata: {
    follower_count?: number;
    following_count?: number;
    likes_count?: number;
    video_count?: number;
    media_count?: number;
    account_type?: string;
  };
  created_at: string;
}

export default function ConnectionsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const searchParams = useSearchParams();
  
  const successMessage = searchParams.get('success');
  const errorMessage = searchParams.get('error');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const disconnectAccount = async (provider: string, accountId: string) => {
    if (!confirm(`Are you sure you want to disconnect this ${provider} account?`)) {
      return;
    }

    setDisconnecting(`${provider}-${accountId}`);

    try {
      const response = await fetch('/api/auth/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, accountId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      // Remove from local state
      setAccounts(accounts.filter(
        acc => !(acc.provider === provider && acc.provider_account_id === accountId)
      ));

    } catch (err: any) {
      alert(err.message || 'Failed to disconnect account');
    } finally {
      setDisconnecting(null);
    }
  };

  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getProviderIcon = (provider: string) => {
    if (provider === 'tiktok') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
        </svg>
      );
    }
    if (provider === 'instagram') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      );
    }
    return null;
  };

  const getProviderColor = (provider: string) => {
    if (provider === 'tiktok') return 'from-black to-gray-800';
    if (provider === 'instagram') return 'from-purple-600 via-pink-500 to-orange-400';
    return 'from-gray-600 to-gray-800';
  };

  const tiktokAccount = accounts.find(acc => acc.provider === 'tiktok');
  const instagramAccount = accounts.find(acc => acc.provider === 'instagram');

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-black'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} mb-4 inline-block`}
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Connected Accounts</h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Connect your social media accounts to publish videos directly from AIShortz
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-green-400">{successMessage}</span>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <XCircle className="text-red-500" size={20} />
            <span className="text-red-400">{errorMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-purple-500" size={40} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* TikTok Connection */}
            <div className={`rounded-2xl border-2 overflow-hidden ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <div className={`p-6 bg-gradient-to-r ${getProviderColor('tiktok')}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black">
                    {getProviderIcon('tiktok')}
                  </div>
                  <div className="text-white">
                    <h2 className="text-xl font-bold">TikTok</h2>
                    <p className="text-white/70 text-sm">Share videos to TikTok</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {tiktokAccount ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {tiktokAccount.profile_image_url && (
                          <img 
                            src={tiktokAccount.profile_image_url} 
                            alt={tiktokAccount.username}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-semibold">@{tiktokAccount.username}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {tiktokAccount.display_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={20} />
                        <span className="text-green-500 text-sm font-medium">Connected</span>
                      </div>
                    </div>

                    {/* Stats */}
                    {tiktokAccount.metadata && (
                      <div className={`grid grid-cols-4 gap-4 pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{tiktokAccount.metadata.follower_count?.toLocaleString() || 0}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Followers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{tiktokAccount.metadata.following_count?.toLocaleString() || 0}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Following</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{tiktokAccount.metadata.likes_count?.toLocaleString() || 0}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Likes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{tiktokAccount.metadata.video_count?.toLocaleString() || 0}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Videos</p>
                        </div>
                      </div>
                    )}

                    {/* Token Status */}
                    {isTokenExpired(tiktokAccount.token_expires_at) && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <AlertCircle className="text-yellow-500" size={18} />
                        <span className="text-yellow-400 text-sm">Token expired. Please reconnect.</span>
                        <Link 
                          href="/api/auth/tiktok"
                          className="ml-auto flex items-center gap-1 text-yellow-400 hover:text-yellow-300 text-sm"
                        >
                          <RefreshCw size={14} />
                          Reconnect
                        </Link>
                      </div>
                    )}

                    {/* Disconnect Button */}
                    <button
                      onClick={() => disconnectAccount('tiktok', tiktokAccount.provider_account_id)}
                      disabled={disconnecting === `tiktok-${tiktokAccount.provider_account_id}`}
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm mt-4"
                    >
                      {disconnecting === `tiktok-${tiktokAccount.provider_account_id}` ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Disconnect Account
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Connect your TikTok account to start publishing videos
                    </p>
                    <Link
                      href="/api/auth/tiktok"
                      className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition"
                    >
                      {getProviderIcon('tiktok')}
                      Connect TikTok
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Instagram Connection */}
            <div className={`rounded-2xl border-2 overflow-hidden ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <div className={`p-6 bg-gradient-to-r ${getProviderColor('instagram')}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-pink-600">
                    {getProviderIcon('instagram')}
                  </div>
                  <div className="text-white">
                    <h2 className="text-xl font-bold">Instagram</h2>
                    <p className="text-white/70 text-sm">Share reels to Instagram</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {instagramAccount ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                          {instagramAccount.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">@{instagramAccount.username}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {instagramAccount.metadata?.account_type || 'Personal Account'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={20} />
                        <span className="text-green-500 text-sm font-medium">Connected</span>
                      </div>
                    </div>

                    {/* Stats */}
                    {instagramAccount.metadata && (
                      <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{instagramAccount.metadata.media_count?.toLocaleString() || 0}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Posts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-medium capitalize">{instagramAccount.metadata.account_type || 'Personal'}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Account Type</p>
                        </div>
                      </div>
                    )}

                    {/* Token Status */}
                    {isTokenExpired(instagramAccount.token_expires_at) && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <AlertCircle className="text-yellow-500" size={18} />
                        <span className="text-yellow-400 text-sm">Token expired. Please reconnect.</span>
                        <Link 
                          href="/api/auth/instagram"
                          className="ml-auto flex items-center gap-1 text-yellow-400 hover:text-yellow-300 text-sm"
                        >
                          <RefreshCw size={14} />
                          Reconnect
                        </Link>
                      </div>
                    )}

                    {/* Disconnect Button */}
                    <button
                      onClick={() => disconnectAccount('instagram', instagramAccount.provider_account_id)}
                      disabled={disconnecting === `instagram-${instagramAccount.provider_account_id}`}
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm mt-4"
                    >
                      {disconnecting === `instagram-${instagramAccount.provider_account_id}` ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Disconnect Account
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Connect your Instagram account to share reels
                    </p>
                    <Link
                      href="/api/auth/instagram"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
                    >
                      {getProviderIcon('instagram')}
                      Connect Instagram
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-gray-100 border border-gray-200'}`}>
              <h3 className="font-semibold mb-3">What can you do with connected accounts?</h3>
              <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  Publish videos directly to TikTok and Instagram
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  Schedule posts for optimal engagement times
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  Track video performance and analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  Manage multiple accounts from one dashboard
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}