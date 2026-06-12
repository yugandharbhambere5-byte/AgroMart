'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, Search,
  MapPin, Filter, ArrowUpRight, ArrowDownRight, Star,
  BarChart3, ChevronUp, ChevronDown, Globe, Activity,
  Clock, IndianRupee, AlertCircle, CheckCircle, Edit3,
  Save, X, Plus, Trash2, Info, Zap, ShieldCheck
} from 'lucide-react';
import { useTranslation, Language } from '@/context/LanguageContext';
import { createClient } from '@/utils/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MarketRate {
  id: string;
  crop: string;
  cropHi: string;
  cropMr: string;
  category: string;
  unit: string;
  todayRate: number;
  yesterdayRate: number;
  weekHighRate: number;
  weekLowRate: number;
  mandi: string;
  state: string;
  quality: 'Premium' | 'Grade A' | 'Grade B' | 'Standard';
  lastUpdated: string;
  trending: 'up' | 'down' | 'stable';
  volume: string; // daily arrivals in tonnes
}

interface MandiTrend {
  name: string;
  state: string;
  activity: 'High' | 'Medium' | 'Low';
  topCrop: string;
  avgPrice: number;
  change: number;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const INITIAL_RATES: MarketRate[] = [
  {
    id: '1', crop: 'Organic Durum Wheat', cropHi: 'जैविक गेहूं', cropMr: 'सेंद्रिय गहू',
    category: 'Grains', unit: '/Quintal', todayRate: 2450, yesterdayRate: 2380,
    weekHighRate: 2510, weekLowRate: 2290, mandi: 'Nashik APMC', state: 'Maharashtra',
    quality: 'Premium', lastUpdated: '09:30 AM', trending: 'up', volume: '142 T'
  },
  {
    id: '2', crop: 'Russet Potatoes', cropHi: 'आलू', cropMr: 'बटाटा',
    category: 'Vegetables', unit: '/Quintal', todayRate: 1520, yesterdayRate: 1560,
    weekHighRate: 1620, weekLowRate: 1480, mandi: 'Pune Mandi', state: 'Maharashtra',
    quality: 'Grade A', lastUpdated: '10:15 AM', trending: 'down', volume: '285 T'
  },
  {
    id: '3', crop: 'Vine-Ripened Tomatoes', cropHi: 'टमाटर', cropMr: 'टोमॅटो',
    category: 'Vegetables', unit: '/Quintal', todayRate: 3500, yesterdayRate: 3200,
    weekHighRate: 3800, weekLowRate: 2900, mandi: 'Manchar Mandi', state: 'Maharashtra',
    quality: 'Premium', lastUpdated: '09:45 AM', trending: 'up', volume: '198 T'
  },
  {
    id: '4', crop: 'Golden Sweet Corn', cropHi: 'मक्का', cropMr: 'मका',
    category: 'Grains', unit: '/Quintal', todayRate: 1850, yesterdayRate: 1850,
    weekHighRate: 1920, weekLowRate: 1780, mandi: 'Solapur APMC', state: 'Maharashtra',
    quality: 'Grade A', lastUpdated: '10:00 AM', trending: 'stable', volume: '95 T'
  },
  {
    id: '5', crop: 'Basmati Rice', cropHi: 'बासमती चावल', cropMr: 'बासमती तांदूळ',
    category: 'Grains', unit: '/Quintal', todayRate: 4800, yesterdayRate: 4750,
    weekHighRate: 4950, weekLowRate: 4600, mandi: 'Amritsar Grain Market', state: 'Punjab',
    quality: 'Premium', lastUpdated: '08:50 AM', trending: 'up', volume: '320 T'
  },
  {
    id: '6', crop: 'Red Onion', cropHi: 'लाल प्याज', cropMr: 'लाल कांदा',
    category: 'Vegetables', unit: '/Quintal', todayRate: 2100, yesterdayRate: 2350,
    weekHighRate: 2600, weekLowRate: 1900, mandi: 'Lasalgaon APMC', state: 'Maharashtra',
    quality: 'Grade A', lastUpdated: '11:00 AM', trending: 'down', volume: '512 T'
  },
  {
    id: '7', crop: 'Soybean', cropHi: 'सोयाबीन', cropMr: 'सोयाबीन',
    category: 'Oilseeds', unit: '/Quintal', todayRate: 4650, yesterdayRate: 4580,
    weekHighRate: 4750, weekLowRate: 4420, mandi: 'Latur APMC', state: 'Maharashtra',
    quality: 'Grade A', lastUpdated: '09:20 AM', trending: 'up', volume: '210 T'
  },
  {
    id: '8', crop: 'Green Chilli', cropHi: 'हरी मिर्च', cropMr: 'हिरवी मिरची',
    category: 'Spices', unit: '/Quintal', todayRate: 6200, yesterdayRate: 5800,
    weekHighRate: 6800, weekLowRate: 5200, mandi: 'Guntur APMC', state: 'Andhra Pradesh',
    quality: 'Premium', lastUpdated: '10:30 AM', trending: 'up', volume: '78 T'
  },
  {
    id: '9', crop: 'Cotton (Long Staple)', cropHi: 'कपास', cropMr: 'कापूस',
    category: 'Cash Crops', unit: '/Quintal', todayRate: 7200, yesterdayRate: 7200,
    weekHighRate: 7450, weekLowRate: 6950, mandi: 'Yavatmal APMC', state: 'Maharashtra',
    quality: 'Premium', lastUpdated: '09:00 AM', trending: 'stable', volume: '165 T'
  },
  {
    id: '10', crop: 'Alphonso Mango', cropHi: 'अल्फांसो आम', cropMr: 'हापूस आंबा',
    category: 'Fruits', unit: '/Dozen', todayRate: 420, yesterdayRate: 390,
    weekHighRate: 480, weekLowRate: 360, mandi: 'Ratnagiri Mandi', state: 'Maharashtra',
    quality: 'Premium', lastUpdated: '07:30 AM', trending: 'up', volume: '42 T'
  },
  {
    id: '11', crop: 'Turmeric (Finger)', cropHi: 'हल्दी', cropMr: 'हळद',
    category: 'Spices', unit: '/Quintal', todayRate: 14500, yesterdayRate: 14800,
    weekHighRate: 15200, weekLowRate: 13900, mandi: 'Sangli APMC', state: 'Maharashtra',
    quality: 'Premium', lastUpdated: '08:15 AM', trending: 'down', volume: '55 T'
  },
  {
    id: '12', crop: 'Sugarcane', cropHi: 'गन्ना', cropMr: 'उसाचे ऊस',
    category: 'Cash Crops', unit: '/Tonne', todayRate: 3150, yesterdayRate: 3150,
    weekHighRate: 3200, weekLowRate: 3100, mandi: 'Kolhapur', state: 'Maharashtra',
    quality: 'Standard', lastUpdated: '08:00 AM', trending: 'stable', volume: '820 T'
  },
];

const MANDI_TRENDS: MandiTrend[] = [
  { name: 'Lasalgaon APMC', state: 'Maharashtra', activity: 'High', topCrop: 'Onion', avgPrice: 2100, change: -10.6 },
  { name: 'Nashik APMC', state: 'Maharashtra', activity: 'High', topCrop: 'Wheat', avgPrice: 2450, change: 2.9 },
  { name: 'Amritsar Grain Market', state: 'Punjab', activity: 'High', topCrop: 'Basmati Rice', avgPrice: 4800, change: 1.05 },
  { name: 'Guntur APMC', state: 'Andhra Pradesh', activity: 'Medium', topCrop: 'Green Chilli', avgPrice: 6200, change: 6.9 },
  { name: 'Sangli APMC', state: 'Maharashtra', activity: 'Medium', topCrop: 'Turmeric', avgPrice: 14500, change: -2.0 },
];

const CATEGORIES = ['All', 'Grains', 'Vegetables', 'Fruits', 'Oilseeds', 'Spices', 'Cash Crops'];

// ─── Helper Utilities ─────────────────────────────────────────────────────────

const getChangePercent = (today: number, yesterday: number) => {
  if (yesterday === 0) return 0;
  return ((today - yesterday) / yesterday) * 100;
};

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const qualityColors: Record<string, string> = {
  Premium: 'bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400',
  'Grade A': 'bg-harvest-100 dark:bg-harvest-950/40 text-harvest-700 dark:text-harvest-400',
  'Grade B': 'bg-earth-100 dark:bg-earth-900 text-earth-600 dark:text-earth-400',
  Standard: 'bg-earth-100 dark:bg-earth-900 text-earth-500',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function RateCard({ rate, onEdit, isAdmin, lang }: {
  rate: MarketRate;
  onEdit: (r: MarketRate) => void;
  isAdmin: boolean;
  lang: Language;
}) {
  const change = getChangePercent(rate.todayRate, rate.yesterdayRate);
  const isUp = rate.trending === 'up';
  const isDown = rate.trending === 'down';
  const cropName = lang === 'mr' ? rate.cropMr : lang === 'hi' ? rate.cropHi : rate.crop;

  return (
    <div className="group relative bg-card border border-border rounded-2xl p-5 hover:border-primary-500/40 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-0.5 flex flex-col gap-4">
      {/* Top row: crop name + trending badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${qualityColors[rate.quality]}`}>
            {rate.quality}
          </span>
          <h3 className="font-extrabold text-foreground text-base leading-tight mt-0.5">{cropName}</h3>
          <div className="flex items-center gap-1 text-[10px] font-bold text-earth-500">
            <MapPin className="w-3 h-3" />
            <span>{rate.mandi}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${
          isUp ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
          : isDown ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
          : 'bg-earth-100 dark:bg-earth-900 text-earth-500'
        }`}>
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : isDown ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          <span>{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
        </div>
      </div>

      {/* Today's Rate — big bold */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-black text-foreground tracking-tight">{formatINR(rate.todayRate)}</div>
          <div className="text-[10px] font-bold text-earth-500 mt-0.5">{rate.unit} · {rate.category}</div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-black flex items-center gap-0.5 justify-end ${isUp ? 'text-emerald-500' : isDown ? 'text-red-500' : 'text-earth-400'}`}>
            {isUp ? <ArrowUpRight className="w-4 h-4" /> : isDown ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            {formatINR(Math.abs(rate.todayRate - rate.yesterdayRate))}
          </div>
          <div className="text-[9px] font-bold text-earth-500 text-right">vs yesterday</div>
        </div>
      </div>

      {/* Week range bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-[9px] font-bold text-earth-500 uppercase tracking-wider">
          <span>52-wk Range</span>
          <span className="text-earth-400">{formatINR(rate.weekLowRate)} – {formatINR(rate.weekHighRate)}</span>
        </div>
        <div className="h-1.5 bg-earth-100 dark:bg-earth-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all"
            style={{
              marginLeft: `${((rate.weekLowRate - rate.weekLowRate) / (rate.weekHighRate - rate.weekLowRate)) * 100}%`,
              width: `${((rate.todayRate - rate.weekLowRate) / (rate.weekHighRate - rate.weekLowRate)) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-bold">
          <span className="text-red-400">Low</span>
          <span className="text-emerald-500">High</span>
        </div>
      </div>

      {/* Bottom metadata */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-1 text-[10px] font-bold text-earth-500">
          <Activity className="w-3 h-3" />
          <span>Vol: {rate.volume}</span>
          <span className="mx-1">·</span>
          <Clock className="w-3 h-3" />
          <span>{rate.lastUpdated}</span>
        </div>
        {isAdmin && (
          <button
            onClick={() => onEdit(rate)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-earth-100 dark:hover:bg-earth-900 text-earth-500 hover:text-primary-600 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function MandiTrendCard({ mandi }: { mandi: MandiTrend }) {
  const actColors: Record<string, string> = {
    High: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600',
    Medium: 'bg-harvest-100 dark:bg-harvest-950/40 text-harvest-600',
    Low: 'bg-earth-100 dark:bg-earth-900 text-earth-500',
  };
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary-500/30 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600">
          <MapPin className="w-4.5 h-4.5" />
        </div>
        <div>
          <div className="font-extrabold text-sm text-foreground leading-tight">{mandi.name}</div>
          <div className="text-[10px] font-bold text-earth-500">{mandi.state} · Top: {mandi.topCrop}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${actColors[mandi.activity]}`}>
          {mandi.activity}
        </span>
        <div className={`flex items-center gap-0.5 text-xs font-black ${mandi.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {mandi.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {Math.abs(mandi.change).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

// ─── Admin Edit Modal ─────────────────────────────────────────────────────────

function EditRateModal({ rate, onSave, onClose }: {
  rate: MarketRate;
  onSave: (updated: MarketRate) => void;
  onClose: () => void;
}) {
  const [todayRate, setTodayRate] = useState(rate.todayRate.toString());
  const [yesterdayRate, setYesterdayRate] = useState(rate.yesterdayRate.toString());
  const [weekHigh, setWeekHigh] = useState(rate.weekHighRate.toString());
  const [weekLow, setWeekLow] = useState(rate.weekLowRate.toString());
  const [volume, setVolume] = useState(rate.volume);
  const [quality, setQuality] = useState(rate.quality);

  const handleSave = () => {
    const updated: MarketRate = {
      ...rate,
      todayRate: parseFloat(todayRate) || rate.todayRate,
      yesterdayRate: parseFloat(yesterdayRate) || rate.yesterdayRate,
      weekHighRate: parseFloat(weekHigh) || rate.weekHighRate,
      weekLowRate: parseFloat(weekLow) || rate.weekLowRate,
      volume,
      quality: quality as MarketRate['quality'],
      lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      trending: parseFloat(todayRate) > parseFloat(yesterdayRate) ? 'up'
        : parseFloat(todayRate) < parseFloat(yesterdayRate) ? 'down' : 'stable',
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-foreground">Edit Market Rate</h3>
            <p className="text-xs font-bold text-earth-500 mt-0.5">{rate.crop} · {rate.mandi}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-earth-100 dark:hover:bg-earth-900 text-earth-500 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Today's Rate (₹)</label>
              <input
                type="number"
                value={todayRate}
                onChange={e => setTodayRate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Yesterday's Rate (₹)</label>
              <input
                type="number"
                value={yesterdayRate}
                onChange={e => setYesterdayRate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Week High (₹)</label>
              <input
                type="number"
                value={weekHigh}
                onChange={e => setWeekHigh(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Week Low (₹)</label>
              <input
                type="number"
                value={weekLow}
                onChange={e => setWeekLow(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Daily Volume</label>
              <input
                type="text"
                value={volume}
                onChange={e => setVolume(e.target.value)}
                placeholder="e.g. 150 T"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Quality Grade</label>
              <select
                value={quality}
                onChange={e => setQuality(e.target.value as MarketRate['quality'])}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option>Premium</option>
                <option>Grade A</option>
                <option>Grade B</option>
                <option>Standard</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-border text-earth-600 dark:text-earth-400 font-bold text-sm hover:bg-earth-50 dark:hover:bg-earth-900 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-primary-600/20"
          >
            <Save className="w-4 h-4" />
            Save Rate
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add New Rate Modal ───────────────────────────────────────────────────────

function AddRateModal({ onAdd, onClose }: { onAdd: (r: MarketRate) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    crop: '', cropHi: '', cropMr: '', category: 'Vegetables', unit: '/Quintal',
    todayRate: '', yesterdayRate: '', weekHighRate: '', weekLowRate: '',
    mandi: '', state: 'Maharashtra', quality: 'Grade A' as MarketRate['quality'], volume: '',
  });

  const handleAdd = () => {
    if (!form.crop || !form.todayRate || !form.mandi) {
      alert('Please fill crop name, today\'s rate and mandi.');
      return;
    }
    const today = parseFloat(form.todayRate);
    const yesterday = parseFloat(form.yesterdayRate) || today;
    const newRate: MarketRate = {
      id: `custom-${Date.now()}`,
      crop: form.crop, cropHi: form.cropHi || form.crop, cropMr: form.cropMr || form.crop,
      category: form.category, unit: form.unit,
      todayRate: today, yesterdayRate: yesterday,
      weekHighRate: parseFloat(form.weekHighRate) || today * 1.05,
      weekLowRate: parseFloat(form.weekLowRate) || today * 0.95,
      mandi: form.mandi, state: form.state,
      quality: form.quality, volume: form.volume || '100 T',
      lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      trending: today > yesterday ? 'up' : today < yesterday ? 'down' : 'stable',
    };
    onAdd(newRate);
  };

  const f = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-foreground">Add New Crop Rate</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-earth-100 dark:hover:bg-earth-900 text-earth-500 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <label className="text-xs font-black text-foreground mb-1 block">Crop Name (English)*</label>
              <input value={form.crop} onChange={e => f('crop', e.target.value)} placeholder="e.g. Mustard Seeds"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Hindi (हिंदी)</label>
              <input value={form.cropHi} onChange={e => f('cropHi', e.target.value)} placeholder="सरसों"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Marathi (मराठी)</label>
              <input value={form.cropMr} onChange={e => f('cropMr', e.target.value)} placeholder="मोहरी"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Category</label>
              <select value={form.category} onChange={e => f('category', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Today's Rate (₹)*</label>
              <input type="number" value={form.todayRate} onChange={e => f('todayRate', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Yesterday's Rate (₹)</label>
              <input type="number" value={form.yesterdayRate} onChange={e => f('yesterdayRate', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Week High (₹)</label>
              <input type="number" value={form.weekHighRate} onChange={e => f('weekHighRate', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Week Low (₹)</label>
              <input type="number" value={form.weekLowRate} onChange={e => f('weekLowRate', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Mandi / Market*</label>
              <input value={form.mandi} onChange={e => f('mandi', e.target.value)} placeholder="e.g. Nagpur APMC"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">State</label>
              <input value={form.state} onChange={e => f('state', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Unit</label>
              <select value={form.unit} onChange={e => f('unit', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                <option>/Quintal</option><option>/Kg</option><option>/Tonne</option><option>/Dozen</option><option>/Box</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-foreground mb-1 block">Quality Grade</label>
              <select value={form.quality} onChange={e => f('quality', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                <option>Premium</option><option>Grade A</option><option>Grade B</option><option>Standard</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-earth-600 dark:text-earth-400 font-bold text-sm hover:bg-earth-50 dark:hover:bg-earth-900 transition-all cursor-pointer">Cancel</button>
          <button onClick={handleAdd} className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-primary-600/20">
            <Plus className="w-4 h-4" />Add Rate
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Table View ───────────────────────────────────────────────────────────────

function RatesTable({ rates, onEdit, isAdmin, lang }: {
  rates: MarketRate[]; onEdit: (r: MarketRate) => void; isAdmin: boolean; lang: Language;
}) {
  const [sortKey, setSortKey] = useState<'todayRate' | 'change' | 'crop'>('todayRate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...rates].sort((a, b) => {
    let valA = sortKey === 'change' ? getChangePercent(a.todayRate, a.yesterdayRate)
      : sortKey === 'crop' ? (lang === 'mr' ? a.cropMr : lang === 'hi' ? a.cropHi : a.crop).localeCompare(lang === 'mr' ? b.cropMr : lang === 'hi' ? b.cropHi : b.crop)
      : a.todayRate;
    let valB = sortKey === 'change' ? getChangePercent(b.todayRate, b.yesterdayRate)
      : sortKey === 'crop' ? 0
      : b.todayRate;
    if (sortKey === 'crop') return sortDir === 'asc' ? (valA as number) : -(valA as number);
    return sortDir === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }: { col: typeof sortKey }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp className={`w-2.5 h-2.5 -mb-0.5 ${sortKey === col && sortDir === 'asc' ? 'text-primary-500' : 'text-earth-300'}`} />
      <ChevronDown className={`w-2.5 h-2.5 ${sortKey === col && sortDir === 'desc' ? 'text-primary-500' : 'text-earth-300'}`} />
    </span>
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-earth-50 dark:bg-earth-950">
          <tr>
            <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-earth-500 cursor-pointer hover:text-primary-600" onClick={() => handleSort('crop')}>
              Crop <SortIcon col="crop" />
            </th>
            <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-wider text-earth-500 cursor-pointer hover:text-primary-600" onClick={() => handleSort('todayRate')}>
              Today <SortIcon col="todayRate" />
            </th>
            <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-wider text-earth-500">Yesterday</th>
            <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-wider text-earth-500 cursor-pointer hover:text-primary-600" onClick={() => handleSort('change')}>
              Change <SortIcon col="change" />
            </th>
            <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-wider text-earth-500">High</th>
            <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-wider text-earth-500">Low</th>
            <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-wider text-earth-500">Mandi</th>
            <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-wider text-earth-500">Volume</th>
            {isAdmin && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map(rate => {
            const change = getChangePercent(rate.todayRate, rate.yesterdayRate);
            const cropName = lang === 'mr' ? rate.cropMr : lang === 'hi' ? rate.cropHi : rate.crop;
            return (
              <tr key={rate.id} className="hover:bg-earth-50/50 dark:hover:bg-earth-950/30 transition-colors group">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${rate.trending === 'up' ? 'bg-emerald-500' : rate.trending === 'down' ? 'bg-red-500' : 'bg-earth-400'}`} />
                    <div>
                      <div className="font-extrabold text-foreground text-sm">{cropName}</div>
                      <div className="text-[9px] font-bold text-earth-500">{rate.category} · {rate.unit}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right font-extrabold text-foreground">{formatINR(rate.todayRate)}</td>
                <td className="px-4 py-3.5 text-right font-bold text-earth-500">{formatINR(rate.yesterdayRate)}</td>
                <td className="px-4 py-3.5 text-right">
                  <span className={`font-black text-xs flex items-center justify-end gap-0.5 ${change > 0 ? 'text-emerald-500' : change < 0 ? 'text-red-500' : 'text-earth-400'}`}>
                    {change > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : change < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                    {change > 0 ? '+' : ''}{change.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs">{formatINR(rate.weekHighRate)}</td>
                <td className="px-4 py-3.5 text-right font-bold text-red-500 text-xs">{formatINR(rate.weekLowRate)}</td>
                <td className="px-4 py-3.5 text-center text-[11px] font-bold text-earth-600 dark:text-earth-400">{rate.mandi}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-earth-100 dark:bg-earth-900 text-earth-600 dark:text-earth-400 text-[10px] font-black">{rate.volume}</span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3.5 text-center">
                    <button onClick={() => onEdit(rate)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-earth-100 dark:hover:bg-earth-900 text-earth-500 hover:text-primary-600 cursor-pointer transition-all">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LiveMarketRates() {
  const { language } = useTranslation();
  const supabase = createClient();
  const [rates, setRates] = useState<MarketRate[]>(INITIAL_RATES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingRate, setEditingRate] = useState<MarketRate | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [trendFilter, setTrendFilter] = useState<'all' | 'up' | 'down' | 'stable'>('all');

  // Load admin state from active Supabase session
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (user?.user_metadata?.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.warn('Admin session check failed:', err);
      }
    };
    checkUser();
  }, [supabase]);

  // Auto-refresh simulation every 3 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      simulateRateUpdates();
    }, 180000);
    return () => clearInterval(timer);
  }, []);

  // Load admin state from localStorage (mock user role)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('agro-mart-mock-user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setIsAdmin(user?.user_metadata?.role === 'admin');
        } catch {}
      }
      // Also load any saved custom rates
      const savedRates = localStorage.getItem('agromart-market-rates');
      if (savedRates) {
        try {
          setRates(JSON.parse(savedRates));
        } catch {}
      }
    }
  }, []);

  const simulateRateUpdates = useCallback(() => {
    setRates(prev => prev.map(r => {
      const fluctuation = (Math.random() - 0.48) * 0.015; // slight upward bias
      const newRate = Math.round(r.todayRate * (1 + fluctuation));
      return {
        ...r,
        yesterdayRate: r.todayRate,
        todayRate: newRate,
        weekHighRate: Math.max(r.weekHighRate, newRate),
        weekLowRate: Math.min(r.weekLowRate, newRate),
        trending: newRate > r.todayRate ? 'up' : newRate < r.todayRate ? 'down' : 'stable',
        lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
    }));
    setLastRefreshed(new Date());
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      simulateRateUpdates();
      setIsRefreshing(false);
    }, 800);
  };

  const pushNotification = (type: string, text: string, role: 'farmer' | 'buyer') => {
    const logStr = typeof window !== 'undefined' ? localStorage.getItem('agromart_notifications_log') : null;
    const logs = logStr ? JSON.parse(logStr) : [];
    const newNotif = {
      id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      text,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      role
    };
    const updatedLogs = [newNotif, ...logs];
    localStorage.setItem('agromart_notifications_log', JSON.stringify(updatedLogs));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'agromart_notifications_log',
      newValue: JSON.stringify(updatedLogs)
    }));
  };

  const handleSaveRate = (updated: MarketRate) => {
    const newRates = rates.map(r => r.id === updated.id ? updated : r);
    setRates(newRates);
    localStorage.setItem('agromart-market-rates', JSON.stringify(newRates));
    setEditingRate(null);

    // Notify both farmer and buyer of market updates
    const msg = `Market update: ${updated.crop} rate at ${updated.mandi} is now ₹${updated.todayRate}/Quintal.`;
    pushNotification('market_update', msg, 'farmer');
    pushNotification('market_update', msg, 'buyer');
  };

  const handleAddRate = (newRate: MarketRate) => {
    const newRates = [newRate, ...rates];
    setRates(newRates);
    localStorage.setItem('agromart-market-rates', JSON.stringify(newRates));
    setShowAddModal(false);

    // Notify both farmer and buyer of market updates
    const msg = `Market update: ${newRate.crop} rate at ${newRate.mandi} is now ₹${newRate.todayRate}/Quintal.`;
    pushNotification('market_update', msg, 'farmer');
    pushNotification('market_update', msg, 'buyer');
  };

  const handleDeleteRate = (id: string) => {
    if (!confirm('Delete this rate entry?')) return;
    const newRates = rates.filter(r => r.id !== id);
    setRates(newRates);
    localStorage.setItem('agromart-market-rates', JSON.stringify(newRates));
  };

  const filtered = rates.filter(r => {
    const cropName = language === 'mr' ? r.cropMr : language === 'hi' ? r.cropHi : r.crop;
    const matchSearch = cropName.toLowerCase().includes(search.toLowerCase()) ||
      r.mandi.toLowerCase().includes(search.toLowerCase()) ||
      r.state.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || r.category === categoryFilter;
    const matchTrend = trendFilter === 'all' || r.trending === trendFilter;
    return matchSearch && matchCat && matchTrend;
  });

  // Summary stats
  const topGainer = rates.length > 0 ? [...rates].sort((a, b) => getChangePercent(b.todayRate, b.yesterdayRate) - getChangePercent(a.todayRate, a.yesterdayRate))[0] : null;
  const topLoser = rates.length > 0 ? [...rates].sort((a, b) => getChangePercent(a.todayRate, a.yesterdayRate) - getChangePercent(b.todayRate, b.yesterdayRate))[0] : null;
  const upCount = rates.filter(r => r.trending === 'up').length;
  const downCount = rates.filter(r => r.trending === 'down').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 font-bold text-xs mb-3">
            <Zap className="w-3.5 h-3.5" />
            Live Mandi Rates • Auto-updates every 3 min
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            {language === 'mr' ? 'थेट बाजारभाव' : language === 'hi' ? 'लाइव मंडी भाव' : 'Live Market Rates'}
          </h1>
          <p className="text-sm font-semibold text-earth-500 mt-1.5 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            {language === 'mr' ? 'शेवटचे अपडेट:' : language === 'hi' ? 'अंतिम अपडेट:' : 'Last updated:'}
            {' '}{lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            {' · '}{rates.length} crops · {MANDI_TRENDS.length} mandis
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm transition-all cursor-pointer shadow-md shadow-primary-600/20"
            >
              <Plus className="w-4 h-4" /> Add Rate
            </button>
          )}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-earth-600 dark:text-earth-400 font-bold text-sm hover:border-primary-500/50 transition-all cursor-pointer disabled:opacity-60 ${isRefreshing ? 'pointer-events-none' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {language === 'mr' ? 'ताजे करा' : language === 'hi' ? 'ताज़ा करें' : 'Refresh'}
          </button>
          {/* Admin toggle (demo) */}
          <button
            onClick={() => setIsAdmin(v => !v)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
              isAdmin ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400' : 'border-border bg-card text-earth-500 hover:border-earth-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {isAdmin ? 'Admin Mode' : 'Admin Mode'}
          </button>
        </div>
      </div>

      {/* ── Summary Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 rounded-2xl p-4">
          <div className="text-[10px] font-black uppercase text-emerald-600 tracking-wider mb-1">
            {language === 'mr' ? 'वाढत आहेत' : language === 'hi' ? 'बढ रहे हैं' : 'Rising Today'}
          </div>
          <div className="text-2xl font-black text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-5 h-5" />{upCount}
          </div>
          <div className="text-[10px] font-bold text-emerald-600/70 mt-0.5">of {rates.length} crops</div>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 rounded-2xl p-4">
          <div className="text-[10px] font-black uppercase text-red-500 tracking-wider mb-1">
            {language === 'mr' ? 'घसरत आहेत' : language === 'hi' ? 'गिर रहे हैं' : 'Falling Today'}
          </div>
          <div className="text-2xl font-black text-red-500 flex items-center gap-1">
            <TrendingDown className="w-5 h-5" />{downCount}
          </div>
          <div className="text-[10px] font-bold text-red-500/70 mt-0.5">of {rates.length} crops</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-[10px] font-black uppercase text-earth-500 tracking-wider mb-1">
            {language === 'mr' ? 'आजचा सर्वाधिक वाढलेला' : language === 'hi' ? 'आज का टॉप गेनर' : 'Top Gainer'}
          </div>
          {topGainer ? (
            <>
              <div className="text-base font-black text-emerald-600 leading-tight">
                {language === 'mr' ? topGainer.cropMr : language === 'hi' ? topGainer.cropHi : topGainer.crop}
              </div>
              <div className="text-xs font-bold text-emerald-500 mt-0.5 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{getChangePercent(topGainer.todayRate, topGainer.yesterdayRate).toFixed(1)}%
              </div>
            </>
          ) : (
            <div className="text-sm font-bold text-earth-400">N/A</div>
          )}
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-[10px] font-black uppercase text-earth-500 tracking-wider mb-1">
            {language === 'mr' ? 'आजचा सर्वाधिक घसरलेला' : language === 'hi' ? 'आज का टॉप लूज़र' : 'Top Loser'}
          </div>
          {topLoser ? (
            <>
              <div className="text-base font-black text-red-500 leading-tight">
                {language === 'mr' ? topLoser.cropMr : language === 'hi' ? topLoser.cropHi : topLoser.crop}
              </div>
              <div className="text-xs font-bold text-red-500 mt-0.5 flex items-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {getChangePercent(topLoser.todayRate, topLoser.yesterdayRate).toFixed(1)}%
              </div>
            </>
          ) : (
            <div className="text-sm font-bold text-earth-400">N/A</div>
          )}
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Rates */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-450 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={language === 'mr' ? 'पीक किंवा मंडी शोधा...' : language === 'hi' ? 'फसल या मंडी खोजें...' : 'Search crops or mandi...'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-sm"
              />
            </div>

            {/* View toggle */}
            <div className="flex bg-earth-100 dark:bg-earth-900 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'cards' ? 'bg-card text-foreground shadow-sm' : 'text-earth-500 hover:text-foreground'}`}
              >
                <BarChart3 className="w-3.5 h-3.5" />Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-card text-foreground shadow-sm' : 'text-earth-500 hover:text-foreground'}`}
              >
                <Filter className="w-3.5 h-3.5" />Table
              </button>
            </div>
          </div>

          {/* Category + Trend filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  categoryFilter === c ? 'bg-primary-600 text-white shadow-md' : 'bg-card border border-border text-earth-600 dark:text-earth-400 hover:border-primary-500/50'
                }`}
              >
                {c}
              </button>
            ))}
            <div className="w-px h-6 bg-border self-center mx-1" />
            {(['all', 'up', 'down', 'stable'] as const).map(tr => (
              <button
                key={tr}
                onClick={() => setTrendFilter(tr)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  trendFilter === tr
                    ? tr === 'up' ? 'bg-emerald-600 text-white' : tr === 'down' ? 'bg-red-500 text-white' : tr === 'stable' ? 'bg-earth-500 text-white' : 'bg-primary-600 text-white'
                    : 'bg-card border border-border text-earth-600 dark:text-earth-400 hover:border-primary-500/50'
                }`}
              >
                {tr === 'up' ? <TrendingUp className="w-3 h-3" /> : tr === 'down' ? <TrendingDown className="w-3 h-3" /> : tr === 'stable' ? <Minus className="w-3 h-3" /> : null}
                {tr === 'all' ? (language === 'mr' ? 'सर्व' : language === 'hi' ? 'सभी' : 'All Trends') : tr === 'up' ? (language === 'mr' ? 'वाढत' : language === 'hi' ? 'बढ़त' : 'Rising') : tr === 'down' ? (language === 'mr' ? 'घसरत' : language === 'hi' ? 'गिरावट' : 'Falling') : (language === 'mr' ? 'स्थिर' : language === 'hi' ? 'स्थिर' : 'Stable')}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-earth-500">
              {filtered.length} {language === 'mr' ? 'पिके दिसत आहेत' : language === 'hi' ? 'फसलें दिख रही हैं' : 'crops shown'}
            </span>
            {isAdmin && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-[10px] font-black">
                <ShieldCheck className="w-3 h-3" /> Admin: Click any card to edit rates
              </div>
            )}
          </div>

          {/* Rates Grid or Table */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.length > 0 ? filtered.map(rate => (
                <div key={rate.id} className="relative">
                  <RateCard rate={rate} onEdit={setEditingRate} isAdmin={isAdmin} lang={language} />
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteRate(rate.id)}
                      className="absolute top-3 right-3 opacity-0 hover:opacity-100 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 text-earth-400 hover:text-red-500 transition-all cursor-pointer z-10"
                      style={{ opacity: undefined }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )) : (
                <div className="sm:col-span-2 py-16 text-center">
                  <AlertCircle className="w-10 h-10 text-earth-300 mx-auto mb-3" />
                  <p className="font-bold text-earth-500">
                    {language === 'mr' ? 'कोणतेही पीक सापडले नाही.' : language === 'hi' ? 'कोई फसल नहीं मिली।' : 'No crops found matching your filters.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            filtered.length > 0 ? (
              <RatesTable rates={filtered} onEdit={setEditingRate} isAdmin={isAdmin} lang={language} />
            ) : (
              <div className="py-16 text-center">
                <AlertCircle className="w-10 h-10 text-earth-300 mx-auto mb-3" />
                <p className="font-bold text-earth-500">No crops found matching your filters.</p>
              </div>
            )
          )}
        </div>

        {/* Right: Trending Mandis + Legend */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Trending Mandis */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <Star className="w-4.5 h-4.5 text-harvest-500" />
              <div>
                <h3 className="font-black text-foreground text-base">
                  {language === 'mr' ? 'ट्रेंडिंग मंड्या' : language === 'hi' ? 'ट्रेंडिंग मंडी' : 'Trending Markets'}
                </h3>
                <p className="text-[10px] font-bold text-earth-500">
                  {language === 'mr' ? 'आजची सर्वाधिक सक्रिय बाजारपेठ' : language === 'hi' ? 'आज की सबसे सक्रिय मंडियां' : 'Today\'s most active mandis'}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {MANDI_TRENDS.map(m => <MandiTrendCard key={m.name} mandi={m} />)}
            </div>
          </div>

          {/* Legend / Data Source Info */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary-500" />
              <h3 className="font-black text-foreground text-sm">
                {language === 'mr' ? 'माहितीचा स्रोत' : language === 'hi' ? 'डेटा स्रोत' : 'Data Sources'}
              </h3>
            </div>
            <div className="flex flex-col gap-2 text-[11px] font-semibold text-earth-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>APMC Mandi APIs (Agmarknet)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Admin-managed custom entries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>AgroMart verified partner mandis</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                <span>Rates shown per Quintal unless noted</span>
              </div>
            </div>
          </div>

          {/* Quality Grade Legend */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="font-black text-foreground text-sm">Quality Grades</h3>
            <div className="flex flex-col gap-1.5">
              {(['Premium', 'Grade A', 'Grade B', 'Standard'] as const).map(q => (
                <div key={q} className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${qualityColors[q]}`}>{q}</span>
                  <span className="text-[10px] font-semibold text-earth-500">
                    {q === 'Premium' ? 'Certified organic / export-quality' : q === 'Grade A' ? 'Uniform size, low defects' : q === 'Grade B' ? 'Minor defects acceptable' : 'Standard local market grade'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      {editingRate && <EditRateModal rate={editingRate} onSave={handleSaveRate} onClose={() => setEditingRate(null)} />}
      {showAddModal && <AddRateModal onAdd={handleAddRate} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
