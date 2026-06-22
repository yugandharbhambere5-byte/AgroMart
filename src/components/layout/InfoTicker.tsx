'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { TrendingUp, TrendingDown, Sun, CloudRain, AlertTriangle } from 'lucide-react';

export default function InfoTicker() {
  const { language } = useTranslation();

  // Localized data for Market Rates
  const marketRates = {
    en: [
      { name: 'Gram (Chana)', price: '5,120', change: '+1.3%', positive: true },
      { name: 'Sunflower', price: '5,680', change: '+0.5%', positive: true },
      { name: 'Chilli', price: '8,200', change: '-0.9%', positive: false },
      { name: 'Groundnut', price: '5,450', change: '+2.7%', positive: true },
      { name: 'Soybean', price: '4,850', change: '+2.1%', positive: true },
      { name: 'Wheat', price: '2,450', change: '+1.8%', positive: true },
      { name: 'Cotton', price: '8,690', change: '+2.4%', positive: true },
      { name: 'Tomato', price: '3,500', change: '+3.1%', positive: true },
      { name: 'Onion', price: '2,100', change: '-1.2%', positive: false },
    ],
    mr: [
      { name: 'हरभरा', price: '५,१२०', change: '+१.३%', positive: true },
      { name: 'सूर्यफूल', price: '५,६८०', change: '+०.५%', positive: true },
      { name: 'मिरची', price: '८,२००', change: '-०.९%', positive: false },
      { name: 'भुईमूग', price: '५,४५०', change: '+२.७%', positive: true },
      { name: 'सोयाबीन', price: '४,८५०', change: '+२.१%', positive: true },
      { name: 'गहू', price: '२,४५०', change: '+१.८%', positive: true },
      { name: 'कापूस', price: '८,६९०', change: '+२.४%', positive: true },
      { name: 'टोमॅटो', price: '३,५००', change: '+३.१%', positive: true },
      { name: 'कांदा', price: '२,१००', change: '-१.२%', positive: false },
    ],
    hi: [
      { name: 'चना', price: '५,१२०', change: '+१.३%', positive: true },
      { name: 'सूरजमुखी', price: '५,६८०', change: '+०.५%', positive: true },
      { name: 'मिर्च', price: '८,२००', change: '-०.९%', positive: false },
      { name: 'मूंगफली', price: '५,४५०', change: '+२.७%', positive: true },
      { name: 'सोयाबीन', price: '४,८५०', change: '+२.१%', positive: true },
      { name: 'गेहूं', price: '२,४५०', change: '+१.८%', positive: true },
      { name: 'कपास', price: '८,६९०', change: '+२.४%', positive: true },
      { name: 'टमाटर', price: '३,५००', change: '+३.१%', positive: true },
      { name: 'प्याज', price: '२,१००', change: '-१.२%', positive: false },
    ]
  };

  // Localized data for Weather Alerts
  const weatherAlerts = {
    en: [
      'Moderate to heavy rainfall expected. Keep farm drainage clear.',
      'Nagpur: Extreme heat alert. Keep livestock in shade and irrigate crops.',
      'Pune: Heavy rain expected in next 24 hours. Move harvested crops to safe storage.',
      'Nashik: Light to moderate rain, cover harvested produce immediately.',
      'Kolhapur: Flood warning. Farmers near riverbanks should stay alert.'
    ],
    mr: [
      'मध्यम ते मुसळधार पाऊस. शेतातून पाण्याचा निचरा योग्य ठेवा.',
      'नागपूर: तीव्र उष्णतेचा इशारा. जनावरांना सावलीत ठेवा व पिकांना पाणी द्या.',
      'पुणे: पुढील २४ तासांत मुसळधार पावसाची शक्यता. काढणी केलेले पीक सुरक्षित ठिकाणी ठेवा.',
      'नाशिक: हलका ते मध्यम पाऊस, काढणीनंतर माल सुरक्षित झाकून ठेवा.',
      'कोल्हापूर: अतिवृष्टीचा इशारा. नद्याकाठच्या शेतकऱ्यांनी खबरदारी बाळगावी.'
    ],
    hi: [
      'मध्यम से भारी बारिश की संभावना। खेतों से जल निकासी की उचित व्यवस्था रखें।',
      'नागपुर: भीषण गर्मी की चेतावनी। पशुओं को छाया में रखें और फसलों की सिंचाई करें।',
      'पुणे: अगले २४ घंटों में भारी बारिश की चेतावनी। कटी हुई फसलों को सुरक्षित रखें।',
      'नाशिक: हल्की से मध्यम बारिश, कटी हुई उपज को तुरंत ढककर सुरक्षित करें।',
      'कोल्हापुर: बाढ़ की चेतावनी। नदियों के किनारे रहने वाले किसान सतर्क रहें।'
    ]
  };

  const currentRates = marketRates[language] || marketRates.en;
  const currentAlerts = weatherAlerts[language] || weatherAlerts.en;

  const marketRatesLabel = language === 'mr' ? 'बाजारभाव' : language === 'hi' ? 'बाजार भाव' : 'Market Rates';
  const weatherLabel = language === 'mr' ? 'हवामान इशारा' : language === 'hi' ? 'हवामान चेतावनी' : 'Weather Alert';

  // Duplicate arrays to create continuous infinite scroll effect
  const duplicatedRates = [...currentRates, ...currentRates];
  const duplicatedAlerts = [...currentAlerts, ...currentAlerts];

  return (
    <div className="w-full flex flex-col select-none text-xs font-semibold">
      {/* 1. Market Rates Ticker (Green Theme) */}
      <div className="w-full flex items-center bg-[#0d2a13] border-b border-[#143e1d] h-9 overflow-hidden">
        {/* Left Badge */}
        <div className="z-10 flex items-center justify-center shrink-0 bg-[#2e7d32] text-white px-3 py-1.5 h-full font-black text-sm relative shadow-md">
          <span className="animate-pulse mr-1.5 w-2 h-2 rounded-full bg-emerald-300"></span>
          {marketRatesLabel}
        </div>

        {/* Scrolling Area */}
        <div className="relative flex-grow overflow-hidden flex items-center h-full">
          <div className="animate-marquee py-1.5 flex items-center gap-12 text-slate-100">
            {duplicatedRates.map((rate, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <span className="text-white/80 font-medium">{rate.name}</span>
                <span className="text-white font-extrabold">₹{rate.price}</span>
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                  rate.positive ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-rose-950 text-rose-400 border border-rose-500/20'
                }`}>
                  {rate.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {rate.change}
                </span>
                <span className="text-slate-500 mx-2">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Weather Alerts Ticker (Dark Red/Brown Theme) */}
      <div className="w-full flex items-center bg-[#210705] border-b border-[#350d0a] h-9 overflow-hidden">
        {/* Left Badge */}
        <div className="z-10 flex items-center justify-center shrink-0 bg-[#b71c1c] text-white px-3 py-1.5 h-full font-black text-sm relative shadow-md">
          <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-300 animate-bounce" />
          {weatherLabel}
        </div>

        {/* Scrolling Area */}
        <div className="relative flex-grow overflow-hidden flex items-center h-full">
          <div className="animate-marquee py-1.5 flex items-center gap-12 text-rose-100">
            {duplicatedAlerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                {alert.includes('heat') || alert.includes('उष्णतेचा') || alert.includes('गर्मी') ? (
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <CloudRain className="w-4 h-4 text-sky-400 shrink-0" />
                )}
                <span className="text-rose-100 font-medium text-xs">{alert}</span>
                <span className="text-[#3d1411] mx-2">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
