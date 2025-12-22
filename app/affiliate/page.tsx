// app/affiliate/page.tsx
import Link from 'next/link';

export default function AffiliateProgram() {
  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10">Back</Link>
        <h1 className="text-5xl font-bold mb-8">AIShortz Affiliate Program</h1>
        <p className="text-2xl text-gray-300 mb-12">Earn 30% recurring commission — no cap!</p>
        
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-800 rounded-3xl p-12 mb-16">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <ol className="space-y-6 text-left max-w-2xl mx-auto text-lg">
            <li>1. Apply and get approved</li>
            <li>2. Get your unique referral link</li>
            <li>3. Share on YouTube, TikTok, newsletters</li>
            <li>4. Earn monthly payouts</li>
          </ol>
        </div>

        <Link href="mailto:sales@aishorts.app" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-12 py-6 rounded-full font-bold text-2xl transition transform hover:scale-105">
          Become an Affiliate
        </Link>
      </div>
    </div>
  );
}