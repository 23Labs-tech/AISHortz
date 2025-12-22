// app/components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const session = localStorage.getItem("userSession") ||
                      sessionStorage.getItem("userSession") ||
                      document.cookie.includes("auth_token=");
      setIsLoggedIn(!!session);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? `py-3 ${isDarkMode ? "bg-black/90" : "bg-white/90"} backdrop-blur-md`
          : `py-5 ${isDarkMode ? "bg-black" : "bg-white"}`
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
            <div className="w-12 h-12">
              <img
                src="/WhatsApp Image 2025-12-03 at 15.22.59.jpeg"
                alt="AIShortz Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold">AIShortz</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
            <a href="#examples" className="text-gray-300 hover:text-white transition">Examples</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-full font-semibold text-white transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white transition">
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-full font-semibold text-white transition"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">
          <div className="px-6 py-8 space-y-6 text-center">
            <a href="#features" className="block text-gray-300 hover:text-white">Features</a>
            <a href="#pricing" className="block text-gray-300 hover:text-white">Pricing</a>
            <a href="#examples" className="block text-gray-300 hover:text-white">Examples</a>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full py-3 bg-gray-800 rounded-full flex items-center justify-center gap-2"
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>

            {isLoggedIn ? (
              <Link href="/dashboard" className="block w-full bg-purple-600 py-3 rounded-full font-bold">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="block text-gray-300">Sign in</Link>
                <Link href="/login" className="block w-full bg-purple-600 py-3 rounded-full font-bold">
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}