'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Sprout, ShieldCheck, Truck, ArrowRight, Mic, MicOff } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { createClient } from '@/utils/supabase/client';

export function Hero() {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();
  const recognitionRef = React.useRef<any>(null);
  
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'mr' ? 'तुमच्या ब्राउझरमध्ये आवाज शोध समर्थित नाही.' : language === 'hi' ? 'आपके ब्राउज़र में आवाज़ खोज समर्थित नहीं है।' : 'Voice search is not supported in your browser.');
      return;
    }

    const speechLang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = speechLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setSearchQuery('');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      if (transcript.trim()) {
        router.push(`/market-rates?search=${encodeURIComponent(transcript.trim())}`);
      }
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/market-rates?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-48 pb-24 overflow-hidden" style={{ paddingTop: '200px' }}>
      {/* Full-width Background Looping Video with Poster Fallback */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/images/agromart-hero-fallback.jpg"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        {/* Vegetarian Crop and Agricultural Videos (Cotton/Wheat Harvesting and Fresh Vegetables/Marketyards) */}
        <source src="https://player.vimeo.com/external/198054816.hd.mp4?s=9148e366c318343616b90a1fb0359f151d2e7a58&profile_id=119" type="video/mp4" />
        <source src="https://player.vimeo.com/progressive_redirect/playback/946985230/rendition/720p/file.mp4?loc=external&log_user=0&signature=34c543522a51ebdc6116342ba68661f0fb80ce3bf4ac58fc88e0c03cd04d08e8" type="video/mp4" />
      </video>

      {/* Dark/Green transparent overlay above video so text remains readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-emerald-950/70 to-black/85 z-10 pointer-events-none" />

      {/* Hero Content Area - Centered and Above Video */}
      <div className="relative z-20 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-6 sm:gap-8">
        
        {/* Direct Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm max-w-fit shadow-sm animate-fade-in-up">
          <Sprout className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{t.hero.badge}</span>
        </div>

        {/* Logged in Greeting Banner */}
        {user && (
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-emerald-500/30 bg-gradient-to-r from-emerald-600/30 to-primary-600/30 text-white font-extrabold text-xs sm:text-sm shadow-md backdrop-blur-md animate-fade-in-up">
            <span>✨ {language === 'mr' ? `नमस्कार, ${user.user_metadata?.fullName || user.user_metadata?.full_name || 'वापरकर्ता'}! आपले स्वागत आहे.` : 
                   language === 'hi' ? `नमस्ते, ${user.user_metadata?.fullName || user.user_metadata?.full_name || 'उपयोगकर्ता'}! आपका स्वागत है।` : 
                   `Hello, ${user.user_metadata?.fullName || user.user_metadata?.full_name || 'User'}! Welcome back.`}</span>
          </div>
        )}

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] sm:leading-[1.1] animate-fade-in-up-delay-1 max-w-4xl">
          {t.hero.titleLine1} <br />
          <span className="text-emerald-450 drop-shadow-[0_2px_10px_rgba(16,185,129,0.4)]">{t.hero.titleLine2}</span> <br />
          {t.hero.titleLine3}
        </h1>

        {/* Sub-text */}
        <p className="text-base sm:text-lg lg:text-xl text-emerald-100/90 max-w-2xl font-medium animate-fade-in-up-delay-2 px-2">
          {t.hero.subtitle}
        </p>

        {/* Interactive Search Bar */}
        <form id="explore" onSubmit={handleSearchSubmit} className="relative max-w-2xl w-full scroll-mt-28 animate-fade-in-up-delay-3 px-2">
          <div className="relative flex items-center">
            <Search className="absolute left-4.5 w-5 h-5 text-earth-500 pointer-events-none z-10" />
            <input
              type="text"
              placeholder={
                isListening
                  ? (language === 'mr' ? 'ऐकत आहे... बोला' : language === 'hi' ? 'सुन रहा हूँ... बोलें' : 'Listening... Speak now')
                  : t.hero.searchPlaceholder
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-[150px] sm:pr-[170px] py-4 sm:py-5 rounded-2xl border border-emerald-500/25 bg-white/95 dark:bg-earth-950/95 text-earth-900 dark:text-white placeholder-earth-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/25 text-sm sm:text-base font-semibold shadow-xl transition-all"
            />
            <div className="absolute right-2 flex items-center gap-1.5 sm:gap-2">
              {/* Voice Search Button */}
              <button
                 type="button"
                 onClick={toggleVoiceSearch}
                 className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                   isListening
                     ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-md shadow-red-500/20'
                     : 'bg-earth-100 dark:bg-earth-900 hover:bg-earth-200 dark:hover:bg-earth-850 text-earth-650 dark:text-earth-300 hover:scale-105 active:scale-95'
                 }`}
                 title={
                   isListening
                     ? (language === 'mr' ? 'ऐकत आहे... थांबवण्यासाठी दाबा' : language === 'hi' ? 'सुन रहा हूँ... रोकने के लिए दबाएं' : 'Listening... Click to stop')
                     : (language === 'mr' ? 'आवाज शोध' : language === 'hi' ? 'आवाज खोज' : 'Voice Search')
                 }
              >
                {isListening ? (
                  <MicOff className="w-4.5 h-4.5" />
                ) : (
                  <Mic className="w-4.5 h-4.5 animate-none hover:scale-110 duration-200" />
                )}
              </button>

              {/* Search Button */}
              <button
                type="submit"
                className="px-4 sm:px-5 py-2 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-sm transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                {t.hero.searchBtn}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs font-bold text-emerald-200/80">
            <span>{t.hero.popular}:</span>
            <button type="button" onClick={() => setSearchQuery('Tomatoes')} className="hover:text-emerald-300 transition-colors">Tomatoes</button>
            <span>•</span>
            <button type="button" onClick={() => setSearchQuery('Wheat')} className="hover:text-emerald-300 transition-colors">Wheat</button>
            <span>•</span>
            <button type="button" onClick={() => setSearchQuery('Potatoes')} className="hover:text-emerald-300 transition-colors">Potatoes</button>
          </div>
        </form>

        {/* CTA Farmer / Buyer buttons - Big and accessible */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mt-2 w-full sm:w-auto px-2 animate-fade-in-up-delay-3">
          {user ? (
            <Link
              href={`/dashboard/${user.user_metadata?.role || 'farmer'}`}
              className="flex items-center justify-center gap-2 px-10 py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-primary-600 hover:from-emerald-500 hover:to-primary-500 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-emerald-900/30 transition-all hover:-translate-y-0.5 active:translate-y-0 text-center cursor-pointer"
            >
              <span>{language === 'mr' ? 'माझ्या डॅशबोर्डवर जा' : language === 'hi' ? 'मेरे डैशबोर्ड पर जाएं' : 'Go to My Dashboard'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/register?role=farmer"
                className="flex items-center justify-center gap-2 px-8 py-4 sm:py-4.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/40 transition-all hover:-translate-y-0.5 active:translate-y-0 text-center cursor-pointer"
              >
                <span>{t.hero.farmerBtn}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#explore"
                className="flex items-center justify-center gap-2 px-8 py-4 sm:py-4.5 rounded-2xl border-2 border-white/20 hover:border-emerald-450 bg-white/10 hover:bg-white/20 text-white font-extrabold text-base sm:text-lg transition-all text-center hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>{t.hero.buyerBtn}</span>
              </Link>
            </>
          )}
        </div>

        {/* Quick trust metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 mt-4 border-t border-white/10 w-full max-w-3xl animate-fade-in-up-delay-3">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-emerald-100">{t.hero.trustEscrow}</span>
          </div>
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-emerald-100">{t.hero.trustLogistics}</span>
          </div>
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-emerald-100">{t.hero.trustMarkup}</span>
          </div>
        </div>

      </div>
    </section>
  );
}

// Simple internal icon for visual ease
function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}
