// ============================================
// FILE: app/api/auth/tiktok/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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
    return NextResponse.redirect(new URL('/login?error=Please login first', request.url));
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID();
  
  // Store state in cookie for verification
  const response = NextResponse.redirect(getTikTokAuthUrl(state));
  response.cookies.set('tiktok_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  });

  return response;
}

function getTikTokAuthUrl(state: string): string {
  const clientKey = process.env.TIKTOK_CLIENT_KEY!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`;
  
  const scopes = [
    'user.info.basic',
    'user.info.profile',
    'user.info.stats',
    'video.list',
    'video.upload',
  ].join(',');

  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: 'code',
    scope: scopes,
    redirect_uri: redirectUri,
    state: state,
  });

  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}