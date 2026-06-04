'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Mail, Phone, ArrowRight, Sprout, ShieldAlert, Loader2 } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const targetValue = authMethod === 'email' ? email.trim() : phone.trim();
    if (!targetValue) {
      setErrorMsg(authMethod === 'email' ? 'Please enter your email.' : 'Please enter your phone number.');
      setLoading(false);
      return;
    }

    try {
      if (authMethod === 'email') {
        const { error } = await supabase.auth.signInWithOtp({
          email: targetValue,
          options: {
            shouldCreateUser: false,
          },
        });
        if (error) throw error;
        router.push(`/verify?email=${encodeURIComponent(targetValue)}`);
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: targetValue,
        });
        if (error) throw error;
        router.push(`/verify?phone=${encodeURIComponent(targetValue)}`);
      }
    } catch (err: any) {
      console.error('OTP Send Error:', err);
      setErrorMsg(err.message || 'Failed to send OTP. Please make sure you are registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-primary-50/20 to-background dark:from-primary-950/10">
      
      {/* Back to Home Link */}
      <Link href="/" className="mb-8 flex items-center gap-2 group">
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
          <Sprout className="w-5 h-5" />
        </div>
        <span className="text-lg font-black tracking-tight text-foreground">
          Agro<span className="text-primary-500">Mart</span>
        </span>
      </Link>

      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-xl shadow-primary-950/5">
        <div className="text-center mb-8 flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">{t.auth.loginTitle}</h1>
          <p className="text-sm font-semibold text-earth-550 dark:text-earth-400">
            {t.auth.loginSubtitle}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-sm font-bold flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Toggle auth method - Large touch targets */}
        <div className="flex p-1 rounded-2xl bg-earth-100 dark:bg-earth-900 border border-border mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
              authMethod === 'email'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-earth-550 hover:text-foreground'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
              authMethod === 'phone'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-earth-550 hover:text-foreground'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Phone</span>
          </button>
        </div>

        {/* Sign in Form */}
        <form onSubmit={handleSendOTP} className="flex flex-col gap-6">
          {authMethod === 'email' ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="login-email" className="text-sm font-bold text-foreground">
                {t.auth.emailLabel}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5 text-earth-450 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label htmlFor="login-phone" className="text-sm font-bold text-foreground">
                {t.auth.phoneLabel}
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-4 w-5 h-5 text-earth-450 pointer-events-none" />
                <input
                  id="login-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                />
              </div>
              <span className="text-xs font-bold text-earth-500 pl-1">
                {t.auth.phoneCodeTip}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-lg shadow-md shadow-primary-600/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.common.loading}</span>
              </>
            ) : (
              <>
                <span>{t.auth.sendOtpBtn}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center text-sm font-semibold text-earth-550 dark:text-earth-400">
          {t.auth.newToAgroMart}{' '}
          <Link href="/register" className="text-primary-600 hover:text-primary-700 font-bold underline">
            {t.auth.createAccountLink}
          </Link>
        </div>

      </div>
    </div>
  );
}
