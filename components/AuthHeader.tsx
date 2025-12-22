// app/components/AuthHeader.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkLogin = () => {
      const loggedIn =
        localStorage.getItem("userSession") === "true" ||
        localStorage.getItem("authToken") ||
        document.cookie.includes("auth_token");

      setIsLoggedIn(!!loggedIn);

      // If on homepage and logged in → redirect to dashboard
      if (loggedIn && window.location.pathname === "/") {
        router.replace("/dashboard");
      }
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);
    const interval = setInterval(checkLogin, 1000); // fallback poll

    return () => {
      window.removeEventListener("storage", checkLogin);
      clearInterval(interval);
    };
  }, [router]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-lg" : "bg-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/WhatsApp Image 2025-12-03 at 15.22.59.jpeg"
              alt="AIShortz"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold">AIShortz</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
            <a href="#examples" className="text-gray-300 hover:text-white transition">Examples</a>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4 hidden md:flex">
            {isLoggedIn ? (
              <>
                {/* Optional: Avatar */}
                <button className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  <User size={18} />
                </button>
                <Link
                  href="/dashboard"
                  className="bg-purple-600 hover:bg-purple-500 px-6 py-2.5 rounded-full font-medium transition"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white">
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-7 py-2.5 rounded-full font-medium text-white shadow-lg"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur border-t border-gray-800">
          <div className="px-6 py-6 space-y-4">
            <a href="#features" className="block text-gray-300">Features</a>
            <a href="#pricing" className="block text-gray-300">Pricing</a>
            <a href="#examples" className="block text-gray-300">Examples</a>
            <div className="h-px bg-gray-800 my-4" />
            {isLoggedIn ? (
              <Link href="/dashboard" className="block w-full bg-purple-600 text-center py-3 rounded-full">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="block text-gray-300 text-center">Sign in</Link>
                <Link href="/login" className="block w-full bg-purple-600 text-center py-3 rounded-full">
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}