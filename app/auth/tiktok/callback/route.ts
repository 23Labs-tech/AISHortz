// ============================================
// FILE: app/api/auth/tiktok/callback/route.ts
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
  const errorDescription = searchParams.get('error_description');

  // Check for errors from TikTok
  if (error) {
    console.error('TikTok OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/dashboard/settings/connections?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  // Verify state to prevent CSRF
  const storedState = cookieStore.get('tiktok_oauth_state')?.value;
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
    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code);
    
    if (!tokenResponse.access_token) {
      throw new Error('Failed to get access token');
    }

    // Get user info from TikTok
    const userInfo = await getTikTokUserInfo(tokenResponse.access_token);

    // Store in database
    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: session.user.id,
        provider: 'tiktok',
        provider_account_id: userInfo.open_id,
        username: userInfo.username || userInfo.display_name,
        display_name: userInfo.display_name,
        profile_image_url: userInfo.avatar_url,
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        token_expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
        scopes: tokenResponse.scope?.split(',') || [],
        metadata: {
          follower_count: userInfo.follower_count,
          following_count: userInfo.following_count,
          likes_count: userInfo.likes_count,
          video_count: userInfo.video_count,
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
      new URL('/dashboard/settings/connections?success=TikTok connected successfully', request.url)
    );
    response.cookies.delete('tiktok_oauth_state');
    
    return response;

  } catch (err: any) {
    console.error('TikTok callback error:', err);
    return NextResponse.redirect(
      new URL(`/dashboard/settings/connections?error=${encodeURIComponent(err.message || 'Failed to connect TikTok')}`, request.url)
    );
  }
}

async function exchangeCodeForToken(code: string) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY!;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`;

  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  return data;
}

async function getTikTokUserInfo(accessToken: string) {
  const response = await fetch(
    'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username,follower_count,following_count,likes_count,video_count',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || 'Failed to get user info');
  }

  return data.data.user;
}