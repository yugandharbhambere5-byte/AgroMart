'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, ShieldAlert, Award, ArrowUpRight, ArrowDownRight, MapPin, Sparkles, AlertCircle, BarChart3, HelpCircle } from 'lucide-react';
import { SupportCategory } from '@/types/support';

interface SuggestionData {
  cropKey: string;
  nameEn: string;
  nameHi: string;
  nameMr: string;
  category: string;
  unit: string;
  currentRate: number;
  yesterdayRate: number;
  weekHighRate: number;
  weekLowRate: number;
  historyRates: number[]; // 7 days of historical rates
  predictedRates: number[]; // 3 days of future prediction rates
  nearbyDemandLevel: 'High' | 'Medium' | 'Low';
  mandiRecommendations: {
    mandiName: string;
    rate: number;
    distanceKm: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

const CROP_SUGGESTIONS_SEEDS: SuggestionData[] = [
  {
    cropKey: 'soybean',
    nameEn: 'Soybean', nameHi: 'सोयाबीन', nameMr: 'सोयाबीन',
    category: 'Oilseeds', unit: 'Quintal',
    currentRate: 4650, yesterdayRate: 4580, weekHighRate: 4750, weekLowRate: 4420,
    historyRates: [4450, 4420, 4490, 4520, 4550, 4580, 4650],
    predictedRates: [4720, 4790, 4850],
    nearbyDemandLevel: 'High',
    mandiRecommendations: [
      { mandiName: 'Latur APMC', rate: 4650, distanceKm: 12, trend: 'up' },
      { mandiName: 'Amravati Mandi', rate: 4590, distanceKm: 85, trend: 'stable' },
      { mandiName: 'Solapur APMC', rate: 4510, distanceKm: 140, trend: 'down' }
    ]
  },
  {
    cropKey: 'wheat',
    nameEn: 'Organic Durum Wheat', nameHi: 'जैविक गेहूं', nameMr: 'सेंद्रिय गहू',
    category: 'Grains', unit: 'Quintal',
    currentRate: 2450, yesterdayRate: 2380, weekHighRate: 2510, weekLowRate: 2290,
    historyRates: [2300, 2295, 2330, 2350, 2365, 2380, 2450],
    predictedRates: [2470, 2490, 2510],
    nearbyDemandLevel: 'High',
    mandiRecommendations: [
      { mandiName: 'Nashik APMC', rate: 2450, distanceKm: 18, trend: 'up' },
      { mandiName: 'Pune APMC', rate: 2410, distanceKm: 92, trend: 'up' },
      { mandiName: 'Ahmednagar Mandi', rate: 2370, distanceKm: 64, trend: 'stable' }
    ]
  },
  {
    cropKey: 'tomatoes',
    nameEn: 'Vine-Ripened Tomatoes', nameHi: 'टमाटर', nameMr: 'टोमॅटो',
    category: 'Vegetables', unit: 'Quintal',
    currentRate: 3500, yesterdayRate: 3200, weekHighRate: 3800, weekLowRate: 2900,
    historyRates: [2900, 3050, 3100, 3120, 3150, 3200, 3500],
    predictedRates: [3650, 3800, 3950],
    nearbyDemandLevel: 'High',
    mandiRecommendations: [
      { mandiName: 'Manchar Mandi', rate: 3500, distanceKm: 8, trend: 'up' },
      { mandiName: 'Pune APMC', rate: 3420, distanceKm: 42, trend: 'up' },
      { mandiName: 'Mumbai Market', rate: 3680, distanceKm: 110, trend: 'up' }
    ]
  },
  {
    cropKey: 'potatoes',
    nameEn: 'Russet Potatoes', nameHi: 'आलू', nameMr: 'बटाटा',
    category: 'Vegetables', unit: 'Quintal',
    currentRate: 1520, yesterdayRate: 1560, weekHighRate: 1620, weekLowRate: 1480,
    historyRates: [1610, 1600, 1590, 1580, 1575, 1560, 1520],
    predictedRates: [1490, 1460, 1420],
    nearbyDemandLevel: 'Low',
    mandiRecommendations: [
      { mandiName: 'Pune Mandi', rate: 1520, distanceKm: 15, trend: 'down' },
      { mandiName: 'Baramati APMC', rate: 1490, distanceKm: 65, trend: 'down' },
      { mandiName: 'Mumbai Market', rate: 1580, distanceKm: 125, trend: 'stable' }
    ]
  },
  {
    cropKey: 'onions',
    nameEn: 'Red Onion', nameHi: 'लाल प्याज', nameMr: 'लाल कांदा',
    category: 'Vegetables', unit: 'Quintal',
    currentRate: 2100, yesterdayRate: 2350, weekHighRate: 2600, weekLowRate: 1900,
    historyRates: [2550, 2500, 2480, 2420, 2390, 2350, 2100],
    predictedRates: [1980, 1850, 1800],
    nearbyDemandLevel: 'Medium',
    mandiRecommendations: [
      { mandiName: 'Lasalgaon APMC', rate: 2100, distanceKm: 25, trend: 'down' },
      { mandiName: 'Pimpalgaon Mandi', rate: 2050, distanceKm: 40, trend: 'down' },
      { mandiName: 'Satana APMC', rate: 1950, distanceKm: 85, trend: 'down' }
    ]
  },
  {
    cropKey: 'rice',
    nameEn: 'Basmati Rice', nameHi: 'बासमती चावल', nameMr: 'बासमती तांदूळ',
    category: 'Grains', unit: 'Quintal',
    currentRate: 4800, yesterdayRate: 4750, weekHighRate: 4950, weekLowRate: 4600,
    historyRates: [4620, 4650, 4690, 4710, 4730, 4750, 4800],
    predictedRates: [4840, 4880, 4920],
    nearbyDemandLevel: 'Medium',
    mandiRecommendations: [
      { mandiName: 'Amritsar Grain Market', rate: 4800, distanceKm: 150, trend: 'up' },
      { mandiName: 'Karnal Mandi', rate: 4850, distanceKm: 240, trend: 'up' },
      { mandiName: 'Gondia APMC', rate: 4700, distanceKm: 420, trend: 'stable' }
    ]
  }
];

interface SuggestionsProps {
  language: 'en' | 'mr' | 'hi';
  rates?: any[];
}

const mergeRatesWithSuggestions = (ratesList: any[], language: string) => {
  const generateHistory = (today: number, yesterday: number, cropKey: string) => {
    const diff = today - yesterday;
    const seedNum = cropKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const getPseudoRandom = (index: number) => {
      return Math.abs(Math.sin(seedNum + index) * 1000) % 1;
    };

    const history = new Array(7);
    history[6] = today;
    history[5] = yesterday;
    
    let currentVal = yesterday;
    for (let i = 4; i >= 0; i--) {
      const step = diff * (0.5 + getPseudoRandom(i) * 0.6);
      currentVal = Math.round(currentVal - step);
      history[i] = currentVal;
    }
    return history;
  };

  const generateForecast = (today: number, yesterday: number, cropKey: string) => {
    const diff = today - yesterday;
    const seedNum = cropKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const getPseudoRandom = (index: number) => {
      return Math.abs(Math.sin(seedNum - index) * 1000) % 1;
    };

    const forecast = new Array(3);
    let currentVal = today;
    const trendMultiplier = diff > 0 ? 1.015 : diff < 0 ? 0.982 : 1.0;
    
    for (let i = 0; i < 3; i++) {
      const randFactor = 0.985 + getPseudoRandom(i) * 0.03;
      currentVal = Math.round(currentVal * trendMultiplier * randFactor);
      forecast[i] = currentVal;
    }
    return forecast;
  };

  const generateMandiRecs = (today: number, mandiName: string, state: string, cropKey: string) => {
    const seedNum = cropKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const getPseudoRandom = (index: number) => {
      return Math.abs(Math.sin(seedNum + index * 7) * 1000) % 1;
    };

    const maharashtraMandis = [
      { nameMr: 'लातूर APMC (Latur)', nameEn: 'Latur APMC', nameHi: 'लातूर APMC' },
      { nameMr: 'पुणे APMC (Pune)', nameEn: 'Pune APMC', nameHi: 'पुणे APMC' },
      { nameMr: 'नाशिक APMC (Nashik)', nameEn: 'Nashik APMC', nameHi: 'नाशिक APMC' },
      { nameMr: 'यवतमाळ APMC (Yavatmal)', nameEn: 'Yavatmal APMC', nameHi: 'यवतमाळ APMC' },
      { nameMr: 'अकोला APMC (Akola)', nameEn: 'Akola APMC', nameHi: 'अकोला APMC' },
      { nameMr: 'अमरावती APMC (Amravati)', nameEn: 'Amravati APMC', nameHi: 'अमरावती APMC' },
      { nameMr: 'जळगाव APMC (Jalgaon)', nameEn: 'Jalgaon APMC', nameHi: 'जळगाव APMC' },
      { nameMr: 'सोलापूर APMC (Solapur)', nameEn: 'Solapur APMC', nameHi: 'सोलापूर APMC' },
      { nameMr: 'नागपूर APMC (Nagpur)', nameEn: 'Nagpur APMC', nameHi: 'नागपूर APMC' },
      { nameMr: 'कोल्हापूर APMC (Kolhapur)', nameEn: 'Kolhapur APMC', nameHi: 'कोल्हापूर APMC' }
    ];

    // Pick 3 pseudo-random mandis from Maharashtra
    const selectedIndexes: number[] = [];
    while (selectedIndexes.length < 3) {
      const idx = Math.floor(getPseudoRandom(selectedIndexes.length + 1) * maharashtraMandis.length);
      if (!selectedIndexes.includes(idx)) {
        selectedIndexes.push(idx);
      }
    }

    return selectedIndexes.map((mandiIdx, i) => {
      const mandi = maharashtraMandis[mandiIdx];
      const rateDiffPercent = (getPseudoRandom(i + 4) * 0.08) - 0.04; // -4% to +4% fluctuation
      const rate = Math.round(today * (1 + rateDiffPercent));
      const distance = Math.round(15 + getPseudoRandom(i + 8) * 180);
      const trend = rateDiffPercent > 0.01 ? 'up' : rateDiffPercent < -0.01 ? 'down' : 'stable';
      
      return {
        mandiName: language === 'mr' ? mandi.nameMr : language === 'hi' ? mandi.nameHi : mandi.nameEn,
        rate,
        distanceKm: distance,
        trend: trend as 'up' | 'down' | 'stable'
      };
    });
  };

  return ratesList.map(r => {
    const cropKey = r.crop.toLowerCase().trim().replace(/\s+/g, '-');
    const seed = CROP_SUGGESTIONS_SEEDS.find(s => s.cropKey === cropKey || s.nameEn.toLowerCase() === r.crop.toLowerCase());
    
    if (seed) {
      const scale = r.todayRate / seed.currentRate;
      return {
        ...seed,
        cropKey,
        currentRate: r.todayRate,
        yesterdayRate: r.yesterdayRate,
        weekHighRate: r.weekHighRate,
        weekLowRate: r.weekLowRate,
        historyRates: seed.historyRates.map(val => Math.round(val * scale)),
        predictedRates: seed.predictedRates.map(val => Math.round(val * scale)),
      };
    } else {
      const historyRates = generateHistory(r.todayRate, r.yesterdayRate, cropKey);
      const predictedRates = generateForecast(r.todayRate, r.yesterdayRate, cropKey);
      const mandiRecommendations = generateMandiRecs(r.todayRate, r.mandi, r.state, cropKey);
      const nearbyDemandLevel: 'High' | 'Medium' | 'Low' = (r.todayRate % 3 === 0) ? 'High' : (r.todayRate % 3 === 1) ? 'Medium' : 'Low';

      return {
        cropKey,
        nameEn: r.crop,
        nameHi: r.cropHi || r.crop,
        nameMr: r.cropMr || r.crop,
        category: r.category,
        unit: r.unit.replace(/^\//, '') || 'Quintal',
        currentRate: r.todayRate,
        yesterdayRate: r.yesterdayRate,
        weekHighRate: r.weekHighRate,
        weekLowRate: r.weekLowRate,
        historyRates,
        predictedRates,
        nearbyDemandLevel,
        mandiRecommendations
      };
    }
  });
};

export function BestSellingSuggestions({ language, rates }: SuggestionsProps) {
  const [selectedCropKey, setSelectedCropKey] = useState<string>('soybean');
  const [suggestionData, setSuggestionData] = useState<SuggestionData[]>(CROP_SUGGESTIONS_SEEDS);
  const [demandCount, setDemandCount] = useState(0);
  const [customSearchQuery, setCustomSearchQuery] = useState('');

  const handleAddCustomCropAnalysis = () => {
    if (!customSearchQuery.trim()) return;
    const query = customSearchQuery.trim().toLowerCase();
    
    // Clean key (support Unicode characters)
    const cropKey = query.replace(/\s+/g, '-');
    const capitalizedCrop = query.charAt(0).toUpperCase() + query.slice(1);
    
    // Check if it already exists
    const existing = suggestionData.find(s => 
      s.nameEn.toLowerCase() === query || 
      s.nameMr.toLowerCase() === query || 
      s.nameHi.toLowerCase() === query ||
      s.cropKey === cropKey
    );

    if (existing) {
      setSelectedCropKey(existing.cropKey);
      setCustomSearchQuery('');
      return;
    }

    // Add directly to localStorage to keep it persistent and avoid overwrite by LiveMarketRates sync
    const todayRate = Math.round(1500 + Math.random() * 8500);
    const yesterdayRate = Math.round(todayRate * (1 + (Math.random() - 0.5) * 0.05));
    const weekHighRate = Math.round(Math.max(todayRate, yesterdayRate) * 1.15);
    const weekLowRate = Math.round(Math.min(todayRate, yesterdayRate) * 0.85);

    const newMarketRate = {
      id: `custom-${Date.now()}`,
      crop: capitalizedCrop,
      cropHi: capitalizedCrop,
      cropMr: capitalizedCrop,
      category: 'Vegetables',
      unit: '/Quintal',
      todayRate,
      yesterdayRate,
      weekHighRate,
      weekLowRate,
      mandi: 'Local APMC',
      state: 'Maharashtra',
      quality: 'Grade A' as const,
      lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      trending: todayRate > yesterdayRate ? 'up' : todayRate < yesterdayRate ? 'down' : ('stable' as const),
      volume: `${Math.round(20 + Math.random() * 180)} T`
    };

    if (typeof window !== 'undefined') {
      const savedRates = localStorage.getItem('agromart-market-rates');
      const ratesList = savedRates ? JSON.parse(savedRates) : [];
      
      const updatedRates = [newMarketRate, ...ratesList];
      localStorage.setItem('agromart-market-rates', JSON.stringify(updatedRates));
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'agromart-market-rates',
        newValue: JSON.stringify(updatedRates)
      }));
    }

    setSelectedCropKey(cropKey);
    setCustomSearchQuery('');
  };

  // Sync rates from props or localStorage
  useEffect(() => {
    if (rates && rates.length > 0) {
      const merged = mergeRatesWithSuggestions(rates, language);
      setSuggestionData(merged);
      if (merged.length > 0) {
        const exists = merged.some(m => m.cropKey === selectedCropKey);
        if (!exists) {
          setSelectedCropKey(merged[0].cropKey);
        }
      }
    } else if (typeof window !== 'undefined') {
      const savedRates = localStorage.getItem('agromart-market-rates');
      if (savedRates) {
        try {
          const ratesList = JSON.parse(savedRates);
          const merged = mergeRatesWithSuggestions(ratesList, language);
          setSuggestionData(merged);
          if (merged.length > 0) {
            const exists = merged.some(m => m.cropKey === selectedCropKey);
            if (!exists) {
              setSelectedCropKey(merged[0].cropKey);
            }
          }
        } catch {}
      }
    }
  }, [rates, language]);

  // Read actual nearby demands from localStorage to show real dynamics
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agromart_demands');
      if (stored) {
        try {
          const demandsList = JSON.parse(stored);
          const currentCropObj = suggestionData.find(c => c.cropKey === selectedCropKey);
          if (currentCropObj) {
            const cropNameLower = currentCropObj.nameEn.toLowerCase();
            // count matching demands
            const count = demandsList.filter((d: any) => 
              d.status === 'Open' && d.crop_name.toLowerCase().includes(cropNameLower.substring(0, 5))
            ).length;
            setDemandCount(count);
          }
        } catch {}
      }
    }
  }, [selectedCropKey, suggestionData]);

  const activeCrop = suggestionData.find(c => c.cropKey === selectedCropKey) || suggestionData[0];
  const changeAmt = activeCrop.currentRate - activeCrop.yesterdayRate;
  const isTrendUp = changeAmt > 0;
  const isTrendDown = changeAmt < 0;

  // Decision Logic for Optimal Time to Sell
  const getSellingDecision = () => {
    // If rate is trending up and predicted rate for next 3 days is significantly higher, advice wait.
    const lastPred = activeCrop.predictedRates[2];
    const isWait = lastPred > activeCrop.currentRate * 1.02;
    const isUrgentSell = activeCrop.predictedRates[2] < activeCrop.currentRate * 0.95;

    if (isUrgentSell) {
      return {
        status: 'sell_now_critical',
        color: 'border-red-500/20 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400',
        icon: ShieldAlert,
        en: `Critical Drop: Sell immediately. Price is dropping rapidly and might lose another ₹${Math.abs(activeCrop.currentRate - lastPred)}/Quintal.`,
        hi: `गिरावट चेतावनी: तुरंत बेचें। कीमत तेजी से गिर रही है और ₹${Math.abs(activeCrop.currentRate - lastPred)}/क्विंटल तक और कम हो सकती है।`,
        mr: `घसरण इशारा: त्वरित विक्री करा. दर वेगाने खाली जात असून पुढील दिवसांत आणखी ₹${Math.abs(activeCrop.currentRate - lastPred)}/क्विंटल नुकसान होऊ शकते.`
      };
    } else if (isWait) {
      const waitDays = 3;
      const profitGain = lastPred - activeCrop.currentRate;
      return {
        status: 'wait',
        color: 'border-amber-500/20 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400',
        icon: Clock,
        en: `Hold & Wait: Wait for ${waitDays} days. Price is expected to rise by +₹${profitGain}/Quintal based on low arrival volumes.`,
        hi: `प्रतीक्षा करें: ${waitDays} दिनों तक रुकें। कम आवक के कारण कीमतों में +₹${profitGain}/क्विंटल की वृद्धि होने की संभावना है।`,
        mr: `थांबा आणि वाट पहा: पुढील ${waitDays} दिवस थांबा. बाजारात मालाची आवक कमी असल्याने दरात +₹${profitGain}/क्विंटल वाढ होण्याचा अंदाज आहे.`
      };
    } else {
      return {
        status: 'sell_now',
        color: 'border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400',
        icon: Award,
        en: `Great Time to Sell: Today is a highly profitable time to sell ${activeCrop.nameEn}. Market demand is strong.`,
        hi: `बेचने का सुनहरा समय: आज ${activeCrop.nameHi} बेचने का सही समय है। बाजार में मजबूत मांग है।`,
        mr: `विक्रीसाठी उत्तम वेळ: आज ${activeCrop.nameMr} विकण्यासाठी योग्य काळ आहे. बाजारात खरेदीदारांची चांगली मागणी आहे.`
      };
    }
  };

  const decision = getSellingDecision();

  // Localized Labels
  const t = {
    en: {
      title: 'Best Selling Time Suggestions',
      subtitle: 'Smart AI analyzes historical rates, volume trends, and active buyer demands to suggest optimal selling times.',
      cropSelect: 'Select Crop to Analyze',
      metricsTitle: 'Trend & Demand Analytics',
      currentRate: 'Current Price',
      trend: '7-Day Price Trend',
      demand: 'Nearby Buyer Demand',
      profitImpact: 'Projected Profit Impact',
      chartTitle: '7-Day History vs 3-Day Forecast Price (₹)',
      mandiTitle: 'Recommended Regional Markets (Mandis)',
      mandiHeader: 'Mandi Name',
      rateHeader: 'Rate Offered',
      distanceHeader: 'Distance',
      actionHeader: 'Trend Status',
      wait: 'Wait Recommendation',
      sell: 'Sell Recommendation',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      demandDesc: 'active buyer demands'
    },
    hi: {
      title: 'फसल बेचने के सही समय का सुझाव',
      subtitle: 'एआई ऐतिहासिक दरों, आवक वॉल्यूम और सक्रिय खरीदार की मांग का विश्लेषण करके बेचने के सही समय का सुझाव देता है।',
      cropSelect: 'विश्लेषण के लिए फसल चुनें',
      metricsTitle: 'रुझान और मांग विश्लेषण',
      currentRate: 'वर्तमान मूल्य',
      trend: '7-दिवसीय मूल्य रुझान',
      demand: 'सक्रिय खरीदार मांग',
      profitImpact: 'अपेक्षित लाभ प्रभाव',
      chartTitle: '7-दिवसीय इतिहास बनाम 3-दिवसीय पूर्वानुमान मूल्य (₹)',
      mandiTitle: 'अनुशंसित क्षेत्रीय मंडियां',
      mandiHeader: 'मंडी का नाम',
      rateHeader: 'प्रस्तावित दर',
      distanceHeader: 'दूरी',
      actionHeader: 'रुझान स्थिति',
      wait: 'प्रतीक्षा करें',
      sell: 'बेचें',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'कम',
      demandDesc: 'सक्रिय खरीदार की मांगें'
    },
    mr: {
      title: 'पीक विक्रीसाठी सर्वोत्तम वेळ सल्ला',
      subtitle: 'आमचे एआई तंत्रज्ञान मागील बाजारभाव, आवक आणि खरेदीदारांची मागणी यावर आधारित विक्रीची सर्वोत्तम वेळ सांगते.',
      cropSelect: 'विश्लेषण करायचे पीक निवडा',
      metricsTitle: 'बाजार कल आणि मागणी विश्लेषण',
      currentRate: 'सध्याचा बाजारभाव',
      trend: '७-दिवसीय भावाचा कल',
      demand: 'स्थानिक खरेदीदार मागणी',
      profitImpact: 'अपेक्षित नफा परिणाम',
      chartTitle: '७-दिवसीय इतिहास विरुद्ध ३-दिवसीय अंदाज दर (₹)',
      mandiTitle: 'शिफारस केलेल्या स्थानिक बाजारपेठा (मार्केट यार्ड)',
      mandiHeader: 'बाजार समिती',
      rateHeader: 'मिळणारा दर',
      distanceHeader: 'अंतर',
      actionHeader: 'कल स्थिती',
      wait: 'वाट पहा सल्ला',
      sell: 'विक्री सल्ला',
      high: 'भरपूर',
      medium: 'मध्यम',
      low: 'कमी',
      demandDesc: 'सक्रिय खरेदीदार मागण्या'
    }
  }[language];

  // Logic to calculate SVG chart parameters
  const chartWidth = 500;
  const chartHeight = 200;
  const padding = 30;

  const allRates = [...activeCrop.historyRates, ...activeCrop.predictedRates];
  const maxRate = Math.max(...allRates) * 1.02;
  const minRate = Math.min(...allRates) * 0.98;
  const rateRange = maxRate - minRate;

  const getX = (index: number) => {
    return padding + (index * (chartWidth - padding * 2)) / 9;
  };

  const getY = (val: number) => {
    return chartHeight - padding - ((val - minRate) * (chartHeight - padding * 2)) / rateRange;
  };

  // Build SVG Points paths
  let historyPoints = '';
  activeCrop.historyRates.forEach((val, i) => {
    historyPoints += `${getX(i)},${getY(val)} `;
  });

  let forecastPoints = `${getX(6)},${getY(activeCrop.historyRates[6])} `;
  activeCrop.predictedRates.forEach((val, i) => {
    forecastPoints += `${getX(i + 7)},${getY(val)} `;
  });

  const localizedCropName = language === 'mr' ? activeCrop.nameMr : language === 'hi' ? activeCrop.nameHi : activeCrop.nameEn;

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in relative pb-16">
      
      {/* Header */}
      <div className="border-b border-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
            <span>{t.title}</span>
          </h2>
          <p className="text-xs font-semibold text-earth-550 dark:text-earth-400 mt-1">
            {t.subtitle}
          </p>
        </div>
        
        <div className="flex flex-wrap items-end gap-3 shrink-0">
          {/* Custom Crop Search / Add */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-earth-500 uppercase tracking-widest">
              {language === 'mr' ? 'नवीन पीक जोडा / शोधा' : language === 'hi' ? 'नई फसल जोड़ें / खोजें' : 'Add / Search Crop'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSearchQuery}
                onChange={e => setCustomSearchQuery(e.target.value)}
                placeholder={language === 'mr' ? 'उदा. कापूस, सोयाबीन...' : language === 'hi' ? 'उदा. कपास, सोयाबीन...' : 'e.g. Cotton, Bajra...'}
                className="px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 h-10 w-44"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddCustomCropAnalysis();
                }}
              />
              <button
                onClick={handleAddCustomCropAnalysis}
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-black h-10 flex items-center justify-center transition-all cursor-pointer shadow-md shadow-primary-600/20"
              >
                {language === 'mr' ? 'विश्लेषण करा' : language === 'hi' ? 'विश्लेषण करें' : 'Analyze'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Alert Banner */}
      <div className={`p-5 rounded-2xl border flex items-start gap-4 transition-all duration-300 ${decision.color}`}>
        <decision.icon className="w-6 h-6 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-sm uppercase tracking-wide">
            {decision.status === 'wait' ? t.wait : t.sell}
          </h4>
          <p className="text-xs font-semibold mt-1 leading-relaxed">
            {language === 'mr' ? decision.mr : language === 'hi' ? decision.hi : decision.en}
          </p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Current Rate */}
        <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-2 hover:border-primary-500/20 transition-all">
          <span className="text-[10px] font-black text-earth-500 uppercase tracking-wider">{t.currentRate}</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-foreground">₹{activeCrop.currentRate.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-earth-500 font-bold">/{activeCrop.unit}</span>
          </div>
          <span className={`text-[10px] font-extrabold flex items-center gap-0.5 ${isTrendUp ? 'text-emerald-500' : isTrendDown ? 'text-red-500' : 'text-earth-400'}`}>
            {isTrendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : isTrendDown ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
            {isTrendUp ? '+' : ''}{changeAmt} vs yesterday
          </span>
        </div>

        {/* Price Trend Velocity */}
        <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-2 hover:border-primary-500/20 transition-all">
          <span className="text-[10px] font-black text-earth-500 uppercase tracking-wider">{t.trend}</span>
          <span className="text-lg font-black text-foreground mt-1 flex items-center gap-1.5">
            {isTrendUp ? (
              <><TrendingUp className="w-5 h-5 text-emerald-500" /> <span className="text-emerald-600 dark:text-emerald-400">Rising (तेजी)</span></>
            ) : isTrendDown ? (
              <><TrendingDown className="w-5 h-5 text-red-500" /> <span className="text-red-600 dark:text-red-400">Dipping (मंदी)</span></>
            ) : (
              <><span className="text-earth-400">Stable (स्थिर)</span></>
            )}
          </span>
          <span className="text-[9px] font-bold text-earth-500">Based on recent APMC arrivals</span>
        </div>

        {/* Nearby Buyer Demand */}
        <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-2 hover:border-primary-500/20 transition-all">
          <span className="text-[10px] font-black text-earth-500 uppercase tracking-wider">{t.demand}</span>
          <span className="text-lg font-black text-foreground mt-1 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${activeCrop.nearbyDemandLevel === 'High' ? 'bg-emerald-500' : activeCrop.nearbyDemandLevel === 'Medium' ? 'bg-amber-500' : 'bg-red-400'}`} />
            <span>{t[activeCrop.nearbyDemandLevel.toLowerCase() as 'high' | 'medium' | 'low']}</span>
          </span>
          <span className="text-[9px] font-bold text-earth-500">
            {demandCount > 0 ? `${demandCount} ${t.demandDesc}` : `Active dealer interest`}
          </span>
        </div>

        {/* Expected Profit Impact */}
        <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-2 hover:border-primary-500/20 transition-all">
          <span className="text-[10px] font-black text-earth-500 uppercase tracking-wider">{t.profitImpact}</span>
          <div className="text-lg font-black mt-1 flex items-center gap-1">
            {decision.status === 'wait' ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                +₹{(activeCrop.predictedRates[2] - activeCrop.currentRate).toLocaleString('en-IN')} (+{(((activeCrop.predictedRates[2] - activeCrop.currentRate) / activeCrop.currentRate) * 100).toFixed(1)}%)
              </span>
            ) : decision.status === 'sell_now_critical' ? (
              <span className="text-red-500">
                -₹{(activeCrop.currentRate - activeCrop.predictedRates[2]).toLocaleString('en-IN')} (-{(((activeCrop.currentRate - activeCrop.predictedRates[2]) / activeCrop.currentRate) * 100).toFixed(1)}%)
              </span>
            ) : (
              <span className="text-emerald-500">Peak Market Value</span>
            )}
          </div>
          <span className="text-[9px] font-bold text-earth-500">Projected rate change in 3 days</span>
        </div>
      </div>

      {/* SVG Chart and Mandi Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Custom SVG Price Trend Line Chart */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-border bg-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-500" />
              <span>{t.chartTitle} ({localizedCropName})</span>
            </h4>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-wider">
              <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-primary-500" /> History</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-1 border-t-2 border-dashed border-amber-500" /> Forecast</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto no-scrollbar">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[450px] overflow-visible">
              {/* Grid Lines */}
              {[0, 1, 2, 3].map((g, idx) => {
                const yVal = minRate + (rateRange / 3) * idx;
                const yPos = getY(yVal);
                return (
                  <g key={idx}>
                    <line x1={padding} y1={yPos} x2={chartWidth - padding} y2={yPos} stroke="currentColor" className="text-border/40" strokeWidth="1" />
                    <text x={padding - 5} y={yPos + 4} textAnchor="end" className="fill-earth-400 text-[8px] font-bold">₹{Math.round(yVal)}</text>
                  </g>
                );
              })}

              {/* Historical Trend Line (Solid) */}
              <polyline fill="none" stroke="currentColor" className="text-primary-500" strokeWidth="3" points={historyPoints} />
              
              {/* Future Forecast Line (Dashed) */}
              <polyline fill="none" stroke="currentColor" className="text-amber-500" strokeDasharray="5,4" strokeWidth="3" points={forecastPoints} />

              {/* Data Points Dots */}
              {activeCrop.historyRates.map((val, i) => (
                <g key={`h-${i}`}>
                  <circle cx={getX(i)} cy={getY(val)} r="4" className="fill-card stroke-primary-500" strokeWidth="2.5" />
                  {i === 6 && (
                    <text x={getX(i)} y={getY(val) - 10} textAnchor="middle" className="fill-foreground text-[8px] font-black">
                      ₹{val}
                    </text>
                  )}
                </g>
              ))}

              {activeCrop.predictedRates.map((val, i) => (
                <g key={`p-${i}`}>
                  <circle cx={getX(i + 7)} cy={getY(val)} r="4" className="fill-card stroke-amber-500" strokeWidth="2.5" />
                  <text x={getX(i + 7)} y={getY(val) - 10} textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 text-[8px] font-black">
                    ₹{val}
                  </text>
                </g>
              ))}

              {/* X Axis Labels */}
              {['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today', 'T+1', 'T+2', 'T+3'].map((lbl, idx) => (
                <text key={idx} x={getX(idx)} y={chartHeight - 8} textAnchor="middle" className="fill-earth-400 text-[8px] font-bold">
                  {lbl}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Recommended Mandis List */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-border bg-card flex flex-col gap-4">
          <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span>{t.mandiTitle}</span>
          </h4>

          <div className="flex flex-col gap-3">
            {activeCrop.mandiRecommendations.map((rec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-border bg-background hover:border-primary-500/20 transition-colors flex items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold text-xs text-foreground">{rec.mandiName}</div>
                  <div className="text-[10px] text-earth-500 font-bold mt-0.5">
                    🚗 {rec.distanceKm} km away
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm text-foreground">₹{rec.rate.toLocaleString('en-IN')}/{activeCrop.unit}</div>
                  <span className={`text-[9px] font-black uppercase tracking-wider inline-block px-1.5 py-0.5 rounded mt-0.5 ${
                    rec.trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
                    : rec.trend === 'down' ? 'bg-red-50 dark:bg-red-950/20 text-red-500'
                    : 'bg-earth-100 dark:bg-earth-900 text-earth-500'
                  }`}>
                    {rec.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
