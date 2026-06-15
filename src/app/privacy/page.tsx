'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Shield, Eye, MapPin, Key } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-24 bg-gradient-to-b from-primary-50/30 via-background to-background dark:from-primary-950/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-6 shadow-sm">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-earth-500 dark:text-earth-400">
              Last Updated: June 15, 2026
            </p>
          </div>

          {/* Content Card */}
          <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-xl shadow-earth-100/10 dark:shadow-none prose dark:prose-invert max-w-none">
            <p className="lead text-lg text-earth-650 dark:text-earth-300 font-semibold mb-8">
              At AgroMart, we are committed to protecting the privacy of our farmers and buyers. This Privacy Policy details how we collect, store, share, and safeguard your personal and business data.
            </p>

            <div className="flex flex-col gap-10">
              <section className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-foreground mb-3">1. Information We Collect</h2>
                  <p className="text-earth-600 dark:text-earth-300 text-sm leading-relaxed mb-3">
                    To deliver a seamless marketplace experience, we collect specific details when you register and interact with our tools:
                  </p>
                  <ul className="list-disc list-inside text-earth-600 dark:text-earth-300 text-sm leading-relaxed flex flex-col gap-1.5 pl-2">
                    <li><strong>Personal Details:</strong> Full Name, Email, Phone Number, and verification credentials.</li>
                    <li><strong>Business Profile:</strong> Farm Size, main crops, shop name, GSTIN (optional), and cold-chain credentials.</li>
                    <li><strong>Communication:</strong> Message transcript history between buyers and farmers on the built-in Chat system.</li>
                  </ul>
                </div>
              </section>

              <section className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-foreground mb-3">2. Location Data Usage</h2>
                  <p className="text-earth-600 dark:text-earth-300 text-sm leading-relaxed">
                    Our platform uses GPS location data to calculate shipping distances, map cold-chain routing, and filter nearby active buyers and recommended crop listings. Location coordinates are shared with third-party mapping providers solely to optimize delivery routes and log distance metrics. You can manage or revoke location permissions at any time via your device settings.
                  </p>
                </div>
              </section>

              <section className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-foreground mb-3">3. Data Retention & Security</h2>
                  <p className="text-earth-600 dark:text-earth-300 text-sm leading-relaxed">
                    Your details are securely hosted and verified using Supabase Auth with secure OTP code logins. We implement advanced encryption protocols to safeguard transaction details and escrow financial records. We do not sell or lease your personal metadata or transactional information to third-party advertising companies under any circumstances.
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
