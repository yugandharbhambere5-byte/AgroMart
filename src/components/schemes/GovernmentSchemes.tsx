'use client';

import React, { useState, useMemo } from 'react';
import {
  IndianRupee, FileText, Calendar, ChevronDown, ChevronUp, CheckCircle,
  Clock, Star, ArrowUpRight, ExternalLink, Search, Filter, Sparkles,
  ShieldCheck, Tractor, Sprout, BarChart3, Landmark, BookOpen, Zap,
  AlertCircle, Download, Phone, Globe, Tag, Users, X, Info, Check
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SchemeCategory =
  | 'income_support'
  | 'crop_insurance'
  | 'subsidy'
  | 'loan'
  | 'equipment'
  | 'organic'
  | 'irrigation';

export type SchemeEligibility = 'any' | 'small' | 'marginal' | 'large';

export interface GovernmentScheme {
  id: string;
  name: string;
  nameMr: string;
  nameHi: string;
  shortDesc: string;
  shortDescMr: string;
  shortDescHi: string;
  category: SchemeCategory;
  ministry: string;
  benefit: string;
  benefitMr: string;
  amount?: string;
  eligibility: {
    landHolding?: string; // e.g. "Up to 2 hectares"
    minAge?: number;
    maxAge?: number;
    income?: string;
    stateSpecific?: string[];
    otherConditions?: string[];
  };
  eligibilityTags: SchemeEligibility[];
  documents: string[];
  documentsMr: string[];
  applicationProcess: string[];
  applicationProcessMr?: string[];
  applicationUrl?: string;
  helpline?: string;
  lastDate?: string;  // ISO date or descriptive
  isOpenNow: boolean;
  tags: string[]; // for profile matching
  color: string; // tailwind gradient classes
  icon: React.ElementType;
  isCentral: boolean; // central vs state scheme
  yearlyBenefit?: string;
}

export interface FarmerProfile {
  landHolding?: number; // in hectares
  cropTypes?: string[];
  isVerified?: boolean;
  hasLoan?: boolean;
  hasInsurance?: boolean;
  location?: string;
  age?: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SCHEMES: GovernmentScheme[] = [
  {
    id: 's1',
    name: 'PM-KISAN Samman Nidhi',
    nameMr: 'पीएम-किसान सन्मान निधी',
    nameHi: 'पीएम-किसान सम्मान निधि',
    shortDesc: 'Direct income support of ₹6,000/year in 3 installments of ₹2,000 to all eligible farmer families.',
    shortDescMr: 'पात्र शेतकरी कुटुंबांना वार्षिक ₹6,000 (₹2,000 च्या 3 हप्त्यांमध्ये) थेट आर्थिक सहाय्य.',
    shortDescHi: 'पात्र किसान परिवारों को ₹2,000 की 3 किस्तों में ₹6,000/वर्ष की प्रत्यक्ष आय सहायता।',
    category: 'income_support',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    benefit: 'Receive ₹6,000 per year directly to your bank account — no middlemen, no paperwork delays.',
    benefitMr: 'तुमच्या बँक खात्यात थेट ₹6,000 प्रतिवर्ष — कोणताही मध्यस्थ नाही.',
    amount: '₹6,000/year',
    eligibility: {
      landHolding: 'All land-holding farmer families (no upper limit)',
      minAge: 18,
      otherConditions: [
        'Must be a cultivable land owner or co-owner',
        'Aadhar-linked bank account required',
        'Excludes income-tax payers and institutional landholders',
      ],
    },
    eligibilityTags: ['any'],
    documents: [
      'Aadhaar Card',
      'Land ownership records (7/12 extract)',
      'Bank passbook (for IFSC)',
      'Mobile number linked to Aadhaar',
    ],
    documentsMr: [
      'आधार कार्ड',
      'जमीन मालकीचे दस्तऐवज (७/१२ उतारा)',
      'बँक पासबुक (IFSC कोडसह)',
      'आधारशी जोडलेला मोबाइल नंबर',
    ],
    applicationProcess: [
      'Visit pmkisan.gov.in or nearest Common Service Centre (CSC)',
      'Click "New Farmer Registration"',
      'Enter Aadhaar number and state',
      'Fill in land and bank details',
      'Submit and note reference number',
      'Status can be checked online in 2–3 working days',
    ],
    applicationUrl: 'https://pmkisan.gov.in',
    helpline: '155261 / 1800-115-526',
    lastDate: 'Ongoing — apply any time',
    isOpenNow: true,
    tags: ['income', 'all farmers', 'aadhaar', 'bank'],
    color: 'from-primary-500 to-emerald-500',
    icon: IndianRupee,
    isCentral: true,
    yearlyBenefit: '₹6,000',
  },
  {
    id: 's2',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    nameMr: 'प्रधानमंत्री पीक विमा योजना (PMFBY)',
    nameHi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
    shortDesc: 'Comprehensive crop insurance covering yield loss from natural calamities, pests and diseases at minimal premium.',
    shortDescMr: 'नैसर्गिक आपत्ती, कीड व रोगांमुळे होणाऱ्या पीक नुकसानीपासून कमी प्रीमियमवर संरक्षण.',
    shortDescHi: 'प्राकृतिक आपदाओं, कीट और बीमारियों से फसल हानि के लिए न्यूनतम प्रीमियम पर व्यापक फसल बीमा।',
    category: 'crop_insurance',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    benefit: 'Get insured against drought, flood, cyclone, hail, pest attack and post-harvest losses. Premium as low as 1.5%–2% for Kharif and Rabi crops.',
    benefitMr: 'दुष्काळ, पूर, गारपीट, कीड व काढणीपश्चात नुकसानीपासून संरक्षण. प्रीमियम केवळ 1.5%–2%.',
    amount: 'Varies by crop and coverage',
    eligibility: {
      otherConditions: [
        'All farmers growing notified crops in notified areas',
        'Both loanee and non-loanee farmers can apply',
        'Must enroll before sowing (cut-off dates apply)',
      ],
    },
    eligibilityTags: ['any', 'small', 'marginal'],
    documents: [
      'Aadhaar Card / Voter ID',
      '7/12 land records (Satbara)',
      'Bank account details',
      'Sowing declaration form',
      'Crop loan account number (if applicable)',
    ],
    documentsMr: [
      'आधार कार्ड / मतदार ओळखपत्र',
      '७/१२ जमीन नोंदी (सातबारा)',
      'बँक खाते तपशील',
      'पेरणी घोषणापत्र',
      'पीक कर्ज खाते क्रमांक (लागू असल्यास)',
    ],
    applicationProcess: [
      'Visit pmfby.gov.in or nearest bank/CSC before cut-off date',
      'Choose crop and coverage type',
      'Fill insurance application with land details',
      'Pay applicable premium (remaining is subsidised by govt)',
      'Get policy document with Crop Insurance Application Number',
      'In case of loss, immediately inform bank/insurance company within 72 hours',
    ],
    applicationUrl: 'https://pmfby.gov.in',
    helpline: '14447',
    lastDate: 'Kharif: July 31, 2026 | Rabi: Dec 31, 2026',
    isOpenNow: true,
    tags: ['insurance', 'crop loss', 'kharif', 'rabi', 'natural disaster'],
    color: 'from-blue-500 to-cyan-500',
    icon: ShieldCheck,
    isCentral: true,
    yearlyBenefit: 'Up to full sum insured',
  },
  {
    id: 's3',
    name: 'Kisan Credit Card (KCC)',
    nameMr: 'किसान क्रेडिट कार्ड (KCC)',
    nameHi: 'किसान क्रेडिट कार्ड (KCC)',
    shortDesc: 'Flexible short-term crop loans up to ₹3 lakhs at 4% effective interest rate for all farm needs.',
    shortDescMr: 'सर्व शेती गरजांसाठी 4% प्रभावी व्याज दराने ₹3 लाखांपर्यंत लवचिक अल्पकालीन पीक कर्ज.',
    shortDescHi: 'सभी कृषि जरूरतों के लिए 4% प्रभावी ब्याज दर पर ₹3 लाख तक का लचीला अल्पकालिक फसल ऋण।',
    category: 'loan',
    ministry: 'Ministry of Finance / NABARD',
    benefit: 'Revolving credit for seeds, fertilizers, pesticides, equipment, post-harvest expenses. No processing fee up to ₹3L.',
    benefitMr: 'बियाणे, खते, कीटकनाशके, उपकरणे, काढणीपश्चात खर्चासाठी फिरती पत. ₹3L पर्यंत प्रक्रिया शुल्क नाही.',
    amount: 'Up to ₹3 Lakhs at 4% p.a.',
    eligibility: {
      landHolding: 'Must own or lease agricultural land',
      minAge: 18,
      maxAge: 75,
      otherConditions: [
        'Individual or joint borrowers (farmers, tenant farmers, sharecroppers)',
        'SHG / JLG members also eligible',
        'Credit limit based on land holding and cropping pattern',
      ],
    },
    eligibilityTags: ['any', 'small', 'marginal'],
    documents: [
      'Aadhaar + PAN Card',
      '7/12 land record or lease deed',
      '2 passport-size photographs',
      'Income certificate (if required)',
      'Completed KCC application form from bank',
    ],
    documentsMr: [
      'आधार + पॅन कार्ड',
      '७/१२ जमीन नोंद किंवा भाडेपट्टा',
      '2 पासपोर्ट आकाराचे फोटो',
      'उत्पन्न प्रमाणपत्र (आवश्यक असल्यास)',
      'बँकेतून KCC अर्ज',
    ],
    applicationProcess: [
      'Visit nearest branch of SBI, cooperative bank, or RRB',
      'Collect KCC application form (also available online)',
      'Attach all required documents',
      'Bank conducts field verification of land',
      'Credit limit sanctioned within 14 working days',
      'KCC ATM/RuPay card issued within 7 days of sanction',
    ],
    applicationUrl: 'https://www.india.gov.in/spotlight/kisan-credit-card',
    helpline: '1800-180-1551 (NABARD)',
    lastDate: 'Ongoing — apply any time',
    isOpenNow: true,
    tags: ['loan', 'credit', 'short-term', 'seeds', 'fertilizer'],
    color: 'from-violet-500 to-purple-600',
    icon: Landmark,
    isCentral: true,
    yearlyBenefit: '₹3L credit @ 4%',
  },
  {
    id: 's4',
    name: 'PM Krishi Sinchayee Yojana — PMKSY',
    nameMr: 'पीएम कृषि सिंचन योजना — PMKSY',
    nameHi: 'पीएम कृषि सिंचाई योजना — PMKSY',
    shortDesc: 'Up to 90% subsidy on micro-irrigation (drip/sprinkler) to improve water use efficiency and crop productivity.',
    shortDescMr: 'सूक्ष्म सिंचन (ठिबक/तुषार) वर 90% पर्यंत अनुदान — पाण्याचा कार्यक्षम वापर व पीक उत्पादकता वाढ.',
    shortDescHi: 'जल उपयोग दक्षता और फसल उत्पादकता सुधारने के लिए सूक्ष्म सिंचाई (ड्रिप/स्प्रिंकलर) पर 90% तक सब्सिडी।',
    category: 'irrigation',
    ministry: 'Ministry of Jal Shakti / Ministry of Agriculture',
    benefit: '55% subsidy for large farmers, 75%–90% for small/marginal farmers on drip and sprinkler irrigation systems.',
    benefitMr: 'मोठ्या शेतकऱ्यांना 55% व लहान/अल्पभूधारकांना 75%-90% सूक्ष्म सिंचन अनुदान.',
    amount: '55–90% subsidy on equipment cost',
    eligibility: {
      landHolding: 'All land-holding farmers (higher % for small/marginal)',
      otherConditions: [
        'Must own or lease land with irrigation potential',
        'Registered on DBT Agriculture portal',
        'Can apply for drip, sprinkler, or both',
      ],
    },
    eligibilityTags: ['any', 'small', 'marginal'],
    documents: [
      'Aadhaar Card',
      '7/12 extract',
      'Bank passbook',
      'Land boundary map',
      'Quotation from approved vendor',
    ],
    documentsMr: [
      'आधार कार्ड',
      '७/१२ उतारा',
      'बँक पासबुक',
      'जमिनीचा सीमांकन नकाशा',
      'मान्यताप्राप्त विक्रेत्याचे कोटेशन',
    ],
    applicationProcess: [
      'Register on MahaDBT portal (for Maharashtra) or respective state portal',
      'Select "Drip Irrigation" or "Sprinkler System" scheme',
      'Upload required documents and land details',
      'After approval, purchase equipment from empanelled vendors',
      'Installation verified by Taluka Agriculture Officer',
      'Subsidy released directly to bank account post-verification',
    ],
    applicationUrl: 'https://mahadbt.maharashtra.gov.in',
    helpline: '020-41757474 (MahaDBT)',
    lastDate: 'Open till March 31, 2027',
    isOpenNow: true,
    tags: ['irrigation', 'drip', 'sprinkler', 'water', 'subsidy'],
    color: 'from-cyan-500 to-blue-600',
    icon: Sprout,
    isCentral: false,
    yearlyBenefit: '55–90% subsidy',
  },
  {
    id: 's5',
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    nameMr: 'कृषी यंत्रीकरण उप-अभियान (SMAM)',
    nameHi: 'कृषि यंत्रीकरण उप-अभियान (SMAM)',
    shortDesc: 'Up to 50% subsidy on farm machinery — tractors, power tillers, harvesting combines, threshers and more.',
    shortDescMr: 'ट्रॅक्टर, पॉवर टिलर, हार्वेस्टर, थ्रेशर यांसारख्या शेती यंत्रावर 50% पर्यंत अनुदान.',
    shortDescHi: 'ट्रैक्टर, पॉवर टिलर, हार्वेस्टर, थ्रेशर सहित कृषि मशीनरी पर 50% तक सब्सिडी।',
    category: 'equipment',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    benefit: '25%–50% subsidy on farm implements. Higher percentage for SC/ST farmers and women. Custom Hiring Centre (CHC) support also available.',
    benefitMr: 'कृषी अवजारांवर 25%-50% अनुदान. SC/ST शेतकरी व महिलांसाठी जास्त टक्केवारी.',
    amount: '25–50% subsidy on machinery',
    eligibility: {
      otherConditions: [
        'Individual farmers, SHGs, cooperatives eligible',
        'Priority to SC/ST, small & marginal, women farmers',
        'One subsidy per implement per 10 years',
      ],
    },
    eligibilityTags: ['any', 'small', 'marginal'],
    documents: [
      'Aadhaar Card',
      'Caste Certificate (for SC/ST)',
      '7/12 land record',
      'Bank passbook',
      'Vehicle registration (for tractor)',
      'Quotation from authorized dealer',
    ],
    documentsMr: [
      'आधार कार्ड',
      'जातीचे प्रमाणपत्र (SC/ST साठी)',
      '७/१२ जमीन नोंद',
      'बँक पासबुक',
      'वाहन नोंदणी (ट्रॅक्टरसाठी)',
      'अधिकृत डीलरचे कोटेशन',
    ],
    applicationProcess: [
      'Log in to agrimachinery.nic.in or state DBT portal',
      'Select required machinery from approved list',
      'Upload documents and apply',
      'Lotter/priority selection conducted at district level',
      'On selection, purchase from authorized dealer',
      'Verification by district agriculture officer',
      'Subsidy credited within 30 days of verification',
    ],
    applicationUrl: 'https://agrimachinery.nic.in',
    helpline: '1800-180-1551',
    lastDate: 'Open — Check state portal for current slots',
    isOpenNow: true,
    tags: ['equipment', 'tractor', 'machinery', 'mechanization', 'subsidy'],
    color: 'from-amber-500 to-harvest-500',
    icon: Tractor,
    isCentral: true,
    yearlyBenefit: '25–50% subsidy',
  },
  {
    id: 's6',
    name: 'National Mission for Sustainable Agriculture (NMSA)',
    nameMr: 'राष्ट्रीय शाश्वत शेती अभियान (NMSA)',
    nameHi: 'राष्ट्रीय सतत कृषि मिशन (NMSA)',
    shortDesc: 'Subsidies and support for organic farming, soil health cards, and climate-resilient agriculture practices.',
    shortDescMr: 'सेंद्रिय शेती, माती आरोग्य कार्ड व हवामान-प्रतिरोधक शेती पद्धतींसाठी अनुदान व सहाय्य.',
    shortDescHi: 'जैविक खेती, मृदा स्वास्थ्य कार्ड और जलवायु-प्रतिरोधी कृषि प्रथाओं के लिए सब्सिडी और सहायता।',
    category: 'organic',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    benefit: 'Free Soil Health Card, ₹50,000 per hectare support for organic certification, vermi-composting units, and bio-fertilizer promotion.',
    benefitMr: 'मोफत माती आरोग्य कार्ड, सेंद्रिय प्रमाणपत्रासाठी ₹50,000 प्रति हेक्टर अनुदान, गांडूळ खत युनिट.',
    amount: 'Up to ₹50,000/hectare for organic',
    eligibility: {
      otherConditions: [
        'Farmers willing to adopt organic practices for minimum 3 years',
        'Must get Soil Health Card from local agriculture dept',
        'Group approach (at least 50 farmers/cluster) preferred for organic clusters',
      ],
    },
    eligibilityTags: ['small', 'marginal'],
    documents: [
      'Aadhaar Card',
      '7/12 land record',
      'Soil Health Card',
      'Bank passbook',
      'Organic farming commitment declaration',
    ],
    documentsMr: [
      'आधार कार्ड',
      '७/१२ जमीन नोंद',
      'माती आरोग्य कार्ड',
      'बँक पासबुक',
      'सेंद्रिय शेती बांधिलकी घोषणापत्र',
    ],
    applicationProcess: [
      'Obtain Soil Health Card from Taluka Agriculture Office',
      'Join or form an organic farmer cluster (50+ farmers)',
      'Apply through Paramparagat Krishi Vikas Yojana (PKVY) portal',
      'Attend orientation workshop organized by KVK',
      'Sign 3-year organic conversion commitment',
      'Receive input support and subsidy annually',
    ],
    applicationUrl: 'https://pgsindia-ncof.gov.in',
    helpline: '1800-180-1551',
    lastDate: 'Ongoing',
    isOpenNow: true,
    tags: ['organic', 'soil', 'sustainable', 'certification', 'composting'],
    color: 'from-emerald-500 to-green-600',
    icon: Sprout,
    isCentral: true,
    yearlyBenefit: '₹50,000/ha',
  },
  {
    id: 's7',
    name: 'Rashtriya Krishi Vikas Yojana (RKVY)',
    nameMr: 'राष्ट्रीय कृषी विकास योजना (RKVY)',
    nameHi: 'राष्ट्रीय कृषि विकास योजना (RKVY)',
    shortDesc: 'Grants and funding for agri-infrastructure, food processing units, cold storage, and value-chain development.',
    shortDescMr: 'कृषी पायाभूत सुविधा, अन्न प्रक्रिया युनिट, शीत साठवणूक व मूल्यसाखळी विकासासाठी अनुदान.',
    shortDescHi: 'कृषि बुनियादी ढांचे, खाद्य प्रसंस्करण इकाइयों, शीत भंडारण और मूल्य-श्रृंखला विकास के लिए अनुदान।',
    category: 'subsidy',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    benefit: 'Project-based funding up to 60% as grant for agri-businesses. Includes Agri Startup Fund and RAWE support for young farmers.',
    benefitMr: 'कृषी व्यवसायांसाठी 60% पर्यंत प्रकल्पाधारित अनुदान. युवा शेतकऱ्यांसाठी Agri Startup निधी.',
    amount: 'Up to 60% of project cost',
    eligibility: {
      otherConditions: [
        'Farmer Producer Organizations (FPOs)',
        'Individual agri-entrepreneurs with project proposal',
        'Young farmers (Agri Startup) 18–40 years',
        'State government acts as implementing agency',
      ],
    },
    eligibilityTags: ['any'],
    documents: [
      'Project Proposal / DPR',
      'Aadhaar + PAN',
      'Bank statements (6 months)',
      'Land documents',
      'FPO registration certificate (if FPO)',
    ],
    documentsMr: [
      'प्रकल्प प्रस्ताव / DPR',
      'आधार + पॅन',
      'बँक विवरणपत्रे (6 महिने)',
      'जमीन दस्तऐवज',
      'FPO नोंदणी प्रमाणपत्र (लागू असल्यास)',
    ],
    applicationProcess: [
      'Contact District Agriculture Officer or State Agriculture Dept.',
      'Prepare a Detailed Project Report (DPR)',
      'Apply through state RKVY portal or district office',
      'State-level committee evaluates and sanctions projects',
      'First installment released after agreement signing',
      'Physical and financial progress monitored quarterly',
    ],
    applicationUrl: 'https://rkvy.nic.in',
    helpline: '011-23382357',
    lastDate: 'Annual call for proposals — check portal',
    isOpenNow: true,
    tags: ['infrastructure', 'processing', 'cold storage', 'FPO', 'startup'],
    color: 'from-rose-500 to-pink-600',
    icon: BarChart3,
    isCentral: true,
    yearlyBenefit: '60% of project cost',
  },
];

// ─── Category Config ──────────────────────────────────────────────────────────

const CAT_CONFIG: Record<SchemeCategory, { label: string; labelMr: string; color: string; bg: string }> = {
  income_support: { label: 'Income Support', labelMr: 'उत्पन्न सहाय्य', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-950/30' },
  crop_insurance: { label: 'Crop Insurance', labelMr: 'पीक विमा', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-950/30' },
  subsidy: { label: 'Subsidy', labelMr: 'अनुदान', color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-950/30' },
  loan: { label: 'Agri Loan', labelMr: 'कृषी कर्ज', color: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-950/30' },
  equipment: { label: 'Equipment Subsidy', labelMr: 'उपकरण अनुदान', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-950/30' },
  organic: { label: 'Organic / Soil', labelMr: 'सेंद्रिय / माती', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-950/30' },
  irrigation: { label: 'Irrigation', labelMr: 'सिंचन', color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-950/30' },
};

// ─── Profile Match Logic ──────────────────────────────────────────────────────

const getMatchScore = (scheme: GovernmentScheme, profile: FarmerProfile): { score: number; reasons: string[] } => {
  let score = 0;
  const reasons: string[] = [];

  // Always eligible schemes
  if (scheme.eligibilityTags.includes('any')) { score += 10; }

  // Small/marginal farmer bonus
  if (profile.landHolding !== undefined && profile.landHolding <= 2 && scheme.eligibilityTags.includes('marginal')) {
    score += 20;
    reasons.push('Matches your small farm size');
  }
  if (profile.landHolding !== undefined && profile.landHolding <= 4 && scheme.eligibilityTags.includes('small')) {
    score += 10;
    reasons.push('Eligible for your land holding');
  }

  // No insurance → push PMFBY
  if (!profile.hasInsurance && scheme.category === 'crop_insurance') {
    score += 30;
    reasons.push('You have no crop insurance — apply now!');
  }

  // Verified profile — suggest income support
  if (profile.isVerified && scheme.category === 'income_support') {
    score += 15;
    reasons.push('Profile verified — ready to apply');
  }

  // Organic farmers
  if (profile.cropTypes?.some(c => c.toLowerCase().includes('organic')) && scheme.category === 'organic') {
    score += 25;
    reasons.push('Matches your organic crops');
  }

  // Has outstanding loan — suggest KCC for lower rates
  if (profile.hasLoan && scheme.category === 'loan') {
    score += 15;
    reasons.push('Better rate than commercial loans');
  }

  return { score, reasons };
};

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepBadge({ n }: { n: number }) {
  return (
    <span className="w-6 h-6 rounded-full bg-foreground text-background text-[10px] font-black flex items-center justify-center shrink-0">{n}</span>
  );
}

// ─── Scheme Card ──────────────────────────────────────────────────────────────

function SchemeCard({ scheme, language, matchReasons, matchScore }:
  { scheme: GovernmentScheme; language: string; matchReasons: string[]; matchScore: number }) {

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'eligibility' | 'documents' | 'apply'>('eligibility');

  const name = language === 'mr' ? scheme.nameMr : language === 'hi' ? scheme.nameHi : scheme.name;
  const shortDesc = language === 'mr' ? scheme.shortDescMr : language === 'hi' ? scheme.shortDescHi : scheme.shortDesc;
  const benefit = language === 'mr' ? scheme.benefitMr : scheme.benefit;
  const cat = CAT_CONFIG[scheme.category];
  const Icon = scheme.icon;

  return (
    <div className={`rounded-2xl border bg-card flex flex-col transition-all duration-300 ${
      matchScore > 25 ? 'border-primary-500/30 shadow-sm shadow-primary-500/10' : 'border-border'
    }`}>

      {/* Suggested badge */}
      {matchScore > 25 && (
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-0">
          <Sparkles className="w-3.5 h-3.5 text-primary-500" />
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-wide">
            {language === 'mr' ? 'तुमच्यासाठी सुचवलेले' : language === 'hi' ? 'आपके लिए सुझाव' : 'Recommended for You'}
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${scheme.color} flex items-center justify-center shrink-0 shadow-md`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${cat.bg} ${cat.color}`}>
                {language === 'mr' ? cat.labelMr : cat.label}
              </span>
              {scheme.isCentral && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-earth-100 dark:bg-earth-900 text-earth-600">Central</span>
              )}
              {scheme.isOpenNow && (
                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Open Now
                </span>
              )}
            </div>
            <h3 className="text-sm font-extrabold text-foreground leading-snug">{name}</h3>
            <p className="text-[10px] font-bold text-earth-500 mt-0.5">{scheme.ministry}</p>
          </div>
          {scheme.amount && (
            <div className="shrink-0 text-right">
              <div className="text-base font-black text-foreground">{scheme.yearlyBenefit ?? scheme.amount}</div>
              <div className="text-[9px] font-bold text-earth-400 uppercase tracking-wide">benefit</div>
            </div>
          )}
        </div>

        {/* Short desc */}
        <p className="text-xs font-semibold text-earth-600 dark:text-earth-300 leading-relaxed">{shortDesc}</p>

        {/* Match reasons */}
        {matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {matchReasons.map((r, i) => (
              <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 text-[9px] font-black border border-primary-500/20">
                <Check className="w-2.5 h-2.5" />{r}
              </span>
            ))}
          </div>
        )}

        {/* Deadline */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-earth-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{scheme.lastDate}</span>
          </div>
          {scheme.helpline && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-earth-500">
              <Phone className="w-3.5 h-3.5" />
              <span>{scheme.helpline}</span>
            </div>
          )}
        </div>

        {/* Expand button */}
        <button
          onClick={() => setIsExpanded(e => !e)}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-border hover:bg-earth-50 dark:hover:bg-earth-900 text-xs font-extrabold text-foreground cursor-pointer transition-colors"
        >
          <span>
            {isExpanded
              ? (language === 'mr' ? 'कमी दाखवा' : language === 'hi' ? 'कम दिखाएं' : 'Show Less')
              : (language === 'mr' ? 'संपूर्ण माहिती पहा' : language === 'hi' ? 'पूरी जानकारी देखें' : 'Full Details & Apply')}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Expanded Detail ──────────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="border-t border-border">
          {/* Benefit highlight */}
          <div className={`px-5 py-4 bg-gradient-to-r ${scheme.color} bg-opacity-10`}>
            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-white leading-relaxed">{benefit}</p>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex border-b border-border">
            {([
              { id: 'eligibility' as const, label: language === 'mr' ? 'पात्रता' : 'Eligibility', icon: CheckCircle },
              { id: 'documents' as const, label: language === 'mr' ? 'कागदपत्रे' : 'Documents', icon: FileText },
              { id: 'apply' as const, label: language === 'mr' ? 'अर्ज कसा करावा' : 'How to Apply', icon: BookOpen },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-black flex-1 justify-center border-b-2 cursor-pointer transition-all ${
                  activeSection === tab.id ? 'border-current text-foreground' : 'border-transparent text-earth-500 hover:text-foreground'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5 flex flex-col gap-4">
            {/* Eligibility section */}
            {activeSection === 'eligibility' && (
              <div className="flex flex-col gap-3">
                {scheme.eligibility.landHolding && (
                  <div className="flex items-start gap-2.5">
                    <Tag className="w-4 h-4 text-earth-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-earth-400 uppercase tracking-wide mb-0.5">Land Holding</p>
                      <p className="text-xs font-semibold text-foreground">{scheme.eligibility.landHolding}</p>
                    </div>
                  </div>
                )}
                {(scheme.eligibility.minAge || scheme.eligibility.maxAge) && (
                  <div className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-earth-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-earth-400 uppercase tracking-wide mb-0.5">Age Criteria</p>
                      <p className="text-xs font-semibold text-foreground">
                        {scheme.eligibility.minAge && `Min ${scheme.eligibility.minAge} years`}
                        {scheme.eligibility.minAge && scheme.eligibility.maxAge && ' – '}
                        {scheme.eligibility.maxAge && `Max ${scheme.eligibility.maxAge} years`}
                      </p>
                    </div>
                  </div>
                )}
                {scheme.eligibility.otherConditions?.map((cond, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-foreground">{cond}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Documents section */}
            {activeSection === 'documents' && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black text-earth-400 uppercase tracking-wider mb-1">Required Documents</p>
                {(language === 'mr' ? scheme.documentsMr : scheme.documents).map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:bg-earth-50 dark:hover:bg-earth-950/30 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-earth-100 dark:bg-earth-900 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-earth-600" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{doc}</span>
                  </div>
                ))}
                <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                    {language === 'mr'
                      ? 'सर्व कागदपत्रे आधारशी जोडलेली असणे आवश्यक आहे. स्वयंसाक्षांकित प्रती जवळ ठेवा.'
                      : 'Keep self-attested photocopies of all documents. Aadhaar linkage is mandatory for most schemes.'}
                  </p>
                </div>
              </div>
            )}

            {/* Application process section */}
            {activeSection === 'apply' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  {scheme.applicationProcess.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <StepBadge n={i + 1} />
                      <p className="text-xs font-semibold text-foreground leading-relaxed pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                  {scheme.applicationUrl && (
                    <a
                      href={scheme.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${scheme.color} text-white font-extrabold text-sm cursor-pointer hover:opacity-90 transition-opacity shadow-md`}
                    >
                      <Globe className="w-4 h-4" />
                      {language === 'mr' ? 'ऑनलाइन अर्ज करा' : 'Apply Online'}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {scheme.helpline && (
                    <a
                      href={`tel:${scheme.helpline.split('/')[0].trim()}`}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-earth-600 font-extrabold text-sm cursor-pointer hover:bg-earth-50 dark:hover:bg-earth-900 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {scheme.helpline}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface GovernmentSchemesProps {
  language?: string;
  farmerProfile?: FarmerProfile;
}

export default function GovernmentSchemes({ language = 'en', farmerProfile = {} }: GovernmentSchemesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SchemeCategory>('all');
  const [showSuggestedOnly, setShowSuggestedOnly] = useState(false);
  const [profileLand, setProfileLand] = useState<string>(farmerProfile.landHolding?.toString() ?? '');
  const [profileInsured, setProfileInsured] = useState(farmerProfile.hasInsurance ?? false);
  const [profileVerified] = useState(farmerProfile.isVerified ?? false);
  const [profileOrganic, setProfileOrganic] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  // Build effective profile from state
  const effectiveProfile: FarmerProfile = useMemo(() => ({
    landHolding: profileLand ? parseFloat(profileLand) : farmerProfile.landHolding,
    cropTypes: profileOrganic ? ['organic wheat'] : farmerProfile.cropTypes,
    isVerified: profileVerified,
    hasInsurance: profileInsured,
    hasLoan: farmerProfile.hasLoan,
    location: farmerProfile.location,
  }), [profileLand, profileOrganic, profileVerified, profileInsured, farmerProfile]);

  // Compute match scores
  const schemesWithScores = useMemo(() =>
    SCHEMES.map(scheme => {
      const { score, reasons } = getMatchScore(scheme, effectiveProfile);
      return { scheme, score, reasons };
    }), [effectiveProfile]);

  // Filter + sort
  const filtered = useMemo(() => {
    return schemesWithScores
      .filter(({ scheme, score }) => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q ||
          scheme.name.toLowerCase().includes(q) ||
          scheme.nameMr.includes(q) ||
          scheme.tags.some(t => t.includes(q)) ||
          scheme.shortDesc.toLowerCase().includes(q);
        const matchCat = categoryFilter === 'all' || scheme.category === categoryFilter;
        const matchSuggested = !showSuggestedOnly || score > 20;
        return matchSearch && matchCat && matchSuggested;
      })
      .sort((a, b) => b.score - a.score);
  }, [schemesWithScores, searchQuery, categoryFilter, showSuggestedOnly]);

  const suggestedCount = schemesWithScores.filter(s => s.score > 20).length;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center shadow-md shadow-primary-500/20">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            {language === 'mr' ? 'सरकारी योजना' : language === 'hi' ? 'सरकारी योजनाएं' : 'Government Schemes'}
          </h2>
          <p className="text-xs font-semibold text-earth-500 mt-1 ml-13">
            {language === 'mr'
              ? `${SCHEMES.length} योजना उपलब्ध · ${suggestedCount} तुमच्यासाठी सुचवलेल्या`
              : `${SCHEMES.length} schemes available · ${suggestedCount} recommended for your profile`}
          </p>
        </div>
        <button
          onClick={() => setShowProfilePanel(p => !p)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-extrabold text-foreground hover:bg-earth-50 dark:hover:bg-earth-900 cursor-pointer transition-colors shadow-sm self-start"
        >
          <Sparkles className="w-4 h-4 text-primary-500" />
          {language === 'mr' ? 'प्रोफाइल-आधारित सूचना' : 'Profile Matching'}
          {showProfilePanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Profile Matching Panel ──────────────────────────────────────────── */}
      {showProfilePanel && (
        <div className="p-5 rounded-2xl border border-primary-500/20 bg-primary-50/30 dark:bg-primary-950/10 flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-black text-foreground">
                {language === 'mr' ? 'तुमचे प्रोफाइल — सूचना अद्ययावत करण्यासाठी' : 'Your Profile — Customize to get better suggestions'}
              </span>
            </div>
            <button onClick={() => setShowProfilePanel(false)} className="p-1 rounded-lg hover:bg-earth-100 dark:hover:bg-earth-900 cursor-pointer">
              <X className="w-4 h-4 text-earth-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-earth-500 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" />Land Holding (Hectares)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={profileLand}
                onChange={e => setProfileLand(e.target.value)}
                placeholder="e.g. 1.5"
                className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {profileLand && parseFloat(profileLand) <= 1 && (
                <span className="text-[10px] font-bold text-primary-600">👤 Marginal farmer — more schemes apply</span>
              )}
              {profileLand && parseFloat(profileLand) > 1 && parseFloat(profileLand) <= 2 && (
                <span className="text-[10px] font-bold text-primary-600">👤 Small farmer — good eligibility</span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background cursor-pointer" onClick={() => setProfileInsured(p => !p)}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${profileInsured ? 'bg-primary-600 border-primary-600' : 'border-earth-400'}`}>
                  {profileInsured && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs font-bold text-foreground">I have crop insurance</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background cursor-pointer" onClick={() => setProfileOrganic(p => !p)}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${profileOrganic ? 'bg-primary-600 border-primary-600' : 'border-earth-400'}`}>
                  {profileOrganic && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs font-bold text-foreground">I do organic farming</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-center">
              <div className={`p-4 rounded-xl border flex flex-col gap-1 ${suggestedCount > 0 ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20' : 'border-border'}`}>
                <div className="text-2xl font-black text-foreground">{suggestedCount}</div>
                <div className="text-[10px] font-black text-earth-500 uppercase tracking-wide">Schemes match your profile</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-grow sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
          <input
            type="text"
            placeholder={language === 'mr' ? 'योजना शोधा...' : 'Search schemes...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'income_support', 'crop_insurance', 'loan', 'equipment', 'subsidy', 'organic', 'irrigation'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-foreground text-background shadow-sm'
                  : 'border border-border text-earth-500 hover:text-foreground'
              }`}
            >
              {cat === 'all'
                ? (language === 'mr' ? 'सर्व' : 'All')
                : (language === 'mr' ? CAT_CONFIG[cat].labelMr : CAT_CONFIG[cat].label)}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested toggle */}
      {suggestedCount > 0 && (
        <button
          onClick={() => setShowSuggestedOnly(p => !p)}
          className={`self-start flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
            showSuggestedOnly
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
              : 'border border-primary-500/30 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {showSuggestedOnly
            ? (language === 'mr' ? 'सर्व योजना दाखवा' : 'Show All Schemes')
            : (language === 'mr' ? `${suggestedCount} सुचवलेल्या दाखवा` : `Show ${suggestedCount} Recommended`)}
        </button>
      )}

      <div className="text-xs font-bold text-earth-500">
        {filtered.length} {language === 'mr' ? 'योजना सापडल्या' : language === 'hi' ? 'योजनाएं मिलीं' : 'schemes found'}
      </div>

      {/* ── Scheme List ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        {filtered.map(({ scheme, score, reasons }) => (
          <SchemeCard
            key={scheme.id}
            scheme={scheme}
            language={language}
            matchScore={score}
            matchReasons={reasons}
          />
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center flex flex-col items-center gap-3 rounded-2xl border border-border bg-card">
            <Landmark className="w-12 h-12 text-earth-300" />
            <p className="text-sm font-extrabold text-earth-500">
              {language === 'mr' ? 'कोणतीही योजना सापडली नाही.' : 'No schemes found for your search.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Bottom Info Banner ───────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-50/30 dark:bg-amber-950/10 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <p className="text-xs font-black text-amber-700 dark:text-amber-400">
            {language === 'mr' ? 'महत्त्वाची टीप' : 'Important Note'}
          </p>
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-500 leading-relaxed">
            {language === 'mr'
              ? 'वरील माहिती शैक्षणिक हेतूसाठी आहे. अंतिम पात्रता आणि अटी-शर्ती अधिकृत सरकारी पोर्टलवर तपासा. अर्जासाठी नेहमी नजीकच्या कृषी कार्यालयाशी संपर्क करा.'
              : 'Information above is for educational purposes. Verify exact eligibility and terms on official government portals. Always consult your nearest Taluka Agriculture Officer before applying.'}
          </p>
        </div>
      </div>

    </div>
  );
}
