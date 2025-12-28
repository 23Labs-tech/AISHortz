// app/login/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Mail, Lock, User, Loader2, CheckCircle } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Create Supabase client using the NEW official method
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Get redirect URL from query params
  const redirectUrl = searchParams?.get('redirect') || '/dashboard';
  const paymentStatus = searchParams?.get('payment');

  // Check for payment success and OAuth errors
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      setError('Authentication failed. Please try again.');
    }
    
    // Show payment success message if coming from payment
    if (paymentStatus === 'success') {
      setShowPaymentSuccess(true);
    }
  }, [searchParams, paymentStatus]);

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Already logged in, redirect to intended destination
        console.log('User already logged in, redirecting to:', redirectUrl);
        router.replace(redirectUrl);
      } else {
        setChecking(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User just signed in, redirect to intended destination
          console.log('User signed in, redirecting to:', redirectUrl);
          router.push(redirectUrl);
        } else if (event === 'SIGNED_OUT') {
          setChecking(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
            data: { full_name: fullName },
          },
        });

        if (error) throw error;

        alert('Check your email to confirm your account!');
        setFullName('');
        setEmail('');
        setPassword('');
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        // Successful login - redirect will be handled by onAuthStateChange
        // But also do explicit redirect as backup
        if (data.session) {
          console.log('Login successful, redirecting to:', redirectUrl);
          router.push(redirectUrl);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Include the redirect URL in the callback
    const callbackUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`;
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
      },
    });
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        {/* Left: Form */}
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="AIShortz" className="h-36 object-contain" />
          </div>

          {/* Payment Success Message */}
          {showPaymentSuccess && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-2xl p-5 mb-8 flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-400 font-bold text-lg">Payment Successful! 🎉</p>
                <p className="text-green-300/80 text-sm mt-1">
                  Your credits have been added to your account. Please sign in to continue.
                </p>
              </div>
            </div>
          )}

          <h1 className="text-4xl font-bold text-white mb-10">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full pl-12 pr-5 py-4 bg-gray-900 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-12 pr-5 py-4 bg-gray-900 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-5 py-4 bg-gray-900 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-center text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-2xl transition disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-white font-bold hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>

          <div className="my-8 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <span className="relative bg-black px-4 text-gray-500 text-sm">Or continue with</span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>

        {/* Right: Social Proof */}
        <div className="hidden lg:block text-center">
          <div className="flex justify-center -space-x-4 mb-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <img
                key={i}
                src={`/a${i}.jpeg`}
                alt={`Creator ${i}`}
                className="w-16 h-16 rounded-full border-4 border-black object-cover shadow-xl"
              />
            ))}
            <div className="w-16 h-16 rounded-full border-4 border-black bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-xl">
              +99
            </div>
          </div>
          <p className="text-yellow-400 text-5xl font-bold">5.0 ★★★★★</p>
          <p className="text-gray-400 text-xl mt-4">Trusted by 27,000+ creators</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}