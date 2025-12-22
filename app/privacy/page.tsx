// app/privacy/page.tsx
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10">Back</Link>
        <h1 className="text-5xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-400 mb-10">Last updated: December 2025</p>
        <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
          <p>AIShortz.app is committed to protecting user privacy. This policy outlines how information is collected, used, and secured.</p>
          <h2>Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account details (name, email)</li>
            <li>Usage data within the platform</li>
            <li>Billing information processed through Stripe</li>
            <li>Device data, analytics, and performance metrics</li>
            <li>Content generated through the service (videos, scripts)</li>
          </ul>
          <h2>How We Use Information</h2>
          <p>To operate and improve AIShortz, generate content, provide support, ensure security, and send updates.</p>
          <h2>Data Protection</h2>
          <p>All data transmitted over encrypted HTTPS. Encrypted storage. Strict internal access controls.</p>
          <h2>Third-Party Providers</h2>
          <p>We work with Stripe, analytics platforms, and AI providers (OpenAI, ElevenLabs).</p>
          <h2>User Rights</h2>
          <p>Request account deletion, data export, or correction: <a href="mailto:privacy@aishorts.app" className="text-purple-400 underline">privacy@aishorts.app</a></p>
        </div>
      </div>
    </div>
  );
}