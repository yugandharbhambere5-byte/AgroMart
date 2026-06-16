'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, Clock, ShieldAlert, Award, ArrowUpRight, 
  ArrowDownRight, MapPin, Sparkles, AlertCircle, BarChart3, HelpCircle, 
  Search, Sprout, ShoppingCart, User, UploadCloud, CheckCircle, 
  RefreshCw, ChevronRight, Eye, ShieldCheck, ArrowRight, Play
} from 'lucide-react';
import { SmartSearch } from '../search/SmartSearch';

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
  historyRates: number[];
  predictedRates: number[];
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
      { mandiName: 'Mumbai Grain Market', rate: 4800, distanceKm: 120, trend: 'up' },
      { mandiName: 'Pune APMC', rate: 4750, distanceKm: 45, trend: 'stable' },
      { mandiName: 'Kolhapur Mandi', rate: 4720, distanceKm: 220, trend: 'stable' }
    ]
  }
];

const mockNearbyBuyers = [
  { name: 'Balaji Agro Traders', crop: 'Soybean', location: 'Latur (8km)', rate: 4680, trust: 96 },
  { name: 'Kisan Mitra Foods', crop: 'Tomato', location: 'Manchar (4km)', rate: 3550, trust: 92 },
  { name: 'Sahyadri Organic Exporters', crop: 'Wheat', location: 'Nashik (12km)', rate: 2500, trust: 98 },
  { name: 'Shivaji Wholesale Mandi', crop: 'Onion', location: 'Lasalgaon (15km)', rate: 2150, trust: 90 },
  { name: 'Vighnaharta Processors', crop: 'Potato', location: 'Pune (10km)', rate: 1540, trust: 88 }
];

interface AIInsightsDashboardProps {
  language: 'en' | 'mr' | 'hi';
  rates?: any[];
}

export function AIInsightsDashboard({ language, rates }: AIInsightsDashboardProps) {
  const [selectedCropKey, setSelectedCropKey] = useState<string>('soybean');
  const [suggestionData, setSuggestionData] = useState<SuggestionData[]>(CROP_SUGGESTIONS_SEEDS);
  
  // Crop Scanner Simulation States
  const [scannerFile, setScannerFile] = useState<File | null>(null);
  const [scannerImageSrc, setScannerImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<{
    crop: string;
    health: string;
    issue: string;
    grade: string;
    confidence: number;
    recommendedActions: string[];
    suggestedRate: number;
  } | null>(null);

  // Sync / calculate mock historical data
  useEffect(() => {
    if (rates && rates.length > 0) {
      // Merge with custom inputs or database rates if available
      // For simplicity, we fallback to our rich SEEDS if match is not found
    }
  }, [rates]);

  const activeCrop = suggestionData.find(c => c.cropKey === selectedCropKey) || suggestionData[0];
  const changeAmt = activeCrop.currentRate - activeCrop.yesterdayRate;
  const isTrendUp = changeAmt > 0;
  const isTrendDown = changeAmt < 0;
  const percentChange = ((changeAmt / activeCrop.yesterdayRate) * 100).toFixed(1);

  // Selling Decision Logic
  const getSellingDecision = () => {
    const lastPred = activeCrop.predictedRates[2];
    const isWait = lastPred > activeCrop.currentRate * 1.02;
    const isUrgentSell = lastPred < activeCrop.currentRate * 0.95;

    if (isUrgentSell) {
      return {
        status: 'sell_now_critical',
        label: { en: 'URGENT SELL', mr: 'त्वरित विक्री करा', hi: 'तुरंत बेचें' },
        colorClass: 'border-red-500/20 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400',
        icon: ShieldAlert,
        confidence: 91,
        desc: {
          en: `Critical Price Warning: Crop availability is rising nearby, and prices are expected to drop. Sell now to avoid losing up to ₹${Math.abs(activeCrop.currentRate - lastPred)}/Quintal.`,
          hi: `कीमत चेतावनी: फसल की आवक बढ़ रही है और कीमतों में गिरावट की संभावना है। ₹${Math.abs(activeCrop.currentRate - lastPred)}/क्विंटल की हानि से बचने के लिए अभी बेचें।`,
          mr: `दर घसरण इशारा: बाजारात पिकाची आवक वाढत असून भाव कमी होण्याची शक्यता आहे. प्रति क्विंटल ₹${Math.abs(activeCrop.currentRate - lastPred)} पर्यंतचे नुकसान टाळण्यासाठी आत्ताच विक्री करा.`
        }
      };
    } else if (isWait) {
      const profitGain = lastPred - activeCrop.currentRate;
      return {
        status: 'wait',
        label: { en: 'HOLD & WAIT', mr: 'थांबा आणि वाट पहा', hi: 'प्रतीक्षा करें' },
        colorClass: 'border-amber-500/20 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400',
        icon: Clock,
        confidence: 87,
        desc: {
          en: `Wait for 2-3 Days: Nearby demand is High and local arrivals are low. Holding your harvest is expected to yield an extra +₹${profitGain}/Quintal (+${((profitGain/activeCrop.currentRate)*100).toFixed(1)}%).`,
          hi: `२-३ दिन रुकें: आसपास की मांग उच्च है और आवक कम है। अपनी फसल रोक कर रखने से आपको +₹${profitGain}/क्विंटल का अतिरिक्त लाभ मिल सकता है।`,
          mr: `२ ते ३ दिवस वाट पहा: स्थानिक बाजारात खरेदीदारांची मागणी जास्त असून मालाची आवक कमी आहे. पीक साठवून ठेवल्यास आपल्याला +₹${profitGain}/क्विंटल वाढीव नफा मिळू शकतो.`
        }
      };
    } else {
      return {
        status: 'sell_now',
        label: { en: 'IDEAL TIME TO SELL', mr: 'विक्रीसाठी उत्तम वेळ', hi: 'बेचने का सही समय' },
        colorClass: 'border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400',
        icon: Award,
        confidence: 94,
        desc: {
          en: `Today is a highly profitable time to sell ${activeCrop.nameEn}. Market rates are stable at peak level with strong nearby buyers.`,
          hi: `आज ${activeCrop.nameHi} बेचने का सर्वोत्तम समय है। दरें मजबूत हैं और पास में सक्रिय खरीदार उपलब्ध हैं।`,
          mr: `आज ${activeCrop.nameMr} विकण्यासाठी सर्वोत्तम काळ आहे. बाजारातील दर उच्च पातळीवर स्थिरावले असून स्थानिक खरेदीदारांकडून मोठी मागणी आहे.`
        }
      };
    }
  };

  const decision = getSellingDecision();

  // Localized UI Texts
  const t = {
    en: {
      title: 'AI Market Insights & Assistant',
      subtitle: 'Smart rule-based analytics to optimize your selling strategy, track local demand, and check harvest quality.',
      tabTrends: 'Market Rate Analysis',
      tabScanner: 'AI Crop Quality Scanner',
      searchLabel: 'Analyze a Specific Crop',
      sellingTimeTitle: 'Best Selling Time Recommendation',
      aiConfidence: 'AI Confidence',
      trendTitle: 'Price Trend & Velocity',
      weeklyRates: 'Weekly Extreme Rates',
      highest: 'Highest Nearby',
      lowest: 'Lowest Nearby',
      nearbyBuyers: 'Suggested Nearby Buyers',
      nearbyMarkets: 'Suggested Nearby Markets',
      highDemandCrops: 'Trending High-Demand Crops',
      scannerTitle: 'Simulated AI Crop Scanner',
      scannerDesc: 'Upload a picture of your harvest to scan quality grading, health defects, and estimate fair market price.',
      dragDrop: 'Drag and drop an image of your crop, or click to browse files',
      scanningText: 'AI is analyzing crop parameters...',
      scanComplete: 'Scanner Diagnostics Complete',
      scanAgain: 'Scan Another Image',
      diagnostics: 'Diagnostics Report',
      directList: 'List this Harvest Now',
      confidenceScore: 'Confidence',
      cropHealth: 'Crop Health',
      qualityGrade: 'Quality Grade',
      suggestedPrice: 'Est. Market Value',
      recommendedActions: 'Recommended Actions'
    },
    hi: {
      title: 'एआई मार्केट इनसाइट्स और असिस्टेंट',
      subtitle: 'अपनी बिक्री रणनीति को अनुकूलित करने, स्थानीय मांग को ट्रैक करने और फसल की गुणवत्ता की जांच करने के लिए एआई विश्लेषण।',
      tabTrends: 'बाजार भाव विश्लेषण',
      tabScanner: 'एआई फसल गुणवत्ता स्कैनर',
      searchLabel: 'विशेष फसल का विश्लेषण करें',
      sellingTimeTitle: 'फसल बेचने के सही समय का सुझाव',
      aiConfidence: 'एआई विश्वसनीयता',
      trendTitle: 'मूल्य रुझान और वेग',
      weeklyRates: 'साप्ताहिक चरम दरें',
      highest: 'आसपास सबसे अधिक',
      lowest: 'आसपास सबसे कम',
      nearbyBuyers: 'सुझाए गए खरीदार',
      nearbyMarkets: 'सुझाए गए बाजार (मंडियां)',
      highDemandCrops: 'उच्च मांग वाली फसलें',
      scannerTitle: 'एआई फसल गुणवत्ता स्कैनर',
      scannerDesc: 'गुणवत्ता ग्रेडिंग, स्वास्थ्य कमियों की जांच और उचित बाजार मूल्य का अनुमान लगाने के लिए अपनी फसल की तस्वीर अपलोड करें।',
      dragDrop: 'फसल की छवि खींचें और छोड़ें, या फाइल ब्राउज़ करने के लिए क्लिक करें',
      scanningText: 'एआई फसल मापदंडों का विश्लेषण कर रहा है...',
      scanComplete: 'स्कैनर निदान पूरा हुआ',
      scanAgain: 'दूसरी छवि स्कैन करें',
      diagnostics: 'निदान रिपोर्ट',
      directList: 'इस फसल को अभी सूचीबद्ध करें',
      confidenceScore: 'सटीकता',
      cropHealth: 'फसल का स्वास्थ्य',
      qualityGrade: 'गुणवत्ता ग्रेड',
      suggestedPrice: 'अनुमानित मूल्य',
      recommendedActions: 'सुझाए गए उपाय'
    },
    mr: {
      title: 'एआय बाजार सल्ला आणि साहाय्यक',
      subtitle: 'तुमच्या पीक विक्रीचे नियोजन करण्यासाठी, स्थानिक मागणी ट्रॅक करण्यासाठी आणि पिकाचा दर्जा तपासण्यासाठी एआय विश्लेषण.',
      tabTrends: 'बाजार भाव कल विश्लेषण',
      tabScanner: 'एआय पीक गुणवत्ता स्कॅनर (AI Scanner)',
      searchLabel: 'विशिष्ट पिकाचे विश्लेषण करा',
      sellingTimeTitle: 'पीक विक्रीसाठी सर्वोत्तम वेळ सल्ला',
      aiConfidence: 'एआय विश्वासार्हता',
      trendTitle: 'बाजार कल आणि गती',
      weeklyRates: 'साप्ताहिक कमाल / किमान दर',
      highest: 'सर्वोच्च स्थानिक दर',
      lowest: 'किमान स्थानिक दर',
      nearbyBuyers: 'स्थानिक खरेदीदार शिफारस',
      nearbyMarkets: 'शिफारस केलेल्या स्थानिक बाजारपेठा',
      highDemandCrops: 'भरपूर मागणी असलेली पिके',
      scannerTitle: 'एआय पीक गुणवत्ता स्कॅनर (AI Scanner)',
      scannerDesc: 'पिकाचा दर्जा, रोग किंवा कमतरता ओळखण्यासाठी आणि योग्य बाजारभाव मिळवण्यासाठी तुमच्या शेतमालाचा फोटो अपलोड करा.',
      dragDrop: 'पिकाचा फोटो येथे ड्रॅग आणि ड्रॉप करा, किंवा फाईल निवडण्यासाठी क्लिक करा',
      scanningText: 'एआय तंत्रज्ञान पिकाच्या दर्जाचे विश्लेषण करत आहे...',
      scanComplete: 'स्कॅनर तपासणी यशस्वी',
      scanAgain: 'नवीन फोटो स्कॅन करा',
      diagnostics: 'तपासणी अहवाल',
      directList: 'हा माल थेट विक्रीसाठी जोडा',
      confidenceScore: 'अचूकता',
      cropHealth: 'पीक आरोग्य स्थिती',
      qualityGrade: 'गुणवत्ता श्रेणी (Grade)',
      suggestedPrice: 'अंदाजित बाजार मूल्य',
      recommendedActions: 'करायाच्या उपाययोजना'
    }
  }[language];

  // Handler for custom search
  const handleSearchSelect = (query: string, parsedCrop?: string) => {
    if (parsedCrop) {
      const match = suggestionData.find(s => s.nameEn.toLowerCase() === parsedCrop.toLowerCase() || s.cropKey === parsedCrop.toLowerCase());
      if (match) {
        setSelectedCropKey(match.cropKey);
      }
    }
  };

  // Mock Crop Scanner Process
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScannerFile(file);
      setScannerImageSrc(URL.createObjectURL(file));
      startMockScan();
    }
  };

  const simulateDemoScan = (demoType: 'tomato' | 'wheat' | 'soybean') => {
    const images = {
      tomato: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80',
      wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80',
      soybean: 'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?auto=format&fit=crop&q=80'
    };
    setScannerImageSrc(images[demoType]);
    setScannerFile(new File([''], `${demoType}.jpg`, { type: 'image/jpeg' }));
    startMockScan(demoType);
  };

  const startMockScan = (forcedType?: 'tomato' | 'wheat' | 'soybean') => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResult(null);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishMockScan(forcedType);
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  const finishMockScan = (forcedType?: 'tomato' | 'wheat' | 'soybean') => {
    setIsScanning(false);
    
    // Choose which diagnostic result to generate
    const type = forcedType || (selectedCropKey === 'tomatoes' ? 'tomato' : selectedCropKey === 'wheat' ? 'wheat' : 'soybean');

    if (type === 'tomato') {
      setScanResult({
        crop: language === 'mr' ? 'टोमॅटो (Tomatoes)' : language === 'hi' ? 'टमाटर (Tomatoes)' : 'Vine-Ripened Tomatoes',
        health: language === 'mr' ? 'अंशत: रोगग्रस्त (Early Blight)' : language === 'hi' ? 'आंशिक रोगग्रस्त (Early Blight)' : 'Early Blight Detected (Mild Leaf Spotting)',
        issue: language === 'mr' ? 'पानांवर तपकिरी ठिपके आणि बुरशीचा प्रादुर्भाव आढळून आला आहे.' : 'Leaf spots and minor fungal presence detected on foliage.',
        grade: 'Grade B',
        confidence: 89,
        recommendedActions: language === 'mr' ? [
          'तांबेयुक्त बुरशीनाशकाची (Copper Fungicide) योग्य प्रमाणात फवारणी करावी.',
          'पिकाच्या मुळाशी पाण्याचा निचरा व्यवस्थित ठेवावा.',
          'संसर्ग झालेली पाने वेगळी करून नष्ट करा.'
        ] : [
          'Spray copper-based fungicide at recommended dilution.',
          'Maintain proper spacing and soil drainage to reduce humidity.',
          'Prune affected lower leaves to prevent spore spread.'
        ],
        suggestedRate: 3100
      });
    } else if (type === 'wheat') {
      setScanResult({
        crop: language === 'mr' ? 'सेंद्रिय गहू (Organic Wheat)' : language === 'hi' ? 'जैविक गेहूं (Organic Wheat)' : 'Organic Durum Wheat',
        health: language === 'mr' ? 'उत्कृष्ट आरोग्य' : language === 'hi' ? 'उत्कृष्ट स्वास्थ्य' : 'Excellent Health - No Pest activity',
        issue: language === 'mr' ? 'दाण्याचा आकार चांगला असून कसदार गुणवत्ता आहे.' : 'Excellent grain size, ideal moisture content (<12%).',
        grade: 'Premium Grade A',
        confidence: 96,
        recommendedActions: language === 'mr' ? [
          'थेट घाऊक खरेदीदार किंवा अन्न प्रक्रिया कंपन्यांना विक्रीसाठी यादीत समाविष्ट करा.',
          'कोरड्या ठिकाणी योग्य साठवणूक करा.'
        ] : [
          'Highly suitable for direct listing to exporters or premium millers.',
          'Store in dry, airtight bags to keep moisture optimal.'
        ],
        suggestedRate: 2510
      });
    } else {
      setScanResult({
        crop: language === 'mr' ? 'सोयाबीन (Soybean)' : language === 'hi' ? 'सोयाबीन (Soybean)' : 'Premium Soybean',
        health: language === 'mr' ? 'निरोगी (Healthy)' : language === 'hi' ? 'स्वस्थ (Healthy)' : 'Healthy - Minor Insect Defoliation',
        issue: language === 'mr' ? 'पिकात किरकोळ कीटकांचा प्रादुर्भाव आहे, परंतु दाणे निरोगी आहेत.' : 'Very minor leaf chewing, grains are intact and mature.',
        grade: 'Grade A',
        confidence: 93,
        recommendedActions: language === 'mr' ? [
          'निम अर्क (Neem Oil) फवारणी करून कीड नियंत्रणात ठेवा.',
          'पुढील २ दिवस भाववाढीची वाट पाहून विक्री करा.'
        ] : [
          'Apply neem seed kernel extract for eco-friendly insect control.',
          'Hold harvest for 2 days as recommended by selling forecast to get peak rate.'
        ],
        suggestedRate: 4720
      });
    }
  };

  const handleResetScanner = () => {
    setScannerFile(null);
    setScannerImageSrc(null);
    setScanResult(null);
    setScanProgress(0);
  };

  // SVG Chart calculation parameters
  const chartWidth = 500;
  const chartHeight = 200;
  const padding = 30;

  const allRates = [...activeCrop.historyRates, ...activeCrop.predictedRates];
  const maxRate = Math.max(...allRates) * 1.02;
  const minRate = Math.min(...allRates) * 0.98;
  const rateRange = maxRate - minRate;

  const getX = (index: number) => padding + (index * (chartWidth - padding * 2)) / 9;
  const getY = (val: number) => chartHeight - padding - ((val - minRate) * (chartHeight - padding * 2)) / rateRange;

  let historyPoints = '';
  activeCrop.historyRates.forEach((val, i) => {
    historyPoints += `${getX(i)},${getY(val)} `;
  });

  let forecastPoints = `${getX(6)},${getY(activeCrop.historyRates[6])} `;
  activeCrop.predictedRates.forEach((val, i) => {
    forecastPoints += `${getX(i + 7)},${getY(val)} `;
  });

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in relative pb-16">
      
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600/10 via-primary-600/5 to-transparent border border-primary-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
            <span>{t.title}</span>
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-earth-600 dark:text-earth-450 mt-1 max-w-xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>
        
        {/* Smart Search Integration */}
        <div className="w-full md:w-80 shrink-0">
          <label className="text-[10px] font-black text-earth-500 uppercase tracking-widest block mb-1.5">{t.searchLabel}</label>
          <SmartSearch onSearch={handleSearchSelect} />
        </div>
      </div>

      {/* Quick Crop Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {suggestionData.map(crop => {
          const isSelected = crop.cropKey === selectedCropKey;
          const localizedName = language === 'mr' ? crop.nameMr : language === 'hi' ? crop.nameHi : crop.nameEn;
          return (
            <button
              key={crop.cropKey}
              onClick={() => setSelectedCropKey(crop.cropKey)}
              className={`px-4.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                isSelected 
                  ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-600/20' 
                  : 'bg-card border-border hover:border-primary-500/40 text-foreground'
              }`}
            >
              <Sprout className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
              <span>{localizedName}</span>
            </button>
          );
        })}
      </div>

      {/* 2 Grid Sections: Trends vs Scanner */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Price, Trends, Recommendations */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Selling Advisory Banner */}
          <div className="p-6 rounded-3xl border bg-card flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:shadow-lg transition-all duration-300">
            <div className="flex gap-4 items-start">
              <div className={`p-3.5 rounded-2xl border ${decision.colorClass} shrink-0`}>
                <decision.icon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black text-earth-500 uppercase tracking-widest">{t.sellingTimeTitle}</span>
                <h4 className="text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                  {language === 'mr' ? decision.label.mr : language === 'hi' ? decision.label.hi : decision.label.en}
                </h4>
                <p className="text-xs font-semibold text-earth-650 dark:text-earth-400 mt-1.5 leading-relaxed max-w-lg">
                  {language === 'mr' ? decision.desc.mr : language === 'hi' ? decision.desc.hi : decision.desc.en}
                </p>
              </div>
            </div>

            {/* AI Confidence Dial */}
            <div className="shrink-0 flex items-center gap-3 bg-earth-50 dark:bg-earth-900/40 p-4 rounded-2xl border border-border/60 w-full md:w-auto">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" className="text-border" strokeWidth="4" fill="transparent" />
                  <circle cx="24" cy="24" r="20" stroke="currentColor" className="text-emerald-500" strokeWidth="4" fill="transparent"
                    strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * decision.confidence) / 100} />
                </svg>
                <span className="text-[10px] font-black text-foreground">{decision.confidence}%</span>
              </div>
              <div>
                <div className="text-[9px] font-black text-earth-500 uppercase tracking-wider">{t.aiConfidence}</div>
                <div className="text-xs font-extrabold text-foreground">Based on Live Volume</div>
              </div>
            </div>
          </div>

          {/* Pricing Details Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Live Rate Analysis */}
            <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-2 hover:border-primary-500/20 transition-all">
              <span className="text-[10px] font-black text-earth-500 uppercase tracking-wider">{t.trendTitle}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-foreground">₹{activeCrop.currentRate.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-earth-500 font-bold">/{activeCrop.unit}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-black mt-0.5">
                <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                  isTrendUp ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'bg-red-50 dark:bg-red-950/20 text-red-500'
                }`}>
                  {isTrendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {isTrendUp ? '+' : ''}{percentChange}%
                </span>
                <span className="text-earth-450">vs yesterday</span>
              </div>
            </div>

            {/* Weekly High Rate */}
            <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-2 hover:border-primary-500/20 transition-all">
              <span className="text-[10px] font-black text-earth-500 uppercase tracking-wider">{t.weeklyRates}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-450">₹{activeCrop.weekHighRate.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-earth-500 font-bold">/{activeCrop.unit}</span>
              </div>
              <span className="text-[10px] text-earth-450 font-bold mt-1.5">
                📈 {t.highest} rate
              </span>
            </div>

            {/* Weekly Low Rate */}
            <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-2 hover:border-primary-500/20 transition-all">
              <span className="text-[10px] font-black text-earth-500 uppercase tracking-wider">{t.weeklyRates}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-500">₹{activeCrop.weekLowRate.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-earth-500 font-bold">/{activeCrop.unit}</span>
              </div>
              <span className="text-[10px] text-earth-450 font-bold mt-1.5">
                📉 {t.lowest} rate
              </span>
            </div>

          </div>

          {/* SVG Price Chart Card */}
          <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-500" />
                <span>{language === 'mr' ? activeCrop.nameMr : language === 'hi' ? activeCrop.nameHi : activeCrop.nameEn} 10-Day Trend (₹)</span>
              </h4>
              <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-primary-500" /> History</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-1 border-t border-dashed border-amber-500" /> Forecast</span>
              </div>
            </div>

            <div className="w-full overflow-x-auto no-scrollbar">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[450px] overflow-visible">
                <defs>
                  <filter id="chartGlowPrimary" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="chartGlowAmber" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
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
                <polyline fill="none" stroke="currentColor" className="text-primary-500" strokeWidth="3" points={historyPoints} filter="url(#chartGlowPrimary)" />
                
                {/* Future Forecast Line (Dashed) */}
                <polyline fill="none" stroke="currentColor" className="text-amber-500" strokeDasharray="5,4" strokeWidth="3" points={forecastPoints} filter="url(#chartGlowAmber)" />

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

          {/* Nearby Buyers & Markets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Suggested Buyers */}
            <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4">
              <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
                <span>{t.nearbyBuyers}</span>
              </h4>

              <div className="flex flex-col gap-3">
                {mockNearbyBuyers
                  .filter(b => b.crop.toLowerCase() === activeCrop.cropKey.replace(/s$/, ''))
                  .concat(mockNearbyBuyers.slice(0, 1)) // fallback
                  .slice(0, 2)
                  .map((buyer, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-xs text-foreground">{buyer.name}</div>
                        <div className="text-[10px] text-earth-500 font-bold mt-0.5">
                          📍 {buyer.location} · Trust: {buyer.trust}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm text-emerald-600 dark:text-emerald-450">₹{buyer.rate.toLocaleString('en-IN')}/{activeCrop.unit}</div>
                        <span className="text-[9px] font-black uppercase text-earth-400 tracking-wider">Direct Match</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Suggested Regional Mandis */}
            <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4">
              <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span>{t.nearbyMarkets}</span>
              </h4>

              <div className="flex flex-col gap-3">
                {activeCrop.mandiRecommendations.map((mandi, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-xs text-foreground">{mandi.mandiName}</div>
                      <div className="text-[10px] text-earth-500 font-bold mt-0.5">
                        🚗 {mandi.distanceKm} km away
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-sm text-foreground">₹{mandi.rate.toLocaleString('en-IN')}/{activeCrop.unit}</div>
                      <span className={`text-[8px] font-black uppercase tracking-wider inline-block px-1 py-0.5 rounded ${
                        mandi.trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
                        : mandi.trend === 'down' ? 'bg-red-50 dark:bg-red-950/20 text-red-500'
                        : 'bg-earth-100 dark:bg-earth-900 text-earth-500'
                      }`}>
                        {mandi.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: AI Crop Quality Scanner Card */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          <div className="p-6 rounded-3xl border border-border bg-card hover:border-primary-500/20 transition-all flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <UploadCloud className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-450" />
                </div>
                <h4 className="font-black text-sm text-foreground">{t.scannerTitle}</h4>
              </div>
              <p className="text-[11px] font-semibold text-earth-500 mt-2 leading-relaxed">
                {t.scannerDesc}
              </p>
            </div>

            {/* Drag Drop or Upload Preview Area */}
            {!scannerImageSrc ? (
              <div className="relative border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-earth-50/50 dark:hover:bg-earth-950/20 transition-colors group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-10 h-10 text-earth-400 group-hover:text-primary-500 transition-colors" />
                <span className="text-[11px] font-black text-foreground mt-3 block">{language === 'mr' ? 'फोटो अपलोड करा' : 'Upload Image'}</span>
                <span className="text-[10px] font-semibold text-earth-450 mt-1 max-w-[200px] leading-relaxed">
                  {t.dragDrop}
                </span>

                {/* Direct Demo Simulation Buttons */}
                <div className="mt-5 border-t border-border/80 pt-4 w-full">
                  <span className="text-[9px] font-black text-earth-500 uppercase tracking-widest block mb-2">Or try a demo image:</span>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    <button onClick={(e) => { e.preventDefault(); simulateDemoScan('tomato'); }} className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 text-[9px] font-black flex items-center gap-1 cursor-pointer">
                      <Play className="w-2.5 h-2.5 fill-red-600" /> Tomato
                    </button>
                    <button onClick={(e) => { e.preventDefault(); simulateDemoScan('wheat'); }} className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-[9px] font-black flex items-center gap-1 cursor-pointer">
                      <Play className="w-2.5 h-2.5 fill-amber-600" /> Wheat
                    </button>
                    <button onClick={(e) => { e.preventDefault(); simulateDemoScan('soybean'); }} className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-[9px] font-black flex items-center gap-1 cursor-pointer">
                      <Play className="w-2.5 h-2.5 fill-emerald-600" /> Soybean
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                
                {/* Uploaded Crop Image preview */}
                <div className="relative rounded-2xl overflow-hidden border border-border h-40 bg-earth-900/10">
                  <img src={scannerImageSrc} alt="Harvest Preview" className="w-full h-full object-cover" />
                  
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-4">
                      {/* Scanning Line Animation */}
                      <div className="absolute left-0 right-0 h-1 bg-emerald-500 animate-bounce shadow-md shadow-emerald-500/50" style={{ top: `${scanProgress}%` }} />
                      <RefreshCw className="w-8 h-8 text-white animate-spin mb-2" />
                      <span className="text-white text-xs font-black">{t.scanningText}</span>
                      <span className="text-emerald-400 text-[10px] font-black mt-1">{scanProgress}%</span>
                    </div>
                  )}
                </div>

                {/* Scan Result */}
                {scanResult && (
                  <div className="flex flex-col gap-4 border border-border p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/10 animate-fade-in text-left">
                    <div className="flex justify-between items-center border-b border-border/80 pb-2">
                      <span className="text-[10px] font-black text-earth-500 uppercase tracking-wider">{t.scanComplete}</span>
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                        ✓ {scanResult.confidence}% {t.confidenceScore}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start text-xs">
                        <span className="font-extrabold text-earth-500">{t.cropHealth}:</span>
                        <span className="font-black text-foreground text-right">{scanResult.health}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-earth-500">{t.qualityGrade}:</span>
                        <span className="font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-450 px-2 py-0.5 rounded">
                          {scanResult.grade}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-earth-500">{t.suggestedPrice}:</span>
                        <span className="font-black text-foreground">₹{scanResult.suggestedRate.toLocaleString('en-IN')}/Quintal</span>
                      </div>

                      <div className="border-t border-border/60 pt-2.5 mt-1 text-xs">
                        <span className="font-black text-foreground block mb-1.5">{t.recommendedActions}:</span>
                        <ul className="list-disc list-inside space-y-1 text-earth-650 dark:text-earth-400 font-semibold text-[11px] leading-relaxed">
                          {scanResult.recommendedActions.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2 pt-2 border-t border-border/60">
                      <button onClick={handleResetScanner} className="flex-1 py-2.5 rounded-xl border border-border text-earth-500 font-black text-xs hover:bg-earth-100 dark:hover:bg-earth-900 cursor-pointer text-center">
                        {t.scanAgain}
                      </button>
                      <button className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-primary-600/20">
                        {t.directList} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* High Demand Crops Badge */}
          <div className="p-5 rounded-3xl border border-border bg-card flex flex-col gap-4">
            <h4 className="font-black text-sm text-foreground flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
              <span>{t.highDemandCrops}</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Soybean', 'Vine-Ripened Tomato', 'Red Onion', 'Organic Grapes'].map((c, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 text-[11px] font-black flex items-center gap-1.5">
                  🔥 {c}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
