// ============================================
// FILE: app/api/auth/disconnect/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies(); // Next.js 15 requires await
  
  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { provider, accountId } = body;

    if (!provider || !accountId) {
      return NextResponse.json(
        { error: 'Provider and accountId are required' },
        { status: 400 }
      );
    }

    // Delete the social account
    const { error } = await supabase
      .from('social_accounts')
      .delete()
      .eq('user_id', session.user.id)
      .eq('provider', provider)
      .eq('provider_account_id', accountId);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: 'Failed to disconnect account' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: `${provider} disconnected successfully` });

  } catch (err: any) {
    console.error('Disconnect error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}