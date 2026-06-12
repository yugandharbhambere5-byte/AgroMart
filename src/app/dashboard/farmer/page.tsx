'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  Sprout, LogOut, PlusCircle, ArrowUpRight, BadgeDollarSign, ShoppingCart,
  MessageSquare, Bell, X, Check, Eye, MapPin, TrendingUp, User,
  Send, Search, Tag, Clock, IndianRupee, CheckCircle, ShieldCheck,
  AlertTriangle, Globe, Star, Phone, Fingerprint, FileText, ChevronRight,
  LayoutDashboard, Inbox, MessageCircle, UserCheck, Filter, Landmark, Bug
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import VoiceAssistant, { VoiceIntent } from '@/components/voice/VoiceAssistant';
import EmergencyAlerts from '@/components/alerts/EmergencyAlerts';
import GovernmentSchemes from '@/components/schemes/GovernmentSchemes';
import PestDiseaseAlerts from '@/components/alerts/PestDiseaseAlerts';
import {
  initialDemandsSeed, initialChatsSeed, mockCrops, getSimulatedReply,
  CropDemand, ChatThread, Message
} from '../buyer/page';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ActiveListing {
  id: string;
  farmer_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expected_price: number;
  description: string;
  harvest_date: string;
  quality_type: string;
  location: string;
  status: 'Available' | 'Reserved' | 'Sold';
  created_at?: string;
  views?: number;
  offers?: number;
  is_otp_verified?: boolean;
  is_gst_verified?: boolean;
  is_kyc_verified?: boolean;
  trust_score?: number;
}

interface BuyerBid {
  id: string;
  buyerName: string;
  crop: string;
  qty: string;
  offerPrice: string;
  location: string;
}

interface NotificationItem {
  id: string;
  type?: string;
  text: string;
  time: string;
  read: boolean;
  role?: string;
}

interface ActiveToast {
  id: string;
  type: string;
  text: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const getLocalizedNotifText = (type: string | undefined, fallback: string, t: any) => {
  if (!t?.notifications || !type) return fallback;
  const map: Record<string, string> = {
    new_offer: t.notifications.newOffer,
    offer_accepted: t.notifications.offerAccepted,
    offer_rejected: t.notifications.offerRejected,
    listing_approved: t.notifications.listingApproved,
    market_update: t.notifications.marketUpdate,
    demand_alert: t.notifications.demandAlert,
  };
  return map[type] ?? fallback;
};

const toastTypeColor: Record<string, string> = {
  new_offer: 'from-blue-500 to-blue-600',
  offer_accepted: 'from-emerald-500 to-emerald-600',
  offer_rejected: 'from-red-500 to-red-600',
  listing_approved: 'from-primary-500 to-primary-600',
  market_update: 'from-harvest-500 to-harvest-600',
  demand_alert: 'from-purple-500 to-purple-600',
};

// ─── Main Component ─────────────────────────────────────────────────────────

export default function FarmerDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const { language, t } = useTranslation();

  // ── Navigation ──
  const [activeTab, setActiveTab] = useState<'overview' | 'demands' | 'chat' | 'crop_health' | 'schemes' | 'profile'>('overview');

  // ── User & Session ──
  const [user, setUser] = useState<any>(null);
  const [userLocation, setUserLocation] = useState('');

  // ── Listings ──
  const [listings, setListings] = useState<ActiveListing[]>([
    {
      id: '1', farmer_id: 'mock-farmer', name: 'Vine-Ripened Organic Tomatoes',
      category: 'Vegetables', quantity: 24, unit: 'Quintals', expected_price: 3500,
      description: 'Grown on organic certified soil, high sugar content and rich texture.',
      harvest_date: '2026-06-15', quality_type: 'Premium', location: 'Pune Mandi, Maharashtra',
      status: 'Available', views: 1420, offers: 3,
    },
    {
      id: '2', farmer_id: 'mock-farmer', name: 'Russet Baking Potatoes',
      category: 'Vegetables', quantity: 50, unit: 'Quintals', expected_price: 1500,
      description: 'Uniform size Grade A potatoes, perfect for baking and frying.',
      harvest_date: '2026-06-20', quality_type: 'Grade A', location: 'Manchar, Maharashtra',
      status: 'Available', views: 980, offers: 1,
    },
    {
      id: '3', farmer_id: 'mock-farmer', name: 'Golden Sweet Corn',
      category: 'Grains', quantity: 12, unit: 'Quintals', expected_price: 1850,
      description: 'Handpicked fresh sweet corn ears, moisture level under 14%.',
      harvest_date: '2026-06-10', quality_type: 'Grade A', location: 'Nashik, Maharashtra',
      status: 'Available', views: 240, offers: 0,
    },
  ]);

  // ── Buyer Bids ──
  const [buyerBids, setBuyerBids] = useState<BuyerBid[]>([
    { id: 'b1', buyerName: 'Patil Wholesale Veggies', crop: 'Organic Tomatoes', qty: '24 Quintals', offerPrice: '₹3,500/Quintal', location: 'Pune Mandi (35km away)' },
    { id: 'b2', buyerName: 'Metro Food Distributers', crop: 'Russet Potatoes', qty: '40 Quintals', offerPrice: '₹1,500/Quintal', location: 'Mumbai Depot (120km away)' },
    { id: 'b3', buyerName: 'Sai Hotel Chains Ltd', crop: 'Golden Sweet Corn', qty: '10 Quintals', offerPrice: '₹1,850/Quintal', location: 'Thane Central (95km away)' },
  ]);

  // ── Notifications ──
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'n1', type: 'new_offer', text: 'New bid received from Patil Wholesale Veggies (+12% above target)', time: '5m ago', read: false },
    { id: 'n2', type: 'offer_accepted', text: 'Escrow payment of ₹1,28,000 released for Order #101', time: '2h ago', read: true },
    { id: 'n3', type: 'market_update', text: 'Local wholesale Potato index increased by 4%', time: '1d ago', read: true },
  ]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [activeToasts, setActiveToasts] = useState<ActiveToast[]>([]);

  // ── Earnings ──
  const [earnings, setEarnings] = useState(124800);
  const [totalOffers, setTotalOffers] = useState(4);

  // ── Crop Form ──
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<ActiveListing | null>(null);
  const [cropName, setCropName] = useState('');
  const [cropCategory, setCropCategory] = useState('Grains');
  const [cropQty, setCropQty] = useState('');
  const [cropUnit, setCropUnit] = useState('Quintals');
  const [cropPrice, setCropPrice] = useState('');
  const [cropDescription, setCropDescription] = useState('');
  const [cropHarvestDate, setCropHarvestDate] = useState('');
  const [cropQualityType, setCropQualityType] = useState('Grade A');
  const [cropLocation, setCropLocation] = useState('');
  const [cropStatus, setCropStatus] = useState<'Available' | 'Reserved' | 'Sold'>('Available');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Verification ──
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isGstModalOpen, setIsGstModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccessMsg, setVerificationSuccessMsg] = useState('');
  const [gstInput, setGstInput] = useState('');
  const [simulatedBusiness, setSimulatedBusiness] = useState('');
  const [kycDocType, setKycDocType] = useState('Aadhaar');
  const [fakeKycFileName, setFakeKycFileName] = useState('');
  const [isScanningKyc, setIsScanningKyc] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isGstVerified, setIsGstVerified] = useState(false);
  const [isKycVerified, setIsKycVerified] = useState(false);

  // ── Demands ──
  const [demands, setDemands] = useState<CropDemand[]>([]);
  const [demandSearch, setDemandSearch] = useState('');
  const [demandCategoryFilter, setDemandCategoryFilter] = useState('All');
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<CropDemand | null>(null);
  const [linkedCropId, setLinkedCropId] = useState('');
  const [respondMode, setRespondMode] = useState<'link' | 'message'>('link');
  const [respondedDemandIds, setRespondedDemandIds] = useState<Set<string>>(new Set());

  // ── Chat ──
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const trustScore = (isOtpVerified ? 30 : 0) + (isGstVerified ? 35 : 0) + (isKycVerified ? 35 : 0);

  // ─── Push Notification Helper ───────────────────────────────────────────────
  const pushNotification = (type: string, text: string, role: 'farmer' | 'buyer') => {
    if (typeof window === 'undefined') return;
    const logStr = localStorage.getItem('agromart_notifications_log');
    const logs: NotificationItem[] = logStr ? JSON.parse(logStr) : [];
    const newNotif: NotificationItem = {
      id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type, text, role,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    const updated = [newNotif, ...logs];
    localStorage.setItem('agromart_notifications_log', JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', { key: 'agromart_notifications_log', newValue: JSON.stringify(updated) }));
    if (role === 'farmer') {
      setNotifications(prev => [newNotif, ...prev]);
    }
    return newNotif;
  };

  // ─── Toast Helper ───────────────────────────────────────────────────────────
  const triggerToast = (id: string, type: string, text: string) => {
    setActiveToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => setActiveToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  // ─── Effects ────────────────────────────────────────────────────────────────

  // Load session & crops
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          const meta = currentUser.user_metadata || {};
          const loc = [meta.village, meta.district, meta.state].filter(Boolean).join(', ');
          setUserLocation(loc);
          setCropLocation(loc);
          setIsOtpVerified(!!meta.is_otp_verified);
          setIsGstVerified(!!meta.is_gst_verified);
          setIsKycVerified(!!meta.is_kyc_verified);
          if (meta.gst_number) setGstInput(meta.gst_number);

          const { data, error } = await supabase.from('crops').select('*').eq('farmer_id', currentUser.id).order('created_at', { ascending: false });
          if (!error && data && data.length > 0) {
            setListings(data.map((c: any) => ({ ...c, views: c.views ?? Math.floor(Math.random() * 200 + 15), offers: c.offers ?? 0 })));
          }
        }
      } catch (e) {
        console.warn('Session init failed:', e);
      }
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, session: any) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, [supabase]);

  // Load demands from localStorage or seed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('agromart_demands');
    if (stored) {
      try { setDemands(JSON.parse(stored)); } catch { setDemands(initialDemandsSeed); }
    } else {
      setDemands(initialDemandsSeed);
    }
  }, []);

  // Load threads from localStorage or seed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('agromart_chats');
    if (stored) {
      try { setThreads(JSON.parse(stored)); } catch { setThreads(initialChatsSeed); }
    } else {
      setThreads(initialChatsSeed);
    }
  }, []);

  // Listen for cross-tab notification updates
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== 'agromart_notifications_log') return;
      const logs: NotificationItem[] = e.newValue ? JSON.parse(e.newValue) : [];
      const farmerLogs = logs.filter(n => n.role === 'farmer');
      setNotifications(farmerLogs);
      // Trigger toast for the newest unread notification
      if (farmerLogs.length > 0 && !farmerLogs[0].read) {
        triggerToast(farmerLogs[0].id, farmerLogs[0].type ?? 'new_offer', farmerLogs[0].text);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, activeThreadId]);

  // ─── Mark as Read ───────────────────────────────────────────────────────────
  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const logs: NotificationItem[] = JSON.parse(localStorage.getItem('agromart_notifications_log') ?? '[]');
    const updated = logs.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('agromart_notifications_log', JSON.stringify(updated));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const logs: NotificationItem[] = JSON.parse(localStorage.getItem('agromart_notifications_log') ?? '[]');
    const updated = logs.map(n => ({ ...n, read: true }));
    localStorage.setItem('agromart_notifications_log', JSON.stringify(updated));
  };

  // ─── Auth ────────────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // ─── Crop Form ───────────────────────────────────────────────────────────────
  const resetForm = () => {
    setCropName(''); setCropCategory('Grains'); setCropQty(''); setCropUnit('Quintals');
    setCropPrice(''); setCropDescription(''); setCropHarvestDate(''); setCropQualityType('Grade A');
    setCropLocation(userLocation || ''); setCropStatus('Available'); setFormErrors({}); setEditingCrop(null);
  };

  const handleEditClick = (crop: ActiveListing) => {
    setEditingCrop(crop);
    setCropName(crop.name); setCropCategory(crop.category); setCropQty(crop.quantity.toString());
    setCropUnit(crop.unit); setCropPrice(crop.expected_price.toString()); setCropDescription(crop.description ?? '');
    setCropHarvestDate(crop.harvest_date); setCropQualityType(crop.quality_type);
    setCropLocation(crop.location); setCropStatus(crop.status);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = async (cropId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    if (user) {
      try { await supabase.from('crops').delete().eq('id', cropId); } catch {}
    }
    setListings(prev => prev.filter(c => c.id !== cropId));
    pushNotification('listing_approved', 'Listing deleted successfully.', 'farmer');
  };

  const handleStatusChange = async (cropId: string, newStatus: 'Available' | 'Reserved' | 'Sold') => {
    if (user) {
      try { await supabase.from('crops').update({ status: newStatus }).eq('id', cropId); } catch {}
    }
    setListings(prev => prev.map(c => c.id === cropId ? { ...c, status: newStatus } : c));
    const notif = pushNotification('listing_approved', `Listing status updated to ${newStatus}.`, 'farmer');
    if (notif) triggerToast(notif.id, 'listing_approved', `Listing status: ${newStatus}`);
  };

  const handleAcceptBid = (bidId: string, cropNameStr: string, offerAmt: string) => {
    const price = parseInt(offerAmt.replace(/[^\d]/g, '')) || 0;
    setEarnings(prev => prev + price);
    const bid = buyerBids.find(b => b.id === bidId);
    setBuyerBids(prev => prev.filter(b => b.id !== bidId));
    setTotalOffers(prev => Math.max(0, prev - 1));
    const farmerNotif = pushNotification('offer_accepted', `Deal accepted! Escrow payout created for ${cropNameStr}.`, 'farmer');
    if (farmerNotif) triggerToast(farmerNotif.id, 'offer_accepted', `Accepted: ${cropNameStr}`);
    // Notify buyer
    pushNotification('offer_accepted', `Your offer for ${cropNameStr} was accepted by the farmer!`, 'buyer');
  };

  const handleRejectBid = (bidId: string, cropNameStr: string) => {
    setBuyerBids(prev => prev.filter(b => b.id !== bidId));
    setTotalOffers(prev => Math.max(0, prev - 1));
    pushNotification('offer_rejected', `Offer for ${cropNameStr} was rejected.`, 'buyer');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!cropName.trim()) errors.name = 'Crop name is required';
    if (!cropQty.trim() || isNaN(Number(cropQty)) || Number(cropQty) <= 0) errors.qty = 'Enter a valid quantity';
    if (!cropPrice.trim() || isNaN(Number(cropPrice)) || Number(cropPrice) <= 0) errors.price = 'Enter a valid price';
    if (!cropHarvestDate) errors.harvestDate = 'Harvest date is required';
    if (!cropLocation.trim()) errors.location = 'Location is required';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    const cropData: any = {
      name: cropName.trim(), category: cropCategory, quantity: Number(cropQty), unit: cropUnit,
      expected_price: Number(cropPrice), description: cropDescription.trim() || null,
      harvest_date: cropHarvestDate, quality_type: cropQualityType, location: cropLocation.trim(), status: cropStatus,
    };

    if (editingCrop) {
      if (user) { try { await supabase.from('crops').update(cropData).eq('id', editingCrop.id); } catch {} }
      setListings(prev => prev.map(c => c.id === editingCrop.id ? { ...c, ...cropData } : c));
      const notif = pushNotification('listing_approved', `Listing updated: "${cropName}".`, 'farmer');
      if (notif) triggerToast(notif.id, 'listing_approved', `Updated: ${cropName}`);
    } else {
      let newId = `c-${Date.now()}`;
      if (user) {
        try {
          const { data } = await supabase.from('crops').insert({ ...cropData, farmer_id: user.id }).select();
          if (data?.[0]) newId = data[0].id;
        } catch {}
      }
      const newListing: ActiveListing = { id: newId, farmer_id: user?.id || 'mock-farmer', ...cropData, views: 0, offers: 0 };
      setListings(prev => [newListing, ...prev]);
      const notif = pushNotification('listing_approved', `Crop listed: "${cropName}" is now live.`, 'farmer');
      if (notif) triggerToast(notif.id, 'listing_approved', `Listed: ${cropName}`);
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  // ─── Verification Handlers ──────────────────────────────────────────────────
  const handleSendOtp = () => {
    setSmsSent(true);
    setVerificationSuccessMsg('OTP sent to your registered mobile number!');
    setVerificationError('');
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '123456') { setVerificationError('Invalid OTP. Try 123456 for demo.'); return; }
    setIsOtpVerified(true);
    if (user) {
      try { await supabase.auth.updateUser({ data: { is_otp_verified: true } }); } catch {}
    }
    const notif = pushNotification('listing_approved', 'Mobile OTP verification successful! +30 Trust Points.', 'farmer');
    if (notif) triggerToast(notif.id, 'listing_approved', 'OTP Verified ✓');
    setIsOtpModalOpen(false);
    setVerificationSuccessMsg(''); setVerificationError(''); setOtpCode(''); setSmsSent(false);
  };

  const handleVerifyGstSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstInput.toUpperCase())) {
      setVerificationError('Invalid GST format. Use e.g. 27AAPFU0939F1ZV');
      return;
    }
    const businesses = ['AgroMart Farms Ltd', 'Green Harvest Pvt Ltd', 'Shetkari Udyog', 'Maharashtra Agri Corp'];
    setSimulatedBusiness(businesses[Math.floor(Math.random() * businesses.length)]);
    setIsGstVerified(true);
    if (user) {
      try { await supabase.auth.updateUser({ data: { is_gst_verified: true, gst_number: gstInput.toUpperCase() } }); } catch {}
    }
    const notif = pushNotification('listing_approved', 'GST verification successful! +35 Trust Points.', 'farmer');
    if (notif) triggerToast(notif.id, 'listing_approved', 'GST Verified ✓');
    setIsGstModalOpen(false);
    setVerificationError(''); setSimulatedBusiness('');
  };

  const handleVerifyKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fakeKycFileName) { setVerificationError('Please select a document file.'); return; }
    setIsScanningKyc(true);
    setScanProgress(0);
    setVerificationError('');
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.floor(Math.random() * 20 + 5);
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        setIsScanningKyc(false);
        setIsKycVerified(true);
        if (user) {
          supabase.auth.updateUser({ data: { is_kyc_verified: true, kyc_doc_type: kycDocType } }).catch(() => {});
        }
        const notif = pushNotification('listing_approved', 'KYC document scan successful! +35 Trust Points.', 'farmer');
        if (notif) triggerToast(notif.id, 'listing_approved', 'KYC Verified ✓');
        setIsKycModalOpen(false);
        setFakeKycFileName(''); setScanProgress(0);
      }
      setScanProgress(prog);
    }, 250);
  };

  // ─── Demand Response ────────────────────────────────────────────────────────
  const handleRespondDemand = (demand: CropDemand) => {
    setSelectedDemand(demand);
    setLinkedCropId('');
    setRespondMode('link');
    setIsRespondModalOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedDemand) return;
    setRespondedDemandIds(prev => new Set([...prev, selectedDemand.id]));
    const notif = pushNotification('new_offer', `You made an offer for "${selectedDemand.crop_name}" from ${selectedDemand.buyer_name}.`, 'buyer');
    if (notif) triggerToast(notif.id, 'new_offer', `Offer sent to ${selectedDemand.buyer_name}`);
    setIsRespondModalOpen(false);
  };

  // ─── Chat ────────────────────────────────────────────────────────────────────
  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeThreadId) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderRole: 'farmer',
      text: chatInput.trim(),
      timestamp: new Date().toISOString(),
      discussionType: 'general',
    };
    const updatedThreads = threads.map(t =>
      t.id === activeThreadId
        ? { ...t, messages: [...t.messages, newMsg], lastUpdated: new Date().toISOString(), unreadForBuyer: true }
        : t
    );
    setThreads(updatedThreads);
    localStorage.setItem('agromart_chats', JSON.stringify(updatedThreads));
    setChatInput('');

    // Simulate buyer reply
    setIsTyping(true);
    const activeThread = threads.find(t => t.id === activeThreadId);
    const reply = getSimulatedReply(chatInput.trim(), activeThread?.cropName ?? '', 'farmer');
    setTimeout(() => {
      const replyMsg: Message = {
        id: `m-${Date.now() + 1}`,
        senderRole: 'buyer',
        text: reply,
        timestamp: new Date().toISOString(),
        discussionType: 'general',
      };
      setThreads(prev => {
        const upd = prev.map(t =>
          t.id === activeThreadId
            ? { ...t, messages: [...t.messages, replyMsg], lastUpdated: new Date().toISOString(), unreadForFarmer: true }
            : t
        );
        localStorage.setItem('agromart_chats', JSON.stringify(upd));
        return upd;
      });
      setIsTyping(false);
    }, 1800);
  };

  // ─── Chart data ──────────────────────────────────────────────────────────────
  const earningsPoints = [35, 50, 42, 68, 85, 90, 115];
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const genPath = (pts: number[]) => {
    const w = 500, h = 180, step = w / (pts.length - 1);
    const mapped = pts.map(p => h - p * 1.2);
    let d = `M 0 ${mapped[0]}`;
    for (let i = 1; i < mapped.length; i++) d += ` L ${i * step} ${mapped[i]}`;
    return d;
  };
  const genArea = (pts: number[]) => {
    const w = 500, h = 180, step = w / (pts.length - 1);
    const mapped = pts.map(p => h - p * 1.2);
    let d = `M 0 ${h} L 0 ${mapped[0]}`;
    for (let i = 1; i < mapped.length; i++) d += ` L ${i * step} ${mapped[i]}`;
    return d + ` L ${w} ${h} Z`;
  };

  // ─── Voice Intent Handler ──────────────────────────────────────────────────
  const handleVoiceIntent = (intent: VoiceIntent) => {
    switch (intent.type) {
      case 'ADD_CROP':
        resetForm();
        if (intent.cropName && intent.cropName !== 'Crop') setCropName(intent.cropName);
        if (intent.quantity) setCropQty(intent.quantity);
        if (intent.unit) setCropUnit(intent.unit);
        setActiveTab('overview');
        setIsAddModalOpen(true);
        const addNotif = pushNotification('listing_approved', `Voice: Pre-filled listing for "${intent.cropName}".`, 'farmer');
        break;
      case 'SHOW_DEMANDS':
        setActiveTab('demands');
        if (intent.cropName) setDemandSearch(intent.cropName);
        break;
      case 'NAVIGATE_PROFILE':
        setActiveTab('profile');
        break;
      case 'NAVIGATE_CHAT':
        setActiveTab('chat');
        break;
      default:
        break;
    }
  };

  // ─── Filters ──────────────────────────────────────────────────────────────────
  const filteredDemands = demands.filter(d => {
    const matchSearch = d.crop_name.toLowerCase().includes(demandSearch.toLowerCase()) ||
      d.buyer_name.toLowerCase().includes(demandSearch.toLowerCase()) ||
      d.location.toLowerCase().includes(demandSearch.toLowerCase());
    const matchCat = demandCategoryFilter === 'All' || d.category === demandCategoryFilter;
    return matchSearch && matchCat && d.status === 'Open';
  });

  const activeThread = threads.find(t => t.id === activeThreadId);
  const unreadCount = notifications.filter(n => !n.read).length;

  const trustLevelLabel = trustScore >= 70 ? 'Verified Farmer' : trustScore >= 30 ? 'Partially Verified' : 'Unverified';
  const trustLevelColor = trustScore >= 70 ? 'text-emerald-500' : trustScore >= 30 ? 'text-harvest-500' : 'text-red-400';

  // ─── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-0 animate-fade-in-up relative">

      {/* ── Emergency Alerts Banner ───────────────────────────────────────── */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 mb-6">
        <EmergencyAlerts userLocation={userLocation} />
      </div>

      <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {language === 'mr' ? 'शेतकरी डॅशबोर्ड' : language === 'hi' ? 'किसान डैशबोर्ड' : 'Farmer Dashboard'}
          </h1>
          <p className="text-sm font-semibold text-earth-500 mt-1">
            {language === 'mr' ? 'पीक यादी व्यवस्थापित करा, बाजारभाव पहा आणि मागण्यांना प्रतिसाद द्या.' :
              language === 'hi' ? 'फसल सूची प्रबंधित करें, बाजार भाव देखें और मांगों का जवाब दें।' :
                'Manage crop listings, check market rates, and respond to buyer demands.'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Trust Badge */}
          {trustScore > 0 && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${
              trustScore >= 70 ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' :
              trustScore >= 30 ? 'border-harvest-500/30 bg-harvest-50 dark:bg-harvest-950/30 text-harvest-600' :
              'border-red-500/30 bg-red-50 dark:bg-red-950/30 text-red-500'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{trustLevelLabel}</span>
            </div>
          )}

          {/* Voice Assistant */}
          <VoiceAssistant onIntent={handleVoiceIntent} compact />

          {/* Notification Bell */}
          <button
            id="farmer-notif-btn"
            onClick={() => setIsNotifOpen(o => !o)}
            className="p-3 rounded-xl bg-earth-100 hover:bg-primary-100 dark:bg-earth-900 dark:hover:bg-primary-900/30 text-earth-700 dark:text-earth-300 relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] font-black flex items-center justify-center px-0.5">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-sm font-extrabold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'mr' ? 'साइन आउट' : language === 'hi' ? 'साइन आउट' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-earth-100/60 dark:bg-earth-900/60 rounded-2xl w-full overflow-x-auto">
        {([
          { id: 'overview', icon: LayoutDashboard, label: language === 'mr' ? 'आढावा' : language === 'hi' ? 'अवलोकन' : 'Overview' },
          { id: 'demands', icon: Inbox, label: language === 'mr' ? 'मागण्या' : language === 'hi' ? 'मांगें' : 'Demands' },
          { id: 'chat', icon: MessageCircle, label: language === 'mr' ? 'चर्चा' : language === 'hi' ? 'बातचीत' : 'Chats' },
          { id: 'crop_health', icon: Bug, label: language === 'mr' ? 'पीक आरोग्य' : language === 'hi' ? 'फसल स्वास्थ्य' : 'Crop Health' },
          { id: 'schemes', icon: Landmark, label: language === 'mr' ? 'योजना' : language === 'hi' ? 'योजनाएं' : 'Schemes' },
          { id: 'profile', icon: UserCheck, label: language === 'mr' ? 'प्रोफाइल' : language === 'hi' ? 'प्रोफाइल' : 'Profile & Trust' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-card text-primary-600 shadow-sm border border-border'
                : 'text-earth-500 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.id === 'demands' && demands.filter(d => d.status === 'Open').length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-primary-600 text-white text-[9px] font-black">
                {demands.filter(d => d.status === 'Open').length}
              </span>
            )}
            {tab.id === 'chat' && threads.some(t => t.unreadForFarmer) && (
              <span className="w-2 h-2 rounded-full bg-red-500 ml-0.5" />
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { label: language === 'mr' ? 'एकूण कमाई' : language === 'hi' ? 'कुल कमाई' : 'Total Earnings', value: `₹${earnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'primary', sub: '+12.4% this week' },
              { label: language === 'mr' ? 'सक्रिय ऑफर' : language === 'hi' ? 'सक्रिय ऑफर' : 'Active Offers', value: `${totalOffers} bids`, icon: ShoppingCart, color: 'primary', sub: 'Awaiting selection' },
              { label: language === 'mr' ? 'पीक दृश्ये' : language === 'hi' ? 'फसल दृश्य' : 'Crop Views', value: '2,400', icon: Eye, color: 'primary', sub: 'Potatoes most viewed' },
              { label: language === 'mr' ? 'मागणी ट्रेंड' : language === 'hi' ? 'मांग ट्रेंड' : 'Demand Trends', value: 'High', icon: TrendingUp, color: 'primary', sub: 'Tomatoes +18%' },
            ].map((m, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 hover-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-earth-500 uppercase tracking-wider">{m.label}</span>
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                    <m.icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground">{m.value}</div>
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 mt-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />{m.sub}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  {language === 'mr' ? 'कमाईचा आढावा' : language === 'hi' ? 'कमाई अवलोकन' : 'Earnings Overview'}
                </h3>
                <p className="text-xs font-semibold text-earth-500">
                  {language === 'mr' ? 'मासिक पीक विक्री' : language === 'hi' ? 'मासिक फसल बिक्री' : 'Monthly crop sales ledger'}
                </p>
              </div>
              <div className="relative h-56 w-full bg-earth-50/50 dark:bg-earth-950/20 rounded-2xl overflow-hidden border border-border/40">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="farmGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={genArea(earningsPoints)} fill="url(#farmGrad)" />
                  <path d={genPath(earningsPoints)} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex justify-between px-2 text-[10px] font-black uppercase text-earth-400">
                {months.map((m, i) => <span key={i}>{m}</span>)}
              </div>
            </div>

            <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  {language === 'mr' ? 'मागणी ट्रेंड' : language === 'hi' ? 'मांग ट्रेंड' : 'Demand Trends'}
                </h3>
                <p className="text-xs font-semibold text-earth-500">
                  {language === 'mr' ? 'स्थानिक पीक मागणी' : language === 'hi' ? 'स्थानीय फसल मांग' : 'Local demand index'}
                </p>
              </div>
              <div className="relative flex-grow flex items-end justify-around h-56 bg-earth-50/50 dark:bg-earth-950/20 rounded-2xl p-4 border border-border/40">
                {[{ label: 'Tomatoes', h: 140, color: 'bg-primary-500' }, { label: 'Wheat', h: 90, color: 'bg-harvest-500' }, { label: 'Potatoes', h: 110, color: 'bg-primary-400' }].map(b => (
                  <div key={b.label} className="flex flex-col items-center gap-2">
                    <div className={`w-8 ${b.color} rounded-t-lg`} style={{ height: `${b.h}px` }} />
                    <span className="text-[10px] font-black text-foreground">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Listings & Bids */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Listings */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    {language === 'mr' ? 'माझ्या पीक यादी' : language === 'hi' ? 'मेरी फसल सूची' : 'My Harvest Listings'}
                  </h3>
                  <p className="text-xs font-bold text-earth-500">Active marketplace listings</p>
                </div>
                <button
                  id="add-listing-btn"
                  onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{language === 'mr' ? 'यादी करा' : language === 'hi' ? 'सूचीबद्ध करें' : 'List Harvest'}</span>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {listings.map(list => (
                  <div key={list.id} className="p-5 rounded-2xl border border-border bg-background hover:border-primary-500/30 transition-all flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center shrink-0">
                          <Sprout className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-foreground leading-tight flex flex-wrap items-center gap-2">
                            {list.name}
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-earth-100 dark:bg-earth-900 text-earth-600 border border-border/40">
                              {list.category}
                            </span>
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-earth-500 mt-1 font-bold">
                            <span>Qty: {list.quantity} {list.unit}</span>
                            <span>•</span>
                            <span>₹{list.expected_price.toLocaleString('en-IN')}/{list.unit}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 border-t border-border sm:border-0 pt-3 sm:pt-0">
                        <div className="flex items-center gap-3 text-xs font-black text-earth-500">
                          <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{list.views ?? 0}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4 text-primary-500" />{list.offers ?? 0}</span>
                        </div>
                        <div className="relative">
                          <select
                            value={list.status}
                            onChange={e => handleStatusChange(list.id, e.target.value as any)}
                            className={`pl-3 pr-6 py-1 rounded-full text-[10px] font-black uppercase border cursor-pointer focus:outline-none appearance-none min-w-[90px] text-center ${
                              list.status === 'Available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/40'
                              : list.status === 'Reserved' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/40'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200/40'
                            }`}
                          >
                            <option value="Available">Available</option>
                            <option value="Reserved">Reserved</option>
                            <option value="Sold">Sold</option>
                          </select>
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[6px] pointer-events-none font-black text-earth-400">▼</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs font-bold text-earth-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{list.location}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditClick(list)} className="px-3 py-1.5 rounded-lg border border-border hover:bg-earth-50 dark:hover:bg-earth-900 text-foreground cursor-pointer text-xs transition-all">Edit</button>
                        <button onClick={() => handleDeleteClick(list.id)} className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer text-xs transition-all">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bids */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
              <div className="border-b border-border pb-5">
                <h3 className="text-lg font-black text-foreground">
                  {language === 'mr' ? 'जवळचे खरेदीदार बोली' : language === 'hi' ? 'नजदीकी खरीदार बोलियां' : 'Nearby Buyer Bids'}
                </h3>
                <p className="text-xs font-bold text-earth-500">Vetted agents looking for local procurement</p>
              </div>

              <div className="flex flex-col gap-5">
                {buyerBids.length > 0 ? buyerBids.map(bid => (
                  <div key={bid.id} className="p-5 rounded-2xl bg-earth-50 dark:bg-earth-950 border border-border flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary-500 flex items-center gap-1 mb-1">
                          <User className="w-3.5 h-3.5" />{bid.buyerName}
                        </span>
                        <h4 className="font-extrabold text-foreground text-sm">{bid.crop}</h4>
                        <span className="text-xs text-earth-500 font-bold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />{bid.location}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-foreground">{bid.offerPrice}</div>
                        <span className="text-[10px] font-bold text-earth-500">Qty: {bid.qty}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptBid(bid.id, bid.crop, bid.offerPrice)}
                        className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs shadow cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Check className="w-4 h-4" />Accept
                      </button>
                      <button
                        onClick={() => handleRejectBid(bid.id, bid.crop)}
                        className="px-4 py-3 rounded-xl border border-red-500/20 text-red-500 font-extrabold text-xs hover:bg-red-500/5 cursor-pointer transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 text-center text-sm font-semibold text-earth-500">✓ No pending bids. Check back later.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DEMANDS TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'demands' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-foreground">
                {language === 'mr' ? 'खरेदीदार मागण्या' : language === 'hi' ? 'खरीदार मांगें' : 'Buyer Crop Demands'}
              </h2>
              <p className="text-xs font-semibold text-earth-500 mt-1">Browse open demands from verified buyers</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
                <input
                  type="text"
                  placeholder={language === 'mr' ? 'शोधा...' : language === 'hi' ? 'खोजें...' : 'Search demands...'}
                  value={demandSearch}
                  onChange={e => setDemandSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={demandCategoryFilter}
                onChange={e => setDemandCategoryFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {['All', 'Grains', 'Vegetables', 'Fruits', 'Oilseeds', 'Spices'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredDemands.length === 0 ? (
            <div className="py-20 text-center text-sm font-semibold text-earth-500 rounded-2xl border border-border bg-card">
              No open demands found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredDemands.map(demand => {
                const hasResponded = respondedDemandIds.has(demand.id);
                const buyerTrust = (demand.trust_score ?? 0);
                return (
                  <div key={demand.id} className="p-6 rounded-2xl border border-border bg-card hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 transition-all flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary-500">{demand.category}</span>
                          <span className="text-[10px] font-bold text-earth-400">•</span>
                          <span className="text-[10px] font-bold text-earth-500">{demand.buyer_name}</span>
                          {demand.is_otp_verified && (
                            <span className="flex items-center gap-0.5 text-[9px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full">
                              <ShieldCheck className="w-2.5 h-2.5" />Verified
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-foreground text-base">{demand.crop_name}</h3>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-black text-foreground">₹{demand.expected_price.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] font-bold text-earth-500">/{demand.unit}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-earth-500">
                      <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />Qty: {demand.quantity} {demand.unit}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{demand.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(demand.created_at).toLocaleDateString('en-IN')}</span>
                    </div>

                    {demand.description && (
                      <p className="text-xs text-earth-500 font-semibold line-clamp-2 border-t border-border pt-3">{demand.description}</p>
                    )}

                    <button
                      onClick={() => !hasResponded && handleRespondDemand(demand)}
                      disabled={hasResponded}
                      className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        hasResponded
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-500/20 cursor-default'
                          : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/20'
                      }`}
                    >
                      {hasResponded ? (
                        <><CheckCircle className="w-4 h-4" />Offer Submitted</>
                      ) : (
                        <><Send className="w-4 h-4" />{language === 'mr' ? 'प्रतिसाद द्या' : language === 'hi' ? 'जवाब दें' : 'Respond to Demand'}</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CHAT TAB ─────────────────────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* Thread List */}
          <div className="lg:col-span-4 p-4 rounded-2xl border border-border bg-card flex flex-col gap-3">
            <h3 className="text-base font-black text-foreground px-2 pt-2">
              {language === 'mr' ? 'संदेश धागे' : language === 'hi' ? 'संदेश धागे' : 'Message Threads'}
            </h3>
            {threads.length === 0 ? (
              <div className="py-12 text-center text-sm text-earth-500 font-semibold">No chats yet.</div>
            ) : (
              threads.map(thread => (
                <button
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full p-4 rounded-xl text-left flex flex-col gap-1 transition-all cursor-pointer border ${
                    activeThreadId === thread.id
                      ? 'border-primary-500/40 bg-primary-50/10 dark:bg-primary-950/20'
                      : 'border-border hover:border-primary-500/20 hover:bg-earth-50 dark:hover:bg-earth-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-earth-100 dark:bg-earth-800 flex items-center justify-center text-earth-500">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-foreground leading-tight">{thread.buyerName}</div>
                        <div className="text-[10px] font-bold text-earth-500">{thread.cropName}</div>
                      </div>
                    </div>
                    {thread.unreadForFarmer && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                  </div>
                  <div className="text-[11px] text-earth-400 font-semibold truncate pl-10">
                    {thread.messages[thread.messages.length - 1]?.text ?? '...'}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-8 rounded-2xl border border-border bg-card flex flex-col overflow-hidden">
            {!activeThread ? (
              <div className="flex-grow flex items-center justify-center text-earth-500 text-sm font-semibold">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-earth-300" />
                  Select a conversation to start chatting
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 flex items-center justify-center">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-foreground">{activeThread.buyerName}</div>
                      <div className="text-[10px] font-bold text-earth-500">{activeThread.cropName}</div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3">
                  {activeThread.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderRole === 'farmer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-semibold leading-relaxed ${
                        msg.senderRole === 'farmer'
                          ? 'bg-primary-600 text-white rounded-br-none'
                          : 'bg-earth-100 dark:bg-earth-800 text-foreground rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-earth-100 dark:bg-earth-800 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-2 h-2 rounded-full bg-earth-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    placeholder={language === 'mr' ? 'संदेश टाइप करा...' : language === 'hi' ? 'संदेश टाइप करें...' : 'Type a message...'}
                    className="flex-grow px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="p-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-default"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── CROP HEALTH TAB ────────────────────────────────────────────────── */}
      {activeTab === 'crop_health' && (
        <div className="flex flex-col gap-6">
          <PestDiseaseAlerts 
            language={language}
            userLocation={userLocation}
            userCrops={listings.map(l => l.name)}
          />
        </div>
      )}

      {/* ── SCHEMES TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'schemes' && (
        <div className="flex flex-col gap-6">
          <GovernmentSchemes
            language={language}
            farmerProfile={{
              landHolding: user?.user_metadata?.land_holding,
              cropTypes: listings.map(l => l.name),
              isVerified: isOtpVerified || isGstVerified || isKycVerified,
              hasInsurance: false,
              hasLoan: false,
              location: userLocation,
            }}
          />
        </div>
      )}

      {/* ── PROFILE & TRUST TAB ───────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-8">
          {/* Trust Score */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h2 className="text-2xl font-black text-foreground">
                  {user?.email ?? (language === 'mr' ? 'शेतकरी' : language === 'hi' ? 'किसान' : 'Farmer')}
                </h2>
                {trustScore >= 70 && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 text-xs font-black">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {language === 'mr' ? 'सत्यापित शेतकरी' : language === 'hi' ? 'सत्यापित किसान' : 'Verified Farmer'}
                  </span>
                )}
              </div>
              <p className={`text-sm font-bold ${trustLevelColor} mb-3`}>{trustLevelLabel} — {trustScore}/100 Trust Points</p>
              <div className="w-full h-3 bg-earth-100 dark:bg-earth-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${trustScore >= 70 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : trustScore >= 30 ? 'bg-gradient-to-r from-harvest-400 to-harvest-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                  style={{ width: `${trustScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Verification Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* OTP */}
            <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${isOtpVerified ? 'border-emerald-500/30 bg-emerald-50/5' : 'border-border bg-card'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isOtpVerified ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' : 'bg-earth-100 dark:bg-earth-900 text-earth-500'}`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-foreground">Mobile OTP</div>
                    <div className="text-[10px] font-bold text-earth-500">+30 Trust Points</div>
                  </div>
                </div>
                {isOtpVerified ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
              </div>
              <p className="text-xs text-earth-500 font-semibold">Verify your mobile number via SMS OTP to establish identity.</p>
              {isOtpVerified ? (
                <div className="px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 text-xs font-extrabold text-center">✓ Verified</div>
              ) : (
                <button onClick={() => setIsOtpModalOpen(true)} className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold cursor-pointer transition-all">Verify Now</button>
              )}
            </div>

            {/* GST */}
            <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${isGstVerified ? 'border-emerald-500/30 bg-emerald-50/5' : 'border-border bg-card'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isGstVerified ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' : 'bg-earth-100 dark:bg-earth-900 text-earth-500'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-foreground">GST Number</div>
                    <div className="text-[10px] font-bold text-earth-500">+35 Trust Points</div>
                  </div>
                </div>
                {isGstVerified ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
              </div>
              <p className="text-xs text-earth-500 font-semibold">Verify your GST registration to unlock wholesale buyer access.</p>
              {isGstVerified ? (
                <div className="px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 text-xs font-extrabold text-center">✓ GST Verified</div>
              ) : (
                <button onClick={() => setIsGstModalOpen(true)} className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold cursor-pointer transition-all">Verify GST</button>
              )}
            </div>

            {/* KYC */}
            <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${isKycVerified ? 'border-emerald-500/30 bg-emerald-50/5' : 'border-border bg-card'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isKycVerified ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' : 'bg-earth-100 dark:bg-earth-900 text-earth-500'}`}>
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-foreground">KYC Document</div>
                    <div className="text-[10px] font-bold text-earth-500">+35 Trust Points</div>
                  </div>
                </div>
                {isKycVerified ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
              </div>
              <p className="text-xs text-earth-500 font-semibold">Upload Aadhaar, PAN, or Driving License for identity proof.</p>
              {isKycVerified ? (
                <div className="px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 text-xs font-extrabold text-center">✓ KYC Verified</div>
              ) : (
                <button onClick={() => setIsKycModalOpen(true)} className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold cursor-pointer transition-all">Upload Document</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODALS ──────────────────────────────────────────────────────────── */}

      {/* Add/Edit Listing Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="absolute top-4 right-4 p-2 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-500 hover:text-foreground cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary-500" />
              {editingCrop ? 'Edit Crop Listing' : 'List Crop Harvest'}
            </h3>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">Crop Name / Variety *</label>
                <input type="text" placeholder="e.g. Organic Durum Wheat" value={cropName} onChange={e => { setCropName(e.target.value); if (formErrors.name) setFormErrors({ ...formErrors, name: '' }); }}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-sm ${formErrors.name ? 'border-red-500' : 'border-border'}`} />
                {formErrors.name && <span className="text-[10px] font-bold text-red-500">{formErrors.name}</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Category</label>
                  <select value={cropCategory} onChange={e => setCropCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                    {['Grains', 'Vegetables', 'Fruits', 'Oilseeds', 'Pulses', 'Spices'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Quality Grade</label>
                  <select value={cropQualityType} onChange={e => setCropQualityType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                    {['Premium', 'Grade A', 'Grade B', 'Grade C'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Quantity *</label>
                  <input type="number" placeholder="e.g. 24" value={cropQty} onChange={e => { setCropQty(e.target.value); if (formErrors.qty) setFormErrors({ ...formErrors, qty: '' }); }}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.qty ? 'border-red-500' : 'border-border'}`} />
                  {formErrors.qty && <span className="text-[10px] font-bold text-red-500">{formErrors.qty}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Unit</label>
                  <select value={cropUnit} onChange={e => setCropUnit(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                    {['Quintals', 'Tons', 'kg', 'Bags'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Expected Price (₹/unit) *</label>
                  <input type="number" placeholder="e.g. 3500" value={cropPrice} onChange={e => { setCropPrice(e.target.value); if (formErrors.price) setFormErrors({ ...formErrors, price: '' }); }}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.price ? 'border-red-500' : 'border-border'}`} />
                  {formErrors.price && <span className="text-[10px] font-bold text-red-500">{formErrors.price}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Location *</label>
                  <input type="text" placeholder="e.g. Nashik, Maharashtra" value={cropLocation} onChange={e => { setCropLocation(e.target.value); if (formErrors.location) setFormErrors({ ...formErrors, location: '' }); }}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.location ? 'border-red-500' : 'border-border'}`} />
                  {formErrors.location && <span className="text-[10px] font-bold text-red-500">{formErrors.location}</span>}
                </div>
              </div>
              <div className={editingCrop ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-1.5'}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Harvest Date *</label>
                  <input type="date" value={cropHarvestDate} onChange={e => { setCropHarvestDate(e.target.value); if (formErrors.harvestDate) setFormErrors({ ...formErrors, harvestDate: '' }); }}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.harvestDate ? 'border-red-500' : 'border-border'}`} />
                  {formErrors.harvestDate && <span className="text-[10px] font-bold text-red-500">{formErrors.harvestDate}</span>}
                </div>
                {editingCrop && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Listing Status</label>
                    <select value={cropStatus} onChange={e => setCropStatus(e.target.value as any)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                      {['Available', 'Reserved', 'Sold'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">Additional Details (Optional)</label>
                <textarea rows={2} placeholder="Soil specs, moisture content, organic certifications..." value={cropDescription} onChange={e => setCropDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <button type="submit" className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-base shadow-md transition-colors cursor-pointer mt-2">
                {editingCrop ? 'Save Changes' : 'List Harvest'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-foreground flex items-center gap-2"><Phone className="w-5 h-5 text-primary-500" />Mobile OTP</h3>
              <button onClick={() => { setIsOtpModalOpen(false); setVerificationError(''); setVerificationSuccessMsg(''); setOtpCode(''); setSmsSent(false); }} className="p-2 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-500 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleVerifyOtpSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-earth-500 font-semibold">Enter your registered mobile number to receive a verification OTP.</p>
              <button type="button" onClick={handleSendOtp} className="w-full py-2.5 rounded-xl border border-primary-500/30 text-primary-600 font-extrabold text-sm hover:bg-primary-50 dark:hover:bg-primary-950/20 cursor-pointer transition-all">
                {smsSent ? '✓ OTP Sent! Resend' : 'Send OTP (Demo: use 123456)'}
              </button>
              {smsSent && (
                <input type="text" maxLength={6} placeholder="Enter 6-digit OTP" value={otpCode} onChange={e => { setOtpCode(e.target.value); setVerificationError(''); }}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500" />
              )}
              {verificationError && <p className="text-xs font-bold text-red-500">{verificationError}</p>}
              {verificationSuccessMsg && <p className="text-xs font-bold text-emerald-500">{verificationSuccessMsg}</p>}
              {smsSent && (
                <button type="submit" className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm cursor-pointer transition-all">Verify OTP</button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* GST Verification Modal */}
      {isGstModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-foreground flex items-center gap-2"><FileText className="w-5 h-5 text-primary-500" />GST Verification</h3>
              <button onClick={() => { setIsGstModalOpen(false); setVerificationError(''); setSimulatedBusiness(''); }} className="p-2 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-500 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleVerifyGstSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-earth-500 font-semibold">Enter your 15-character GST number to verify your business registration.</p>
              <input type="text" maxLength={15} placeholder="e.g. 27AAPFU0939F1ZV" value={gstInput} onChange={e => { setGstInput(e.target.value.toUpperCase()); setVerificationError(''); }}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold uppercase tracking-wider text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {verificationError && <p className="text-xs font-bold text-red-500">{verificationError}</p>}
              {simulatedBusiness && <p className="text-xs font-bold text-emerald-500">✓ Business found: {simulatedBusiness}</p>}
              <button type="submit" className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm cursor-pointer transition-all">Verify GST Number</button>
            </form>
          </div>
        </div>
      )}

      {/* KYC Modal */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-foreground flex items-center gap-2"><Fingerprint className="w-5 h-5 text-primary-500" />KYC Verification</h3>
              <button onClick={() => { setIsKycModalOpen(false); setVerificationError(''); setFakeKycFileName(''); setScanProgress(0); setIsScanningKyc(false); }} className="p-2 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-500 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleVerifyKycSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">Document Type</label>
                <select value={kycDocType} onChange={e => setKycDocType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                  {['Aadhaar Card', 'PAN Card', "Driver's License", 'Voter ID'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <label className={`flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all ${fakeKycFileName ? 'border-primary-500/60 bg-primary-50/5' : 'border-border hover:border-primary-400 hover:bg-earth-50 dark:hover:bg-earth-900/40'}`}>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setFakeKycFileName(f.name); setVerificationError(''); } }} />
                <Fingerprint className={`w-6 h-6 mb-2 ${fakeKycFileName ? 'text-primary-500' : 'text-earth-400'}`} />
                <span className="text-xs font-bold text-earth-500">{fakeKycFileName ? `✓ ${fakeKycFileName}` : 'Click or drag file to upload'}</span>
                <span className="text-[10px] text-earth-400 mt-0.5">JPEG, PNG or PDF up to 5MB</span>
              </label>

              {isScanningKyc && (
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-earth-50 dark:bg-earth-900 border border-border">
                  <div className="flex justify-between text-[10px] font-black uppercase text-earth-500">
                    <span>🔍 OCR scanning document...</span><span>{scanProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-earth-200 dark:bg-earth-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 transition-all duration-300 rounded-full" style={{ width: `${scanProgress}%` }} />
                  </div>
                </div>
              )}

              {verificationError && <p className="text-xs font-bold text-red-500">{verificationError}</p>}
              <button type="submit" disabled={isScanningKyc} className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm cursor-pointer transition-all disabled:opacity-50">
                {isScanningKyc ? 'Scanning...' : 'Upload & Scan Document'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Respond to Demand Modal */}
      {isRespondModalOpen && selectedDemand && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black text-foreground">Respond to Demand</h3>
              <button onClick={() => setIsRespondModalOpen(false)} className="p-2 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-500 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-4 rounded-xl bg-earth-50 dark:bg-earth-900 border border-border mb-5">
              <div className="text-[10px] font-black uppercase text-primary-500 mb-1">{selectedDemand.buyer_name}</div>
              <div className="font-extrabold text-foreground">{selectedDemand.crop_name}</div>
              <div className="text-xs text-earth-500 font-bold mt-1">
                {selectedDemand.quantity} {selectedDemand.unit} · ₹{selectedDemand.expected_price.toLocaleString('en-IN')}/{selectedDemand.unit} · {selectedDemand.location}
              </div>
            </div>

            <div className="flex gap-2 mb-5">
              <button onClick={() => setRespondMode('link')} className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${respondMode === 'link' ? 'bg-primary-600 text-white' : 'border border-border text-earth-600 hover:bg-earth-50 dark:hover:bg-earth-900'}`}>Link My Crop</button>
              <button onClick={() => setRespondMode('message')} className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${respondMode === 'message' ? 'bg-primary-600 text-white' : 'border border-border text-earth-600 hover:bg-earth-50 dark:hover:bg-earth-900'}`}>Send Message</button>
            </div>

            {respondMode === 'link' ? (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-foreground">Select your crop listing to link:</label>
                <select value={linkedCropId} onChange={e => setLinkedCropId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                  <option value="">— Select a listing —</option>
                  {listings.filter(l => l.status === 'Available').map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.quantity} {l.unit} · ₹{l.expected_price.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-foreground">Message to buyer:</label>
                <textarea rows={3} placeholder="Describe your crop availability, price, and any terms..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
            )}

            <button
              onClick={handleSubmitResponse}
              disabled={respondMode === 'link' && !linkedCropId}
              className="w-full mt-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />Submit Response
            </button>
          </div>
        </div>
      )}

      {/* Notification Slide-out Panel */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-card border-l border-border h-full p-6 flex flex-col shadow-2xl relative animate-slide-in">
            <button onClick={() => setIsNotifOpen(false)} className="absolute top-4 right-4 p-2 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-500 hover:text-foreground cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="mt-8 border-b border-border pb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-500" />
                {language === 'mr' ? 'अलर्ट लॉग' : language === 'hi' ? 'अलर्ट लॉग' : 'Alert Logs'}
              </h3>
              <button onClick={handleMarkAllRead} className="text-xs font-bold text-primary-600 hover:text-primary-700 cursor-pointer">
                {language === 'mr' ? 'सर्व वाचले' : language === 'hi' ? 'सब पढ़ें' : 'Mark all read'}
              </button>
            </div>
            <div className="flex-grow flex flex-col gap-3 mt-5 overflow-y-auto pr-1">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    className={`p-4 rounded-xl border flex flex-col gap-1.5 text-left transition-colors w-full cursor-pointer ${
                      n.read ? 'border-border/60 bg-background/50' : 'border-primary-500/20 bg-primary-50/5'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />}
                      <span className="text-xs font-semibold text-foreground leading-relaxed">
                        {getLocalizedNotifText(n.type, n.text, t)}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-earth-400 self-end">{n.time}</span>
                  </button>
                ))
              ) : (
                <div className="text-center text-sm font-semibold text-earth-500 py-12">No notifications yet.</div>
              )}
            </div>
          </div>
          <div onClick={() => setIsNotifOpen(false)} className="flex-grow h-full cursor-pointer hidden sm:block" />
        </div>
      )}

      {/* Floating Toast Stack */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 items-end pointer-events-none">
        {activeToasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-white shadow-xl text-sm font-extrabold bg-gradient-to-r ${toastTypeColor[toast.type] ?? 'from-primary-500 to-primary-600'} animate-slide-in min-w-[240px] max-w-xs`}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="leading-tight">{getLocalizedNotifText(toast.type, toast.text, t)}</span>
          </div>
        ))}
      </div>

    </div>{/* end inner gap-8 div */}
    </div>
  );
}
