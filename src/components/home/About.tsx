'use client';

import React from 'react';
import { Target, Leaf, Heart, Recycle } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export function About() {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-24 bg-card transition-colors duration-300 scroll-mt-28">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-12">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
          <h2 className="text-base font-black text-primary-600 uppercase tracking-widest">{t.about.badge}</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {t.about.title}
          </p>
          <p className="text-lg text-earth-600 dark:text-earth-300 font-medium">
            {t.about.subtitle}
          </p>
        </div>

        {/* Comparison Block: Problem vs Solution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-stretch">
          
          {/* Traditional Middleman Problem */}
          <div className="p-8 sm:p-10 rounded-3xl bg-earth-100 dark:bg-earth-900/40 border border-border/60 flex flex-col gap-6 relative overflow-hidden group hover:border-red-500/35 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 hover:-translate-y-1.5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -z-10" />
            <h3 className="text-2xl font-black text-foreground">{t.about.problemHeader}</h3>
            <p className="text-sm font-semibold text-earth-550 uppercase tracking-wider">{t.about.problemSub}</p>
            
            <ul className="flex flex-col gap-4 mt-2">
              {t.about.problems.map((prob, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/40 text-red-500 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-110 transition-transform duration-300">✕</span>
                  <span className="text-base text-earth-650 dark:text-earth-350">{prob}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AgroMart Solution */}
          <div className="p-8 sm:p-10 rounded-3xl bg-primary-50/40 dark:bg-primary-950/10 border-2 border-primary-500/20 flex flex-col gap-6 relative overflow-hidden group hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-1.5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-bl-full -z-10" />
            <h3 className="text-2xl font-black text-foreground">{t.about.solutionHeader}</h3>
            <p className="text-sm font-semibold text-primary-500 uppercase tracking-wider">{t.about.solutionSub}</p>
            
            <ul className="flex flex-col gap-4 mt-2">
              {t.about.solutions.map((sol, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-110 transition-transform duration-300">✓</span>
                  <span className="text-base text-earth-650 dark:text-earth-300">{sol}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background hover-lift group/pillar hover:border-primary-500/30 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center group-hover/pillar:scale-110 group-hover/pillar:bg-primary-500 group-hover/pillar:text-white transition-all duration-300">
              <Target className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-foreground">{t.about.pillars.farmerTitle}</h4>
            <p className="text-sm text-earth-500">{t.about.pillars.farmerDesc}</p>
          </div>

          <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background hover-lift group/pillar hover:border-primary-500/30 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center group-hover/pillar:scale-110 group-hover/pillar:bg-primary-500 group-hover/pillar:text-white transition-all duration-300">
              <Leaf className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-foreground">{t.about.pillars.traceTitle}</h4>
            <p className="text-sm text-earth-500">{t.about.pillars.traceDesc}</p>
          </div>

          <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background hover-lift group/pillar hover:border-primary-500/30 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center group-hover/pillar:scale-110 group-hover/pillar:bg-primary-500 group-hover/pillar:text-white transition-all duration-300">
              <Recycle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-foreground">{t.about.pillars.wasteTitle}</h4>
            <p className="text-sm text-earth-500">{t.about.pillars.wasteDesc}</p>
          </div>

          <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background hover-lift group/pillar hover:border-primary-500/30 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center group-hover/pillar:scale-110 group-hover/pillar:bg-primary-500 group-hover/pillar:text-white transition-all duration-300">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-foreground">{t.about.pillars.fairTitle}</h4>
            <p className="text-sm text-earth-500">{t.about.pillars.fairDesc}</p>
          </div>

        </div>

      </div>
    </section>
  );
}
