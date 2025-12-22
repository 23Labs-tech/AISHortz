// ============================================
// FILE: app/api/auth/instagram/callback/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies(); // Next.js 15 requires await
  const searchParams = request.nextUrl.searchParams;
  
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_reason');
  const errorDescription = searchParams.get('error_description');

  // Check for errors from Instagram
  if (error) {
    console.error('Instagram OAuth error:', error, errorReason, errorDescription);
    return NextResponse.redirect(
      new URL(`/dashboard/settings/connections?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  // Verify state to prevent CSRF
  const storedState = cookieStore.get('instagram_oauth_state')?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      new URL('/dashboard/settings/connections?error=Invalid state parameter', request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/settings/connections?error=No authorization code received', request.url)
    );
  }

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

  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.redirect(new URL('/login?error=Session expired', request.url));
  }

  try {
    // Exchange code for short-lived access token
    const shortLivedToken = await exchangeCodeForToken(code);
    
    if (!shortLivedToken.access_token) {
      throw new Error('Failed to get access token');
    }

    // Exchange short-lived token for long-lived token
    const longLivedToken = await getLongLivedToken(shortLivedToken.access_token);

    // Get user info from Instagram
    const userInfo = await getInstagramUserInfo(longLivedToken.access_token);

    // Store in database
    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: session.user.id,
        provider: 'instagram',
        provider_account_id: userInfo.id,
        username: userInfo.username,
        display_name: userInfo.username,
        profile_image_url: null,
        access_token: longLivedToken.access_token,
        refresh_token: null,
        token_expires_at: new Date(Date.now() + longLivedToken.expires_in * 1000).toISOString(),
        scopes: ['user_profile', 'user_media'],
        metadata: {
          account_type: userInfo.account_type,
          media_count: userInfo.media_count,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider,provider_account_id',
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save account');
    }

    // Clear the state cookie and redirect
    const response = NextResponse.redirect(
      new URL('/dashboard/settings/connections?success=Instagram connected successfully', request.url)
    );
    response.cookies.delete('instagram_oauth_state');
    
    return response;

  } catch (err: any) {
    console.error('Instagram callback error:', err);
    return NextResponse.redirect(
      new URL(`/dashboard/settings/connections?error=${encodeURIComponent(err.message || 'Failed to connect Instagram')}`, request.url)
    );
  }
}

async function exchangeCodeForToken(code: string) {
  const appId = process.env.INSTAGRAM_APP_ID!;
  const appSecret = process.env.INSTAGRAM_APP_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;

  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code,
    }),
  });

  const data = await response.json();
  
  if (data.error_message) {
    throw new Error(data.error_message);
  }

  return data;
}

async function getLongLivedToken(shortLivedToken: string) {
  const appSecret = process.env.INSTAGRAM_APP_SECRET!;

  const params = new URLSearchParams({
    grant_type: 'ig_exchange_token',
    client_secret: appSecret,
    access_token: shortLivedToken,
  });

  const response = await fetch(
    `https://graph.instagram.com/access_token?${params.toString()}`
  );

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }

  return data;
}

async function getInstagramUserInfo(accessToken: string) {
  const params = new URLSearchParams({
    fields: 'id,username,account_type,media_count',
    access_token: accessToken,
  });

  const response = await fetch(
    `https://graph.instagram.com/me?${params.toString()}`
  );

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }

  return data;
}