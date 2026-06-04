'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, ShoppingBag } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export function CTA() {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-background relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          
          {/* Card 1: Farmers */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 text-white flex flex-col justify-between gap-8 relative overflow-hidden shadow-lg shadow-primary-950/15 group">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 blur-xl group-hover:scale-110 transition-transform" />
            <div className="absolute top-8 right-8 text-white/10">
              <Leaf className="w-32 h-32 rotate-12" />
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <span className="text-xs font-black uppercase tracking-widest text-primary-100 bg-white/10 px-3 py-1.5 rounded-full max-w-fit">
                {t.cta.farmerTag}
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t.cta.farmerTitle}
              </h3>
              <p className="text-base text-primary-100 max-w-md font-medium leading-relaxed">
                {t.cta.farmerDesc}
              </p>
            </div>

            <div className="relative z-10">
              <Link
                href="/register?role=farmer"
                className="inline-flex items-center gap-2 px-8 py-5 rounded-2xl bg-white hover:bg-primary-50 text-primary-800 font-extrabold text-lg shadow-md transition-all hover:scale-102 cursor-pointer w-full sm:w-auto justify-center"
              >
                <span>{t.cta.farmerBtn}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="mt-3 text-xs text-primary-100 font-semibold pl-1">
                {t.cta.farmerFeatures}
              </div>
            </div>
          </div>

          {/* Card 2: Buyers */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-earth-900 to-earth-950 dark:from-earth-850 dark:to-earth-950 text-white flex flex-col justify-between gap-8 border border-earth-800 relative overflow-hidden shadow-lg shadow-black/10 group">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 blur-xl group-hover:scale-110 transition-transform" />
            <div className="absolute top-8 right-8 text-white/10">
              <ShoppingBag className="w-32 h-32 -rotate-12" />
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <span className="text-xs font-black uppercase tracking-widest text-harvest-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full max-w-fit">
                {t.cta.buyerTag}
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t.cta.buyerTitle}
              </h3>
              <p className="text-base text-earth-300 max-w-md font-medium leading-relaxed">
                {t.cta.buyerDesc}
              </p>
            </div>

            <div className="relative z-10">
              <Link
                href="/register?role=buyer"
                className="inline-flex items-center gap-2 px-8 py-5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-lg shadow-md transition-all hover:scale-102 cursor-pointer w-full sm:w-auto justify-center"
              >
                <span>{t.cta.buyerBtn}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="mt-3 text-xs text-earth-400 font-semibold pl-1">
                {t.cta.buyerFeatures}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
