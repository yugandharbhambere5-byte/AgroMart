'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, MapPin, Sprout, Loader2 } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { CROP_DICT } from '@/components/voice/VoiceAssistant';

interface SmartSearchProps {
  onSearch: (query: string, parsedCrop?: string, parsedLocation?: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export function SmartSearch({ onSearch, placeholder, initialValue = '' }: SmartSearchProps) {
  const { language } = useTranslation();
  const [query, setQuery] = useState(initialValue);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<{ text: string; translated: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      alert(language === 'mr' ? 'तुमचा ब्राउझर व्हॉइस सर्च सपोर्ट करत नाही.' : 'Your browser does not support voice search.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      recognitionRef.current.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      
      recognitionRef.current.onstart = () => setIsListening(true);
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        processSearch(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => setIsListening(false);

      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const extractCrop = (t: string): string | undefined => {
    const textLower = t.toLowerCase();
    for (const [key, val] of Object.entries(CROP_DICT)) {
      if (textLower.includes(key.toLowerCase())) return val;
    }
    return undefined;
  };

  const extractLocation = (t: string): string | undefined => {
    // Looks for patterns like "near Pune", "in Nashik", "अकोला मध्ये", "नागपूर जवळ"
    const match = t.match(/(?:near|in|around)\s+([a-zA-Z]+)/i) || 
                  t.match(/([a-zA-Z\u0900-\u097F]+)\s+(?:मध्ये|me|madhye|जवळ|jawal|pas)/i);
    if (match) return match[1].trim();
    return undefined;
  };

  const processSearch = (text: string) => {
    const crop = extractCrop(text);
    const loc = extractLocation(text);
    setShowSuggestions(false);
    onSearch(text, crop, loc);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processSearch(query);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.trim().length > 1) {
      // Find autocomplete suggestions
      const valLower = val.toLowerCase();
      const matches = Object.entries(CROP_DICT)
        .filter(([key]) => key.toLowerCase().startsWith(valLower))
        .slice(0, 5)
        .map(([key, translated]) => ({ text: key, translated }));
      
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }

    // Call onSearch immediately for live filtering but without strict NLP if they are just typing
    onSearch(val, extractCrop(val), extractLocation(val));
  };

  const selectSuggestion = (suggestion: { text: string; translated: string }) => {
    // Replace the last word being typed with the suggestion, or just set it
    const newQuery = suggestion.translated; // Or suggestion.text depending on if we want English translation
    setQuery(suggestion.text);
    processSearch(suggestion.text);
  };

  const defaultPlaceholder = language === 'mr' 
    ? 'पीक किंवा ठिकाण शोधा (उदा: सोयाबीन अकोला मध्ये)...' 
    : language === 'hi' 
      ? 'फसल या स्थान खोजें...' 
      : 'Search crops or locations (e.g. Wheat near Pune)...';

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className={`relative flex items-center w-full rounded-2xl border transition-all ${
        isListening ? 'border-primary-500 ring-4 ring-primary-500/20 bg-primary-50/10' : 'border-border bg-card'
      }`}>
        <Search className={`absolute left-4 w-5 h-5 ${isListening ? 'text-primary-500' : 'text-earth-400'}`} />
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          className="w-full pl-12 pr-14 py-3.5 bg-transparent text-foreground placeholder-earth-400 focus:outline-none font-bold text-sm"
        />
        
        <button
          onClick={handleVoiceSearch}
          className={`absolute right-2 p-2 rounded-xl transition-colors cursor-pointer ${
            isListening 
              ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40' 
              : 'hover:bg-earth-100 dark:hover:bg-earth-900 text-earth-500 hover:text-primary-600'
          }`}
          title="Voice Search"
        >
          {isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => selectSuggestion(s)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-earth-50 dark:hover:bg-earth-900/50 cursor-pointer border-b border-border/50 last:border-0 transition-colors text-left"
            >
              <span className="font-extrabold text-sm text-foreground flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-500" />
                {s.text}
              </span>
              {s.text !== s.translated && (
                <span className="text-xs font-semibold text-earth-500 bg-earth-100 dark:bg-earth-900 px-2 py-0.5 rounded-md">
                  {s.translated}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* NLP Indicators (shown when location or crop is extracted) */}
      {(extractCrop(query) || extractLocation(query)) && (
        <div className="absolute -bottom-6 left-2 flex gap-2 animate-fade-in">
          {extractCrop(query) && (
            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              <Sprout className="w-3 h-3" /> {extractCrop(query)}
            </span>
          )}
          {extractLocation(query) && (
            <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              <MapPin className="w-3 h-3" /> {extractLocation(query)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
