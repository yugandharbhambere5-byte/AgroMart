'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2, X, Bell } from 'lucide-react';

export default function AdminRegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Email Template Preview states
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [previewOtp, setPreviewOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMsg('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      setLoading(false);
      return;
    }

    // Simulate registration delays
    setTimeout(() => {
      // Check if email already exists
      const storedAdmins = localStorage.getItem('agromart_admins');
      let admins = storedAdmins ? JSON.parse(storedAdmins) : [];
      
      if (admins.some((a: any) => a.email.toLowerCase() === email.toLowerCase().trim())) {
        setErrorMsg('Email address already registered.');
        setLoading(false);
        return;
      }

      // Generate secure 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

      const newAdmin = {
        id: 'admin-' + Date.now(),
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: password, // Plain text check for mock
        isVerified: false,
        otpCode: otp,
        otpExpiry: expiry,
        otpAttempts: 0,
        resendAttempts: 0,
        bruteForceAttempts: 0,
        bruteForceLockUntil: null,
      };

      admins.push(newAdmin);
      localStorage.setItem('agromart_admins', JSON.stringify(admins));

      setPreviewOtp(otp);
      setRegisteredEmail(email.toLowerCase().trim());
      setLoading(false);
      setShowEmailPreview(true); // Trigger email template preview
    }, 1200);
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
          <h1 className="text-2xl font-black text-foreground">Admin Registration</h1>
          <p className="text-sm font-semibold text-earth-500 mt-1">Create an authoritative administrator account</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-extrabold flex items-start gap-3">
            <span className="text-base select-none mt-0.5">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-foreground uppercase tracking-wide">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-4 w-5 h-5 text-earth-450 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Ramesh Patil"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background text-foreground font-semibold placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground uppercase tracking-wide">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-earth-455 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-background text-foreground font-semibold placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground uppercase tracking-wide">Confirm</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-earth-455 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-background text-foreground font-semibold placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-xs font-bold text-earth-500">
          Already an administrator?{' '}
          <Link href="/admin/login" className="text-red-500 hover:text-red-650 hover:underline">
            Log In
          </Link>
        </div>
      </div>

      {/* Professional Email Preview Overlay Modal */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button 
              onClick={() => { 
                setShowEmailPreview(false); 
                router.push(`/admin/verify-email?email=${encodeURIComponent(registeredEmail)}`); 
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
                <div><span className="font-extrabold text-earth-500 text-xs">Subject:</span> <span className="font-black text-foreground">Verify Your AgroMart Admin Account</span></div>
                <div><span className="font-extrabold text-earth-500 text-xs">To:</span> <span className="font-bold text-primary-600">{registeredEmail}</span></div>
              </div>
              <div>
                <p className="font-semibold text-foreground">Hello <span className="font-extrabold">{fullName}</span>,</p>
                <p className="text-earth-550 dark:text-earth-400 mt-2 leading-relaxed font-medium">
                  Welcome to AgroMart. To activate your administrator control account and gain full clearance permissions, please verify your email address using the secure OTP code below:
                </p>
              </div>
              <div className="my-3 py-4 px-6 rounded-xl border-2 border-dashed border-red-500 bg-red-500/5 text-center">
                <span className="text-3xl font-black tracking-widest text-red-600 dark:text-red-400">{previewOtp}</span>
              </div>
              <div className="text-xs text-earth-500 leading-relaxed font-bold flex flex-col gap-1 border-t border-border/60 pt-3">
                <p>⏰ <strong>Expiry Notice:</strong> This code is valid for exactly <strong>10 minutes</strong> and is restricted to single-use.</p>
                <p>🔒 <strong>Security Warning:</strong> If you did not request this account registration, please ignore this email or report this to IT security immediately.</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowEmailPreview(false);
                router.push(`/admin/verify-email?email=${encodeURIComponent(registeredEmail)}`);
              }}
              className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-750 text-white font-extrabold text-sm shadow-md mt-6 cursor-pointer"
            >
              Proceed to Verification Page
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
