// app/terms/page.tsx
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10">Back</Link>
        <h1 className="text-5xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-400 mb-10">Last updated: December 2025</p>
        <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
          <p>By using AIShortz.app, you agree to the following terms.</p>
          <h2>Use of the Service</h2>
          <p>Users must not misuse the service, reverse-engineer, or upload harmful content.</p>
          <h2>Ownership</h2>
          <p>You own your videos. We own the platform and technology.</p>
          <h2>Subscriptions and Billing</h2>
          <p>Auto-renew unless cancelled. Access retained until billing period ends.</p>
          <h2>Acceptable Use</h2>
          <p>No reselling, impersonation, or illegal use.</p>
          <h2>Termination</h2>
          <p>We may suspend accounts violating these terms.</p>
          <p>Contact: <a href="mailto:legal@aishorts.app" className="text-purple-400 underline">legal@aishorts.app</a></p>
        </div>
      </div>
    </div>
  );
}