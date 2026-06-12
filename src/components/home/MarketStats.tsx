'use client';

import React, { useState } from 'react';
import { TrendingUp, UserCheck, Scale, Compass } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface CropPriceData {
  name: string;
  currentPrice: string;
  change: string;
  changeType: 'up' | 'down';
  points: number[];
  months: string[];
}

export function MarketStats() {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState<string>('wheat');

  const cropMarketData: Record<string, CropPriceData> = {
    wheat: {
      name: t.stats.cropWheat,
      currentPrice: '₹24,500 / Ton',
      change: `+14.2% ${t.stats.changeMonth}`,
      changeType: 'up',
      points: [40, 60, 45, 75, 90, 85, 110],
      months: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    },
    potato: {
      name: t.stats.cropPotato,
      currentPrice: '₹15,200 / Ton',
      change: `+6.8% ${t.stats.changeMonth}`,
      changeType: 'up',
      points: [80, 75, 85, 95, 90, 105, 120],
      months: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    },
    tomato: {
      name: t.stats.cropTomato,
      currentPrice: '₹35,000 / Ton',
      change: `-3.1% ${t.stats.changeWeek}`,
      changeType: 'down',
      points: [110, 100, 115, 130, 120, 95, 90],
      months: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    },
  };

  const activeCrop = cropMarketData[selectedCrop];

  const generateSvgPath = (points: number[]) => {
    const width = 500;
    const height = 160;
    const step = width / (points.length - 1);
    const mapped = points.map(p => height - (p * 1.1));
    
    let path = `M 0 ${mapped[0]}`;
    for (let i = 1; i < mapped.length; i++) {
      path += ` L ${i * step} ${mapped[i]}`;
    }
    return path;
  };

  const generateSvgAreaPath = (points: number[]) => {
    const width = 500;
    const height = 160;
    const step = width / (points.length - 1);
    const mapped = points.map(p => height - (p * 1.1));
    
    let path = `M 0 ${height} L 0 ${mapped[0]}`;
    for (let i = 1; i < mapped.length; i++) {
      path += ` L ${i * step} ${mapped[i]}`;
    }
    path += ` L ${width} ${height} Z`;
    return path;
  };

  return (
    <section id="stats" className="py-24 bg-card border-t border-b border-border transition-colors duration-300 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: General Stats Counters */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-black text-primary-600 uppercase tracking-widest">{t.stats.badge}</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {t.stats.title}
              </p>
              <p className="text-base text-earth-550 dark:text-earth-300 font-medium">
                {t.stats.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5 text-primary-600 dark:text-primary-400">
                  <UserCheck className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-wider">{t.stats.metricFarmers}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-foreground">14,250+</div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5 text-primary-600 dark:text-primary-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-wider">{t.stats.metricVolume}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-foreground">₹200 Cr+</div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5 text-primary-600 dark:text-primary-400">
                  <Scale className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-wider">{t.stats.metricTons}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-foreground">450k TN</div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5 text-primary-600 dark:text-primary-400">
                  <Compass className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-wider">{t.stats.metricDelivery}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-foreground">98.4%</div>
              </div>

            </div>
          </div>

          {/* Right: Dynamic Crop pricing index */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-background border border-border flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <h3 className="text-lg font-black text-foreground">{t.stats.liveIndex}</h3>
                <p className="text-xs text-earth-550 dark:text-earth-400 font-semibold">{t.stats.liveIndexSub}</p>
              </div>

              {/* Crop selectors */}
              <div className="flex gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setSelectedCrop('wheat')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    selectedCrop === 'wheat'
                      ? 'bg-primary-600 text-white'
                      : 'bg-earth-100 dark:bg-earth-900 text-earth-650 hover:bg-earth-200 dark:hover:bg-earth-850'
                  }`}
                >
                  {t.stats.cropWheat.split(' ').pop()}
                </button>
                <button
                  onClick={() => setSelectedCrop('potato')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    selectedCrop === 'potato'
                      ? 'bg-primary-600 text-white'
                      : 'bg-earth-100 dark:bg-earth-900 text-earth-650 hover:bg-earth-200 dark:hover:bg-earth-850'
                  }`}
                >
                  {t.stats.cropPotato.split(' ').pop()}
                </button>
                <button
                  onClick={() => setSelectedCrop('tomato')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    selectedCrop === 'tomato'
                      ? 'bg-primary-600 text-white'
                      : 'bg-earth-100 dark:bg-earth-900 text-earth-650 hover:bg-earth-200 dark:hover:bg-earth-850'
                  }`}
                >
                  {t.stats.cropTomato.split(' ').pop()}
                </button>
              </div>
            </div>

            {/* Price Detail */}
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs font-bold text-earth-500 uppercase tracking-wider">{activeCrop.name}</div>
                <div className="text-3xl font-black text-foreground mt-1">{activeCrop.currentPrice}</div>
              </div>
              <div
                className={`px-3.5 py-1.5 rounded-full text-xs font-black ${
                  activeCrop.changeType === 'up'
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                }`}
              >
                {activeCrop.change}
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="relative h-40 w-full mt-4 bg-earth-50/50 dark:bg-earth-950/20 rounded-2xl overflow-hidden border border-border/40">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d={generateSvgAreaPath(activeCrop.points)}
                  fill="url(#chartGrad)"
                />
                <path
                  d={generateSvgPath(activeCrop.points)}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Months labels */}
            <div className="flex justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-earth-450 mt-1">
              {activeCrop.months.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
