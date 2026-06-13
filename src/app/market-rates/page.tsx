'use client';

import React, { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LiveMarketRates } from '@/components/market/LiveMarketRates';

export default function MarketRatesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 py-12 text-center text-earth-500 font-bold">
            Loading Live Market Rates...
          </div>
        }>
          <LiveMarketRates />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
