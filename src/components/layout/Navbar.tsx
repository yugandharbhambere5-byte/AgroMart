'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu, X, ShoppingCart, User, Sprout, ArrowRight, Globe, TrendingUp, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useTranslation, Language } from '@/context/LanguageContext';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();
  
  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
    setMounted(true);
    
    // Check active session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    // Check scroll
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Prevent layout shift during theme mounting
  const renderThemeToggle = () => {
    if (!mounted) return <div className="w-10 h-10 rounded-xl bg-earth-100 dark:bg-earth-800 animate-pulse" />;
    return (
      <button
        onClick={toggleTheme}
        className="p-3 rounded-xl bg-earth-100 hover:bg-primary-100 text-earth-700 hover:text-primary-700 dark:bg-earth-800 dark:hover:bg-primary-900/30 dark:text-earth-300 dark:hover:text-primary-400 transition-all hover:scale-105 active:scale-95 focus:ring-2 focus:ring-primary-500 cursor-pointer group/theme"
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 group-hover/theme:rotate-90 transition-transform duration-500" />
        ) : (
          <Moon className="w-5 h-5 group-hover/theme:-rotate-12 transition-transform duration-500" />
        )}
      </button>
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b navbar-bg-scrolled border-border shadow-md ${
        scrolled ? 'py-3' : 'py-4'
      }`}
    >
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sprout className="w-5.5 h-5.5 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Agro<span className="text-primary-500">Mart</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#about"
              className="text-base font-semibold text-earth-600 hover:text-primary-500 dark:text-earth-300 dark:hover:text-primary-400 transition-colors"
            >
              {t.common.about}
            </Link>
            <Link
              href="#features"
              className="text-base font-semibold text-earth-600 hover:text-primary-500 dark:text-earth-300 dark:hover:text-primary-400 transition-colors"
            >
              {t.common.features}
            </Link>
            <Link
              href="/market-rates"
              className="flex items-center gap-1.5 text-base font-semibold text-earth-600 hover:text-primary-500 dark:text-earth-300 dark:hover:text-primary-400 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              {t.common.stats}
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Language Selector Dropdown */}
            <div className="relative flex items-center">
              <Globe className="absolute left-3 w-4 h-4 text-earth-450 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="pl-9 pr-8 py-2.5 rounded-xl border border-border bg-earth-100 hover:bg-primary-100 dark:bg-earth-800 dark:hover:bg-primary-900/30 text-xs font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer appearance-none"
              >
                <option value="en">EN</option>
                <option value="mr">मराठी</option>
                <option value="hi">हिंदी</option>
              </select>
              <span className="absolute right-3 text-earth-450 pointer-events-none text-[8px] font-black">▼</span>
            </div>

            {renderThemeToggle()}

            <Link
              href="#cart"
              className="p-3 rounded-xl bg-earth-100 hover:bg-primary-100 text-earth-700 hover:text-primary-700 dark:bg-earth-800 dark:hover:bg-primary-900/30 dark:text-earth-300 dark:hover:text-primary-400 transition-all hover:scale-105 active:scale-95 relative group/cart"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5 group-hover/cart:-translate-y-0.5 transition-transform duration-300" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-harvest-500 rounded-full" />
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold transition-all text-sm"
                >
                  <User className="w-4 h-4" />
                  <span>{t.common.myFarm}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2.5 rounded-xl text-earth-600 hover:text-red-500 dark:text-earth-300 dark:hover:text-red-400 font-semibold transition-colors cursor-pointer text-sm"
                >
                  {t.common.signOut}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-earth-700 dark:text-earth-200 hover:text-primary-500 dark:hover:text-primary-400 font-semibold transition-colors"
                >
                  {t.common.signIn}
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-md shadow-primary-600/15 hover:shadow-lg hover:shadow-primary-600/25 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm"
                >
                  {t.common.getStarted} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex md:hidden items-center gap-2">
            {/* Show Login or Dashboard/Logout directly on the header screen */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/dashboard"
                  className="p-2.5 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-600 dark:text-primary-400 transition-all active:scale-95"
                  title={t.common.dashboard}
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all cursor-pointer active:scale-95"
                  title={t.common.signOut}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-black shadow-md shadow-primary-500/10 transition-all active:scale-95"
              >
                {t.common.signIn}
              </Link>
            )}

            {renderThemeToggle()}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-earth-100 dark:bg-earth-800 text-foreground transition-all cursor-pointer active:scale-95"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-45 w-full max-w-sm bg-card border-l border-border shadow-2xl p-6 md:hidden flex flex-col justify-between transition-transform duration-300 ease-in-out transform ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button inside Drawer */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-3 rounded-xl bg-earth-100 dark:bg-earth-800 text-foreground hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col gap-6 mt-16">
          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-border mt-2">
            <span className="text-xs font-black uppercase text-earth-500">Language / भाषा</span>
            <div className="relative flex items-center">
              <Globe className="absolute left-2.5 w-3.5 h-3.5 text-earth-450 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="pl-8 pr-6 py-2 rounded-lg border border-border bg-earth-100 dark:bg-earth-800 text-xs font-bold text-foreground focus:outline-none appearance-none"
              >
                <option value="en">English</option>
                <option value="mr">मराठी</option>
                <option value="hi">हिंदी</option>
              </select>
              <span className="absolute right-2 text-[8px] text-earth-450 pointer-events-none font-bold">▼</span>
            </div>
          </div>

          {/* Mobile Auth Actions - Top Section for Instant Visibility */}
          <div className="pb-4 border-b border-border flex flex-col gap-2">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold shadow-sm"
                >
                  <User className="w-4.5 h-4.5" />
                  <span>{t.common.dashboard}</span>
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl border border-red-500/20 text-red-500 text-sm font-bold hover:bg-red-500/5 cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  <span>{t.common.signOut}</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-center text-sm font-bold text-foreground hover:bg-earth-100 dark:hover:bg-earth-800"
                >
                  {t.common.signIn}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-center text-sm font-bold shadow-md shadow-primary-500/10 hover:bg-primary-700"
                >
                  {t.common.getStarted}
                </Link>
              </div>
            )}
          </div>

          <Link
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-bold text-earth-700 dark:text-earth-200 hover:text-primary-500 py-2 border-b border-earth-100 dark:border-earth-800"
          >
            {t.about.badge}
          </Link>
          <Link
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-bold text-earth-700 dark:text-earth-200 hover:text-primary-500 py-2 border-b border-earth-100 dark:border-earth-800"
          >
            {t.common.features}
          </Link>
          <Link
            href="/market-rates"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-lg font-bold text-earth-700 dark:text-earth-200 hover:text-primary-500 py-2 border-b border-earth-100 dark:border-earth-800"
          >
            <TrendingUp className="w-5 h-5 text-primary-500" />
            {t.common.stats}
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex flex-col gap-4 mt-auto">
          <Link
            href="#cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-earth-100 dark:bg-earth-800 font-bold"
          >
            <ShoppingCart className="w-5 h-5 text-primary-500" />
            <span>{t.common.myCart}</span>
          </Link>
        </div>
      </div>
      
      {/* Backdrop for drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}
    </header>
  );
}
