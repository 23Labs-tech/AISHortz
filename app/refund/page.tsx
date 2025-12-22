// app/refund/page.tsx
import Link from 'next/link';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10">Back</Link>
        <h1 className="text-5xl font-bold mb-8">Refund Policy</h1>
        <p className="text-gray-400 mb-10">Last updated: December 2025</p>
        <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
          <h2>7-Day Guarantee</h2>
          <p>Full refund within 7 days of subscribing if unsatisfied.</p>
          <h2>Limitations</h2>
          <p>No refund if:</p>
          <ul className="list-disc pl-6">
            <li>More than 7 days passed</li>
            <li>Substantial usage occurred</li>
            <li>Abuse detected</li>
          </ul>
          <p>Email: <a href="mailto:billing@aishorts.app" className="text-purple-400 underline">billing@aishorts.app</a></p>
        </div>
      </div>
    </div>
  );
}