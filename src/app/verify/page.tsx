'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Check, ShieldCheck, ArrowRight, ShieldAlert, Loader2, RotateCw } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

function VerifyForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get('email');
  const phoneParam = searchParams.get('phone');

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);

  const supabase = createClient();
  const targetContact = emailParam ? decodeURIComponent(emailParam) : phoneParam ? decodeURIComponent(phoneParam) : '';

  useEffect(() => {
    if (!targetContact) {
      setErrorMsg('No verification target specified. Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, targetContact, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (otp.length < 6) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      setLoading(false);
      return;
    }

    try {
      const verifyPayload: any = {
        token: otp,
      };

      if (emailParam) {
        verifyPayload.email = targetContact;
        verifyPayload.type = 'email';
      } else {
        verifyPayload.phone = targetContact;
        verifyPayload.type = 'sms';
      }

      const { data, error } = await supabase.auth.verifyOtp(verifyPayload);
      if (error) throw error;

      setSuccessMsg('Identity verified successfully! Redirecting...');

      // Retrieve authenticated user metadata role
      const user = data.user;
      const role = user?.user_metadata?.role || 'farmer';

      // Redirect to correct dashboard
      setTimeout(() => {
        router.push(`/dashboard/${role}`);
        router.refresh();
      }, 1500);

    } catch (err: any) {
      console.error('Verification Error:', err);
      setErrorMsg(err.message || 'Incorrect verification code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (emailParam) {
        const { error } = await supabase.auth.signInWithOtp({
          email: targetContact,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: targetContact,
        });
        if (error) throw error;
      }
      setSuccessMsg('A new verification code has been sent!');
      setCountdown(30);
    } catch (err: any) {
      console.error('Resend Error:', err);
      setErrorMsg(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-xl shadow-primary-950/5">
      <div className="text-center mb-8 flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground">{t.auth.verifyTitle}</h1>
        <p className="text-sm font-semibold text-earth-550 dark:text-earth-400">
          {t.auth.verifySubtitle} <span className="text-primary-600 font-bold break-all">{targetContact}</span>
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-sm font-bold flex items-start gap-3 animate-fade-in">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-start gap-3 animate-fade-in">
          <Check className="w-5 h-5 shrink-0 mt-0.5 bg-emerald-600 text-white rounded-full p-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Verification Form */}
      <form onSubmit={handleVerify} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="otp-token" className="text-sm font-bold text-foreground text-center">
            {t.auth.verifyTitle.split(' ')[0]} Code
          </label>
          <input
            id="otp-token"
            type="text"
            maxLength={6}
            placeholder="0 0 0 0 0 0"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            disabled={loading}
            className="w-full text-center py-4 rounded-xl border border-border bg-background text-foreground text-3xl font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-primary-500/25 placeholder:text-earth-200"
            required
            autoComplete="one-time-code"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full py-4.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-lg shadow-md shadow-primary-600/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t.common.loading}</span>
            </>
          ) : (
            <>
              <span>{t.auth.verifyBtn}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Resend Logic */}
      <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || resending}
          className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1.5 cursor-pointer disabled:text-earth-400 disabled:pointer-events-none"
        >
          {resending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCw className="w-4 h-4" />
          )}
          <span>{t.auth.resendBtn}</span>
        </button>
        <span className="text-earth-500 font-bold">
          {countdown > 0 ? `${t.auth.resendTip} ${countdown}s` : t.auth.expiredTip}
        </span>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-primary-50/20 to-background dark:from-primary-950/10">
      
      {/* Brand logo */}
      <Link href="/" className="mb-8 flex items-center gap-2 group">
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <span className="text-lg font-black tracking-tight text-foreground">
          AgroMart Secure
        </span>
      </Link>

      <Suspense fallback={
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-xl flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      }>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
