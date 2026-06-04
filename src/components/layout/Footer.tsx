'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, Mail, ShieldCheck, HelpCircle, Truck, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-earth-950 text-earth-300 border-t border-earth-900/60 transition-colors duration-300">
      {/* Pre-footer Value Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-earth-900/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary-950 text-primary-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">{t.footer.secureTitle}</h3>
              <p className="text-sm text-earth-400">{t.footer.secureDesc}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary-950 text-primary-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">{t.footer.logisticsTitle}</h3>
              <p className="text-sm text-earth-400">{t.footer.logisticsDesc}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary-950 text-primary-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">{t.footer.pricingTitle}</h3>
              <p className="text-sm text-earth-400">{t.footer.pricingDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Logo & Newsletter */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <Sprout className="w-5.5 h-5.5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Agro<span className="text-primary-400">Mart</span>
              </span>
            </Link>
            <p className="text-base text-earth-400 max-w-sm">
              {t.footer.aboutUs}
            </p>
            {/* Newsletter Sign Up */}
            <div className="mt-2 flex flex-col gap-3">
              <label htmlFor="footer-email" className="font-bold text-sm text-white">
                {t.footer.newsletterTitle}
              </label>
              <div className="flex gap-2 max-w-md">
                <input
                  id="footer-email"
                  type="email"
                  placeholder={t.footer.newsletterPlaceholder}
                  className="w-full px-4 py-3 rounded-xl bg-earth-900 border border-earth-800 text-white placeholder-earth-550 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <button
                  type="button"
                  className="px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  {t.footer.newsletterBtn}
                </button>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:col-span-3 gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Marketplace</h4>
              <nav className="flex flex-col gap-2.5">
                <Link href="#explore" className="text-sm hover:text-white transition-colors">Browse Produce</Link>
                <Link href="#sell" className="text-sm hover:text-white transition-colors">Sell Crops</Link>
                <Link href="#logistics" className="text-sm hover:text-white transition-colors">Agro-Logistics</Link>
                <Link href="#insurance" className="text-sm hover:text-white transition-colors">Harvest Insurance</Link>
              </nav>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Resources</h4>
              <nav className="flex flex-col gap-2.5">
                <Link href="#weather" className="text-sm hover:text-white transition-colors">Agronomy Forecasts</Link>
                <Link href="#prices" className="text-sm hover:text-white transition-colors">Wholesale Indexes</Link>
                <Link href="#guides" className="text-sm hover:text-white transition-colors">Farmer Guides</Link>
                <Link href="#support" className="text-sm hover:text-white transition-colors">Help Center</Link>
              </nav>
            </div>

            <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Get in Touch</h4>
              <div className="flex flex-col gap-3 text-sm">
                <p className="flex items-center gap-2 text-earth-400">
                  <Mail className="w-4 h-4 text-primary-400" /> support@agromart.com
                </p>
                <p className="flex items-center gap-2 text-earth-400">
                  <HelpCircle className="w-4 h-4 text-primary-400" /> Support Desk: 24/7
                </p>
                {/* Social icons */}
                <div className="flex items-center gap-3.5 mt-2">
                  <a href="#twitter" className="p-2 rounded-lg bg-earth-900 hover:bg-primary-950 text-earth-400 hover:text-primary-400 transition-colors" aria-label="Twitter">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="#facebook" className="p-2 rounded-lg bg-earth-900 hover:bg-primary-950 text-earth-400 hover:text-primary-400 transition-colors" aria-label="Facebook">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#instagram" className="p-2 rounded-lg bg-earth-900 hover:bg-primary-950 text-earth-400 hover:text-primary-400 transition-colors" aria-label="Instagram">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  <a href="#linkedin" className="p-2 rounded-lg bg-earth-900 hover:bg-primary-950 text-earth-400 hover:text-primary-400 transition-colors" aria-label="LinkedIn">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-earth-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-earth-500">
            &copy; {new Date().getFullYear()} AgroMart. {t.footer.copyright}
          </p>
          <div className="flex items-center gap-6 text-xs text-earth-500">
            <Link href="#privacy" className="hover:text-white transition-colors">{t.footer.privacy}</Link>
            <Link href="#terms" className="hover:text-white transition-colors">{t.footer.terms}</Link>
            <Link href="#cookies" className="hover:text-white transition-colors">{t.footer.cookies}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
