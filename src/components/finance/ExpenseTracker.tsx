'use client';

import React, { useState, useMemo } from 'react';
import {
  IndianRupee, Plus, Filter, Search, TrendingUp, TrendingDown,
  Sprout, Tractor, Zap, Users, Package, Calendar, MoreVertical,
  CheckCircle, X, Download, BarChart3, PieChart, Activity
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExpenseCategory = 'seed' | 'fertilizer' | 'labour' | 'transport' | 'utility' | 'equipment' | 'other';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  cropId: string;
  cropName: string;
  description: string;
  vendor?: string;
}

export interface CropOption {
  id: string;
  name: string;
}

interface ExpenseTrackerProps {
  language?: string;
  crops: CropOption[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; labelMr: string; icon: React.ElementType; color: string; bg: string }> = {
  seed: { label: 'Seeds & Plants', labelMr: 'बियाणे आणि रोपे', icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-950/40' },
  fertilizer: { label: 'Fertilizers & Pesticides', labelMr: 'खते आणि कीटकनाशके', icon: Package, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-950/40' },
  labour: { label: 'Labour Cost', labelMr: 'मजुरी खर्च', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-950/40' },
  transport: { label: 'Transport', labelMr: 'वाहतूक खर्च', icon: Tractor, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950/40' },
  utility: { label: 'Electricity & Water', labelMr: 'वीज आणि पाणी', icon: Zap, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-950/40' },
  equipment: { label: 'Equipment Rent/Buy', labelMr: 'उपकरणे भाड्याने/खरेदी', icon: Tractor, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-950/40' },
  other: { label: 'Other', labelMr: 'इतर', icon: Activity, color: 'text-earth-600', bg: 'bg-earth-100 dark:bg-earth-900/40' },
};

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const generateMockExpenses = (crops: CropOption[]): Expense[] => {
  if (crops.length === 0) return [];
  const now = new Date();
  return [
    {
      id: 'e1',
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'fertilizer',
      amount: 4500,
      cropId: crops[0].id,
      cropName: crops[0].name,
      description: 'Urea and DAP combo',
      vendor: 'Kisan Krishi Kendra'
    },
    {
      id: 'e2',
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'labour',
      amount: 2400,
      cropId: crops[0].id,
      cropName: crops[0].name,
      description: 'Weeding labour (4 workers x 2 days)',
    },
    {
      id: 'e3',
      date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'seed',
      amount: 8500,
      cropId: crops[1]?.id || crops[0].id,
      cropName: crops[1]?.name || crops[0].name,
      description: 'High yield hybrid seeds',
    },
    {
      id: 'e4',
      date: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'utility',
      amount: 1200,
      cropId: 'general',
      cropName: 'Farm General',
      description: 'Monthly electricity bill for pump',
    },
    {
      id: 'e5',
      date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'transport',
      amount: 3500,
      cropId: crops[0].id,
      cropName: crops[0].name,
      description: 'Tractor rent for ploughing',
    }
  ];
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExpenseTracker({ language = 'en', crops = [] }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>(generateMockExpenses(crops));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterCrop, setFilterCrop] = useState<string>('all');

  // Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('fertilizer');
  const [formAmount, setFormAmount] = useState('');
  const [formCropId, setFormCropId] = useState(crops[0]?.id || 'general');
  const [formDescription, setFormDescription] = useState('');

  // ─── Calculations ─────────────────────────────────────────────────────────

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => filterCrop === 'all' || e.cropId === filterCrop)
      .filter(e => {
        if (filterMonth === 'all') return true;
        const eMonth = new Date(e.date).getMonth().toString();
        return eMonth === filterMonth;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filterCrop, filterMonth]);

  const totalInvestment = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryBreakdown = useMemo(() => {
    const bd: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      bd[e.category] = (bd[e.category] || 0) + e.amount;
    });
    return Object.entries(bd)
      .map(([cat, amt]) => ({ category: cat as ExpenseCategory, amount: amt }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || isNaN(Number(formAmount))) return;

    const selectedCrop = crops.find(c => c.id === formCropId);
    
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date: formDate,
      category: formCategory,
      amount: Number(formAmount),
      cropId: formCropId,
      cropName: formCropId === 'general' ? 'Farm General' : (selectedCrop?.name || 'Unknown Crop'),
      description: formDescription,
    };

    setExpenses(prev => [newExpense, ...prev]);
    setIsAddModalOpen(false);
    setFormAmount('');
    setFormDescription('');
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border">
        <div>
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            {language === 'mr' ? 'स्मार्ट खर्च ट्रॅकर' : language === 'hi' ? 'स्मार्ट व्यय ट्रैकर' : 'Smart Expense Tracker'}
          </h2>
          <p className="text-sm font-semibold text-earth-500 mt-1 ml-13">
            {language === 'mr' ? 'तुमच्या शेतीतील सर्व खर्चाचा मागोवा घ्या आणि विश्लेषण करा.' : 'Track and analyze all your farm investments and daily expenses.'}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-extrabold transition-all shadow-md shadow-primary-500/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          {language === 'mr' ? 'खर्च जोडा' : 'Add Expense'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Metrics & Charts */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Total Investment Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-card to-emerald-50/10 dark:to-emerald-950/10 border border-emerald-500/20 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <IndianRupee className="w-24 h-24 text-emerald-500" />
            </div>
            <p className="text-xs font-black text-earth-500 uppercase tracking-widest relative z-10">
              {language === 'mr' ? 'एकूण गुंतवणूक' : 'Total Investment'}
            </p>
            <h3 className="text-4xl font-black text-foreground relative z-10">
              ₹{totalInvestment.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 relative z-10">
              <TrendingUp className="w-3 h-3" /> Based on current filters
            </p>
          </div>

          {/* Category Breakdown */}
          <div className="p-6 rounded-3xl bg-card border border-border flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-earth-400" />
              <h4 className="text-sm font-black text-foreground uppercase tracking-wider">
                {language === 'mr' ? 'खर्चाची विभागणी' : 'Expense Breakdown'}
              </h4>
            </div>
            {categoryBreakdown.length > 0 ? (
              <div className="flex flex-col gap-3">
                {categoryBreakdown.map((item, i) => {
                  const cfg = CATEGORY_CONFIG[item.category];
                  const Icon = cfg.icon;
                  const pct = Math.round((item.amount / totalInvestment) * 100);
                  
                  return (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                          {language === 'mr' ? cfg.labelMr : cfg.label}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-earth-500">{pct}%</span>
                          <span>₹{item.amount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-earth-100 dark:bg-earth-900 rounded-full overflow-hidden">
                        <div className={`h-full ${cfg.bg.split(' ')[0]} ${cfg.color.replace('text', 'bg')}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-semibold text-earth-500">
                No expenses found for selected filters.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Filters & List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card">
              <Filter className="w-4 h-4 text-earth-400" />
              <select 
                value={filterMonth} 
                onChange={e => setFilterMonth(e.target.value)}
                className="bg-transparent text-sm font-bold text-foreground focus:outline-none cursor-pointer"
              >
                <option value="all">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i.toString()}>
                    {new Date(2026, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card flex-grow">
              <Sprout className="w-4 h-4 text-earth-400" />
              <select 
                value={filterCrop} 
                onChange={e => setFilterCrop(e.target.value)}
                className="bg-transparent text-sm font-bold text-foreground focus:outline-none cursor-pointer w-full"
              >
                <option value="all">{language === 'mr' ? 'सर्व पिके' : 'All Crops & General'}</option>
                <option value="general">Farm General</option>
                {crops.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expense List */}
          <div className="flex-grow bg-card rounded-3xl border border-border flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-earth-50/50 dark:bg-earth-900/10 flex items-center justify-between">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                {language === 'mr' ? 'अलीकडील खर्च' : 'Recent Transactions'}
              </h3>
              <span className="text-xs font-bold text-earth-500">{filteredExpenses.length} records</span>
            </div>
            
            <div className="flex flex-col flex-grow overflow-y-auto p-2">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map(expense => {
                  const cfg = CATEGORY_CONFIG[expense.category];
                  const Icon = cfg.icon;
                  return (
                    <div key={expense.id} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-earth-50 dark:hover:bg-earth-900/40 transition-colors">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-extrabold text-foreground truncate">{expense.description || (language === 'mr' ? cfg.labelMr : cfg.label)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-earth-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(expense.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Sprout className="w-3 h-3" /> {expense.cropName}</span>
                          {expense.vendor && <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {expense.vendor}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-base font-black text-foreground">₹{expense.amount.toLocaleString()}</span>
                        <button 
                          onClick={() => deleteExpense(expense.id)}
                          className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-red-500 hover:underline transition-opacity cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="m-auto flex flex-col items-center gap-2 py-12">
                  <div className="w-16 h-16 rounded-full bg-earth-100 dark:bg-earth-900 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-earth-400" />
                  </div>
                  <p className="text-sm font-bold text-earth-500 mt-2">No expenses recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Expense Modal ──────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card rounded-3xl shadow-2xl animate-scale-up overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-earth-50 to-transparent dark:from-earth-900/30">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-500" />
                {language === 'mr' ? 'खर्च जोडा' : 'Add New Expense'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-xl hover:bg-earth-200 dark:hover:bg-earth-800 text-earth-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-6 flex flex-col gap-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-earth-500 uppercase tracking-widest">Date</label>
                  <input 
                    type="date" 
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-earth-500 uppercase tracking-widest">Amount (₹)</label>
                  <input 
                    type="number" 
                    required min="1"
                    placeholder="0.00"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-earth-500 uppercase tracking-widest">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map(cat => {
                    const cfg = CATEGORY_CONFIG[cat];
                    const Icon = cfg.icon;
                    const isSel = formCategory === cat;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setFormCategory(cat)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                          isSel ? `border-current ${cfg.color} ${cfg.bg}` : 'border-border bg-background text-earth-500 hover:bg-earth-50 dark:hover:bg-earth-900/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[9px] font-black text-center">{language === 'mr' ? cfg.labelMr : cfg.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-earth-500 uppercase tracking-widest">Related Crop</label>
                <select 
                  value={formCropId}
                  onChange={e => setFormCropId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                  <option value="general">Farm General / Common</option>
                  {crops.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-earth-500 uppercase tracking-widest">Description (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Urea bags from supplier"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm transition-colors shadow-lg shadow-primary-500/20">
                  {language === 'mr' ? 'खर्च जतन करा' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
