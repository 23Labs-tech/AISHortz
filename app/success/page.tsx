'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<{
    newBalance: number;
    amountAdded: number;
    transactionId: string;
  } | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await response.json();

        if (response.ok) {
          setPaymentData({
            newBalance: data.new_balance,
            amountAdded: data.amount_added,
            transactionId: data.transaction_id,
          });
          setLoading(false);
          
          // Redirect after 3 seconds
          setTimeout(() => {
            router.push('/phone');
          }, 3000);
        } else {
          setError(data.error || 'Payment verification failed');
          setLoading(false);
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Failed to verify payment');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md w-full">
        {loading ? (
          <>
            <Loader2 className="w-20 h-20 text-green-500 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment...</h1>
            <p className="text-gray-600">Please wait while we confirm your payment and update your balance.</p>
          </>
        ) : error ? (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Verification Failed</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/buy-credits')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your credits have been added to your account.
            </p>
            
            {paymentData && (
              <div className="space-y-3 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Amount Added</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${paymentData.amountAdded.toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">New Balance</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${paymentData.newBalance.toFixed(2)}
                  </p>
                </div>
                
                <p className="text-xs text-gray-500 mt-4">
                  Transaction ID: {paymentData.transactionId.slice(0, 8)}...
                </p>
              </div>
            )}
            
            <p className="text-sm text-gray-500 animate-pulse">
              Redirecting to phone page in 3 seconds...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-20 h-20 text-green-500 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}