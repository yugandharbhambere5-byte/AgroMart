'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FileText, Shield, UserCheck, HelpCircle } from 'lucide-react';

export default function TermsOfService() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-24 bg-gradient-to-b from-primary-50/30 via-background to-background dark:from-primary-950/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-6 shadow-sm">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg text-earth-500 dark:text-earth-400">
              Last Updated: June 15, 2026
            </p>
          </div>

          {/* Content Card */}
          <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-xl shadow-earth-100/10 dark:shadow-none prose dark:prose-invert max-w-none">
            <p className="lead text-lg text-earth-650 dark:text-earth-300 font-semibold mb-8">
              Welcome to AgroMart. By accessing or using our platform, you agree to comply with and be bound by the following Terms of Service. Please review them carefully.
            </p>

            <div className="flex flex-col gap-10">
              <section className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-foreground mb-3">1. Account Registration & Eligibility</h2>
                  <p className="text-earth-600 dark:text-earth-300 text-sm leading-relaxed">
                    Users must register as either a "Farmer" or a "Wholesale Buyer" to use specific marketplace features. You agree to provide accurate, truthful, and complete information during registration. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                  </p>
                </div>
              </section>

              <section className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-foreground mb-3">2. Direct Trading & Escrow Protection</h2>
                  <p className="text-earth-600 dark:text-earth-300 text-sm leading-relaxed mb-3">
                    AgroMart facilitates direct peer-to-peer crop transactions. To protect both parties, buyers must deposit payment into the AgroMart Escrow account prior to dispatch. 
                  </p>
                  <ul className="list-disc list-inside text-earth-600 dark:text-earth-300 text-sm leading-relaxed flex flex-col gap-1.5 pl-2">
                    <li>Farmers agree to deliver produce matching the grade and descriptions listed on their profile.</li>
                    <li>Buyers agree to inspect cargo upon delivery arrival within the designated quality check window.</li>
                    <li>Funds are released automatically to the Farmer upon delivery verification, or returned according to active logistics dispute resolution rules.</li>
                  </ul>
                </div>
              </section>

              <section className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-foreground mb-3">3. Listing and Content Guidelines</h2>
                  <p className="text-earth-600 dark:text-earth-300 text-sm leading-relaxed">
                    Farmers are solely responsible for their harvest listings, including crop pictures, descriptions, pricing, soil data, and location coordinates. AgroMart reserves the right to suspend or remove any listings that are inaccurate, fraudulent, or violate community safety regulations.
                  </p>
                </div>
              </section>

              <section className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-foreground mb-3">4. Dispute Resolution & Limitation of Liability</h2>
                  <p className="text-earth-600 dark:text-earth-300 text-sm leading-relaxed">
                    AgroMart provides digital trade escrow tools but is not a direct party to the quality of fresh produce. Any disputes arising from grade mismatch, temperature variance, or shipping delays should be managed via our Support desk or directly between parties in the active chat threads. AgroMart's total liability under any circumstances is limited to the transaction fees collected for the specific order.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
