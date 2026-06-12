'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../utils/translations/en';
import { mr } from '../utils/translations/mr';
import { hi } from '../utils/translations/hi';

export type Language = 'en' | 'mr' | 'hi';

const translations = {
  en,
  mr,
  hi,
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof en;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agromart_language') as Language;
      if (saved && (saved === 'en' || saved === 'mr' || saved === 'hi')) {
        setLanguageState(saved);
        document.documentElement.lang = saved;
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agromart_language', lang);
      document.documentElement.lang = lang;
    }
  };

  // Safe fallback to 'en' dictionary if anything is missing
  const t = translations[language] || en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
