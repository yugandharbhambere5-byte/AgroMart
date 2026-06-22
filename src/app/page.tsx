import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/home/Hero';
import { About } from '@/components/home/About';
import { Features } from '@/components/home/Features';
import { MarketStats } from '@/components/home/MarketStats';
import { CTA } from '@/components/home/CTA';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <>
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
