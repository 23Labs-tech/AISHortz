// app/components/Hero.tsx
import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-8">
          <Sparkles className="text-purple-400" size={18} />
          <span className="text-purple-300 text-sm">The #1 AI Shorts & Reels Generator in 2025</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
          Turn Any Idea Into<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Viral Short Videos
          </span>
          <br />
          in 60 Seconds
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
          Generate faceless videos for TikTok, YouTube Shorts & Instagram Reels with AI — no editing skills needed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-10 py-5 rounded-full font-bold text-lg text-white transition transform hover:scale-105"
          >
            Start Creating Free
          </Link>
          <a
            href="#examples"
            className="border border-gray-700 hover:border-purple-500 px-10 py-5 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition"
          >
            Watch Examples <ChevronRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}