'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.includes('not verified')) {
          setErrorMsg(error.message);
          setLoading(false);
          setTimeout(() => {
            router.push(`/admin/verify-email?email=${encodeURIComponent(email)}`);
          }, 2500);
          return;
        }
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      setSuccessMsg('Authentication successful! Accessing Admin Dashboard...');
      setLoading(false);

      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-red-50/20 to-background dark:from-red-950/10">
      
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 group mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground">
            Agro<span className="text-red-500">Admin</span>
          </span>
        </div>
        <p className="text-xs font-black text-red-500 uppercase tracking-widest">Control Center Access</p>
      </div>

      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-foreground">Admin Login</h1>
          <p className="text-sm font-semibold text-earth-500 mt-1">Authenticate to access management dashboard</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-extrabold flex items-start gap-3">
            <span className="text-base select-none mt-0.5">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-450 text-xs font-extrabold flex items-start gap-3">
            <span className="text-base select-none mt-0.5">✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-foreground uppercase tracking-wide">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-5 h-5 text-earth-450 pointer-events-none" />
              <input
                type="email"
                placeholder="admin@agromart.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background text-foreground font-semibold placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-foreground uppercase tracking-wide">Password</label>
              <Link href="/admin/forgot-password" className="text-xs font-extrabold text-red-500 hover:text-red-650 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-5 h-5 text-earth-450 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background text-foreground font-semibold placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-750 text-white font-extrabold text-sm shadow-md shadow-red-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Logging In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-xs font-bold text-earth-500">
          Need an account?{' '}
          <Link href="/admin/register" className="text-red-500 hover:text-red-650 hover:underline">
            Register Admin
          </Link>
        </div>
      </div>

    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
