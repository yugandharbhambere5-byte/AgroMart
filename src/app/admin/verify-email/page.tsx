'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Loader2, X, Bell, RefreshCw, KeyRound } from 'lucide-react';

function AdminVerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email Template Preview states for Resend OTP
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [previewOtp, setPreviewOtp] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!email.trim() || !otp.trim()) {
      setErrorMsg('Please enter both your email and the 6-digit OTP code.');
      setLoading(false);
      return;
    }

    if (otp.trim().length !== 6 || isNaN(Number(otp.trim()))) {
      setErrorMsg('OTP must be a 6-digit numeric code.');
      setLoading(false);
      return;
    }

    // Simulate checking delay
    setTimeout(() => {
      const storedAdmins = localStorage.getItem('agromart_admins');
      if (!storedAdmins) {
        setErrorMsg('No admin accounts found.');
        setLoading(false);
        return;
      }

      let admins = JSON.parse(storedAdmins);
      const adminIndex = admins.findIndex((a: any) => a.email.toLowerCase() === email.toLowerCase().trim());

      if (adminIndex === -1) {
        setErrorMsg('Admin account not found with this email.');
        setLoading(false);
        return;
      }

      const admin = admins[adminIndex];

      // Check for account lockout/brute force check
      if (admin.bruteForceLockUntil) {
        const lockTime = new Date(admin.bruteForceLockUntil).getTime();
        if (Date.now() < lockTime) {
          const remainingMins = Math.ceil((lockTime - Date.now()) / 60000);
          setErrorMsg(`This account is temporarily locked due to too many failed attempts. Try again in ${remainingMins} minutes.`);
          setLoading(false);
          return;
        } else {
          // Lockout expired, reset brute force attempts
          admin.bruteForceLockUntil = null;
          admin.bruteForceAttempts = 0;
        }
      }

      if (admin.isVerified) {
        setSuccessMsg('Your account is already verified! Redirecting to login...');
        setLoading(false);
        setTimeout(() => {
          router.push('/admin/login');
        }, 1500);
        return;
      }

      // Check OTP Attempts (Max 3 attempts)
      if (admin.otpAttempts >= 3) {
        // Lock account for 15 minutes
        admin.bruteForceLockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        admin.otpAttempts = 0; // reset attempts for after lockout
        admins[adminIndex] = admin;
        localStorage.setItem('agromart_admins', JSON.stringify(admins));
        setErrorMsg('Too many invalid attempts. Your account has been locked for 15 minutes.');
        setLoading(false);
        return;
      }

      // Check OTP Expiry (10 minutes)
      const expiryTime = new Date(admin.otpExpiry).getTime();
      if (Date.now() > expiryTime) {
        setErrorMsg('The OTP has expired. Please request a new one.');
        setLoading(false);
        return;
      }

      // Validate OTP
      if (admin.otpCode !== otp.trim()) {
        admin.otpAttempts = (admin.otpAttempts || 0) + 1;
        admins[adminIndex] = admin;
        localStorage.setItem('agromart_admins', JSON.stringify(admins));
        setErrorMsg(`Invalid OTP. Remaining attempts: ${3 - admin.otpAttempts}`);
        setLoading(false);
        return;
      }

      // Successful verification
      admin.isVerified = true;
      admin.otpCode = ''; // Clear code
      admin.otpAttempts = 0;
      admins[adminIndex] = admin;
      localStorage.setItem('agromart_admins', JSON.stringify(admins));

      setSuccessMsg('Account verified successfully! Redirecting to login...');
      setLoading(false);
      setTimeout(() => {
        router.push(`/admin/login?email=${encodeURIComponent(email)}`);
      }, 1500);
    }, 1000);
  };

  const handleResendOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setResending(true);

    if (!email.trim()) {
      setErrorMsg('Please specify an email address to resend OTP.');
      setResending(false);
      return;
    }

    setTimeout(() => {
      const storedAdmins = localStorage.getItem('agromart_admins');
      if (!storedAdmins) {
        setErrorMsg('No admin accounts found.');
        setResending(false);
        return;
      }

      let admins = JSON.parse(storedAdmins);
      const adminIndex = admins.findIndex((a: any) => a.email.toLowerCase() === email.toLowerCase().trim());

      if (adminIndex === -1) {
        setErrorMsg('Admin account not found with this email.');
        setResending(false);
        return;
      }

      const admin = admins[adminIndex];

      // Enforce Resend limits
      if (admin.resendAttempts >= 3) {
        setErrorMsg('Maximum resend attempts reached. Please register again or contact support.');
        setResending(false);
        return;
      }

      // Generate new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      admin.otpCode = newOtp;
      admin.otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
      admin.otpAttempts = 0; // Reset attempts for new OTP
      admin.resendAttempts = (admin.resendAttempts || 0) + 1;

      admins[adminIndex] = admin;
      localStorage.setItem('agromart_admins', JSON.stringify(admins));

      setPreviewOtp(newOtp);
      setResending(false);
      setShowEmailPreview(true);
    }, 1000);
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
          <h1 className="text-2xl font-black text-foreground">Email Verification</h1>
          <p className="text-sm font-semibold text-earth-500 mt-1">Enter the 6-digit OTP code sent to your email address</p>
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

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-foreground uppercase tracking-wide">Registered Email</label>
            <input
              type="email"
              placeholder="admin@agromart.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground font-semibold placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-foreground uppercase tracking-wide">6-Digit Verification Code</label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-4 w-5 h-5 text-earth-450 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. 123456"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background text-foreground font-semibold tracking-wider placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
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
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify & Activate</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 items-center border-t border-border pt-6 text-xs font-bold">
          <button
            onClick={handleResendOtp}
            disabled={resending || loading}
            className="text-red-500 hover:text-red-650 hover:underline flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {resending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Resend Verification Code
          </button>

          <div className="text-earth-500 mt-2">
            Back to{' '}
            <Link href="/admin/register" className="text-red-500 hover:underline">
              Registration
            </Link>
          </div>
        </div>
      </div>

      {/* Professional Email Preview Overlay Modal for Resending */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowEmailPreview(false)} 
              className="absolute top-4 right-4 p-2 rounded-xl bg-earth-100 dark:bg-earth-900 text-earth-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 border-b border-border pb-3 text-xs font-black text-earth-500 uppercase tracking-widest">
              <Bell className="w-4.5 h-4.5 text-red-500 animate-bounce" />
              <span>Simulated Email Notification Dispatch</span>
            </div>
            
            {/* Email Template Preview */}
            <div className="bg-earth-50 dark:bg-earth-950 p-6 rounded-2xl border border-border flex flex-col gap-4 text-left font-sans text-sm">
              <div className="border-b border-border/80 pb-3 flex flex-col gap-1">
                <div><span className="font-extrabold text-earth-500 text-xs">Subject:</span> <span className="font-black text-foreground">Your New AgroMart Verification Code</span></div>
                <div><span className="font-extrabold text-earth-500 text-xs">To:</span> <span className="font-bold text-primary-600">{email}</span></div>
              </div>
              <div>
                <p className="font-semibold text-foreground">Hello Admin,</p>
                <p className="text-earth-550 dark:text-earth-400 mt-2 leading-relaxed font-medium">
                  We received a request to resend your OTP code. Please use the verification code below to verify your admin account:
                </p>
              </div>
              <div className="my-3 py-4 px-6 rounded-xl border-2 border-dashed border-red-500 bg-red-500/5 text-center">
                <span className="text-3xl font-black tracking-widest text-red-600 dark:text-red-400">{previewOtp}</span>
              </div>
              <div className="text-xs text-earth-500 leading-relaxed font-bold flex flex-col gap-1 border-t border-border/60 pt-3">
                <p>⏰ <strong>Expiry Notice:</strong> This code is valid for exactly <strong>10 minutes</strong> and is restricted to single-use.</p>
              </div>
            </div>

            <button
              onClick={() => setShowEmailPreview(false)}
              className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-750 text-white font-extrabold text-sm shadow-md mt-6 cursor-pointer"
            >
              Close and Enter OTP
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminVerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    }>
      <AdminVerifyEmailForm />
    </Suspense>
  );
}
