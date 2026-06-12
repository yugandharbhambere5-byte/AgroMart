'use client';

import React, { useState, useMemo } from 'react';
import {
  Bug, ShieldAlert, ThermometerSun, Droplets, Wind,
  AlertTriangle, Search, Filter, MapPin, Sprout,
  CheckCircle2, ShieldCheck, Beaker, Leaf, Info,
  ChevronDown, ChevronUp, AlertCircle, Clock
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThreatSeverity = 'critical' | 'high' | 'moderate' | 'low';
export type ThreatType = 'pest' | 'disease' | 'fungus' | 'virus';

export interface Treatment {
  name: string;
  nameMr: string;
  nameHi: string;
  type: 'chemical' | 'organic' | 'preventive';
  dosage: string;
  instructions: string;
  instructionsMr: string;
}

export interface PestDiseaseAlert {
  id: string;
  title: string;
  titleMr: string;
  titleHi: string;
  type: ThreatType;
  severity: ThreatSeverity;
  affectedCrops: string[];
  affectedDistricts: string[];
  symptoms: string;
  symptomsMr: string;
  symptomsHi: string;
  treatments: Treatment[];
  dateReported: string;
  status: 'active' | 'resolved';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const THREATS: PestDiseaseAlert[] = [
  {
    id: 'pd1',
    title: 'Fall Armyworm Outbreak',
    titleMr: 'लष्करी अळीचा प्रादुर्भाव',
    titleHi: 'फॉल आर्मीवर्म का प्रकोप',
    type: 'pest',
    severity: 'critical',
    affectedCrops: ['Maize', 'Sorghum', 'Sugarcane'],
    affectedDistricts: ['Nashik', 'Pune', 'Ahmednagar', 'Solapur'],
    symptoms: 'Large ragged holes in leaves, sawdust-like frass near the whorl. Rapid defoliation of young plants.',
    symptomsMr: 'पानांना मोठी छिद्रे पडणे, पोंग्यात भुशासारखी विष्ठा दिसणे. कोवळ्या झाडांची पाने वेगाने खाल्ली जाणे.',
    symptomsHi: 'पत्तियों में बड़े छेद, भंवर के पास चूरा जैसा मल। युवा पौधों का तेजी से पत्ती रहित होना।',
    dateReported: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    treatments: [
      {
        name: 'Spinetoram 11.7% SC',
        nameMr: 'स्पिनेटोरम 11.7% SC',
        nameHi: 'स्पिनेटोरम 11.7% SC',
        type: 'chemical',
        dosage: '0.5 ml per Litre of water',
        instructions: 'Spray directly into the whorl of the plant during early morning or late evening.',
        instructionsMr: 'सकाळी लवकर किंवा संध्याकाळी उशिरा झाडाच्या पोंग्यात थेट फवारणी करा.'
      },
      {
        name: 'Neem Seed Kernel Extract (NSKE 5%)',
        nameMr: 'निंबोळी अर्क (NSKE 5%)',
        nameHi: 'नीम बीज अर्क (NSKE 5%)',
        type: 'organic',
        dosage: '50 ml per Litre of water',
        instructions: 'Use as a preventive spray at early growth stages (15-20 days after sowing).',
        instructionsMr: 'पेरणीनंतर 15-20 दिवसांनी प्रतिबंधात्मक फवारणी म्हणून वापरा.'
      }
    ]
  },
  {
    id: 'pd2',
    title: 'Late Blight Alert',
    titleMr: 'करपा रोगाचा इशारा',
    titleHi: 'पछेती झुलसा चेतावनी',
    type: 'fungus',
    severity: 'high',
    affectedCrops: ['Tomato', 'Potato'],
    affectedDistricts: ['Pune', 'Satara', 'Kolhapur', 'Nashik'],
    symptoms: 'Irregular dark brown patches on leaves with white fungal growth on the underside. Rapid spread in humid conditions.',
    symptomsMr: 'पानांवर अनियमित गडद तपकिरी डाग, खालील बाजूस पांढरी बुरशी वाढणे. दमट हवामानात वेगाने प्रसार.',
    symptomsHi: 'पत्तियों पर अनियमित गहरे भूरे रंग के धब्बे और निचली सतह पर सफेद कवक वृद्धि। नम स्थितियों में तेजी से फैलाव।',
    dateReported: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    treatments: [
      {
        name: 'Mancozeb 75% WP',
        nameMr: 'मॅन्कोझेब 75% WP',
        nameHi: 'मैनकोजेब 75% WP',
        type: 'chemical',
        dosage: '2.5 to 3 grams per Litre',
        instructions: 'Start spraying as soon as symptoms appear. Repeat after 7-10 days if necessary.',
        instructionsMr: 'लक्षणे दिसताच फवारणी सुरू करा. आवश्यक असल्यास 7-10 दिवसांनी पुन्हा फवारणी करा.'
      },
      {
        name: 'Trichoderma Viride',
        nameMr: 'ट्रायकोडर्मा व्हिरिडी',
        nameHi: 'ट्राइकोडर्मा विरिडी',
        type: 'organic',
        dosage: '5 grams per Litre',
        instructions: 'Soil application mixed with FYM before planting, or foliar spray for early prevention.',
        instructionsMr: 'लागवडीपूर्वी शेणखतात मिसळून जमिनीत द्या किंवा प्रतिबंधात्मक फवारणी करा.'
      }
    ]
  },
  {
    id: 'pd3',
    title: 'Yellow Vein Mosaic Virus',
    titleMr: 'यलो व्हेन मोझॅक व्हायरस',
    titleHi: 'येलो वेन मोज़ेक वायरस',
    type: 'virus',
    severity: 'high',
    affectedCrops: ['Okra (Bhindi)'],
    affectedDistricts: ['Jalgaon', 'Dhule', 'Nandurbar', 'Aurangabad'],
    symptoms: 'Yellowing of the entire network of veins in the leaf blade. Stunted plant growth and deformed, yellowish fruits.',
    symptomsMr: 'पानांच्या शिरांचे जाळे पिवळे पडणे. झाडाची वाढ खुंटणे आणि फळांचा आकार बिघडणे, फळे पिवळी पडणे.',
    symptomsHi: 'पत्ती के ब्लेड में नसों के पूरे नेटवर्क का पीला पड़ना। पौधे की वृद्धि रुकना और विकृत, पीले फल।',
    dateReported: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    treatments: [
      {
        name: 'Imidacloprid 17.8% SL (Vector Control)',
        nameMr: 'इमिडाक्लोप्रिड 17.8% SL (पांढरी माशी नियंत्रण)',
        nameHi: 'इमिडाक्लोप्रिड 17.8% SL',
        type: 'chemical',
        dosage: '0.5 ml per Litre',
        instructions: 'Virus cannot be cured. Spray to control the whitefly vector. Remove and destroy infected plants immediately.',
        instructionsMr: 'हा विषाणू बरा होत नाही. वाहक पांढऱ्या माशीच्या नियंत्रणासाठी फवारणी करा. प्रादुर्भावग्रस्त झाडे त्वरित उपटून नष्ट करा.'
      },
      {
        name: 'Yellow Sticky Traps',
        nameMr: 'पिवळे चिकट सापळे',
        nameHi: 'पीले चिपचिपे जाल',
        type: 'preventive',
        dosage: '10-15 traps per acre',
        instructions: 'Install just above crop canopy height to trap whiteflies and monitor pest population.',
        instructionsMr: 'पांढऱ्या माश्या पकडण्यासाठी आणि किडीच्या संख्येवर लक्ष ठेवण्यासाठी पिकाच्या उंचीच्या थोडे वर लावा.'
      }
    ]
  },
  {
    id: 'pd4',
    title: 'Thrips Infestation',
    titleMr: 'फुलकिड्यांचा (थ्रिप्स) प्रादुर्भाव',
    titleHi: 'थ्रिप्स का प्रकोप',
    type: 'pest',
    severity: 'moderate',
    affectedCrops: ['Onion', 'Chilli', 'Cotton'],
    affectedDistricts: ['Ahmednagar', 'Pune', 'Nashik', 'Beed'],
    symptoms: 'Silvery white patches on leaves, curling of leaves upwards (in chilli), stunted growth.',
    symptomsMr: 'पानांवर चंदेरी पांढरे डाग, पाने वरच्या बाजूला वळणे (मिरचीमध्ये), वाढ खुंटणे.',
    symptomsHi: 'पत्तियों पर चांदी जैसे सफेद धब्बे, पत्तियों का ऊपर की ओर मुड़ना (मिर्च में), रुकी हुई वृद्धि।',
    dateReported: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    treatments: [
      {
        name: 'Fipronil 5% SC',
        nameMr: 'फिप्रोनिल 5% SC',
        nameHi: 'फिप्रोनिल 5% SC',
        type: 'chemical',
        dosage: '1.5 to 2 ml per Litre',
        instructions: 'Ensure complete coverage of foliage. Alternate with other insecticides to prevent resistance.',
        instructionsMr: 'पानांवर संपूर्ण फवारणी करा. प्रतिकारक्षमता टाळण्यासाठी इतर कीटकनाशकांचा आलटून पालटून वापर करा.'
      },
      {
        name: 'Blue Sticky Traps',
        nameMr: 'निळे चिकट सापळे',
        nameHi: 'नीले चिपचिपे जाल',
        type: 'preventive',
        dosage: '10 traps per acre',
        instructions: 'Specifically attracts and traps adult thrips. Good for monitoring and mass trapping.',
        instructionsMr: 'प्रौढ फुलकिड्यांना विशेषतः आकर्षित करून पकडते. लक्ष ठेवण्यासाठी आणि मोठ्या प्रमाणावर पकडण्यासाठी उपयुक्त.'
      }
    ]
  }
];

// ─── Helpers & Config ────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<ThreatSeverity, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'Critical', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-500/50' },
  high: { label: 'High', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-500/50' },
  moderate: { label: 'Moderate', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-500/50' },
  low: { label: 'Low', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-500/50' }
};

const TYPE_ICONS: Record<ThreatType, React.ElementType> = {
  pest: Bug,
  disease: ShieldAlert,
  fungus: Leaf,
  virus: AlertCircle
};

const TREATMENT_BADGE: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  chemical: { bg: 'bg-rose-100 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', icon: Beaker },
  organic: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', icon: Sprout },
  preventive: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', icon: ShieldCheck }
};

// ─── Sub-Component: Threat Card ───────────────────────────────────────────────

function ThreatCard({ threat, language }: { threat: PestDiseaseAlert; language: string }) {
  const [expanded, setExpanded] = useState(false);

  const title = language === 'mr' ? threat.titleMr : language === 'hi' ? threat.titleHi : threat.title;
  const symptoms = language === 'mr' ? threat.symptomsMr : language === 'hi' ? threat.symptomsHi : threat.symptoms;
  
  const sev = SEVERITY_CONFIG[threat.severity];
  const Icon = TYPE_ICONS[threat.type];

  return (
    <div className={`rounded-2xl border ${sev.border} bg-card overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md`}>
      {/* Header Area */}
      <div className={`p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start ${sev.bg}`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white dark:bg-black/20 shadow-sm border border-black/5`}>
          <Icon className={`w-6 h-6 ${sev.color}`} />
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border ${sev.color} border-current`}>
              {threat.severity} Risk
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-background/50 text-foreground/70">
              {threat.type}
            </span>
            <span className="text-[10px] font-bold text-earth-500 flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              Reported {new Date(threat.dateReported).toLocaleDateString()}
            </span>
          </div>
          
          <h3 className="text-lg font-black text-foreground mb-2 leading-tight">{title}</h3>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
            <div className="flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-bold text-foreground">
                <span className="text-earth-500 mr-1">Crops:</span>
                {threat.affectedCrops.join(', ')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary-500" />
              <span className="text-xs font-bold text-foreground">
                <span className="text-earth-500 mr-1">Districts:</span>
                {threat.affectedDistricts.slice(0, 3).join(', ')}
                {threat.affectedDistricts.length > 3 ? ` +${threat.affectedDistricts.length - 3}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms Preview */}
      <div className="p-4 sm:p-5 border-t border-border bg-background">
        <p className="text-sm text-foreground/80 font-medium leading-relaxed">
          <span className="font-bold text-earth-600 dark:text-earth-400 mr-2">
            {language === 'mr' ? 'लक्षणे:' : language === 'hi' ? 'लक्षण:' : 'Symptoms:'}
          </span>
          {symptoms}
        </p>

        <button 
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center justify-between w-full px-4 py-2 rounded-xl border border-border hover:bg-earth-50 dark:hover:bg-earth-900 text-xs font-black text-primary-600 transition-colors"
        >
          <span>{expanded 
            ? (language === 'mr' ? 'उपाय लपवा' : 'Hide Treatments') 
            : (language === 'mr' ? 'उपाय आणि फवारणी माहिती पहा' : 'View Recommended Treatments')}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Treatments Area */}
      {expanded && (
        <div className="p-4 sm:p-5 bg-earth-50/50 dark:bg-earth-900/10 border-t border-border flex flex-col gap-4">
          <h4 className="text-sm font-black text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            {language === 'mr' ? 'शिफारस केलेले उपाय' : language === 'hi' ? 'अनुशंसित उपचार' : 'Recommended Treatments'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {threat.treatments.map((treatment, i) => {
              const tBadge = TREATMENT_BADGE[treatment.type];
              const TIcon = tBadge.icon;
              const tName = language === 'mr' ? treatment.nameMr : language === 'hi' ? treatment.nameHi : treatment.name;
              const tInst = language === 'mr' ? treatment.instructionsMr : treatment.instructions;

              return (
                <div key={i} className="p-4 rounded-xl border border-border bg-card flex flex-col gap-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-bold text-foreground leading-snug">{tName}</h5>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${tBadge.bg} ${tBadge.text}`}>
                      <TIcon className="w-3 h-3" />
                      {treatment.type}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex items-start gap-2">
                      <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[10px] font-bold text-earth-500 uppercase tracking-wide">Dosage</span>
                        <span className="text-xs font-semibold text-foreground">{treatment.dosage}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-earth-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[10px] font-bold text-earth-500 uppercase tracking-wide">Instructions</span>
                        <span className="text-xs font-semibold text-foreground leading-snug">{tInst}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
              {language === 'mr' 
                ? 'नेहमी शिफारस केलेल्या मात्रेचाच वापर करा. फवारणी करताना संरक्षक उपकरणे (मास्क, हातमोजे) वापरा.'
                : 'Always strictly adhere to the recommended dosage. Wear protective gear (masks, gloves) while spraying chemicals.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PestDiseaseAlertsProps {
  language?: string;
  userLocation?: string;
  userCrops?: string[];
}

export default function PestDiseaseAlerts({ 
  language = 'en', 
  userLocation = '', 
  userCrops = [] 
}: PestDiseaseAlertsProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | ThreatType>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | ThreatSeverity>('all');
  const [myCropsOnly, setMyCropsOnly] = useState(false);
  const [myDistrictOnly, setMyDistrictOnly] = useState(false);

  // Extract base district from user location (simple approximation)
  const userDistrict = userLocation ? userLocation.split(',')[0].trim() : '';

  const filteredThreats = useMemo(() => {
    return THREATS.filter(threat => {
      // Free text search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesText = 
          threat.title.toLowerCase().includes(q) || 
          threat.titleMr.includes(q) || 
          threat.affectedCrops.some(c => c.toLowerCase().includes(q)) ||
          threat.affectedDistricts.some(d => d.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      // Type & Severity
      if (filterType !== 'all' && threat.type !== filterType) return false;
      if (filterSeverity !== 'all' && threat.severity !== filterSeverity) return false;

      // Personalization filters
      if (myCropsOnly && userCrops.length > 0) {
        const affectsMyCrops = threat.affectedCrops.some(tc => 
          userCrops.some(uc => uc.toLowerCase().includes(tc.toLowerCase()) || tc.toLowerCase().includes(uc.toLowerCase()))
        );
        if (!affectsMyCrops) return false;
      }

      if (myDistrictOnly && userDistrict) {
        const inMyDistrict = threat.affectedDistricts.some(d => 
          d.toLowerCase().includes(userDistrict.toLowerCase()) || userDistrict.toLowerCase().includes(d.toLowerCase())
        );
        if (!inMyDistrict) return false;
      }

      return true;
    });
  }, [searchQuery, filterType, filterSeverity, myCropsOnly, myDistrictOnly, userCrops, userDistrict]);

  const activeAlertsCount = THREATS.filter(t => t.status === 'active').length;

  return (
    <div className="flex flex-col gap-6">
      
      {/* ── Header Area ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md shadow-orange-500/20">
              <Bug className="w-5 h-5 text-white" />
            </div>
            {language === 'mr' ? 'पीक आरोग्य आणि कीड सूचना' : language === 'hi' ? 'फसल स्वास्थ्य और कीट अलर्ट' : 'Crop Health & Pest Alerts'}
          </h2>
          <p className="text-xs font-semibold text-earth-500 mt-1 ml-13 flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-red-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {activeAlertsCount} Active Threats
            </span>
            <span>in Maharashtra region</span>
          </p>
        </div>

        {/* Quick toggles for personalization */}
        <div className="flex items-center gap-3 ml-13 md:ml-0">
          {userCrops.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={myCropsOnly} 
                  onChange={e => setMyCropsOnly(e.target.checked)} 
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${myCropsOnly ? 'bg-primary-600' : 'bg-earth-200 dark:bg-earth-800'}`} />
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${myCropsOnly ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-xs font-bold text-foreground group-hover:text-primary-600 transition-colors">
                {language === 'mr' ? 'फक्त माझी पिके' : 'My Crops Only'}
              </span>
            </label>
          )}

          {userDistrict && (
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={myDistrictOnly} 
                  onChange={e => setMyDistrictOnly(e.target.checked)} 
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${myDistrictOnly ? 'bg-primary-600' : 'bg-earth-200 dark:bg-earth-800'}`} />
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${myDistrictOnly ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-xs font-bold text-foreground group-hover:text-primary-600 transition-colors">
                {language === 'mr' ? 'फक्त माझा जिल्हा' : 'My District Only'}
              </span>
            </label>
          )}
        </div>
      </div>

      {/* ── Filters Bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
          <input
            type="text"
            placeholder={language === 'mr' ? 'कीड, रोग किंवा पीक शोधा...' : 'Search pest, disease or crop...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="w-px h-8 bg-border hidden lg:block" />

        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-earth-400" />
            <span className="text-xs font-bold text-earth-500 uppercase tracking-wide">Type:</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'pest', 'disease', 'fungus', 'virus'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all capitalize ${
                  filterType === t 
                    ? 'bg-foreground text-background shadow-sm' 
                    : 'bg-background border border-border text-earth-600 hover:bg-earth-50 dark:hover:bg-earth-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Threat Feed ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        {filteredThreats.length > 0 ? (
          filteredThreats.map(threat => (
            <ThreatCard key={threat.id} threat={threat} language={language} />
          ))
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-card rounded-2xl border border-border border-dashed">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-black text-foreground mb-1">
              {language === 'mr' ? 'कोणतेही धोके आढळले नाहीत' : 'No active threats found'}
            </h3>
            <p className="text-sm font-semibold text-earth-500 max-w-sm">
              {language === 'mr' 
                ? 'तुमच्या निवडलेल्या फिल्टरनुसार सध्या कोणतेही पीक धोके नाहीत. तुमची पिके सुरक्षित आहेत!'
                : 'There are no reported crop health threats matching your current filters. Your crops look safe!'}
            </p>
            {(searchQuery || filterType !== 'all' || filterSeverity !== 'all' || myCropsOnly || myDistrictOnly) && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setFilterSeverity('all');
                  setMyCropsOnly(false);
                  setMyDistrictOnly(false);
                }}
                className="mt-6 px-5 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-600 font-bold text-sm hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
