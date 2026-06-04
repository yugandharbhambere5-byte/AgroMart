'use client';

import React, { useState } from 'react';
import { ShieldCheck, Truck, BarChart3, Database, ShieldAlert, Sparkles } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export function Features() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'farmer' | 'buyer'>('farmer');

  // We map the icons dynamically based on index to keep the code clean
  const farmerIcons = [
    <Database key="db" className="w-6 h-6" />,
    <BarChart3 key="chart" className="w-6 h-6" />,
    <ShieldCheck key="shield" className="w-6 h-6" />
  ];

  const buyerIcons = [
    <Sparkles key="sparkle" className="w-6 h-6" />,
    <Truck key="truck" className="w-6 h-6" />,
    <ShieldAlert key="alert" className="w-6 h-6" />
  ];

  const currentFeatures = activeTab === 'farmer' ? t.features.farmerList : t.features.buyerList;
  const currentIcons = activeTab === 'farmer' ? farmerIcons : buyerIcons;

  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden transition-colors duration-300 scroll-mt-28">
      
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.04)_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
          <h2 className="text-base font-black text-primary-600 uppercase tracking-widest">{t.features.badge}</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {t.features.title}
          </p>
          <p className="text-lg text-earth-600 dark:text-earth-300 font-medium">
            {t.features.subtitle}
          </p>

          {/* Role Toggle Switch - Big buttons */}
          <div className="inline-flex p-1.5 rounded-2xl bg-earth-100 dark:bg-earth-900 border border-border mt-6 max-w-md mx-auto w-full">
            <button
              onClick={() => setActiveTab('farmer')}
              className={`flex-1 py-4.5 rounded-xl font-black text-base transition-all cursor-pointer ${
                activeTab === 'farmer'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-earth-650 dark:text-earth-300 hover:text-foreground'
              }`}
            >
              {t.features.forFarmers}
            </button>
            <button
              onClick={() => setActiveTab('buyer')}
              className={`flex-1 py-4.5 rounded-xl font-black text-base transition-all cursor-pointer ${
                activeTab === 'buyer'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-earth-650 dark:text-earth-300 hover:text-foreground'
              }`}
            >
              {t.features.forBuyers}
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {currentFeatures.map((feat, index) => (
            <div
              key={index}
              className="p-8 rounded-3xl bg-card border border-border hover:border-primary-500/30 shadow-sm hover:shadow-lg hover-lift flex flex-col justify-between transition-all duration-300"
            >
              <div className="flex flex-col gap-6">
                
                {/* Feature Icon block */}
                <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-xs">
                  {currentIcons[index]}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-2">
                  <div className="inline-block text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                    {feat.tag}
                  </div>
                  <h3 className="text-xl font-extrabold text-foreground">{feat.title}</h3>
                  <p className="text-earth-550 dark:text-earth-300 text-sm font-medium mt-1 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                {/* Sub-details list */}
                <ul className="flex flex-col gap-2.5 mt-2 border-t border-earth-100 dark:border-earth-900 pt-4">
                  {feat.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-earth-600 dark:text-earth-450">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
