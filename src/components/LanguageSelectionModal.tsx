'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation, Language } from '@/context/LanguageContext';
import { Sprout, Globe } from 'lucide-react';

export function LanguageSelectionModal() {
  const { setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agromart_language');
      if (!saved) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-card border-2 border-primary-500/20 rounded-3xl p-8 sm:p-10 text-center shadow-2xl flex flex-col gap-8 relative overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute -top-16 -left-16 w-36 h-36 rounded-full bg-primary-500/10 blur-2xl" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-harvest-500/10 blur-2xl" />

        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 animate-bounce">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-2 flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary-500" />
            <span>Select Language / भाषा निवडा</span>
          </h2>
          <p className="text-sm font-semibold text-earth-550 dark:text-earth-400 max-w-sm">
            कृपया तुमची पसंतीची भाषा निवडा. <br />
            कृपया अपनी पसंदीदा भाषा चुनें।
          </p>
        </div>

        {/* Large, rural-friendly touch buttons */}
        <div className="flex flex-col gap-4 relative z-10 mt-2">
          <button
            onClick={() => handleSelectLanguage('en')}
            className="w-full py-5 px-6 rounded-2xl border-2 border-border bg-background hover:border-primary-500 text-foreground font-black text-lg transition-all hover:scale-102 flex items-center justify-between cursor-pointer"
          >
            <span>English (US)</span>
            <span className="text-xs font-bold text-earth-500 uppercase tracking-widest">Select</span>
          </button>

          <button
            onClick={() => handleSelectLanguage('mr')}
            className="w-full py-5 px-6 rounded-2xl border-2 border-border bg-background hover:border-primary-500 text-foreground font-black text-xl transition-all hover:scale-102 flex items-center justify-between cursor-pointer"
          >
            <span>मराठी (Maharashtra)</span>
            <span className="text-xs font-bold text-earth-500 uppercase tracking-widest">निवडा</span>
          </button>

          <button
            onClick={() => handleSelectLanguage('hi')}
            className="w-full py-5 px-6 rounded-2xl border-2 border-border bg-background hover:border-primary-500 text-foreground font-black text-xl transition-all hover:scale-102 flex items-center justify-between cursor-pointer"
          >
            <span>हिन्दी (India)</span>
            <span className="text-xs font-bold text-earth-500 uppercase tracking-widest">चुनें</span>
          </button>
        </div>

        <p className="text-xs text-earth-450 font-bold relative z-10">
          ✓ You can change this language at any time in the top navigation bar.
        </p>

      </div>
    </div>
  );
}
