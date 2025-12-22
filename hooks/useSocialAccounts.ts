// ============================================
// FILE: hooks/useSocialAccounts.ts
// ============================================
// This hook fetches and manages connected social accounts
// Use this in any component to check connection status

'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export interface SocialAccount {
  id: string;
  provider: 'tiktok' | 'instagram';
  provider_account_id: string;
  username: string;
  display_name: string;
  profile_image_url: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string;
  scopes: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function useSocialAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('social_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setAccounts(data || []);
    } catch (err: any) {
      console.error('Error fetching social accounts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAccountByProvider = (provider: 'tiktok' | 'instagram') => {
    return accounts.find(acc => acc.provider === provider);
  };

  const isConnected = (provider: 'tiktok' | 'instagram') => {
    return accounts.some(acc => acc.provider === provider);
  };

  const isTokenValid = (provider: 'tiktok' | 'instagram') => {
    const account = getAccountByProvider(provider);
    if (!account) return false;
    return new Date(account.token_expires_at) > new Date();
  };

  const disconnectAccount = async (provider: string, accountId: string) => {
    try {
      const response = await fetch('/api/auth/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, accountId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      // Remove from local state
      setAccounts(accounts.filter(
        acc => !(acc.provider === provider && acc.provider_account_id === accountId)
      ));

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
    getAccountByProvider,
    isConnected,
    isTokenValid,
    disconnectAccount,
    tiktokAccount: getAccountByProvider('tiktok'),
    instagramAccount: getAccountByProvider('instagram'),
  };
}