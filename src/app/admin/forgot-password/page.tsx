'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, KeyRound, ArrowRight, Loader2, CheckCircle2, X, Bell } from 'lucide-react';

type WizardStep = 'EMAIL' | 'OTP' | 'RESET_PASS';

export default function AdminForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<WizardStep>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email Template Preview states
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [previewOtp, setPreviewOtp] = useState('');

  // Request Reset OTP Step
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      setLoading(false);
      return;
    }

    // Simulate OTP generation delay
    setTimeout(() => {
      const storedAdmins = localStorage.getItem('agromart_admins');
      let admins = storedAdmins ? JSON.parse(storedAdmins) : [];
      const adminIndex = admins.findIndex((a: any) => a.email.toLowerCase() === email.toLowerCase().trim());

      if (adminIndex === -1) {
        setErrorMsg('No administrator account associated with this email address.');
        setLoading(false);
        return;
      }

      const admin = admins[adminIndex];

      // Generate secure OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      admin.resetOtpCode = newOtp;
      admin.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
      admin.resetOtpAttempts = 0; // reset attempts

      admins[adminIndex] = admin;
      localStorage.setItem('agromart_admins', JSON.stringify(admins));

      setPreviewOtp(newOtp);
      setLoading(false);
      setShowEmailPreview(true); // show simulated dispatch popup
    }, 1000);
  };

  // Verify Reset OTP Step
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!otp.trim() || otp.trim().length !== 6 || isNaN(Number(otp.trim()))) {
      setErrorMsg('Please enter a valid 6-digit numeric OTP code.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const storedAdmins = localStorage.getItem('agromart_admins');
      if (!storedAdmins) {
        setErrorMsg('System error. Admin records not found.');
        setLoading(false);
        return;
      }

      let admins = JSON.parse(storedAdmins);
      const adminIndex = admins.findIndex((a: any) => a.email.toLowerCase() === email.toLowerCase().trim());

      if (adminIndex === -1) {
        setErrorMsg('Admin account not found.');
        setLoading(false);
        return;
      }

      const admin = admins[adminIndex];

      // Check OTP Attempts (Max 3)
      if ((admin.resetOtpAttempts || 0) >= 3) {
        setErrorMsg('Too many invalid attempts for this security code. Please request a new OTP.');
        setLoading(false);
        return;
      }

      // Check expiry
      const expiryTime = new Date(admin.resetOtpExpiry).getTime();
      if (Date.now() > expiryTime) {
        setErrorMsg('The verification OTP has expired. Please request a new code.');
        setLoading(false);
        return;
      }

      // Validate match
      if (admin.resetOtpCode !== otp.trim()) {
        admin.resetOtpAttempts = (admin.resetOtpAttempts || 0) + 1;
        admins[adminIndex] = admin;
        localStorage.setItem('agromart_admins', JSON.stringify(admins));
        setErrorMsg(`Invalid OTP. Remaining attempts: ${3 - admin.resetOtpAttempts}`);
        setLoading(false);
        return;
      }

      // Clear code immediately upon validation to ensure single-use
      admin.resetOtpCode = '';
      admin.resetOtpAttempts = 0;
      admin.resetOtpValidated = true; // Mark as validated
      admins[adminIndex] = admin;
      localStorage.setItem('agromart_admins', JSON.stringify(admins));

      setSuccessMsg('OTP verified successfully! You may now set a new password.');
      setLoading(false);
      setTimeout(() => {
        setSuccessMsg(null);
        setStep('RESET_PASS');
      }, 1000);
    }, 1000);
  };

  // Reset Password Step
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!password.trim() || !confirmPassword.trim()) {
      setErrorMsg('Please fill in both fields.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const storedAdmins = localStorage.getItem('agromart_admins');
      if (!storedAdmins) {
        setErrorMsg('System error. Admin records not found.');
        setLoading(false);
        return;
      }

      let admins = JSON.parse(storedAdmins);
      const adminIndex = admins.findIndex((a: any) => a.email.toLowerCase() === email.toLowerCase().trim());

      if (adminIndex === -1) {
        setErrorMsg('Admin account not found.');
        setLoading(false);
        return;
      }

      const admin = admins[adminIndex];

      // Ensure they actually went through the OTP verification step
      if (!admin.resetOtpValidated) {
        setErrorMsg('Security validation trace failed. Please restart the forgot password flow.');
        setLoading(false);
        return;
      }

      // Update password
      admin.password = password; // For mock plain text credential match
      admin.resetOtpValidated = false; // reset flag
      
      admins[adminIndex] = admin;
      localStorage.setItem('agromart_admins', JSON.stringify(admins));

      setSuccessMsg('Password successfully reset! Redirecting to login page...');
      setLoading(false);

      setTimeout(() => {
        router.push(`/admin/login?email=${encodeURIComponent(email)}`);
      }, 1800);
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
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className={`w-2 h-2 rounded-full ${step === 'EMAIL' ? 'bg-red-500 scale-125' : 'bg-earth-200 dark:bg-earth-800'}`} />
          <span className={`w-2 h-2 rounded-full ${step === 'OTP' ? 'bg-red-500 scale-125' : 'bg-earth-200 dark:bg-earth-800'}`} />
          <span className={`w-2 h-2 rounded-full ${step === 'RESET_PASS' ? 'bg-red-500 scale-125' : 'bg-earth-200 dark:bg-earth-800'}`} />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-foreground">
            {step === 'EMAIL' && 'Forgot Password'}
            {step === 'OTP' && 'Verify OTP'}
            {step === 'RESET_PASS' && 'Reset Password'}
          </h1>
          <p className="text-sm font-semibold text-earth-500 mt-1">
            {step === 'EMAIL' && 'Request a verification code to reset your password'}
            {step === 'OTP' && `Verification code sent to ${email}`}
            {step === 'RESET_PASS' && 'Choose a secure new password for your account'}
          </p>
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

        {/* Step 1: Request OTP Form */}
        {step === 'EMAIL' && (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground uppercase tracking-wide">Registered Email Address</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-750 text-white font-extrabold text-sm shadow-md shadow-red-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP Form */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
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
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 3: Reset Password Form */}
        {step === 'RESET_PASS' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground uppercase tracking-wide">New Password</label>
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground uppercase tracking-wide">Confirm New Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-earth-450 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
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
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-border text-center text-xs font-bold text-earth-500">
          Remember your password?{' '}
          <Link href="/admin/login" className="text-red-500 hover:text-red-650 hover:underline">
            Log In
          </Link>
        </div>
      </div>

      {/* Professional Email Preview Overlay Modal for password reset OTP */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button 
              onClick={() => { 
                setShowEmailPreview(false); 
                setStep('OTP');
              }} 
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
                <div><span className="font-extrabold text-earth-500 text-xs">Subject:</span> <span className="font-black text-foreground">Reset Your AgroMart Admin Password</span></div>
                <div><span className="font-extrabold text-earth-500 text-xs">To:</span> <span className="font-bold text-primary-600">{email}</span></div>
              </div>
              <div>
                <p className="font-semibold text-foreground">Hello Admin,</p>
                <p className="text-earth-550 dark:text-earth-400 mt-2 leading-relaxed font-medium">
                  We received a request to reset the password for your AgroMart Administrator account. Please use the secure OTP code below to verify your identity:
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
              onClick={() => {
                setShowEmailPreview(false);
                setStep('OTP');
              }}
              className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-750 text-white font-extrabold text-sm shadow-md mt-6 cursor-pointer"
            >
              Proceed to Enter Code
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
