import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/home/Hero';
import { About } from '@/components/home/About';
import { Features } from '@/components/home/Features';
import { MarketStats } from '@/components/home/MarketStats';
import { CTA } from '@/components/home/CTA';
import { Footer } from '@/components/layout/Footer';
import InfoTicker from '@/components/layout/InfoTicker';

export default function Home() {
  return (
    <>
      <InfoTicker />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <About />
        <Features />
        <MarketStats />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
