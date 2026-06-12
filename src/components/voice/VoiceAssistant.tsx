'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, X, Volume2, Loader2, CheckCircle, AlertCircle,
  Sprout, Search, BarChart3, User, Zap, ChevronRight
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type VoiceIntent =
  | { type: 'ADD_CROP'; cropName: string; quantity?: string; unit?: string }
  | { type: 'SEARCH_BUYERS'; cropName: string; location?: string }
  | { type: 'SHOW_MARKET_RATES'; cropName?: string }
  | { type: 'SHOW_DEMANDS'; cropName?: string }
  | { type: 'NAVIGATE_PROFILE' }
  | { type: 'NAVIGATE_CHAT' }
  | { type: 'UNKNOWN'; raw: string };

export interface VoiceAssistantProps {
  /** Called when a recognized intent should be acted upon */
  onIntent?: (intent: VoiceIntent) => void;
  /** Optional: override the recognition language (default follows app language) */
  languageOverride?: string;
  /** Compact mode — just the mic button, no floating panel */
  compact?: boolean;
}

// ─── Crop Name Dictionary (Marathi / Hindi / English) ────────────────────────

export const CROP_DICT: Record<string, string> = {
  // Marathi
  'सोयाबीन': 'Soybean', 'सोया': 'Soybean',
  'गहू': 'Wheat', 'ज्वारी': 'Jowar', 'बाजरी': 'Bajra',
  'तांदूळ': 'Rice', 'भात': 'Rice',
  'टोमॅटो': 'Tomato', 'टोमाटो': 'Tomato',
  'बटाटा': 'Potato',
  'कांदा': 'Onion', 'कपाशी': 'Cotton', 'कापूस': 'Cotton',
  'तूर': 'Tur Dal', 'उडीद': 'Urad Dal', 'मूग': 'Moong',
  'हरभरा': 'Chickpea', 'हळद': 'Turmeric',
  'आंबा': 'Mango', 'द्राक्षे': 'Grapes', 'संत्री': 'Orange',
  'मिरची': 'Chilli', 'वांगे': 'Brinjal', 'भेंडी': 'Okra',
  'कोबी': 'Cabbage', 'फ्लॉवर': 'Cauliflower', 'गाजर': 'Carrot',
  // Hindi (unique keys only — shared Marathi keys omitted)
  'गेहूं': 'Wheat', 'चावल': 'Rice',
  'आलू': 'Potato', 'प्याज': 'Onion', 'टमाटर': 'Tomato',
  'मक्का': 'Corn', 'कपास': 'Cotton', 'मिर्च': 'Chilli',
  'धनिया': 'Coriander', 'अदरक': 'Ginger', 'लहसुन': 'Garlic',
  // English (common misspellings handled by similarity)
  'soybean': 'Soybean', 'soybeans': 'Soybean',
  'wheat': 'Wheat', 'rice': 'Rice', 'potato': 'Potato', 'potatoes': 'Potato',
  'tomato': 'Tomato', 'tomatoes': 'Tomato', 'onion': 'Onion', 'onions': 'Onion',
  'cotton': 'Cotton', 'corn': 'Corn', 'maize': 'Corn', 'jowar': 'Jowar',
  'bajra': 'Bajra', 'turmeric': 'Turmeric', 'chilli': 'Chilli', 'chili': 'Chilli',
  'mango': 'Mango', 'grapes': 'Grapes', 'orange': 'Orange', 'sugarcane': 'Sugarcane',
  'chickpea': 'Chickpea', 'lentil': 'Lentil', 'groundnut': 'Groundnut',
};

// ─── Intent Parsing Engine ────────────────────────────────────────────────────

const parseIntent = (transcript: string): VoiceIntent => {
  const text = transcript.toLowerCase().trim();

  // Helper: extract crop name from text
  const extractCrop = (t: string): string | undefined => {
    for (const [key, val] of Object.entries(CROP_DICT)) {
      if (t.includes(key.toLowerCase())) return val;
    }
    return undefined;
  };

  // Helper: extract quantity
  const extractQty = (t: string): { quantity?: string; unit?: string } => {
    const match = t.match(/(\d+)\s*(quintal|क्विंटल|ton|टन|kg|किलो|bag|बोरी)?/i);
    if (match) {
      const unitMap: Record<string, string> = {
        quintal: 'Quintals', 'क्विंटल': 'Quintals',
        ton: 'Tons', टन: 'Tons',
        kg: 'kg', किलो: 'kg',
        bag: 'Bags', बोरी: 'Bags',
      };
      return {
        quantity: match[1],
        unit: match[2] ? (unitMap[match[2].toLowerCase()] ?? match[2]) : 'Quintals',
      };
    }
    return {};
  };

  // ─ ADD / LIST CROP ─
  const addKeywords = ['add', 'list', 'नोंदणी', 'नोंद', 'जोड', 'यादी', 'विक्री', 'sell', 'जोडा', 'नोंदव', 'दाखल'];
  if (addKeywords.some(k => text.includes(k))) {
    const crop = extractCrop(text);
    const { quantity, unit } = extractQty(text);
    return { type: 'ADD_CROP', cropName: crop ?? 'Crop', quantity, unit };
  }

  // ─ SEARCH BUYERS ─
  const buyerKeywords = ['buyer', 'खरेदीदार', 'खरेदी', 'search', 'शोध', 'find', 'nearby', 'जवळचे', 'दाखव'];
  if (buyerKeywords.some(k => text.includes(k)) && !text.includes('बाजार') && !text.includes('market')) {
    const crop = extractCrop(text);
    return { type: 'SEARCH_BUYERS', cropName: crop ?? '' };
  }

  // ─ MARKET RATES ─
  const marketKeywords = ['market', 'बाजार', 'rate', 'भाव', 'price', 'किंमत', 'दर', 'mandi', 'मंडी', 'बाजारभाव'];
  if (marketKeywords.some(k => text.includes(k))) {
    const crop = extractCrop(text);
    return { type: 'SHOW_MARKET_RATES', cropName: crop };
  }

  // ─ DEMANDS ─
  const demandKeywords = ['demand', 'मागणी', 'order', 'ऑर्डर', 'requirement', 'आवश्यकता'];
  if (demandKeywords.some(k => text.includes(k))) {
    const crop = extractCrop(text);
    return { type: 'SHOW_DEMANDS', cropName: crop };
  }

  // ─ PROFILE ─
  if (text.includes('profile') || text.includes('प्रोफाइल') || text.includes('verify') || text.includes('सत्यापन')) {
    return { type: 'NAVIGATE_PROFILE' };
  }

  // ─ CHAT ─
  if (text.includes('chat') || text.includes('message') || text.includes('चर्चा') || text.includes('संदेश')) {
    return { type: 'NAVIGATE_CHAT' };
  }

  return { type: 'UNKNOWN', raw: transcript };
};

// ─── Example Commands ─────────────────────────────────────────────────────────

const EXAMPLE_COMMANDS = [
  { lang: 'mr', text: 'सोयाबीन नोंदणी करा', icon: Sprout, intent: 'ADD_CROP' },
  { lang: 'mr', text: 'जवळचे गहू खरेदीदार दाखवा', icon: Search, intent: 'SEARCH_BUYERS' },
  { lang: 'mr', text: 'टोमॅटो बाजारभाव सांगा', icon: BarChart3, intent: 'SHOW_MARKET_RATES' },
  { lang: 'en', text: 'Add soybean listing', icon: Sprout, intent: 'ADD_CROP' },
  { lang: 'en', text: 'Show nearby wheat buyers', icon: Search, intent: 'SEARCH_BUYERS' },
  { lang: 'en', text: 'Show market rates for onion', icon: BarChart3, intent: 'SHOW_MARKET_RATES' },
  { lang: 'hi', text: '20 क्विंटल गेहूं जोड़ें', icon: Sprout, intent: 'ADD_CROP' },
  { lang: 'hi', text: 'पास के आलू खरीदार खोजें', icon: Search, intent: 'SEARCH_BUYERS' },
];

const intentLabels: Record<string, { label: string; color: string }> = {
  ADD_CROP:          { label: 'Add Crop',     color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  SEARCH_BUYERS:     { label: 'Find Buyers',  color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
  SHOW_MARKET_RATES: { label: 'Market Rates', color: 'text-harvest-600 bg-harvest-50 dark:bg-harvest-950/40' },
  SHOW_DEMANDS:      { label: 'Demands',      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
  NAVIGATE_PROFILE:  { label: 'Profile',      color: 'text-primary-500 bg-primary-50 dark:bg-primary-950/40' },
  NAVIGATE_CHAT:     { label: 'Chat',         color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
  UNKNOWN:           { label: 'Unknown',      color: 'text-earth-500 bg-earth-100 dark:bg-earth-900' },
};

// ─── Web Speech API Types ─────────────────────────────────────────────────────

type RecognitionState = 'idle' | 'listening' | 'processing' | 'result' | 'error' | 'unsupported';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VoiceAssistant({ onIntent, languageOverride, compact = false }: VoiceAssistantProps) {
  const { language, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<RecognitionState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [parsedIntent, setParsedIntent] = useState<VoiceIntent | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState<Array<{ transcript: string; intent: VoiceIntent }>>([]);
  const [volume, setVolume] = useState(0); // 0-1 for visualizer
  const [activeExample, setActiveExample] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const volumeIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Language map for Web Speech API
  const speechLang = languageOverride ?? (language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN');

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // ── Stop Recognition ────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (volumeIntervalRef.current) { clearInterval(volumeIntervalRef.current); }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setVolume(0);
  }, []);

  // ── Audio Visualizer ────────────────────────────────────────────────────────
  const startVisualizer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buffer = new Uint8Array(analyser.frequencyBinCount);

      volumeIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(buffer);
        const avg = buffer.reduce((a, b) => a + b, 0) / buffer.length;
        setVolume(Math.min(1, avg / 60));
      }, 50);
    } catch {
      // No mic access, just animate randomly
      volumeIntervalRef.current = setInterval(() => {
        setVolume(0.3 + Math.random() * 0.5);
      }, 100);
    }
  }, []);

  // ── Start Listening ─────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!isSupported) {
      setState('unsupported');
      setErrorMsg('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    setTranscript('');
    setInterimTranscript('');
    setParsedIntent(null);
    setErrorMsg('');
    setState('listening');
    startVisualizer();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = speechLang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (final) {
        setTranscript(final);
        setState('processing');
        setTimeout(() => {
          const intent = parseIntent(final);
          setParsedIntent(intent);
          setState('result');
          setHistory(prev => [{ transcript: final, intent }, ...prev.slice(0, 4)]);
          stopListening();
        }, 400);
      }
    };

    recognition.onerror = (event: any) => {
      setState('error');
      const errMap: Record<string, string> = {
        'no-speech': 'No speech detected. Please try again.',
        'not-allowed': 'Microphone access denied. Please allow microphone access in your browser.',
        'network': 'Network error. Please check your connection.',
        'aborted': 'Recognition stopped.',
      };
      setErrorMsg(errMap[event.error] ?? `Error: ${event.error}`);
      stopListening();
    };

    recognition.onend = () => {
      if (state === 'listening') {
        setState('idle');
        stopListening();
      }
    };

    recognition.start();
  }, [isSupported, speechLang, startVisualizer, stopListening, state]);

  // ── Execute Intent ──────────────────────────────────────────────────────────
  const executeIntent = (intent: VoiceIntent) => {
    if (onIntent) {
      onIntent(intent);
      setIsOpen(false);
      setState('idle');
      setTranscript('');
      setParsedIntent(null);
    }
  };

  // ── Run Example Command ─────────────────────────────────────────────────────
  const runExample = (exampleText: string, idx: number) => {
    setActiveExample(idx);
    setTranscript(exampleText);
    setState('processing');
    setTimeout(() => {
      const intent = parseIntent(exampleText);
      setParsedIntent(intent);
      setState('result');
      setHistory(prev => [{ transcript: exampleText, intent }, ...prev.slice(0, 4)]);
      setActiveExample(null);
    }, 600);
  };

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  // ── Render Mic Button ───────────────────────────────────────────────────────
  const micSize = volume * 60;
  const isListening = state === 'listening';

  const langExamples = EXAMPLE_COMMANDS.filter(
    e => e.lang === language || (language === 'en' && e.lang === 'en')
  );

  // Intent type guard helpers
  const intentCropName = (intent: VoiceIntent): string | undefined => {
    if (intent.type === 'ADD_CROP') return intent.cropName;
    if (intent.type === 'SEARCH_BUYERS') return intent.cropName || undefined;
    if (intent.type === 'SHOW_MARKET_RATES') return intent.cropName;
    if (intent.type === 'SHOW_DEMANDS') return intent.cropName;
    return undefined;
  };

  const intentQty = (intent: VoiceIntent): string | undefined =>
    intent.type === 'ADD_CROP' ? intent.quantity : undefined;

  return (
    <>
      {/* ── Floating Trigger Button ─────────────────────────────────────── */}
      <button
        id="voice-assistant-btn"
        onClick={() => { setIsOpen(o => !o); if (!isOpen) { setState('idle'); setTranscript(''); setParsedIntent(null); } }}
        title={language === 'mr' ? 'आवाज सहाय्यक' : language === 'hi' ? 'आवाज सहायक' : 'Voice Assistant'}
        className={`relative group flex items-center justify-center rounded-2xl font-extrabold transition-all duration-300 cursor-pointer select-none
          ${compact
            ? 'w-10 h-10 bg-earth-100 dark:bg-earth-900 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-earth-600 dark:text-earth-300'
            : 'gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white shadow-lg shadow-primary-600/25 hover:shadow-primary-500/40 hover:scale-[1.03]'
          }
          ${isOpen ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-background' : ''}
        `}
      >
        {/* Pulse ring when open */}
        {isOpen && !compact && (
          <span className="absolute inset-0 rounded-2xl bg-primary-500 animate-ping opacity-20" />
        )}
        <Mic className={`shrink-0 ${compact ? 'w-4.5 h-4.5' : 'w-4 h-4'}`} />
        {!compact && (
          <span className="text-sm">
            {language === 'mr' ? 'आवाज' : language === 'hi' ? 'आवाज' : 'Voice'}
          </span>
        )}
      </button>

      {/* ── Voice Panel ─────────────────────────────────────────────────── */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[150] bg-black/30 backdrop-blur-sm"
            onClick={() => { setIsOpen(false); stopListening(); }}
          />

          {/* Panel */}
          <div className="fixed bottom-6 right-6 z-[160] w-full max-w-md animate-fade-in-up">
            <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">

              {/* Header */}
              <div className="flex items-center justify-between p-5 pb-4 border-b border-border bg-gradient-to-r from-primary-600/5 to-primary-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/25">
                    <Mic className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-sm">
                      {language === 'mr' ? 'आवाज सहाय्यक' : language === 'hi' ? 'आवाज सहायक' : 'Voice Assistant'}
                    </h3>
                    <p className="text-[10px] font-bold text-earth-500">
                      {speechLang === 'mr-IN' ? 'मराठी · हिंदी · English' : speechLang === 'hi-IN' ? 'हिंदी · मराठी · English' : 'English · मराठी · हिंदी'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsOpen(false); stopListening(); }}
                  className="p-2 rounded-xl hover:bg-earth-100 dark:hover:bg-earth-900 text-earth-500 hover:text-foreground transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Content */}
              <div className="p-5 flex flex-col gap-5 max-h-[calc(100vh-200px)] overflow-y-auto">

                {/* Microphone Visualizer */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    {/* Animated volume rings */}
                    {isListening && (
                      <>
                        <div
                          className="absolute rounded-full bg-primary-400/20 transition-all duration-150"
                          style={{ width: `${80 + micSize}px`, height: `${80 + micSize}px` }}
                        />
                        <div
                          className="absolute rounded-full bg-primary-500/15 transition-all duration-200"
                          style={{ width: `${96 + micSize * 1.2}px`, height: `${96 + micSize * 1.2}px` }}
                        />
                        <div
                          className="absolute rounded-full bg-primary-600/10 transition-all duration-250"
                          style={{ width: `${112 + micSize * 1.4}px`, height: `${112 + micSize * 1.4}px` }}
                        />
                      </>
                    )}

                    {/* Main mic button */}
                    <button
                      id="voice-mic-button"
                      onClick={() => isListening ? stopListening() : startListening()}
                      disabled={state === 'processing'}
                      className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center font-extrabold transition-all duration-300 cursor-pointer shadow-xl
                        ${isListening
                          ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/40 scale-110'
                          : state === 'processing'
                          ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-400/30'
                          : state === 'result'
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30'
                          : state === 'error' || state === 'unsupported'
                          ? 'bg-gradient-to-br from-red-400 to-red-500 shadow-red-400/30'
                          : 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary-500/40 hover:scale-105'
                        }
                      `}
                    >
                      {state === 'processing' ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      ) : isListening ? (
                        <MicOff className="w-8 h-8 text-white" />
                      ) : state === 'result' ? (
                        <CheckCircle className="w-8 h-8 text-white" />
                      ) : state === 'error' || state === 'unsupported' ? (
                        <AlertCircle className="w-8 h-8 text-white" />
                      ) : (
                        <Mic className="w-8 h-8 text-white" />
                      )}
                    </button>
                  </div>

                  {/* Status Text */}
                  <div className="text-center">
                    {isListening && (
                      <p className="text-sm font-extrabold text-primary-600 animate-pulse">
                        {language === 'mr' ? '🎙️ ऐकत आहे...' : language === 'hi' ? '🎙️ सुन रहा हूं...' : '🎙️ Listening...'}
                      </p>
                    )}
                    {state === 'processing' && (
                      <p className="text-sm font-extrabold text-amber-600">
                        {language === 'mr' ? '⚙️ समजत आहे...' : language === 'hi' ? '⚙️ समझ रहा हूं...' : '⚙️ Processing...'}
                      </p>
                    )}
                    {state === 'idle' && (
                      <p className="text-xs font-bold text-earth-500">
                        {language === 'mr' ? 'बोलण्यासाठी मायक्रोफोन दाबा' : language === 'hi' ? 'बोलने के लिए माइक दबाएं' : 'Tap the mic to speak'}
                      </p>
                    )}
                    {(state === 'error' || state === 'unsupported') && (
                      <p className="text-xs font-bold text-red-500 max-w-[280px] text-center">{errorMsg}</p>
                    )}
                  </div>
                </div>

                {/* Live Transcript */}
                {(transcript || interimTranscript) && (
                  <div className="px-4 py-3 rounded-xl bg-earth-50 dark:bg-earth-900 border border-border">
                    <p className="text-[10px] font-black uppercase tracking-wider text-earth-400 mb-1">
                      {language === 'mr' ? 'ऐकलेले' : language === 'hi' ? 'सुना गया' : 'Heard'}
                    </p>
                    <p className="text-sm font-semibold text-foreground leading-relaxed">
                      {transcript || <span className="text-earth-400 italic">{interimTranscript}</span>}
                    </p>
                  </div>
                )}

                {/* Parsed Intent Result */}
                {parsedIntent && state === 'result' && (
                  <div className="flex flex-col gap-3 animate-fade-in">
                    <div className="p-4 rounded-2xl border-2 border-primary-500/30 bg-primary-50/10 dark:bg-primary-950/20 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary-500" />
                          <span className="text-xs font-black text-foreground uppercase tracking-wider">
                            {language === 'mr' ? 'आज्ञा ओळखली' : language === 'hi' ? 'कमांड पहचानी' : 'Command Recognized'}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${intentLabels[parsedIntent.type]?.color}`}>
                          {intentLabels[parsedIntent.type]?.label}
                        </span>
                      </div>

                      <div className="text-sm text-foreground font-bold space-y-1">
                        {parsedIntent.type === 'ADD_CROP' && (
                          <>
                            <div>🌾 {language === 'mr' ? 'पीक:' : language === 'hi' ? 'फसल:' : 'Crop:'} <span className="text-primary-600">{parsedIntent.cropName}</span></div>
                            {parsedIntent.quantity && <div>📦 {language === 'mr' ? 'प्रमाण:' : 'Qty:'} <span className="text-primary-600">{parsedIntent.quantity} {parsedIntent.unit}</span></div>}
                          </>
                        )}
                        {parsedIntent.type === 'SEARCH_BUYERS' && (
                          <div>🔍 {language === 'mr' ? 'शोधत आहे:' : 'Searching:'} <span className="text-blue-600">{parsedIntent.cropName || 'all'} buyers</span></div>
                        )}
                        {parsedIntent.type === 'SHOW_MARKET_RATES' && (
                          <div>📊 {language === 'mr' ? 'बाजारभाव:' : 'Market rates:'} <span className="text-harvest-600">{parsedIntent.cropName ?? 'All crops'}</span></div>
                        )}
                        {parsedIntent.type === 'SHOW_DEMANDS' && (
                          <div>📋 {language === 'mr' ? 'मागण्या:' : 'Demands for:'} <span className="text-purple-600">{parsedIntent.cropName ?? 'All'}</span></div>
                        )}
                        {parsedIntent.type === 'NAVIGATE_PROFILE' && <div>👤 {language === 'mr' ? 'प्रोफाइल टॅब उघडतो' : 'Opening Profile tab'}</div>}
                        {parsedIntent.type === 'NAVIGATE_CHAT' && <div>💬 {language === 'mr' ? 'चर्चा टॅब उघडतो' : 'Opening Chat tab'}</div>}
                        {parsedIntent.type === 'UNKNOWN' && (
                          <div className="text-earth-500 italic text-xs">
                            {language === 'mr' ? '"' + parsedIntent.raw + '" समजले नाही' : `Could not understand "${parsedIntent.raw}"`}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        {parsedIntent.type !== 'UNKNOWN' && (
                          <button
                            onClick={() => executeIntent(parsedIntent)}
                            className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-primary-600/20"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            {language === 'mr' ? 'अंमलात आणा' : language === 'hi' ? 'चलाएं' : 'Execute'}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => { setState('idle'); setTranscript(''); setParsedIntent(null); startListening(); }}
                          className="px-4 py-2.5 rounded-xl border border-border text-earth-600 dark:text-earth-400 font-extrabold text-xs hover:bg-earth-50 dark:hover:bg-earth-900 cursor-pointer transition-all"
                        >
                          {language === 'mr' ? 'पुन्हा बोला' : language === 'hi' ? 'फिर बोलें' : 'Try Again'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Example Commands */}
                {state === 'idle' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-earth-400">
                      {language === 'mr' ? 'उदाहरण आज्ञा' : language === 'hi' ? 'उदाहरण कमांड' : 'Try saying'}
                    </p>
                    <div className="flex flex-col gap-2">
                      {langExamples.slice(0, 4).map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => runExample(ex.text, i)}
                          disabled={activeExample !== null}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer group hover:border-primary-500/40 hover:bg-primary-50/5 dark:hover:bg-primary-950/10
                            ${activeExample === i ? 'border-primary-500/40 bg-primary-50/10 dark:bg-primary-950/20' : 'border-border bg-background'}
                          `}
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/40 transition-colors">
                            {activeExample === i
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <ex.icon className="w-4 h-4" />
                            }
                          </div>
                          <span className="text-sm font-semibold text-foreground flex-grow">"{ex.text}"</span>
                          <ChevronRight className="w-4 h-4 text-earth-400 group-hover:text-primary-500 transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* History */}
                {history.length > 0 && state === 'idle' && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-earth-400">
                      {language === 'mr' ? 'अलीकडील' : language === 'hi' ? 'हाल के' : 'Recent'}
                    </p>
                    {history.slice(0, 3).map((h, i) => (
                      <button
                        key={i}
                        onClick={() => { setParsedIntent(h.intent); setTranscript(h.transcript); setState('result'); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:border-primary-500/30 text-left text-xs font-semibold text-earth-500 cursor-pointer transition-all hover:text-foreground"
                      >
                        <Volume2 className="w-3 h-3 shrink-0 text-earth-400" />
                        <span className="truncate">"{h.transcript}"</span>
                        <span className={`ml-auto shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black ${intentLabels[h.intent.type]?.color}`}>
                          {intentLabels[h.intent.type]?.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-border bg-earth-50/50 dark:bg-earth-950/30 flex items-center justify-between">
                <span className="text-[10px] font-bold text-earth-400">
                  Powered by Web Speech API
                </span>
                <div className="flex items-center gap-2">
                  {(['mr-IN', 'hi-IN', 'en-IN'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => { /* Language is app-level */ }}
                      className={`text-[10px] font-black px-2 py-0.5 rounded transition-all ${
                        speechLang === l
                          ? 'bg-primary-600 text-white'
                          : 'text-earth-400 hover:text-foreground'
                      }`}
                    >
                      {l === 'mr-IN' ? 'मराठी' : l === 'hi-IN' ? 'हिंदी' : 'EN'}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
}
