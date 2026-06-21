'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Mail, Phone, ArrowRight, Sprout, ShieldAlert, Loader2, ShoppingBag, Globe } from 'lucide-react';
import { useTranslation, Language } from '@/context/LanguageContext';

export default function LoginPage() {
  const { t, language, setLanguage } = useTranslation();
  const [role, setRole] = useState<'farmer' | 'buyer' | 'admin'>('farmer');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const router = useRouter();
  const supabase = createClient();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const targetValue = authMethod === 'email' ? email.trim() : `${countryCode}${phone.trim()}`;
    const contactField = authMethod === 'email' ? 'email' : 'phone';

    if (authMethod === 'email' ? !email.trim() : !phone.trim()) {
      setErrorMsg(authMethod === 'email' ? 'Please enter your email.' : 'Please enter your phone number.');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      setLoading(false);
      return;
    }

    try {
      const mockUserId = 'mock-' + role + '-' + Math.random().toString(36).substring(2, 11);
      const isSuperadmin = role === 'admin';
      
      const mockUser = {
        id: mockUserId,
        email: authMethod === 'email' ? targetValue : null,
        phone: authMethod === 'phone' ? targetValue : null,
        user_metadata: {
          role: isSuperadmin ? 'admin' : role,
          full_name: isSuperadmin ? 'Superadmin User' : role === 'buyer' ? 'Mauli Ginning' : 'Kanha Patil',
          fullName: isSuperadmin ? 'Superadmin User' : role === 'buyer' ? 'Mauli Ginning' : 'Kanha Patil',
        }
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('agro-mart-mock-user', JSON.stringify(mockUser));
        document.cookie = `agro-mart-mock-user=${encodeURIComponent(JSON.stringify(mockUser))}; path=/`;
        
        // Save to mock users list to make it discoverable
        const storedUsers = localStorage.getItem('agromart_mock_users');
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        if (!users.some((u: any) => u.email === mockUser.email || u.phone === mockUser.phone)) {
          users.push({
            ...mockUser,
            password: password.trim()
          });
          localStorage.setItem('agromart_mock_users', JSON.stringify(users));
        }
      }

      setSuccessMsg(language === 'mr' ? 'लॉगिन यशस्वी! रीडायरेक्ट करत आहे...' : 'Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = `/dashboard/${isSuperadmin ? 'admin' : role}`;
      }, 1000);
    } catch (err: any) {
      console.error('Sign In Error:', err);
      setErrorMsg(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetEmail.trim()) {
      setErrorMsg('Please enter your email.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim());
      if (error) throw error;
      setSuccessMsg('Reset OTP has been sent to your registered email.');
      console.log('Mock Reset OTP sent. Hint: Mock OTP is "123456"');
      setResetStep('verify');
    } catch (err: any) {
      console.error('Reset password request error:', err);
      setErrorMsg(err.message || 'Failed to send reset link/OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetOtp.trim() || !newPassword.trim()) {
      setErrorMsg('Please enter both the OTP and the new password.');
      setLoading(false);
      return;
    }

    if (resetOtp.trim() !== '123456') {
      setErrorMsg('Invalid verification OTP code. Use 123456 in mock mode.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
      if (error) throw error;

      setSuccessMsg('Password updated successfully! Redirecting to dashboard...');
      
      // Auto login after reset
      const { data, error: loginErr } = await supabase.auth.signInWithPassword({
        email: resetEmail.trim(),
        password: newPassword.trim(),
      });

      let userRole = role;
      if (data?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        if (profileData) {
          userRole = profileData.role || userRole;
        } else if (data.user.user_metadata?.role) {
          userRole = data.user.user_metadata.role;
        }
      }

      setTimeout(() => {
        window.location.href = `/dashboard/${userRole}`;
      }, 1500);
    } catch (err: any) {
      console.error('Reset password verification error:', err);
      setErrorMsg(err.message || 'Failed to verify OTP or update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-primary-50/20 to-background dark:from-primary-950/10">
      
      {/* Brand logo & Language selection header */}
      <div className="mb-8 flex items-center justify-between w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-foreground">
            Agro<span className="text-primary-500">Mart</span>
          </span>
        </Link>

        {/* Language Selector Dropdown */}
        <div className="relative flex items-center select-none">
          <Globe className="absolute left-3 w-4 h-4 text-earth-455 pointer-events-none" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="pl-9 pr-7 py-2.5 rounded-xl border border-border bg-card hover:bg-earth-100 dark:hover:bg-earth-800 text-xs font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer appearance-none"
          >
            <option value="en">EN</option>
            <option value="mr">मराठी</option>
            <option value="hi">हिंदी</option>
          </select>
          <span className="absolute right-2.5 text-earth-455 pointer-events-none text-[8px] font-black">▼</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-xl shadow-primary-950/5">
        <div className="text-center mb-6 flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            {isForgotPassword 
              ? (language === 'mr' ? 'सुपरअॅडमिन पासवर्ड रिसेट' : language === 'hi' ? 'सुपरएडमिन पासवर्ड रीसेट' : 'Reset Superadmin Password')
              : t.auth.loginTitle}
          </h1>
          <p className="text-sm font-semibold text-earth-550 dark:text-earth-400">
            {isForgotPassword
              ? (resetStep === 'request'
                  ? (language === 'mr' ? 'पासवर्ड रिसेट करण्यासाठी तुमचा नोंदणीकृत ईमेल प्रविष्ट करा.' : language === 'hi' ? 'पासवर्ड रीसेट करने के लिए अपना पंजीकृत ईमेल दर्ज करें।' : 'Enter your registered superadmin email to receive a password reset OTP.')
                  : (language === 'mr' ? `आम्ही ${resetEmail} वर OTP पाठवला आहे.` : language === 'hi' ? `हमने ${resetEmail} पर OTP भेजा है।` : `We sent an OTP to ${resetEmail}.`))
              : role === 'admin' 
                ? (language === 'mr' ? 'सुपरअॅडमिन क्रेडेंशियल्स वापरून सुरक्षितपणे लॉग इन करा.' : language === 'hi' ? 'सुपरएडमिन क्रेडेंशियल्स का उपयोग करके सुरक्षित रूप से लॉग इन करें।' : 'Sign in securely using superadmin credentials.')
                : t.auth.loginSubtitle}
          </p>
        </div>

        {/* Role selector - Farmer vs Buyer/Trader vs Admin */}
        {!isForgotPassword && (
          <div className="flex flex-col gap-2 mb-6 text-left">
            <label className="text-xs font-black text-foreground pl-1 uppercase tracking-wide">
              लॉगिन प्रकार / Login As:
            </label>
            <div className="flex p-1 rounded-2xl bg-earth-100 dark:bg-earth-900 border border-border">
              <button
                type="button"
                onClick={() => { setRole('farmer'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  role === 'farmer'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-earth-550 hover:text-foreground'
                }`}
              >
                <Sprout className="w-4 h-4" />
                <span>Farmer</span>
              </button>
              <button
                type="button"
                onClick={() => { setRole('buyer'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  role === 'buyer'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-earth-550 hover:text-foreground'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buyer</span>
              </button>
              <button
                type="button"
                onClick={() => { setRole('admin'); setErrorMsg(null); setSuccessMsg(null); setAuthMethod('email'); }}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  role === 'admin'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-earth-550 hover:text-foreground'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Superadmin</span>
              </button>
            </div>
            {role === 'admin' && (
              <p className="text-[11px] font-bold text-red-500 pl-1 flex items-center gap-1 animate-pulse">
                🔒 Superadmin access — restricted to authorised personnel only.
              </p>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-sm font-bold flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-start gap-3">
            <span className="text-base select-none">✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Toggle auth method - Large touch targets */}
        {!isForgotPassword && role !== 'admin' && (
          <div className="flex p-1 rounded-2xl bg-earth-100 dark:bg-earth-900 border border-border mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setErrorMsg(null);
                setSuccessMsg(null);
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
                setSuccessMsg(null);
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
        )}

        {/* Sign in Form or Forgot Password Form */}
        {isForgotPassword ? (
          resetStep === 'request' ? (
            <form onSubmit={handleForgotPasswordRequest} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="reset-email" className="text-sm font-bold text-foreground">
                  {t.auth.emailLabel}
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-earth-450 pointer-events-none" />
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="admin@agromart.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.common.loading}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'mr' ? 'OTP पाठवा' : language === 'hi' ? 'OTP भेजें' : 'Send Reset OTP'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-black text-earth-500 hover:text-foreground underline text-center"
              >
                {language === 'mr' ? 'लॉगिन वर परत जा' : language === 'hi' ? 'लॉगिन पर वापस जाएं' : 'Back to Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPasswordVerify} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="reset-otp" className="text-sm font-bold text-foreground">
                  {language === 'mr' ? 'OTP कोड प्रविष्ट करा' : language === 'hi' ? 'OTP कोड दर्ज करें' : 'Enter Reset OTP'}
                </label>
                <input
                  id="reset-otp"
                  type="text"
                  maxLength={6}
                  placeholder="0 0 0 0 0 0"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  className="w-full text-center py-3 rounded-xl border border-border bg-background text-foreground text-2xl font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="new-password" className="text-sm font-bold text-foreground">
                  {language === 'mr' ? 'नवीन पासवर्ड' : language === 'hi' ? 'नया पासवर्ड' : 'New Password'}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-earth-455 pointer-events-none select-none text-base">🔑</span>
                  <input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.common.loading}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'mr' ? 'पासवर्ड रिसेट करा आणि लॉगिन करा' : language === 'hi' ? 'पासवर्ड रीसेट करें और लॉगिन करें' : 'Reset Password & Login'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-black text-earth-550 hover:text-foreground underline text-center font-bold"
              >
                {language === 'mr' ? 'लॉगिन वर परत जा' : language === 'hi' ? 'लॉगिन पर वापस जाएं' : 'Back to Login'}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleSendOTP} className="flex flex-col gap-6">
            {role === 'admin' ? (
              <>
                {/* Admin Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="login-email" className="text-sm font-bold text-foreground">
                    {t.auth.emailLabel}
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-5 h-5 text-earth-450 pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      placeholder="admin@agromart.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Admin Password */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="login-password" className="text-sm font-bold text-foreground">
                      {language === 'mr' ? 'पासवर्ड' : language === 'hi' ? 'पासवर्ड' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setResetStep('request');
                        setResetEmail(email);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                    >
                      {language === 'mr' ? 'पासवर्ड विसरलात?' : language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-earth-455 pointer-events-none select-none text-base">🔑</span>
                    <input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {authMethod === 'email' ? (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="login-email" className="text-sm font-bold text-foreground">
                      {t.auth.emailLabel}
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-4 w-5 h-5 text-earth-455 pointer-events-none" />
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
                    <div className="flex gap-2">
                      <div className="relative flex items-center min-w-[100px]">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          disabled={loading}
                          className="w-full py-4 pl-3 pr-8 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm cursor-pointer appearance-none"
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+966">🇸🇦 +966</option>
                          <option value="+977">🇳🇵 +977</option>
                          <option value="+880">🇧🇩 +880</option>
                          <option value="+94">🇱🇰 +94</option>
                          <option value="+92">🇵🇰 +92</option>
                          <option value="+61">🇦🇺 +61</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-earth-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="relative flex-1 flex items-center">
                        <Phone className="absolute left-4 w-5 h-5 text-earth-450 pointer-events-none" />
                        <input
                          id="login-phone"
                          type="tel"
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          disabled={loading}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-earth-500 pl-1">
                      {t.auth.phoneCodeTip}
                    </span>
                  </div>
                )}

                {/* Password field for Farmer / Buyer */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="login-password" className="text-sm font-bold text-foreground">
                      {language === 'mr' ? 'पासवर्ड' : language === 'hi' ? 'पासवर्ड' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setResetStep('request');
                        setResetEmail(authMethod === 'email' ? email : '');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs font-bold text-primary-500 hover:text-primary-600 hover:underline cursor-pointer"
                    >
                      {language === 'mr' ? 'पासवर्ड विसरलात?' : language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-earth-455 pointer-events-none select-none text-base">🔑</span>
                    <input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                    />
                  </div>
                </div>
              </>
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
                  <span>{language === 'mr' ? 'लॉगिन करा' : language === 'hi' ? 'लॉगिन करें' : 'Sign In'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-border text-center text-sm font-semibold text-earth-550 dark:text-earth-400">
          {t.auth.newToAgroMart}{' '}
          <Link href="/register" className="text-primary-600 hover:text-primary-700 font-bold underline">
            {t.auth.createAccountLink}
          </Link>
        </div>

        {/* Superadmin quick access */}
        <div className="mt-4 text-center">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1.5 text-[11px] font-black text-earth-400 hover:text-red-500 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Go directly to Superadmin Panel
          </Link>
        </div>

      </div>
    </div>
  );
}
