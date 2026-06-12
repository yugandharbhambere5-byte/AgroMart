'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator, TrendingUp, IndianRupee, MapPin, Scale, ArrowRight,
  TrendingDown, Info, Package, Tractor, AlertCircle, BarChart, CheckCircle
} from 'lucide-react';

export interface CropListingForCalc {
  id: string;
  name: string;
  quantity: number;
  expected_price: number;
  unit: string;
}

interface ProfitCalculatorProps {
  language?: string;
  crops: CropListingForCalc[];
}

// Simulated active market prices for comparison
const MOCK_MARKET_RATES: Record<string, number> = {
  'Vine-Ripened Organic Tomatoes': 3800,
  'Russet Baking Potatoes': 1600,
  'Golden Sweet Corn': 1900,
};

export default function ProfitCalculator({ language = 'en', crops = [] }: ProfitCalculatorProps) {
  const [selectedCropId, setSelectedCropId] = useState<string>(crops[0]?.id || '');
  const [transportCostPerQuintal, setTransportCostPerQuintal] = useState<string>('50');
  const [otherDeductions, setOtherDeductions] = useState<string>('0');

  const selectedCrop = useMemo(() => crops.find(c => c.id === selectedCropId), [crops, selectedCropId]);

  const calculations = useMemo(() => {
    if (!selectedCrop) return null;

    const qty = selectedCrop.quantity;
    const userPrice = selectedCrop.expected_price;
    const marketPrice = MOCK_MARKET_RATES[selectedCrop.name] || (userPrice * 1.05); // Default to slightly higher market price if not mocked
    
    const transportTotal = qty * (Number(transportCostPerQuintal) || 0);
    const deductionsTotal = Number(otherDeductions) || 0;

    const expectedRevenue = qty * userPrice;
    const marketRevenue = qty * marketPrice;

    const netEarnings = expectedRevenue - transportTotal - deductionsTotal;
    const marketNetEarnings = marketRevenue - transportTotal - deductionsTotal;

    const differenceFromMarket = expectedRevenue - marketRevenue;
    const isBelowMarket = differenceFromMarket < 0;

    return {
      qty,
      userPrice,
      marketPrice,
      expectedRevenue,
      marketRevenue,
      transportTotal,
      deductionsTotal,
      netEarnings,
      marketNetEarnings,
      differenceFromMarket,
      isBelowMarket,
    };
  }, [selectedCrop, transportCostPerQuintal, otherDeductions]);

  if (!selectedCrop || !calculations) return null;

  return (
    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-card border border-border">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">
            {language === 'mr' ? 'नफा आणि उत्पन्न कॅल्क्युलेटर' : language === 'hi' ? 'लाभ कैलकुलेटर' : 'Harvest Profit Calculator'}
          </h2>
          <p className="text-xs font-bold text-earth-500">
            {language === 'mr' 
              ? 'बाजारातील किमतींशी तुलना करून तुमच्या संभाव्य कमाईचा अंदाज घ्या.' 
              : 'Estimate net earnings by comparing your expected price with current market rates.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Inputs */}
        <div className="lg:col-span-5 flex flex-col gap-5 bg-earth-50/50 dark:bg-earth-900/20 p-5 rounded-2xl border border-border">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wide flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary-500" />
            {language === 'mr' ? 'पीक आणि खर्च तपशील' : 'Crop & Expense Details'}
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-earth-500 uppercase tracking-widest">
              {language === 'mr' ? 'पीक निवडा' : 'Select Crop Listing'}
            </label>
            <select 
              value={selectedCropId}
              onChange={e => setSelectedCropId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              {crops.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.quantity} {c.unit})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-earth-500 uppercase tracking-widest text-left">Your Price (₹)</label>
              <div className="px-4 py-3 rounded-xl border border-border bg-background/50 text-sm font-bold text-foreground opacity-80 cursor-not-allowed">
                ₹{selectedCrop.expected_price.toLocaleString()} /{selectedCrop.unit}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-earth-500 uppercase tracking-widest text-left">Total Qty</label>
              <div className="px-4 py-3 rounded-xl border border-border bg-background/50 text-sm font-bold text-foreground opacity-80 cursor-not-allowed">
                {selectedCrop.quantity} {selectedCrop.unit}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-earth-500 uppercase tracking-widest flex items-center gap-1.5">
              <Tractor className="w-3 h-3" />
              {language === 'mr' ? 'वाहतूक खर्च (प्रति क्विंटल)' : 'Transport Cost (per Quintal)'}
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
              <input 
                type="number" min="0"
                value={transportCostPerQuintal}
                onChange={e => setTransportCostPerQuintal(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-earth-500 uppercase tracking-widest flex items-center gap-1.5">
              <Package className="w-3 h-3" />
              {language === 'mr' ? 'इतर वजावट / कमिशन' : 'Other Deductions / Commission'}
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
              <input 
                type="number" min="0"
                value={otherDeductions}
                onChange={e => setOtherDeductions(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Net Earnings Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <div className="absolute -bottom-6 -right-4 opacity-20 rotate-12">
                <IndianRupee className="w-32 h-32" />
              </div>
              <div>
                <p className="text-xs font-black text-emerald-100 uppercase tracking-widest">
                  {language === 'mr' ? 'अपेक्षित निव्वळ नफा' : 'Expected Net Earnings'}
                </p>
                <div className="flex items-end gap-2 mt-2">
                  <h3 className="text-4xl font-black relative z-10 leading-none">
                    ₹{calculations.netEarnings.toLocaleString('en-IN')}
                  </h3>
                </div>
              </div>
              <p className="text-[10px] font-bold text-emerald-100 flex items-center gap-1 mt-4">
                <CheckCircle className="w-3 h-3" /> After ₹{(calculations.transportTotal + calculations.deductionsTotal).toLocaleString()} expenses
              </p>
            </div>

            {/* Market Comparison Card */}
            <div className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between min-h-[140px]">
              <div>
                <p className="text-xs font-black text-earth-500 uppercase tracking-widest flex items-center justify-between">
                  {language === 'mr' ? 'बाजारभावानुसार उत्पन्न' : 'Market Rate Potential'}
                  <BarChart className="w-4 h-4 text-primary-500" />
                </p>
                <div className="flex items-end gap-2 mt-2">
                  <h3 className="text-3xl font-black text-foreground leading-none">
                    ₹{calculations.marketNetEarnings.toLocaleString('en-IN')}
                  </h3>
                </div>
              </div>
              
              <div className={`mt-4 flex items-center gap-1.5 text-[10px] font-extrabold px-2 py-1.5 rounded-lg w-max ${
                calculations.isBelowMarket ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-500' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-500'
              }`}>
                {calculations.isBelowMarket ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    Market pays ₹{Math.abs(calculations.differenceFromMarket).toLocaleString()} more
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3.5 h-3.5" />
                    Your price is ₹{calculations.differenceFromMarket.toLocaleString()} above market
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="mt-2 bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-earth-50/50 dark:bg-earth-900/10 flex items-center justify-between">
              <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
                {language === 'mr' ? 'कॅल्क्युलेशन ब्रेकडाऊन' : 'Calculation Breakdown'}
              </h4>
            </div>
            <div className="flex flex-col p-2">
              <div className="flex items-center justify-between p-3 rounded-xl text-sm font-semibold">
                <span className="text-earth-600 dark:text-earth-400">Total Gross Revenue (Qty × Price)</span>
                <span className="font-bold text-foreground">₹{calculations.expectedRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl text-sm font-semibold">
                <span className="text-earth-600 dark:text-earth-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> Transport Expenses
                </span>
                <span className="font-bold text-red-500">- ₹{calculations.transportTotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl text-sm font-semibold">
                <span className="text-earth-600 dark:text-earth-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Other Deductions
                </span>
                <span className="font-bold text-red-500">- ₹{calculations.deductionsTotal.toLocaleString()}</span>
              </div>
              <div className="mx-3 my-1 border-t border-border border-dashed" />
              <div className="flex items-center justify-between p-3 rounded-xl text-sm">
                <span className="font-black text-foreground uppercase tracking-wider">Total Net Earnings</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-500">₹{calculations.netEarnings.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


