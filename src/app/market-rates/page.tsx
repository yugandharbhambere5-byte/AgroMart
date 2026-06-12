'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LiveMarketRates } from '@/components/market/LiveMarketRates';

export default function MarketRatesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <LiveMarketRates />
      </main>
      <Footer />
    </div>
  );
}
