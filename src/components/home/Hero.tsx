'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Sprout, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export function Hero() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/market-rates?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative pt-44 pb-24 overflow-hidden bg-gradient-to-b from-primary-50/50 via-background to-background dark:from-primary-950/20" style={{ paddingTop: '160px' }}>
      {/* Background blobs for premium decoration */}
      <div className="absolute top-1/4 -left-64 w-[600px] h-[600px] rounded-full bg-primary-500/5 blur-3xl -z-10" />
      <div className="absolute bottom-10 -right-64 w-[500px] h-[500px] rounded-full bg-harvest-500/5 blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left animate-fade-in-up">
            
            {/* Direct Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-750 dark:text-primary-405 font-bold text-sm max-w-fit shadow-xs">
              <Sprout className="w-4 h-4 text-primary-500" />
              <span>{t.hero.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              {t.hero.titleLine1} <br />
              <span className="text-primary-500">{t.hero.titleLine2}</span> <br />
              {t.hero.titleLine3}
            </h1>

            {/* Sub-text */}
            <p className="text-lg sm:text-xl text-earth-600 dark:text-earth-300 max-w-2xl font-medium">
              {t.hero.subtitle}
            </p>

            {/* Interactive Search Bar */}
            <form id="explore" onSubmit={handleSearchSubmit} className="relative max-w-xl w-full scroll-mt-28">
              <div className="relative flex items-center">
                <Search className="absolute left-4.5 w-5.5 h-5.5 text-earth-450 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t.hero.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12.5 pr-28 py-4 sm:py-5 rounded-2xl border border-border bg-card text-foreground placeholder-earth-400 focus:outline-none focus:ring-4 focus:ring-primary-500/25 text-base font-semibold shadow-md shadow-earth-200/10 dark:shadow-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-5 py-2.5 sm:py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm sm:text-base shadow-sm transition-all hover:scale-102 cursor-pointer"
                >
                  {t.hero.searchBtn}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-bold text-earth-500">
                <span>{t.hero.popular}:</span>
                <button type="button" onClick={() => setSearchQuery('Tomatoes')} className="hover:text-primary-500 transition-colors">Tomatoes</button>
                <span>•</span>
                <button type="button" onClick={() => setSearchQuery('Wheat')} className="hover:text-primary-500 transition-colors">Wheat</button>
                <span>•</span>
                <button type="button" onClick={() => setSearchQuery('Potatoes')} className="hover:text-primary-500 transition-colors">Potatoes</button>
              </div>
            </form>

            {/* CTA Farmer / Buyer buttons - Big and accessible */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2">
              <Link
                href="/register?role=farmer"
                className="flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-lg shadow-lg shadow-primary-600/20 hover:shadow-primary-600/35 transition-all hover:-translate-y-0.5 active:translate-y-0 text-center"
              >
                <span>{t.hero.farmerBtn}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#explore"
                className="flex items-center justify-center gap-2 px-8 py-5 rounded-2xl border-2 border-earth-300 dark:border-earth-700 hover:border-primary-500 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 text-foreground font-extrabold text-lg transition-all text-center"
              >
                <span>{t.hero.buyerBtn}</span>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-earth-200 dark:border-earth-900">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-earth-600 dark:text-earth-400">{t.hero.trustEscrow}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-earth-600 dark:text-earth-400">{t.hero.trustLogistics}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600">
                  <Sprout className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-earth-600 dark:text-earth-400">{t.hero.trustMarkup}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visuals */}
          <div className="lg:col-span-5 flex justify-center items-center relative select-none animate-fade-in">
            {/* Green glowing border around visual */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-harvest-400/10 rounded-3xl blur-2xl -z-10" />
            
            {/* Visual Container */}
            <div className="relative w-full max-w-md aspect-square lg:max-w-none rounded-3xl overflow-hidden border-4 border-card dark:border-earth-900 shadow-2xl shadow-primary-900/10 hover-lift">
              <Image
                src="/images/hero.png"
                alt="AgroMart high-tech digital farming demonstration"
                fill
                priority
                className="object-cover"
                sizes="(max-w-1024px) 100vw, 500px"
              />
              
              {/* Floating glass card 1 */}
              <div className="absolute top-6 left-6 glassmorphism px-4 py-3 rounded-2xl shadow-md border border-white/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-harvest-500 flex items-center justify-center text-white">
                  <TrendingUpIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-earth-500 dark:text-earth-450 uppercase">Harvest Yield Avg</div>
                  <div className="text-sm font-black text-foreground">+18.5% growth</div>
                </div>
              </div>

              {/* Floating glass card 2 */}
              <div className="absolute bottom-6 right-6 glassmorphism px-4 py-3 rounded-2xl shadow-md border border-white/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-earth-500 dark:text-earth-450 uppercase">Trade Security</div>
                  <div className="text-sm font-black text-foreground">Verified Escrow</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// Simple internal icon for visual ease
function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}
