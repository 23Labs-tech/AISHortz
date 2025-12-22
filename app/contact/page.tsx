// app/contact/page.tsx
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10">Back</Link>
        <h1 className="text-5xl font-bold mb-8">Contact Us</h1>
        <p className="text-xl text-gray-300 mb-12">We typically respond within 24 hours</p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Support</h3>
            <a href="mailto:support@aishorts.app" className="text-purple-400 text-lg hover:underline">support@aishorts.app</a>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Sales</h3>
            <a href="mailto:sales@aishorts.app" className="text-purple-400 text-lg hover:underline">sales@aishorts.app</a>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Tech</h3>
            <a href="mailto:tech@aishorts.app" className="text-purple-400 text-lg hover:underline">tech@aishorts.app</a>
          </div>
        </div>
      </div>
    </div>
  );
}