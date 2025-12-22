// app/dashboard/components/EmptyState.tsx
import Link from 'next/link';
import { Film, Plus } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        <Film className="w-12 h-12 text-gray-600" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">No video found</h3>
      <p className="text-gray-400 mb-8">You didn't create any video yet.</p>
      <Link
        href="/dashboard/create-new"
        className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-medium transition"
      >
        <Plus className="w-5 h-5" />
        Create a single video
      </Link>
    </div>
  );
}