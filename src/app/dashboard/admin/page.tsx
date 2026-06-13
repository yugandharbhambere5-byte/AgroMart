'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  ShieldCheck, LogOut, Users, Sprout, BarChart3, AlertTriangle,
  CheckCircle, XCircle, Search, Filter, Eye, Trash2, Edit3,
  TrendingUp, TrendingDown, IndianRupee, MapPin, Clock, Download,
  Flag, MessageSquare, RefreshCw, ChevronDown, ChevronUp,
  Star, UserCheck, UserX, Package, LayoutDashboard, Activity,
  FileText, Settings, Bell, ArrowUpRight, ArrowDownRight,
  ShieldX, Globe, Zap, Plus, Save, X, CheckSquare, MoreVertical,
  Minus, Phone, Fingerprint, BookOpen, HelpCircle
} from 'lucide-react';
import { AdminEducationManager } from '@/components/education/AdminEducationManager';
import { AdminSupportManager } from '@/components/support/AdminSupportManager';
import EmergencyAlerts from '@/components/alerts/EmergencyAlerts';

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminTab = 'overview' | 'users' | 'listings' | 'reports' | 'market' | 'analytics' | 'alerts' | 'education' | 'support';
type UserRole = 'farmer' | 'buyer' | 'admin';
type VerificationLevel = 'none' | 'otp' | 'gst' | 'kyc' | 'full';
type ListingStatus = 'Available' | 'Reserved' | 'Sold' | 'Flagged' | 'Removed';
type ReportStatus = 'Open' | 'Investigating' | 'Resolved' | 'Dismissed';
type ReportType = 'spam' | 'fake_listing' | 'fraud' | 'inappropriate' | 'price_manipulation';
type SortDirection = 'asc' | 'desc';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  location: string;
  verificationLevel: VerificationLevel;
  trustScore: number;
  joinedAt: string;
  lastActive: string;
  isActive: boolean;
  listingCount?: number;
  orderCount?: number;
  revenue?: number;
  flagCount: number;
}

interface AdminListing {
  id: string;
  cropName: string;
  farmerName: string;
  farmerId: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  status: ListingStatus;
  postedAt: string;
  views: number;
  offers: number;
  flagCount: number;
  quality: string;
}

interface AdminReport {
  id: string;
  type: ReportType;
  reportedBy: string;
  reportedEntity: string;
  entityType: 'user' | 'listing';
  description: string;
  reportedAt: string;
  status: ReportStatus;
  priority: 'low' | 'medium' | 'high';
}

interface MarketRateAdmin {
  id: string;
  crop: string;
  category: string;
  unit: string;
  todayRate: number;
  yesterdayRate: number;
  mandi: string;
  state: string;
  quality: string;
  trending: 'up' | 'down' | 'stable';
  lastUpdated: string;
  volume: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_USERS: AdminUser[] = [
  { id: 'u1', name: 'Ramesh Patil', email: 'ramesh@farm.in', phone: '+91 98765 43210', role: 'farmer', location: 'Nashik, Maharashtra', verificationLevel: 'full', trustScore: 100, joinedAt: '2025-12-01', lastActive: '2h ago', isActive: true, listingCount: 12, revenue: 284000, flagCount: 0 },
  { id: 'u2', name: 'Suresh Deshmukh', email: 'suresh@agri.in', phone: '+91 87654 32109', role: 'farmer', location: 'Pune, Maharashtra', verificationLevel: 'gst', trustScore: 65, joinedAt: '2026-01-15', lastActive: '1d ago', isActive: true, listingCount: 7, revenue: 145000, flagCount: 1 },
  { id: 'u3', name: 'Priya Sharma', email: 'priya@buy.in', phone: '+91 76543 21098', role: 'buyer', location: 'Mumbai, Maharashtra', verificationLevel: 'full', trustScore: 100, joinedAt: '2025-11-20', lastActive: '30m ago', isActive: true, orderCount: 45, revenue: 920000, flagCount: 0 },
  { id: 'u4', name: 'Metro Food Dist.', email: 'metro@foods.com', phone: '+91 65432 10987', role: 'buyer', location: 'Thane, Maharashtra', verificationLevel: 'otp', trustScore: 30, joinedAt: '2026-02-10', lastActive: '5d ago', isActive: true, orderCount: 12, revenue: 340000, flagCount: 2 },
  { id: 'u5', name: 'Anil Shinde', email: 'anil@farm.in', phone: '+91 54321 09876', role: 'farmer', location: 'Manchar, Maharashtra', verificationLevel: 'kyc', trustScore: 65, joinedAt: '2026-03-05', lastActive: '3h ago', isActive: true, listingCount: 5, revenue: 78000, flagCount: 0 },
  { id: 'u6', name: 'SpamBot Farm', email: 'spam@fake.xyz', phone: '+91 11111 11111', role: 'farmer', location: 'Unknown', verificationLevel: 'none', trustScore: 0, joinedAt: '2026-06-10', lastActive: '2h ago', isActive: true, listingCount: 48, revenue: 0, flagCount: 7 },
  { id: 'u7', name: 'Sai Hotel Chains', email: 'sai@hotels.in', phone: '+91 43210 98765', role: 'buyer', location: 'Nagpur, Maharashtra', verificationLevel: 'full', trustScore: 100, joinedAt: '2025-10-15', lastActive: '1h ago', isActive: true, orderCount: 89, revenue: 1840000, flagCount: 0 },
  { id: 'u8', name: 'Geeta Kulkarni', email: 'geeta@organic.in', phone: '+91 32109 87654', role: 'farmer', location: 'Baramati, Maharashtra', verificationLevel: 'gst', trustScore: 65, joinedAt: '2026-04-01', lastActive: '6h ago', isActive: false, listingCount: 3, revenue: 42000, flagCount: 0 },
];

const SEED_LISTINGS: AdminListing[] = [
  { id: 'l1', cropName: 'Organic Durum Wheat', farmerName: 'Ramesh Patil', farmerId: 'u1', category: 'Grains', quantity: 12, unit: 'Tons', pricePerUnit: 24500, location: 'Nashik, MH', status: 'Available', postedAt: '2026-06-09', views: 1420, offers: 3, flagCount: 0, quality: 'Premium' },
  { id: 'l2', cropName: 'Russet Baking Potatoes', farmerName: 'Suresh Deshmukh', farmerId: 'u2', category: 'Vegetables', quantity: 8, unit: 'Tons', pricePerUnit: 15200, location: 'Pune, MH', status: 'Available', postedAt: '2026-06-08', views: 980, offers: 1, flagCount: 0, quality: 'Grade A' },
  { id: 'l3', cropName: 'Vine-Ripened Tomatoes', farmerName: 'Anil Shinde', farmerId: 'u5', category: 'Vegetables', quantity: 3, unit: 'Tons', pricePerUnit: 35000, location: 'Manchar, MH', status: 'Available', postedAt: '2026-06-09', views: 540, offers: 2, flagCount: 0, quality: 'Premium' },
  { id: 'l4', cropName: 'FREE TOMATOES - CLICK HERE', farmerName: 'SpamBot Farm', farmerId: 'u6', category: 'Vegetables', quantity: 9999, unit: 'Tons', pricePerUnit: 1, location: 'Unknown', status: 'Flagged', postedAt: '2026-06-10', views: 2100, offers: 0, flagCount: 7, quality: 'Grade C' },
  { id: 'l5', cropName: 'Golden Sweet Corn', farmerName: 'Anil Shinde', farmerId: 'u5', category: 'Grains', quantity: 12, unit: 'Quintals', pricePerUnit: 1850, location: 'Nashik, MH', status: 'Reserved', postedAt: '2026-06-07', views: 240, offers: 1, flagCount: 0, quality: 'Grade A' },
  { id: 'l6', cropName: 'Organic Turmeric', farmerName: 'Geeta Kulkarni', farmerId: 'u8', category: 'Spices', quantity: 5, unit: 'Quintals', pricePerUnit: 14000, location: 'Baramati, MH', status: 'Available', postedAt: '2026-06-05', views: 310, offers: 0, flagCount: 0, quality: 'Premium' },
  { id: 'l7', cropName: 'BULK WHEAT - 50% BELOW MARKET', farmerName: 'SpamBot Farm', farmerId: 'u6', category: 'Grains', quantity: 5000, unit: 'Tons', pricePerUnit: 500, location: 'Unknown', status: 'Flagged', postedAt: '2026-06-11', views: 890, offers: 0, flagCount: 5, quality: 'Grade C' },
];

const SEED_REPORTS: AdminReport[] = [
  { id: 'r1', type: 'spam', reportedBy: 'Ramesh Patil', reportedEntity: 'SpamBot Farm', entityType: 'user', description: 'This account is posting hundreds of fake listings with prices set to ₹1.', reportedAt: '2026-06-10T14:00:00Z', status: 'Investigating', priority: 'high' },
  { id: 'r2', type: 'fake_listing', reportedBy: 'Priya Sharma', reportedEntity: 'FREE TOMATOES - CLICK HERE', entityType: 'listing', description: 'Listing price is ₹1 per ton. Clearly spam/phishing attempt.', reportedAt: '2026-06-10T15:30:00Z', status: 'Open', priority: 'high' },
  { id: 'r3', type: 'price_manipulation', reportedBy: 'Metro Food Dist.', reportedEntity: 'Suresh Deshmukh', entityType: 'user', description: 'Farmer agreed to price of ₹14,500 in chat but listed at ₹15,200.', reportedAt: '2026-06-09T11:00:00Z', status: 'Resolved', priority: 'medium' },
  { id: 'r4', type: 'fraud', reportedBy: 'Sai Hotel Chains', reportedEntity: 'Anil Shinde', entityType: 'user', description: 'Received partial shipment (6T instead of 12T) but escrow released full amount.', reportedAt: '2026-06-08T09:00:00Z', status: 'Investigating', priority: 'high' },
  { id: 'r5', type: 'inappropriate', reportedBy: 'Geeta Kulkarni', reportedEntity: 'Metro Food Dist.', entityType: 'user', description: 'Buyer used abusive language in the chat thread.', reportedAt: '2026-06-07T17:00:00Z', status: 'Dismissed', priority: 'low' },
];

const SEED_RATES: MarketRateAdmin[] = [
  { id: '1', crop: 'Organic Durum Wheat', category: 'Grains', unit: '/Quintal', todayRate: 2450, yesterdayRate: 2380, mandi: 'Nashik APMC', state: 'Maharashtra', quality: 'Premium', trending: 'up', lastUpdated: '09:30 AM', volume: '142 T' },
  { id: '2', crop: 'Russet Potatoes', category: 'Vegetables', unit: '/Quintal', todayRate: 1520, yesterdayRate: 1560, mandi: 'Pune Mandi', state: 'Maharashtra', quality: 'Grade A', trending: 'down', lastUpdated: '10:15 AM', volume: '285 T' },
  { id: '3', crop: 'Vine-Ripened Tomatoes', category: 'Vegetables', unit: '/Quintal', todayRate: 3500, yesterdayRate: 3200, mandi: 'Manchar APMC', state: 'Maharashtra', quality: 'Premium', trending: 'up', lastUpdated: '10:45 AM', volume: '98 T' },
  { id: '4', crop: 'Organic Turmeric', category: 'Spices', unit: '/Quintal', todayRate: 14000, yesterdayRate: 14000, mandi: 'Sangli APMC', state: 'Maharashtra', quality: 'Premium', trending: 'stable', lastUpdated: '08:00 AM', volume: '32 T' },
  { id: '5', crop: 'Sweet Corn', category: 'Grains', unit: '/Quintal', todayRate: 1850, yesterdayRate: 1790, mandi: 'Nashik APMC', state: 'Maharashtra', quality: 'Grade A', trending: 'up', lastUpdated: '11:00 AM', volume: '76 T' },
  { id: '6', crop: 'Soybean', category: 'Oilseeds', unit: '/Quintal', todayRate: 4600, yesterdayRate: 4750, mandi: 'Latur APMC', state: 'Maharashtra', quality: 'Grade A', trending: 'down', lastUpdated: '09:00 AM', volume: '215 T' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const verificationBadge = (level: VerificationLevel) => {
  const map: Record<VerificationLevel, { label: string; classes: string }> = {
    full: { label: '✓ Full KYC', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20' },
    kyc: { label: '✓ KYC', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-500/20' },
    gst: { label: '✓ GST', classes: 'bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400 border-primary-500/20' },
    otp: { label: '✓ OTP', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-500/20' },
    none: { label: '✗ Unverified', classes: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-500/20' },
  };
  const b = map[level];
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${b.classes}`}>{b.label}</span>;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    Reserved: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    Sold: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    Flagged: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    Removed: 'bg-earth-200 text-earth-600 dark:bg-earth-800 dark:text-earth-400',
    Open: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    Investigating: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    Resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    Dismissed: 'bg-earth-100 text-earth-600 dark:bg-earth-800 dark:text-earth-400',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${map[status] ?? ''}`}>{status}</span>;
};

const priorityIcon = (p: string) =>
  p === 'high' ? <span className="text-red-500 text-[10px] font-black uppercase">● High</span>
  : p === 'medium' ? <span className="text-amber-500 text-[10px] font-black uppercase">● Medium</span>
  : <span className="text-earth-400 text-[10px] font-black uppercase">● Low</span>;

const reportTypeLabel: Record<ReportType, string> = {
  spam: '🚫 Spam',
  fake_listing: '📋 Fake Listing',
  fraud: '💸 Fraud',
  inappropriate: '⚠️ Inappropriate',
  price_manipulation: '📊 Price Manipulation',
};

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string; sub: string; icon: any; color: string; trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card hover-lift flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-earth-500 uppercase tracking-wider">{label}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-black text-foreground">{value}</div>
        <div className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-earth-500'}`}>
          {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
          {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
          {sub}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // ── Users State ──
  const [users, setUsers] = useState<AdminUser[]>(SEED_USERS);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');
  const [userVerifFilter, setUserVerifFilter] = useState<'all' | VerificationLevel>('all');
  const [userSort, setUserSort] = useState<{ field: keyof AdminUser; dir: SortDirection }>({ field: 'trustScore', dir: 'desc' });
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // ── Listings State ──
  const [listings, setListings] = useState<AdminListing[]>(SEED_LISTINGS);
  const [listingSearch, setListingSearch] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState<'all' | ListingStatus>('all');
  const [listingCatFilter, setListingCatFilter] = useState('all');

  // ── Reports State ──
  const [reports, setReports] = useState<AdminReport[]>(SEED_REPORTS);
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | ReportStatus>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState<'all' | ReportType>('all');
  const [reportSearch, setReportSearch] = useState('');

  // ── Market State ──
  const [rates, setRates] = useState<MarketRateAdmin[]>(SEED_RATES);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [editRateValue, setEditRateValue] = useState('');
  const [isAddRateOpen, setIsAddRateOpen] = useState(false);
  const [newRate, setNewRate] = useState<Partial<MarketRateAdmin>>({ category: 'Grains', quality: 'Grade A', unit: '/Quintal', state: 'Maharashtra' });
  const [rateSearch, setRateSearch] = useState('');

  // ── Notification helper ──
  const pushAdminNotif = (type: string, text: string, role: 'farmer' | 'buyer') => {
    if (typeof window === 'undefined') return;
    const logStr = localStorage.getItem('agromart_notifications_log');
    const logs = logStr ? JSON.parse(logStr) : [];
    const n = { id: `n-admin-${Date.now()}`, type, text, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), read: false, role };
    localStorage.setItem('agromart_notifications_log', JSON.stringify([n, ...logs]));
    window.dispatchEvent(new StorageEvent('storage', { key: 'agromart_notifications_log', newValue: JSON.stringify([n, ...logs]) }));
  };

  // ── Auth ──
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // ── User Actions ──
  const handleVerifyUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verificationLevel: 'full', trustScore: 100 } : u));
    const user = users.find(u => u.id === userId);
    if (user) {
      pushAdminNotif('listing_approved', `Admin verified your profile. You now have Full KYC status!`, user.role === 'admin' ? 'farmer' : user.role);
    }
  };

  const handleBanUser = (userId: string) => {
    if (!confirm('Ban this user? They will lose marketplace access.')) return;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: false } : u));
  };

  const handleRestoreUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: true } : u));
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    setUsers(prev => prev.filter(u => u.id !== userId));
    setListings(prev => prev.filter(l => l.farmerId !== userId));
  };

  // ── Listing Actions ──
  const handleRemoveListing = (id: string) => {
    if (!confirm('Remove this listing from the marketplace?')) return;
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'Removed' } : l));
  };

  const handleFlagListing = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'Flagged', flagCount: l.flagCount + 1 } : l));
  };

  const handleApproveListing = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'Available', flagCount: 0 } : l));
    const listing = listings.find(l => l.id === id);
    if (listing) {
      pushAdminNotif('listing_approved', `Your listing "${listing.cropName}" was reviewed and approved by admin.`, 'farmer');
    }
  };

  // ── Report Actions ──
  const handleUpdateReportStatus = (id: string, status: ReportStatus) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  // ── Market Rate Actions ──
  const handleSaveRate = (rateId: string) => {
    const val = parseFloat(editRateValue);
    if (isNaN(val) || val <= 0) { alert('Enter a valid rate.'); return; }
    setRates(prev => prev.map(r => r.id === rateId ? {
      ...r,
      yesterdayRate: r.todayRate,
      todayRate: val,
      trending: val > r.todayRate ? 'up' : val < r.todayRate ? 'down' : 'stable',
      lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    } : r));
    setEditingRateId(null);
    setEditRateValue('');
    pushAdminNotif('market_update', `Market rate updated: ${rates.find(r => r.id === rateId)?.crop ?? 'Crop'} is now ₹${val}/Quintal.`, 'farmer');
    pushAdminNotif('market_update', `Market rate updated: ${rates.find(r => r.id === rateId)?.crop ?? 'Crop'} is now ₹${val}/Quintal.`, 'buyer');
  };

  const handleAddRate = () => {
    if (!newRate.crop || !newRate.todayRate) { alert('Fill in all required fields.'); return; }
    const rate: MarketRateAdmin = {
      id: `r-${Date.now()}`,
      crop: newRate.crop!,
      category: newRate.category ?? 'Grains',
      unit: newRate.unit ?? '/Quintal',
      todayRate: Number(newRate.todayRate),
      yesterdayRate: Number(newRate.todayRate),
      mandi: newRate.mandi ?? 'Local APMC',
      state: newRate.state ?? 'Maharashtra',
      quality: newRate.quality ?? 'Grade A',
      trending: 'stable',
      lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      volume: newRate.volume ?? '50 T',
    };
    setRates(prev => [rate, ...prev]);
    setIsAddRateOpen(false);
    setNewRate({ category: 'Grains', quality: 'Grade A', unit: '/Quintal', state: 'Maharashtra' });
    pushAdminNotif('market_update', `New crop added to market rates: ${rate.crop} at ₹${rate.todayRate}/Quintal.`, 'farmer');
    pushAdminNotif('market_update', `New crop added to market rates: ${rate.crop} at ₹${rate.todayRate}/Quintal.`, 'buyer');
  };

  const handleDeleteRate = (id: string) => {
    if (!confirm('Remove this crop from market rates?')) return;
    setRates(prev => prev.filter(r => r.id !== id));
  };

  // ── Filtered/Sorted Data ──
  const filteredUsers = useMemo(() => {
    let arr = users.filter(u => {
      const matchSearch = !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchVerif = userVerifFilter === 'all' || u.verificationLevel === userVerifFilter;
      return matchSearch && matchRole && matchVerif;
    });
    arr = [...arr].sort((a, b) => {
      const aVal = a[userSort.field] as any;
      const bVal = b[userSort.field] as any;
      if (typeof aVal === 'number' && typeof bVal === 'number') return userSort.dir === 'asc' ? aVal - bVal : bVal - aVal;
      return userSort.dir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return arr;
  }, [users, userSearch, userRoleFilter, userVerifFilter, userSort]);

  const filteredListings = useMemo(() => listings.filter(l => {
    const matchSearch = !listingSearch || l.cropName.toLowerCase().includes(listingSearch.toLowerCase()) || l.farmerName.toLowerCase().includes(listingSearch.toLowerCase());
    const matchStatus = listingStatusFilter === 'all' || l.status === listingStatusFilter;
    const matchCat = listingCatFilter === 'all' || l.category === listingCatFilter;
    return matchSearch && matchStatus && matchCat;
  }), [listings, listingSearch, listingStatusFilter, listingCatFilter]);

  const filteredReports = useMemo(() => reports.filter(r => {
    const matchSearch = !reportSearch || r.reportedEntity.toLowerCase().includes(reportSearch.toLowerCase()) || r.reportedBy.toLowerCase().includes(reportSearch.toLowerCase());
    const matchStatus = reportStatusFilter === 'all' || r.status === reportStatusFilter;
    const matchType = reportTypeFilter === 'all' || r.type === reportTypeFilter;
    return matchSearch && matchStatus && matchType;
  }), [reports, reportSearch, reportStatusFilter, reportTypeFilter]);

  const filteredRates = useMemo(() => rates.filter(r =>
    !rateSearch || r.crop.toLowerCase().includes(rateSearch.toLowerCase()) || r.mandi.toLowerCase().includes(rateSearch.toLowerCase())
  ), [rates, rateSearch]);

  // ── Derived stats ──
  const totalFarmers = users.filter(u => u.role === 'farmer').length;
  const totalBuyers = users.filter(u => u.role === 'buyer').length;
  const totalListings = listings.filter(l => l.status !== 'Removed').length;
  const openReports = reports.filter(r => r.status === 'Open' || r.status === 'Investigating').length;
  const flaggedListings = listings.filter(l => l.status === 'Flagged').length;
  const totalRevenue = users.reduce((acc, u) => acc + (u.revenue || 0), 0);

  const TABS = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'users' as AdminTab, label: 'Users', icon: Users, badge: users.filter(u => u.flagCount >= 3).length || undefined },
    { id: 'listings' as AdminTab, label: 'Listings', icon: Sprout, badge: flaggedListings || undefined },
    { id: 'reports' as AdminTab, label: 'Reports', icon: Flag, badge: openReports || undefined },
    { id: 'market' as AdminTab, label: 'Market Rates', icon: BarChart3 },
    { id: 'analytics' as AdminTab, label: 'Analytics', icon: Activity },
    { id: 'alerts' as AdminTab, label: 'Alerts', icon: AlertTriangle },
    { id: 'education' as AdminTab, label: 'Education Manager', icon: BookOpen },
    { id: 'support' as AdminTab, label: 'Support Tickets', icon: HelpCircle, badge: openReports || undefined },
  ];

  // ─── Analytics chart helpers ────────────────────────────────────────────────
  const monthlyGMV = [28, 45, 38, 62, 71, 84, 124];
  const monthlyUsers = [120, 245, 310, 480, 620, 780, 920];
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const categoryBreakdown = [
    { name: 'Vegetables', pct: 42, color: 'bg-emerald-500' },
    { name: 'Grains', pct: 31, color: 'bg-harvest-500' },
    { name: 'Fruits', pct: 15, color: 'bg-blue-500' },
    { name: 'Spices', pct: 8, color: 'bg-purple-500' },
    { name: 'Oilseeds', pct: 4, color: 'bg-earth-400' },
  ];
  const genSparkPath = (pts: number[], h: number, w: number) => {
    const step = w / (pts.length - 1);
    const max = Math.max(...pts);
    const mapped = pts.map(p => h - (p / max) * (h - 8));
    let d = `M 0 ${mapped[0]}`;
    for (let i = 1; i < mapped.length; i++) d += ` L ${i * step} ${mapped[i]}`;
    return d;
  };
  const genAreaPath = (pts: number[], h: number, w: number) => {
    const step = w / (pts.length - 1);
    const max = Math.max(...pts);
    const mapped = pts.map(p => h - (p / max) * (h - 8));
    let d = `M 0 ${h} L 0 ${mapped[0]}`;
    for (let i = 1; i < mapped.length; i++) d += ` L ${i * step} ${mapped[i]}`;
    return `${d} L ${w} ${h} Z`;
  };

  // ─── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Admin Control Panel</h1>
            <p className="text-sm font-semibold text-earth-500 mt-0.5">Manage users, listings, reports, and market rates</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          {openReports > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-black">
              <AlertTriangle className="w-3.5 h-3.5" />
              {openReports} open reports
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-sm font-extrabold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-earth-100/60 dark:bg-earth-900/60 rounded-2xl w-full overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer flex-1 justify-center relative ${
              activeTab === tab.id
                ? 'bg-card text-red-500 shadow-sm border border-border'
                : 'text-earth-500 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge != null && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* OVERVIEW TAB                                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard label="Total Users" value={users.length.toLocaleString()} sub="+12.4% this month" icon={Users} color="bg-blue-100 dark:bg-blue-950/40 text-blue-600" trend="up" />
            <MetricCard label="Active Listings" value={totalListings.toString()} sub={`${flaggedListings} flagged`} icon={Sprout} color="bg-primary-100 dark:bg-primary-950/40 text-primary-600" trend="up" />
            <MetricCard label="Platform GMV" value={`₹${(totalRevenue / 100000).toFixed(1)}L`} sub="+18.2% vs last month" icon={IndianRupee} color="bg-harvest-100 dark:bg-harvest-950/40 text-harvest-600" trend="up" />
            <MetricCard label="Open Reports" value={openReports.toString()} sub={`${reports.filter(r => r.priority === 'high' && r.status !== 'Resolved').length} high priority`} icon={Flag} color="bg-red-100 dark:bg-red-950/40 text-red-600" trend={openReports > 2 ? 'down' : 'neutral'} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard label="Verified Farmers" value={users.filter(u => u.role === 'farmer' && u.verificationLevel === 'full').length.toString()} sub={`of ${totalFarmers} total farmers`} icon={UserCheck} color="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600" trend="up" />
            <MetricCard label="Verified Buyers" value={users.filter(u => u.role === 'buyer' && u.verificationLevel === 'full').length.toString()} sub={`of ${totalBuyers} total buyers`} icon={ShieldCheck} color="bg-primary-100 dark:bg-primary-950/40 text-primary-600" trend="up" />
            <MetricCard label="Spam Detected" value={users.filter(u => u.flagCount >= 3).length.toString()} sub="Needs review" icon={ShieldX} color="bg-red-100 dark:bg-red-950/40 text-red-600" />
            <MetricCard label="Market Crops" value={rates.length.toString()} sub="Tracked live rates" icon={BarChart3} color="bg-purple-100 dark:bg-purple-950/40 text-purple-600" trend="up" />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pending actions */}
            <div className="lg:col-span-5 p-6 rounded-3xl border border-border bg-card flex flex-col gap-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" />Needs Attention</h3>
              <div className="flex flex-col gap-3">
                {listings.filter(l => l.status === 'Flagged').map(l => (
                  <div key={l.id} className="flex items-start gap-3 p-3 rounded-xl border border-red-500/20 bg-red-50/5">
                    <Flag className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <div className="flex-grow min-w-0">
                      <div className="text-xs font-extrabold text-foreground truncate">{l.cropName}</div>
                      <div className="text-[10px] font-bold text-earth-500">by {l.farmerName} · {l.flagCount} flags</div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => { setActiveTab('listings'); setListingStatusFilter('Flagged'); }} className="px-2.5 py-1 rounded-lg bg-red-100 text-red-600 text-[10px] font-black cursor-pointer hover:bg-red-200 transition-colors">Review</button>
                    </div>
                  </div>
                ))}
                {reports.filter(r => r.status === 'Open').map(r => (
                  <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/20 bg-amber-50/5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="flex-grow min-w-0">
                      <div className="text-xs font-extrabold text-foreground truncate">{reportTypeLabel[r.type as ReportType]}</div>
                      <div className="text-[10px] font-bold text-earth-500 truncate">Re: {r.reportedEntity}</div>
                    </div>
                    <button onClick={() => { setActiveTab('reports'); }} className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-black cursor-pointer hover:bg-amber-200 transition-colors shrink-0">View</button>
                  </div>
                ))}
                {listings.filter(l => l.status === 'Flagged').length === 0 && reports.filter(r => r.status === 'Open').length === 0 && (
                  <div className="py-6 text-center text-xs font-semibold text-earth-500">✓ No urgent items right now</div>
                )}
              </div>
            </div>

            {/* User breakdown */}
            <div className="lg:col-span-7 p-6 rounded-3xl border border-border bg-card flex flex-col gap-5">
              <h3 className="text-base font-black text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" />User Trust Distribution</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Full KYC (100 pts)', count: users.filter(u => u.verificationLevel === 'full').length, pct: Math.round(users.filter(u => u.verificationLevel === 'full').length / users.length * 100), color: 'bg-emerald-500' },
                  { label: 'GST + OTP (65 pts)', count: users.filter(u => u.verificationLevel === 'gst' || u.verificationLevel === 'kyc').length, pct: Math.round(users.filter(u => u.verificationLevel === 'gst' || u.verificationLevel === 'kyc').length / users.length * 100), color: 'bg-primary-500' },
                  { label: 'OTP Only (30 pts)', count: users.filter(u => u.verificationLevel === 'otp').length, pct: Math.round(users.filter(u => u.verificationLevel === 'otp').length / users.length * 100), color: 'bg-amber-500' },
                  { label: 'Unverified (0 pts)', count: users.filter(u => u.verificationLevel === 'none').length, pct: Math.round(users.filter(u => u.verificationLevel === 'none').length / users.length * 100), color: 'bg-red-400' },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-earth-500 w-36 shrink-0">{row.label}</span>
                    <div className="flex-grow h-2.5 rounded-full bg-earth-100 dark:bg-earth-900 overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full transition-all duration-700`} style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="text-xs font-black text-foreground w-8 text-right shrink-0">{row.count}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-border grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Farmers', value: totalFarmers, color: 'text-primary-600' },
                  { label: 'Buyers', value: totalBuyers, color: 'text-blue-600' },
                  { label: 'Banned', value: users.filter(u => !u.isActive).length, color: 'text-red-500' },
                ].map(s => (
                  <div key={s.label}>
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] font-bold text-earth-500 uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* USERS TAB                                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
              <input type="text" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 w-72" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer">
                <option value="all">All Roles</option>
                <option value="farmer">Farmers</option>
                <option value="buyer">Buyers</option>
                <option value="admin">Admins</option>
              </select>
              <select value={userVerifFilter} onChange={e => setUserVerifFilter(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer">
                <option value="all">All Verification</option>
                <option value="full">Full KYC</option>
                <option value="kyc">KYC Only</option>
                <option value="gst">GST Only</option>
                <option value="otp">OTP Only</option>
                <option value="none">Unverified</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-bold text-earth-500">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found</div>

          {/* Users Table */}
          <div className="flex flex-col gap-3">
            {filteredUsers.map(user => (
              <div key={user.id} className={`rounded-2xl border bg-card flex flex-col transition-all ${
                user.flagCount >= 3 ? 'border-red-500/30' : !user.isActive ? 'border-earth-300/40 opacity-60' : 'border-border'
              }`}>
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar & Identity */}
                  <div className="flex items-center gap-3 flex-grow min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      user.role === 'farmer' ? 'bg-primary-100 dark:bg-primary-950/40 text-primary-700'
                      : user.role === 'buyer' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700'
                      : 'bg-red-100 dark:bg-red-950/40 text-red-600'
                    }`}>
                      {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-foreground">{user.name}</span>
                        {!user.isActive && <span className="text-[10px] font-black text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">BANNED</span>}
                        {user.flagCount >= 3 && <span className="text-[10px] font-black text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">⚑ {user.flagCount} flags</span>}
                      </div>
                      <div className="text-[11px] font-semibold text-earth-500 truncate">{user.email}</div>
                    </div>
                  </div>

                  {/* Meta badges */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black capitalize ${
                      user.role === 'farmer' ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 border border-primary-500/20'
                      : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 border border-blue-500/20'
                    }`}>{user.role}</span>
                    {verificationBadge(user.verificationLevel)}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-earth-100 dark:bg-earth-900 text-earth-600 border border-earth-200/40">
                      {user.trustScore}/100 pts
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {user.verificationLevel !== 'full' && user.isActive && (
                      <button onClick={() => handleVerifyUser(user.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-black cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors">
                        <ShieldCheck className="w-3.5 h-3.5" />Verify
                      </button>
                    )}
                    {user.isActive ? (
                      <button onClick={() => handleBanUser(user.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 text-[11px] font-black cursor-pointer hover:bg-amber-200 transition-colors">
                        <UserX className="w-3.5 h-3.5" />Ban
                      </button>
                    ) : (
                      <button onClick={() => handleRestoreUser(user.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-100 dark:bg-primary-950/40 text-primary-700 text-[11px] font-black cursor-pointer hover:bg-primary-200 transition-colors">
                        <UserCheck className="w-3.5 h-3.5" />Restore
                      </button>
                    )}
                    <button onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                      className="p-1.5 rounded-lg border border-border text-earth-500 hover:bg-earth-50 dark:hover:bg-earth-900 cursor-pointer transition-colors">
                      {expandedUserId === user.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Row */}
                {expandedUserId === user.id && (
                  <div className="border-t border-border px-5 pb-5 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Phone', value: user.phone, icon: Phone },
                      { label: 'Location', value: user.location, icon: MapPin },
                      { label: 'Joined', value: user.joinedAt, icon: Clock },
                      { label: 'Last Active', value: user.lastActive, icon: Activity },
                      { label: user.role === 'farmer' ? 'Listings' : 'Orders', value: (user.listingCount ?? user.orderCount ?? 0).toString(), icon: Package },
                      { label: 'Revenue', value: `₹${((user.revenue || 0) / 1000).toFixed(1)}K`, icon: IndianRupee },
                      { label: 'Flags', value: user.flagCount.toString(), icon: Flag },
                    ].map(f => (
                      <div key={f.label} className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-earth-400 flex items-center gap-1"><f.icon className="w-3 h-3" />{f.label}</span>
                        <span className="text-xs font-bold text-foreground">{f.value}</span>
                      </div>
                    ))}
                    <div className="col-span-2 sm:col-span-4 flex gap-2 pt-2 border-t border-border/40 mt-1">
                      <button onClick={() => handleDeleteUser(user.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-500 text-xs font-black cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* LISTINGS TAB                                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'listings' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
              <input type="text" placeholder="Search crop or farmer..." value={listingSearch} onChange={e => setListingSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 w-64" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'Available', 'Flagged', 'Reserved', 'Sold', 'Removed'] as const).map(s => (
                <button key={s} onClick={() => setListingStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition-all ${listingStatusFilter === s ? 'bg-red-500 text-white shadow-md' : 'border border-border text-earth-600 hover:bg-earth-50 dark:hover:bg-earth-900'}`}>
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-bold text-earth-500">{filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found</div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-earth-50 dark:bg-earth-950/60 border-b border-border text-earth-500 text-[10px] font-black uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Crop / Farmer</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-right px-4 py-3">Qty</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-center px-4 py-3">Flags</th>
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredListings.map(l => (
                  <tr key={l.id} className={`bg-card hover:bg-earth-50 dark:hover:bg-earth-950/30 transition-colors ${l.flagCount >= 3 ? 'bg-red-50/30 dark:bg-red-950/10' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-foreground text-xs leading-tight">{l.cropName}</div>
                      <div className="text-[10px] font-bold text-earth-500">by {l.farmerName} · {l.location}</div>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-earth-600">{l.category}</td>
                    <td className="px-4 py-4 text-right text-xs font-bold text-foreground">{l.quantity} {l.unit}</td>
                    <td className="px-4 py-4 text-right text-xs font-black text-foreground">₹{l.pricePerUnit.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-4 text-center">{statusBadge(l.status)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-black ${l.flagCount >= 3 ? 'text-red-500' : 'text-earth-400'}`}>{l.flagCount}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {l.status === 'Flagged' && (
                          <button onClick={() => handleApproveListing(l.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 text-[10px] font-black cursor-pointer hover:bg-emerald-200 transition-colors">Approve</button>
                        )}
                        {l.status === 'Available' && (
                          <button onClick={() => handleFlagListing(l.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 text-[10px] font-black cursor-pointer hover:bg-amber-200 transition-colors">Flag</button>
                        )}
                        {l.status !== 'Removed' && (
                          <button onClick={() => handleRemoveListing(l.id)}
                            className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 text-[10px] font-black cursor-pointer hover:bg-red-200 transition-colors">Remove</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredListings.map(l => (
              <div key={l.id} className={`p-4 rounded-2xl border bg-card ${l.flagCount >= 3 ? 'border-red-500/30 bg-red-50/5' : 'border-border'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-extrabold text-sm text-foreground">{l.cropName}</div>
                    <div className="text-[11px] font-bold text-earth-500">by {l.farmerName}</div>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {l.flagCount > 0 && <span className="text-[10px] font-black text-red-500">⚑ {l.flagCount}</span>}
                    {statusBadge(l.status)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-earth-500 mb-3">
                  <span>{l.quantity} {l.unit} · ₹{l.pricePerUnit.toLocaleString('en-IN')}</span>
                  <span>{l.location}</span>
                </div>
                <div className="flex gap-2">
                  {l.status === 'Flagged' && <button onClick={() => handleApproveListing(l.id)} className="flex-1 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-[11px] font-black cursor-pointer">Approve</button>}
                  {l.status === 'Available' && <button onClick={() => handleFlagListing(l.id)} className="flex-1 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-[11px] font-black cursor-pointer">Flag</button>}
                  {l.status !== 'Removed' && <button onClick={() => handleRemoveListing(l.id)} className="flex-1 py-1.5 rounded-lg bg-red-100 text-red-600 text-[11px] font-black cursor-pointer">Remove</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* REPORTS TAB                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'reports' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
              <input type="text" placeholder="Search entity or reporter..." value={reportSearch} onChange={e => setReportSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 w-64" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={reportStatusFilter} onChange={e => setReportStatusFilter(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer">
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="Investigating">Investigating</option>
                <option value="Resolved">Resolved</option>
                <option value="Dismissed">Dismissed</option>
              </select>
              <select value={reportTypeFilter} onChange={e => setReportTypeFilter(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer">
                <option value="all">All Types</option>
                <option value="spam">Spam</option>
                <option value="fake_listing">Fake Listing</option>
                <option value="fraud">Fraud</option>
                <option value="inappropriate">Inappropriate</option>
                <option value="price_manipulation">Price Manipulation</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filteredReports.map(report => (
              <div key={report.id} className={`p-5 rounded-2xl border bg-card flex flex-col gap-4 ${
                report.priority === 'high' && report.status === 'Open' ? 'border-red-500/30 bg-red-50/5 dark:bg-red-950/5' :
                report.priority === 'high' && report.status === 'Investigating' ? 'border-amber-500/20' : 'border-border'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      report.priority === 'high' ? 'bg-red-100 dark:bg-red-950/40 text-red-500' :
                      report.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-500' :
                      'bg-earth-100 dark:bg-earth-900 text-earth-500'
                    }`}>
                      <Flag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-foreground">{reportTypeLabel[report.type as ReportType]}</span>
                        {statusBadge(report.status)}
                        {priorityIcon(report.priority)}
                      </div>
                      <div className="text-[11px] font-bold text-earth-500 mt-0.5">
                        Re: <span className="text-foreground font-extrabold">{report.reportedEntity}</span> ({report.entityType})
                      </div>
                      <div className="text-[11px] font-semibold text-earth-400 mt-0.5">Reported by {report.reportedBy} · {new Date(report.reportedAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    {report.status === 'Open' && (
                      <button onClick={() => handleUpdateReportStatus(report.id, 'Investigating')}
                        className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 text-xs font-black cursor-pointer hover:bg-amber-200 transition-colors">Investigate</button>
                    )}
                    {(report.status === 'Open' || report.status === 'Investigating') && (
                      <>
                        <button onClick={() => handleUpdateReportStatus(report.id, 'Resolved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 text-xs font-black cursor-pointer hover:bg-emerald-200 transition-colors">Resolve</button>
                        <button onClick={() => handleUpdateReportStatus(report.id, 'Dismissed')}
                          className="px-3 py-1.5 rounded-lg border border-border text-earth-600 text-xs font-black cursor-pointer hover:bg-earth-50 dark:hover:bg-earth-900 transition-colors">Dismiss</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-earth-50 dark:bg-earth-950/40 border border-border/40 text-xs font-semibold text-earth-600 dark:text-earth-400 leading-relaxed">
                  "{report.description}"
                </div>
              </div>
            ))}
            {filteredReports.length === 0 && (
              <div className="py-16 text-center text-sm font-semibold text-earth-500 rounded-2xl border border-border bg-card">No reports found.</div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MARKET RATES TAB                                                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'market' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
              <input type="text" placeholder="Search crop or mandi..." value={rateSearch} onChange={e => setRateSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 w-64" />
            </div>
            <button onClick={() => setIsAddRateOpen(o => !o)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm cursor-pointer transition-all shadow-md shadow-red-500/20">
              <Plus className="w-4 h-4" />Add Crop Rate
            </button>
          </div>

          {/* Add Rate Form */}
          {isAddRateOpen && (
            <div className="p-6 rounded-2xl border border-red-500/20 bg-red-50/5 dark:bg-red-950/5 flex flex-col gap-4 animate-fade-in">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2"><Plus className="w-4 h-4 text-red-500" />Add New Market Rate</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { key: 'crop', label: 'Crop Name *', placeholder: 'e.g. Basmati Rice' },
                  { key: 'todayRate', label: 'Today Rate (₹) *', placeholder: 'e.g. 4200' },
                  { key: 'mandi', label: 'Mandi *', placeholder: 'e.g. Nashik APMC' },
                  { key: 'volume', label: 'Volume', placeholder: 'e.g. 100 T' },
                ].map(f => (
                  <div key={f.key} className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-earth-500">{f.label}</label>
                    <input type={f.key === 'todayRate' ? 'number' : 'text'} placeholder={f.placeholder}
                      value={(newRate as any)[f.key] ?? ''}
                      onChange={e => setNewRate(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-earth-500">Category</label>
                  <select value={newRate.category} onChange={e => setNewRate(prev => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer">
                    {['Grains', 'Vegetables', 'Fruits', 'Oilseeds', 'Pulses', 'Spices'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-earth-500">Quality</label>
                  <select value={newRate.quality} onChange={e => setNewRate(prev => ({ ...prev, quality: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer">
                    {['Premium', 'Grade A', 'Grade B', 'Standard'].map(q => <option key={q}>{q}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddRate}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm cursor-pointer transition-all shadow-md">
                  <Save className="w-4 h-4" />Save Rate
                </button>
                <button onClick={() => setIsAddRateOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-earth-600 font-extrabold text-sm cursor-pointer hover:bg-earth-50 dark:hover:bg-earth-900 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Rates Table */}
          <div className="hidden sm:block rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-earth-50 dark:bg-earth-950/60 border-b border-border text-earth-500 text-[10px] font-black uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Crop / Mandi</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-right px-4 py-3">Today (₹)</th>
                  <th className="text-right px-4 py-3">Yesterday</th>
                  <th className="text-right px-4 py-3">Change</th>
                  <th className="text-center px-4 py-3">Trend</th>
                  <th className="text-left px-4 py-3">Volume</th>
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRates.map(rate => {
                  const change = rate.todayRate - rate.yesterdayRate;
                  const changePct = rate.yesterdayRate > 0 ? ((change / rate.yesterdayRate) * 100).toFixed(1) : '0.0';
                  const isEditing = editingRateId === rate.id;
                  return (
                    <tr key={rate.id} className="bg-card hover:bg-earth-50 dark:hover:bg-earth-950/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-xs text-foreground">{rate.crop}</div>
                        <div className="text-[10px] font-bold text-earth-500">{rate.mandi} · {rate.state}</div>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-earth-600">{rate.category}</td>
                      <td className="px-4 py-4 text-right">
                        {isEditing ? (
                          <input type="number" value={editRateValue} onChange={e => setEditRateValue(e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg border border-red-500 bg-background text-sm font-black text-foreground text-right focus:outline-none"
                            autoFocus />
                        ) : (
                          <span className="text-xs font-black text-foreground">₹{rate.todayRate.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-earth-500">₹{rate.yesterdayRate.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-right">
                        <span className={`text-xs font-black flex items-center justify-end gap-0.5 ${change > 0 ? 'text-emerald-500' : change < 0 ? 'text-red-500' : 'text-earth-400'}`}>
                          {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : change < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {Math.abs(parseFloat(changePct))}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {rate.trending === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />
                          : rate.trending === 'down' ? <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />
                          : <Minus className="w-4 h-4 text-earth-400 mx-auto" />}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-earth-500">{rate.volume}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditing ? (
                            <>
                              <button onClick={() => handleSaveRate(rate.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 text-[10px] font-black cursor-pointer hover:bg-emerald-200 transition-colors">Save</button>
                              <button onClick={() => { setEditingRateId(null); setEditRateValue(''); }}
                                className="p-1 rounded-lg border border-border text-earth-500 cursor-pointer hover:bg-earth-50 dark:hover:bg-earth-900">
                                <X className="w-3.5 h-3.5" /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditingRateId(rate.id); setEditRateValue(rate.todayRate.toString()); }}
                                className="p-1.5 rounded-lg border border-border text-earth-500 hover:bg-earth-50 dark:hover:bg-earth-900 cursor-pointer transition-colors">
                                <Edit3 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDeleteRate(rate.id)}
                                className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors">
                                <Trash2 className="w-3.5 h-3.5" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Rate Cards */}
          <div className="sm:hidden flex flex-col gap-3">
            {filteredRates.map(rate => {
              const change = rate.todayRate - rate.yesterdayRate;
              return (
                <div key={rate.id} className="p-4 rounded-2xl border border-border bg-card flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-extrabold text-sm text-foreground">{rate.crop}</div>
                      <div className="text-[11px] font-bold text-earth-500">{rate.mandi} · {rate.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-foreground text-sm">₹{rate.todayRate.toLocaleString('en-IN')}</div>
                      <div className={`text-[10px] font-black ${change > 0 ? 'text-emerald-500' : change < 0 ? 'text-red-500' : 'text-earth-400'}`}>
                        {change > 0 ? '▲' : change < 0 ? '▼' : '—'} vs ₹{rate.yesterdayRate.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingRateId(rate.id === editingRateId ? null : rate.id); setEditRateValue(rate.todayRate.toString()); }}
                      className="flex-1 py-1.5 rounded-lg border border-border text-earth-600 text-[11px] font-black cursor-pointer hover:bg-earth-50 dark:hover:bg-earth-900">Edit Rate</button>
                    <button onClick={() => handleDeleteRate(rate.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-500 text-[11px] font-black cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20">Remove</button>
                  </div>
                  {editingRateId === rate.id && (
                    <div className="flex gap-2 pt-1 border-t border-border">
                      <input type="number" value={editRateValue} onChange={e => setEditRateValue(e.target.value)}
                        placeholder="New rate (₹)" className="flex-grow px-3 py-2 rounded-xl border border-red-500 bg-background text-sm font-black focus:outline-none" autoFocus />
                      <button onClick={() => handleSaveRate(rate.id)} className="px-3 py-2 rounded-xl bg-emerald-500 text-white font-extrabold text-xs cursor-pointer">Save</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ANALYTICS TAB                                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-8">
          {/* GMV Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-black text-foreground">Platform GMV</h3>
                <p className="text-xs font-semibold text-earth-500">Gross Merchandise Value (₹ Lakhs)</p>
              </div>
              <div className="relative h-48 bg-earth-50/50 dark:bg-earth-950/20 rounded-2xl overflow-hidden border border-border/40">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={genAreaPath(monthlyGMV, 180, 500)} fill="url(#gmvGrad)" />
                  <path d={genSparkPath(monthlyGMV, 180, 500)} fill="none" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
                  {monthlyGMV.map((v, i) => {
                    const step = 500 / (monthlyGMV.length - 1);
                    const max = Math.max(...monthlyGMV);
                    const y = 180 - (v / max) * 172;
                    return <circle key={i} cx={i * step} cy={y} r="5" fill="#ef4444" stroke="white" strokeWidth="2" />;
                  })}
                </svg>
              </div>
              <div className="flex justify-between px-2 text-[10px] font-black uppercase text-earth-400">
                {months.map((m, i) => <span key={i}>{m}</span>)}
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-black text-foreground">User Growth</h3>
                <p className="text-xs font-semibold text-earth-500">Cumulative registered users</p>
              </div>
              <div className="relative h-48 bg-earth-50/50 dark:bg-earth-950/20 rounded-2xl overflow-hidden border border-border/40">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={genAreaPath(monthlyUsers, 180, 500)} fill="url(#userGrad)" />
                  <path d={genSparkPath(monthlyUsers, 180, 500)} fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex justify-between px-2 text-[10px] font-black uppercase text-earth-400">
                {months.map((m, i) => <span key={i}>{m}</span>)}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl border border-border bg-card flex flex-col gap-5">
              <h3 className="text-base font-black text-foreground">Sales by Category</h3>
              <div className="flex flex-col gap-4">
                {categoryBreakdown.map(cat => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-earth-500 w-24 shrink-0">{cat.name}</span>
                    <div className="flex-grow h-3 rounded-full bg-earth-100 dark:bg-earth-900 overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                    </div>
                    <span className="text-xs font-black text-foreground w-8 text-right shrink-0">{cat.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-border bg-card flex flex-col gap-5">
              <h3 className="text-base font-black text-foreground">Platform Health Score</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Verification Rate', value: `${Math.round(users.filter(u => u.verificationLevel !== 'none').length / users.length * 100)}%`, color: 'text-emerald-500' },
                  { label: 'Report Resolution', value: `${Math.round(reports.filter(r => r.status === 'Resolved' || r.status === 'Dismissed').length / reports.length * 100)}%`, color: 'text-blue-500' },
                  { label: 'Flagged Rate', value: `${Math.round(listings.filter(l => l.status === 'Flagged').length / listings.length * 100)}%`, color: 'text-red-500' },
                  { label: 'Active Listings', value: `${Math.round(listings.filter(l => l.status === 'Available').length / listings.length * 100)}%`, color: 'text-primary-500' },
                  { label: 'Avg Trust Score', value: `${Math.round(users.reduce((a, b) => a + b.trustScore, 0) / users.length)}`, color: 'text-harvest-500' },
                  { label: 'Revenue/User', value: `₹${Math.round(totalRevenue / users.length / 1000)}K`, color: 'text-purple-500' },
                ].map(s => (
                  <div key={s.label} className="p-4 rounded-xl border border-border bg-background flex flex-col gap-1">
                    <span className="text-[10px] font-black text-earth-500 uppercase tracking-wider">{s.label}</span>
                    <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top performers table */}
          <div className="p-6 rounded-3xl border border-border bg-card flex flex-col gap-4">
            <h3 className="text-base font-black text-foreground">Top Performing Users by Revenue</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-earth-500 text-[10px] font-black uppercase tracking-wider">
                    <th className="text-left pb-3">User</th>
                    <th className="text-left pb-3">Role</th>
                    <th className="text-left pb-3">Verification</th>
                    <th className="text-right pb-3">Revenue</th>
                    <th className="text-right pb-3">Trust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {[...users].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 5).map((u, i) => (
                    <tr key={u.id} className="hover:bg-earth-50 dark:hover:bg-earth-950/20 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-earth-100 dark:bg-earth-900 text-earth-600 text-[10px] font-black flex items-center justify-center">{i + 1}</span>
                          <div>
                            <div className="font-extrabold text-xs text-foreground">{u.name}</div>
                            <div className="text-[10px] font-semibold text-earth-500 truncate">{u.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 capitalize text-xs font-bold text-earth-600">{u.role}</td>
                      <td className="py-3">{verificationBadge(u.verificationLevel)}</td>
                      <td className="py-3 text-right text-xs font-black text-foreground">₹{((u.revenue || 0) / 100000).toFixed(2)}L</td>
                      <td className="py-3 text-right">
                        <span className={`text-xs font-black ${u.trustScore >= 70 ? 'text-emerald-500' : u.trustScore >= 30 ? 'text-amber-500' : 'text-red-500'}`}>{u.trustScore}/100</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ALERTS TAB */}
      {activeTab === 'alerts' && (
        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-black text-foreground">Emergency Alert System</h3>
            </div>
            <p className="text-xs font-semibold text-earth-500">
              Broadcast emergency alerts (rainfall, disease outbreaks, market crashes) to all farmers and buyers.
              Alerts are filtered by district so only affected users see them.
            </p>
          </div>
          <EmergencyAlerts adminMode={true} />
        </div>
      )}

      {/* EDUCATION MANAGER TAB */}
      {activeTab === 'education' && (
        <AdminEducationManager />
      )}

      {/* SUPPORT TICKETS TAB */}
      {activeTab === 'support' && (
        <AdminSupportManager />
      )}

    </div>
  );
}
