// app/buy-credits/success/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  const [credits, setCredits] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        setMessage('No session ID found.');
        return;
      }

      try {
        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setCredits(data.credits_added || 0);
          setMessage(`Successfully added ${data.credits_added} credits!`);
          
          // Clear the pending checkout flag
          localStorage.removeItem('pending_checkout_user');
        } else {
          setStatus('error');
          setMessage(data.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Failed to verify payment.');
      }
    };

    verifyPayment();
  }, [sessionId]);

  const handleGoToDashboard = async () => {
    // Try to refresh session first
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
      // Session exists, go to dashboard
      router.push('/dashboard');
    } else {
      // Try to refresh
      const { data: refreshData } = await supabase.auth.refreshSession();
      
      if (refreshData.session) {
        router.push('/dashboard');
      } else {
        // Session truly expired, need to login
        // But save success state so user sees their credits after login
        localStorage.setItem('payment_success', 'true');
        localStorage.setItem('credits_added', credits.toString());
        router.push('/login?redirect=/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        
        {status === 'loading' && (
          <>
            <Loader2 className="w-20 h-20 text-purple-600 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment...</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            {credits > 0 && (
              <div className="bg-purple-50 rounded-2xl p-6 mb-6">
                <p className="text-4xl font-bold text-purple-600">+{credits} Credits</p>
                <p className="text-gray-500 text-sm mt-2">Added to your account</p>
              </div>
            )}
            
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition"
            >
              Go to Dashboard
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              Your credits have been added. Click above to continue.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}