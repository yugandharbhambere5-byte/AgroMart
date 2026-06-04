'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Mail, Phone, User, Sprout, ShoppingBag, ShieldAlert, Loader2, ArrowRight, ArrowLeft, Check, MapPin, BadgePercent } from 'lucide-react';
import { useTranslation, Language } from '@/context/LanguageContext';

interface CropOption {
  id: string;
  en: string;
  mr: string;
  hi: string;
}

const cropOptions: CropOption[] = [
  { id: 'wheat', en: 'Wheat', mr: 'गहू', hi: 'गेहूं' },
  { id: 'potato', en: 'Potato', mr: 'बटाटा', hi: 'आलू' },
  { id: 'tomato', en: 'Tomato', mr: 'टोमॅटो', hi: 'टमाटर' },
  { id: 'rice', en: 'Rice', mr: 'भात', hi: 'चावल' },
  { id: 'cotton', en: 'Cotton', mr: 'कापूस', hi: 'कपास' },
  { id: 'sugarcane', en: 'Sugarcane', mr: 'ऊस', hi: 'गन्ना' },
];

function RegisterForm() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard state
  const [step, setStep] = useState(1);

  // Form Fields State
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [fullName, setFullName] = useState('');
  const [preferredLang, setPreferredLang] = useState<Language>('en');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Location fields
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  const [village, setVillage] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  // Farmer Specific fields
  const [farmSize, setFarmSize] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [farmingType, setFarmingType] = useState('organic');

  // Buyer Specific fields
  const [shopName, setShopName] = useState('');
  const [businessType, setBusinessType] = useState('retailer');
  const [gstNumber, setGstNumber] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'farmer' || roleParam === 'buyer') {
      setRole(roleParam);
    }
    if (language) {
      setPreferredLang(language);
    }
  }, [searchParams, language]);

  // Local helper translation dictionaries inside register to prevent compilation key issues
  const localT = {
    en: {
      stepOf: 'Step',
      stepTitles: ['Account Info', 'Location Details', 'Profile Details', 'Review & Submit'],
      langSelect: 'Preferred Language',
      stateLabel: 'State / Region',
      districtLabel: 'District',
      talukaLabel: 'Taluka / Sub-district',
      villageLabel: 'Village / City',
      addressLabel: 'Full Address',
      pincodeLabel: 'Pincode',
      farmSizeLabel: 'Farm Size (in Acres)',
      farmingTypeLabel: 'Farming Type',
      organic: 'Organic',
      chemical: 'Chemical (Fertilizers)',
      mixed: 'Mixed / Traditional',
      cropsLabel: 'Select Main Crops you grow',
      shopNameLabel: 'Shop / Business Name',
      businessTypeLabel: 'Business Type',
      wholesaler: 'Wholesaler / Trader',
      retailer: 'Retailer / Shopkeeper',
      commission: 'Commission Agent',
      exporter: 'Exporter',
      gstLabel: 'GST Number (Optional)',
      shopAddressLabel: 'Shop Physical Address',
      mapsLabel: 'Google Maps Link',
      reviewTitle: 'Confirm Registration Details',
      submitBtn: 'Register & Send Verification OTP',
      nextBtn: 'Next Step',
      prevBtn: 'Back',
      invalidCrops: 'Please select at least one main crop.',
    },
    mr: {
      stepOf: 'टप्पा',
      stepTitles: ['खाते माहिती', 'पत्ता आणि ठिकाण', 'व्यवसाय प्रोफाइल', 'पुनरावलोकन'],
      langSelect: 'पसंतीची भाषा',
      stateLabel: 'राज्य',
      districtLabel: 'जिल्हा',
      talukaLabel: 'तालुका',
      villageLabel: 'गाव / शहर',
      addressLabel: 'पूर्ण पत्ता',
      pincodeLabel: 'पिनकोड',
      farmSizeLabel: 'शेती आकारमान (एकर मध्ये)',
      farmingTypeLabel: 'शेतीचा प्रकार',
      organic: 'सेंद्रिय (Organic)',
      chemical: 'रासायनिक (Chemical)',
      mixed: 'मिश्र / पारंपरिक',
      cropsLabel: 'तुम्ही पिकवणारी मुख्य पिके निवडा',
      shopNameLabel: 'दुकान / व्यवसायाचे नाव',
      businessTypeLabel: 'व्यवसायाचा प्रकार',
      wholesaler: 'घाऊक व्यापारी (Wholesaler)',
      retailer: 'किरकोळ विक्रेता (Retailer)',
      commission: 'अडतदार / एजंट',
      exporter: 'निर्यातदार (Exporter)',
      gstLabel: 'जीएसटी (GST) नंबर (पर्यायी)',
      shopAddressLabel: 'दुकानचा पत्ता',
      mapsLabel: 'गुगल मॅप्स (Google Maps) लिंक',
      reviewTitle: 'नोंदणी तपशीलांची पुष्टी करा',
      submitBtn: 'नोंदणी करा आणि पडताळणी OTP पाठवा',
      nextBtn: 'पुढील टप्पा',
      prevBtn: 'मागे',
      invalidCrops: 'कृपया किमान एक मुख्य पीक निवडा.',
    },
    hi: {
      stepOf: 'चरण',
      stepTitles: ['खाता विवरण', 'पता और स्थान', 'प्रोफाइल विवरण', 'पुष्टि करें'],
      langSelect: 'पसंदीदा भाषा',
      stateLabel: 'राज्य',
      districtLabel: 'जिला',
      talukaLabel: 'तहसील / तालुका',
      villageLabel: 'गांव / शहर',
      addressLabel: 'पूरा पता',
      pincodeLabel: 'पिनकोड',
      farmSizeLabel: 'खेत का आकार (एकड़ में)',
      farmingTypeLabel: 'खेती का प्रकार',
      organic: 'जैविक (Organic)',
      chemical: 'रासायनिक (Chemical)',
      mixed: 'मिश्रित / पारंपरिक',
      cropsLabel: 'उगाई जाने वाली मुख्य फसलें चुनें',
      shopNameLabel: 'दुकान / व्यापार का नाम',
      businessTypeLabel: 'व्यापार का प्रकार',
      wholesaler: 'थोक विक्रेता (Wholesaler)',
      retailer: 'खुदरा विक्रेता (Retailer)',
      commission: 'कमीशन एजेंट / आढ़ती',
      exporter: 'निर्यातक (Exporter)',
      gstLabel: 'जीएसटी (GST) नंबर (वैकल्पिक)',
      shopAddressLabel: 'दुकान का पता',
      mapsLabel: 'गूगल मैप्स (Google Maps) लिंक',
      reviewTitle: 'पंजीकरण विवरण की पुष्टि करें',
      submitBtn: 'पंजीकरण करें और सत्यापन OTP भेजें',
      nextBtn: 'आगे बढ़ें',
      prevBtn: 'पीछे जाएं',
      invalidCrops: 'कृपया कम से कम एक मुख्य फसल चुनें।',
    }
  };

  const l = localT[language as Language] || localT.en;

  const handleCropToggle = (cropId: string) => {
    if (selectedCrops.includes(cropId)) {
      setSelectedCrops(selectedCrops.filter(c => c !== cropId));
    } else {
      setSelectedCrops([...selectedCrops, cropId]);
    }
  };

  const handleNextStep = () => {
    setErrorMsg(null);

    // Validation per step
    if (step === 1) {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      const contactVal = contactMethod === 'email' ? email.trim() : phone.trim();
      if (!contactVal) {
        setErrorMsg(`Please enter your ${contactMethod === 'email' ? 'email address' : 'mobile number'}.`);
        return;
      }
    } else if (step === 2) {
      if (!stateName.trim() || !district.trim() || !taluka.trim() || !village.trim() || !pincode.trim() || !address.trim()) {
        setErrorMsg('Please fill in all geographical address fields.');
        return;
      }
    } else if (step === 3) {
      if (role === 'farmer') {
        if (!farmSize.trim()) {
          setErrorMsg('Please enter your farm size.');
          return;
        }
        if (selectedCrops.length === 0) {
          setErrorMsg(l.invalidCrops);
          return;
        }
      } else {
        if (!shopName.trim() || !shopAddress.trim()) {
          setErrorMsg('Please fill in your shop name and address.');
          return;
        }
      }
    }

    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setStep(step - 1);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const contactVal = contactMethod === 'email' ? email.trim() : phone.trim();

    try {
      // Build user metadata for storage
      const metadata: any = {
        role,
        full_name: fullName,
        preferred_language: preferredLang,
        state: stateName,
        district,
        taluka,
        village,
        address,
        pincode,
      };

      if (role === 'farmer') {
        metadata.farm_size = farmSize;
        metadata.main_crops = selectedCrops;
        metadata.farming_type = farmingType;
      } else {
        metadata.shop_name = shopName;
        metadata.business_type = businessType;
        metadata.gst_number = gstNumber || null;
        metadata.shop_address = shopAddress;
        metadata.google_maps_link = googleMapsLink || null;
      }

      if (contactMethod === 'email') {
        const { error } = await supabase.auth.signInWithOtp({
          email: contactVal,
          options: {
            shouldCreateUser: true,
            data: metadata,
          },
        });
        if (error) throw error;
        router.push(`/verify?email=${encodeURIComponent(contactVal)}&isSignUp=true`);
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: contactVal,
          options: {
            shouldCreateUser: true,
            data: metadata,
          },
        });
        if (error) throw error;
        router.push(`/verify?phone=${encodeURIComponent(contactVal)}&isSignUp=true`);
      }
    } catch (err: any) {
      console.error('Registration OTP Dispatch Error:', err);
      setErrorMsg(err.message || 'Failed to dispatch registration passcode. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl shadow-primary-950/5">
      
      {/* Wizard Step Progress Tracker */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-earth-500 uppercase tracking-widest mb-3">
          <span>{l.stepOf} {step} / 4</span>
          <span>{l.stepTitles[step - 1]}</span>
        </div>
        <div className="h-2 w-full bg-earth-100 dark:bg-earth-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-sm font-bold flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* FORM CONTENTS BY STEP */}
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">

        {/* STEP 1: Account Setup */}
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Choose Role Card Toggle */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-black text-foreground">{t.auth.joinAsLabel}</span>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  className={`p-5 rounded-2xl border-2 text-left flex flex-col gap-3 transition-all cursor-pointer ${
                    role === 'farmer'
                      ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/10 ring-2 ring-primary-500/20'
                      : 'border-border hover:border-earth-300 bg-background'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${role === 'farmer' ? 'bg-primary-600 text-white' : 'bg-earth-100 text-earth-605 dark:bg-earth-900'}`}>
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-foreground">{t.auth.farmerCardTitle}</div>
                    <div className="text-[10px] font-bold text-earth-500 uppercase mt-0.5">{t.auth.farmerCardSub}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`p-5 rounded-2xl border-2 text-left flex flex-col gap-3 transition-all cursor-pointer ${
                    role === 'buyer'
                      ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/10 ring-2 ring-primary-500/20'
                      : 'border-border hover:border-earth-300 bg-background'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${role === 'buyer' ? 'bg-primary-600 text-white' : 'bg-earth-100 text-earth-605 dark:bg-earth-900'}`}>
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-foreground">{t.auth.buyerCardTitle}</div>
                    <div className="text-[10px] font-bold text-earth-500 uppercase mt-0.5">{t.auth.buyerCardSub}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="wizard-name" className="text-sm font-bold text-foreground">
                {t.auth.fullNameLabel}
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-4 w-5 h-5 text-earth-450 pointer-events-none" />
                <input
                  id="wizard-name"
                  type="text"
                  placeholder={t.auth.fullNamePlaceholder}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  required
                />
              </div>
            </div>

            {/* Language Selection */}
            <div className="flex flex-col gap-2">
              <label htmlFor="wizard-lang" className="text-sm font-bold text-foreground">
                {l.langSelect}
              </label>
              <select
                id="wizard-lang"
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value as Language)}
                className="w-full px-4 py-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold cursor-pointer"
              >
                <option value="en">English</option>
                <option value="mr">मराठी</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>

            {/* Contact Switch Toggle */}
            <div className="flex p-1 rounded-2xl bg-earth-100 dark:bg-earth-900 border border-border mt-2">
              <button
                type="button"
                onClick={() => setContactMethod('email')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  contactMethod === 'email'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-earth-550 hover:text-foreground'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{t.auth.emailMethod}</span>
              </button>
              <button
                type="button"
                onClick={() => setContactMethod('phone')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  contactMethod === 'phone'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-earth-550 hover:text-foreground'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t.auth.phoneMethod}</span>
              </button>
            </div>

            {/* Contact Input */}
            {contactMethod === 'email' ? (
              <div className="flex flex-col gap-2">
                <label htmlFor="wizard-email" className="text-sm font-bold text-foreground">
                  {t.auth.emailLabel}
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-earth-450 pointer-events-none" />
                  <input
                    id="wizard-email"
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label htmlFor="wizard-phone" className="text-sm font-bold text-foreground">
                  {t.auth.phoneLabel}
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-4 w-5 h-5 text-earth-450 pointer-events-none" />
                  <input
                    id="wizard-phone"
                    type="tel"
                    placeholder="+911234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                    required
                  />
                </div>
                <span className="text-xs font-bold text-earth-500 pl-1">
                  {t.auth.phoneCodeTip}
                </span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Location Information */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="loc-state" className="text-sm font-bold text-foreground">{l.stateLabel}</label>
                <input
                  id="loc-state"
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="loc-district" className="text-sm font-bold text-foreground">{l.districtLabel}</label>
                <input
                  id="loc-district"
                  type="text"
                  placeholder="e.g. Pune"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="loc-taluka" className="text-sm font-bold text-foreground">{l.talukaLabel}</label>
                <input
                  id="loc-taluka"
                  type="text"
                  placeholder="e.g. Haveli"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="loc-village" className="text-sm font-bold text-foreground">{l.villageLabel}</label>
                <input
                  id="loc-village"
                  type="text"
                  placeholder="e.g. Loni Kalbhor"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="loc-pincode" className="text-sm font-bold text-foreground">{l.pincodeLabel}</label>
              <input
                id="loc-pincode"
                type="text"
                maxLength={6}
                placeholder="412201"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="loc-address" className="text-sm font-bold text-foreground">{l.addressLabel}</label>
              <textarea
                id="loc-address"
                rows={2}
                placeholder="House No, Landmark, Street info"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold resize-none"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 3: Role Specific Profiles */}
        {step === 3 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {role === 'farmer' ? (
              // Farmer subform
              <>
                <div className="flex flex-col gap-2">
                  <label htmlFor="farm-size" className="text-sm font-bold text-foreground">{l.farmSizeLabel}</label>
                  <input
                    id="farm-size"
                    type="text"
                    placeholder="e.g. 5"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="farming-type" className="text-sm font-bold text-foreground">{l.farmingTypeLabel}</label>
                  <select
                    id="farming-type"
                    value={farmingType}
                    onChange={(e) => setFarmingType(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold cursor-pointer"
                  >
                    <option value="organic">{l.organic}</option>
                    <option value="chemical">{l.chemical}</option>
                    <option value="mix">{l.mixed}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-sm font-bold text-foreground">{l.cropsLabel}</span>
                  <div className="grid grid-cols-2 gap-3">
                    {cropOptions.map((crop) => {
                      const isSelected = selectedCrops.includes(crop.id);
                      return (
                        <button
                          key={crop.id}
                          type="button"
                          onClick={() => handleCropToggle(crop.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between font-bold text-sm transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50/15 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                              : 'border-border bg-background text-earth-650'
                          }`}
                        >
                          <span>{crop[language as Language] || crop.en}</span>
                          {isSelected && <Check className="w-4 h-4 text-primary-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              // Buyer subform
              <>
                <div className="flex flex-col gap-2">
                  <label htmlFor="shop-name" className="text-sm font-bold text-foreground">{l.shopNameLabel}</label>
                  <input
                    id="shop-name"
                    type="text"
                    placeholder="e.g. Green Earth Wholesale Traders"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="business-type" className="text-sm font-bold text-foreground">{l.businessTypeLabel}</label>
                  <select
                    id="business-type"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold cursor-pointer"
                  >
                    <option value="wholesaler">{l.wholesaler}</option>
                    <option value="retailer">{l.retailer}</option>
                    <option value="commission_agent">{l.commission}</option>
                    <option value="exporter">{l.exporter}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="shop-gst" className="text-sm font-bold text-foreground">{l.gstLabel}</label>
                  <input
                    id="shop-gst"
                    type="text"
                    placeholder="27AAAAA0000A1Z5"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="shop-address" className="text-sm font-bold text-foreground">{l.shopAddressLabel}</label>
                  <textarea
                    id="shop-address"
                    rows={2}
                    placeholder="Market yard Shop No. or Depot location"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold resize-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="shop-maps" className="text-sm font-bold text-foreground">{l.mapsLabel}</label>
                  <input
                    id="shop-maps"
                    type="url"
                    placeholder="https://goo.gl/maps/..."
                    value={googleMapsLink}
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 4: Review Details */}
        {step === 4 && (
          <div className="flex flex-col gap-6 animate-fade-in text-left">
            <h3 className="text-lg font-black text-foreground border-b border-border pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              <span>{l.reviewTitle}</span>
            </h3>

            <div className="p-5 rounded-2xl bg-earth-50 dark:bg-earth-950 border border-border flex flex-col gap-4.5 text-sm font-semibold">
              <div className="grid grid-cols-2 border-b border-earth-100 dark:border-earth-900 pb-3">
                <span className="text-earth-500">Name:</span>
                <span className="text-foreground text-right">{fullName}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-earth-100 dark:border-earth-900 pb-3">
                <span className="text-earth-500">Role:</span>
                <span className="text-foreground text-right capitalize">{role === 'farmer' ? t.auth.farmerCardTitle : t.auth.buyerCardTitle}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-earth-100 dark:border-earth-900 pb-3">
                <span className="text-earth-500">Location:</span>
                <span className="text-foreground text-right">{village}, {taluka}, {district}, {stateName} ({pincode})</span>
              </div>

              {role === 'farmer' ? (
                <>
                  <div className="grid grid-cols-2 border-b border-earth-100 dark:border-earth-900 pb-3">
                    <span className="text-earth-500">{l.farmSizeLabel.split(' ')[0]}:</span>
                    <span className="text-foreground text-right">{farmSize} Acres</span>
                  </div>
                  <div className="grid grid-cols-2 border-b border-earth-100 dark:border-earth-900 pb-3">
                    <span className="text-earth-500">{l.farmingTypeLabel}:</span>
                    <span className="text-foreground text-right capitalize">{farmingType}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-earth-500">Main Crops:</span>
                    <span className="text-foreground text-right capitalize truncate max-w-[200px]">
                      {selectedCrops.map(cid => cropOptions.find(o => o.id === cid)?.[language as Language] || cid).join(', ')}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 border-b border-earth-100 dark:border-earth-900 pb-3">
                    <span className="text-earth-500">{l.shopNameLabel.split(' ')[0]}:</span>
                    <span className="text-foreground text-right">{shopName}</span>
                  </div>
                  <div className="grid grid-cols-2 border-b border-earth-100 dark:border-earth-900 pb-3">
                    <span className="text-earth-500">{l.businessTypeLabel}:</span>
                    <span className="text-foreground text-right capitalize">{businessType}</span>
                  </div>
                  {gstNumber && (
                    <div className="grid grid-cols-2">
                      <span className="text-earth-500">GSTIN:</span>
                      <span className="text-foreground text-right">{gstNumber}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              onClick={handleRegisterSubmit}
              type="button"
              disabled={loading}
              className="w-full py-4.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-lg shadow-md shadow-primary-600/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t.common.loading}</span>
                </>
              ) : (
                <>
                  <span>{l.submitBtn}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Action Controls Back & Next Buttons */}
        {step < 4 && (
          <div className="flex gap-4 mt-4 border-t border-border pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 px-6 py-4.5 rounded-xl border border-border text-foreground font-extrabold text-base transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{l.prevBtn}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleNextStep}
              className="flex-1 flex items-center justify-center gap-1.5 px-6 py-4.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-base transition-colors cursor-pointer shadow-md"
            >
              <span>{l.nextBtn}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-primary-50/20 to-background dark:from-primary-950/10">
      
      {/* Brand logo */}
      <Link href="/" className="mb-8 flex items-center gap-2 group">
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
          <Sprout className="w-5 h-5" />
        </div>
        <span className="text-lg font-black tracking-tight text-foreground">
          Agro<span className="text-primary-500">Mart</span>
        </span>
      </Link>

      <Suspense fallback={
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-xl flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
