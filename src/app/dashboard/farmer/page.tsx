'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  Sprout, LogOut, PlusCircle, ArrowUpRight, BadgeDollarSign, ShoppingCart, 
  MessageSquare, AlertCircle, Bell, X, Check, Eye, MapPin, TrendingUp, Info, User
} from 'lucide-react';

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
  text: string;
  time: string;
  read: boolean;
}

export default function FarmerDashboard() {
  const router = useRouter();
  const supabase = createClient();

  // 1. Dashboard State
  const [user, setUser] = useState<any>(null);
  const [userLocation, setUserLocation] = useState('');
  
  const [listings, setListings] = useState<ActiveListing[]>([
    { 
      id: '1', 
      farmer_id: 'mock-farmer', 
      name: 'Vine-Ripened Organic Tomatoes', 
      category: 'Vegetables', 
      quantity: 2.4, 
      unit: 'Tons', 
      expected_price: 420, 
      description: 'Grown on organic certified soil, high sugar content and rich texture.',
      harvest_date: '2026-06-15',
      quality_type: 'Premium',
      location: 'Pune Mandi, Maharashtra',
      status: 'Available',
      views: 1420,
      offers: 3
    },
    { 
      id: '2', 
      farmer_id: 'mock-farmer', 
      name: 'Russet Baking Potatoes', 
      category: 'Vegetables', 
      quantity: 5.0, 
      unit: 'Tons', 
      expected_price: 180, 
      description: 'Uniform size Grade A potatoes, perfect for baking and frying.',
      harvest_date: '2026-06-20',
      quality_type: 'Grade A',
      location: 'Manchar, Maharashtra',
      status: 'Available',
      views: 980,
      offers: 1
    },
    { 
      id: '3', 
      farmer_id: 'mock-farmer', 
      name: 'Golden Sweet Corn', 
      category: 'Grains', 
      quantity: 1.2, 
      unit: 'Tons', 
      expected_price: 210, 
      description: 'Handpicked fresh sweet corn ears, moisture level under 14%.',
      harvest_date: '2026-06-10',
      quality_type: 'Grade A',
      location: 'Nashik, Maharashtra',
      status: 'Available',
      views: 240,
      offers: 0
    },
  ]);

  const [buyerBids, setBuyerBids] = useState<BuyerBid[]>([
    { id: 'b1', buyerName: 'Patil Wholesale Veggies', crop: 'Organic Tomatoes', qty: '2.4 Tons', offerPrice: '$435 / Ton', location: 'Pune Mandi (35km away)' },
    { id: 'b2', buyerName: 'Metro Food Distributers', crop: 'Russet Potatoes', qty: '4.0 Tons', offerPrice: '$175 / Ton', location: 'Mumbai Depot (120km away)' },
    { id: 'b3', buyerName: 'Sai Hotel chains Ltd', crop: 'Golden Sweet Corn', qty: '1.0 Tons', offerPrice: '$215 / Ton', location: 'Thane Central (95km away)' },
  ]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'n1', text: 'New bid received from Patil Wholesale Veggies (+12% above target)', time: '5m ago', read: false },
    { id: 'n2', text: 'Escrow payment of $1,280.00 released for Order #101', time: '2h ago', read: true },
    { id: 'n3', text: 'Local wholesale Potato index increased by 4%', time: '1d ago', read: true },
  ]);

  // UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [earnings, setEarnings] = useState(12480);
  const [totalOffers, setTotalOffers] = useState(4);

  // Form States & Validation
  const [editingCrop, setEditingCrop] = useState<ActiveListing | null>(null);
  const [cropName, setCropName] = useState('');
  const [cropCategory, setCropCategory] = useState('Grains');
  const [cropQty, setCropQty] = useState('');
  const [cropUnit, setCropUnit] = useState('Tons');
  const [cropPrice, setCropPrice] = useState('');
  const [cropDescription, setCropDescription] = useState('');
  const [cropHarvestDate, setCropHarvestDate] = useState('');
  const [cropQualityType, setCropQualityType] = useState('Grade A');
  const [cropLocation, setCropLocation] = useState('');
  const [cropStatus, setCropStatus] = useState<'Available' | 'Reserved' | 'Sold'>('Available');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check active session and load crops
    const checkUserAndFetchCrops = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Pre-fill location from user metadata if available
          const metadata = currentUser.user_metadata || {};
          const userLoc = [metadata.village, metadata.district, metadata.state]
            .filter(Boolean)
            .join(', ');
          setUserLocation(userLoc);
          setCropLocation(userLoc);

          // Fetch crops
          const { data, error } = await supabase
            .from('crops')
            .select('*')
            .eq('farmer_id', currentUser.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.warn('Error fetching crops (table might not exist yet):', error.message);
          } else if (data && data.length > 0) {
            setListings(data.map((crop: any) => ({
              ...crop,
              views: crop.views ?? Math.floor(Math.random() * 200) + 15,
              offers: crop.offers ?? 0
            })));
          }
        }
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to mock data:', e);
      }
    };
    checkUserAndFetchCrops();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const resetForm = () => {
    setCropName('');
    setCropCategory('Grains');
    setCropQty('');
    setCropUnit('Tons');
    setCropPrice('');
    setCropDescription('');
    setCropHarvestDate('');
    setCropQualityType('Grade A');
    setCropLocation(userLocation || '');
    setCropStatus('Available');
    setFormErrors({});
    setEditingCrop(null);
  };

  const handleEditClick = (crop: ActiveListing) => {
    setEditingCrop(crop);
    setCropName(crop.name);
    setCropCategory(crop.category);
    setCropQty(crop.quantity.toString());
    setCropUnit(crop.unit);
    setCropPrice(crop.expected_price.toString());
    setCropDescription(crop.description || '');
    setCropHarvestDate(crop.harvest_date);
    setCropQualityType(crop.quality_type);
    setCropLocation(crop.location);
    setCropStatus(crop.status);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = async (cropId: string) => {
    if (!confirm('Are you sure you want to delete this crop listing?')) {
      return;
    }
    
    if (user) {
      try {
        const { error } = await supabase
          .from('crops')
          .delete()
          .eq('id', cropId);
        
        if (error) {
          console.warn('Database delete failed:', error.message);
        }
      } catch (e) {
        console.warn('Supabase delete failed:', e);
      }
    }

    setListings(prev => prev.filter(c => c.id !== cropId));

    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      text: 'Listing deleted successfully.',
      time: 'Just now',
      read: false,
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleStatusChange = async (cropId: string, newStatus: 'Available' | 'Reserved' | 'Sold') => {
    if (user) {
      try {
        const { error } = await supabase
          .from('crops')
          .update({ status: newStatus })
          .eq('id', cropId);
        
        if (error) {
          console.warn('Database status update failed:', error.message);
        }
      } catch (e) {
        console.warn('Supabase status update failed:', e);
      }
    }

    setListings(prev => prev.map(c => c.id === cropId ? {
      ...c,
      status: newStatus
    } : c));

    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      text: `Status updated to ${newStatus} for this listing.`,
      time: 'Just now',
      read: false,
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleAcceptBid = (bidId: string, cropName: string, offerAmt: string) => {
    const priceNum = parseInt(offerAmt.replace(/\D/g, '')) || 0;
    setEarnings(prev => prev + priceNum);
    setBuyerBids(prev => prev.filter(b => b.id !== bidId));
    setTotalOffers(prev => Math.max(0, prev - 1));

    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      text: `Deal accepted! Escrow payout created for ${cropName}.`,
      time: 'Just now',
      read: false,
    };
    setNotifications([newNotif, ...notifications]);

    alert(`Success! Bid accepted for ${cropName}. Escrow funds requested from buyer.`);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form Validation
    const errors: Record<string, string> = {};
    if (!cropName.trim()) errors.name = 'Crop Name is required';
    if (!cropQty.trim() || isNaN(Number(cropQty)) || Number(cropQty) <= 0) {
      errors.qty = 'Quantity must be a positive number';
    }
    if (!cropPrice.trim() || isNaN(Number(cropPrice)) || Number(cropPrice) <= 0) {
      errors.price = 'Expected Price must be a positive number';
    }
    if (!cropHarvestDate) errors.harvestDate = 'Harvest Date is required';
    if (!cropLocation.trim()) errors.location = 'Location is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const qtyNum = Number(cropQty);
    const priceNum = Number(cropPrice);

    const cropData: any = {
      name: cropName.trim(),
      category: cropCategory,
      quantity: qtyNum,
      unit: cropUnit,
      expected_price: priceNum,
      description: cropDescription.trim() || null,
      harvest_date: cropHarvestDate,
      quality_type: cropQualityType,
      location: cropLocation.trim(),
      status: cropStatus,
    };

    if (editingCrop) {
      // EDIT MODE
      if (user) {
        try {
          const { error } = await supabase
            .from('crops')
            .update(cropData)
            .eq('id', editingCrop.id);
          
          if (error) {
            console.warn('Database update failed:', error.message);
          }
        } catch (e) {
          console.warn('Supabase update failed:', e);
        }
      }

      setListings(prev => prev.map(c => c.id === editingCrop.id ? {
        ...c,
        ...cropData,
      } : c));

      const newNotif: NotificationItem = {
        id: `n-${Date.now()}`,
        text: `Listing updated: "${cropName}" is successfully saved.`,
        time: 'Just now',
        read: false,
      };
      setNotifications([newNotif, ...notifications]);

      setIsAddModalOpen(false);
      resetForm();
    } else {
      // ADD MODE
      let newId = `c-${Date.now()}`;
      
      if (user) {
        try {
          const { data, error } = await supabase
            .from('crops')
            .insert({
              ...cropData,
              farmer_id: user.id,
            })
            .select();
          
          if (error) {
            console.warn('Database insert failed:', error.message);
          } else if (data && data[0]) {
            newId = data[0].id;
          }
        } catch (e) {
          console.warn('Supabase insert failed:', e);
        }
      }

      const newListing: ActiveListing = {
        id: newId,
        farmer_id: user?.id || 'mock-farmer',
        ...cropData,
        views: 0,
        offers: 0,
      };

      setListings([newListing, ...listings]);
      setIsAddModalOpen(false);
      resetForm();

      const newNotif: NotificationItem = {
        id: `n-${Date.now()}`,
        text: `Crop listed: "${cropName}" is now available.`,
        time: 'Just now',
        read: false,
      };
      setNotifications([newNotif, ...notifications]);
    }
  };

  // Convert points to SVG path representation
  const generateSvgPath = (points: number[]) => {
    const width = 500;
    const height = 180;
    const step = width / (points.length - 1);
    const mapped = points.map(p => height - (p * 1.2));
    let path = `M 0 ${mapped[0]}`;
    for (let i = 1; i < mapped.length; i++) {
      path += ` L ${i * step} ${mapped[i]}`;
    }
    return path;
  };

  const generateSvgAreaPath = (points: number[]) => {
    const width = 500;
    const height = 180;
    const step = width / (points.length - 1);
    const mapped = points.map(p => height - (p * 1.2));
    let path = `M 0 ${height} L 0 ${mapped[0]}`;
    for (let i = 1; i < mapped.length; i++) {
      path += ` L ${i * step} ${mapped[i]}`;
    }
    path += ` L ${width} ${height} Z`;
    return path;
  };

  const earningsPoints = [35, 50, 42, 68, 85, 90, 115];
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up relative">
      
      {/* Welcome header & Notification Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Farmer Dashboard</h1>
          <p className="text-sm font-semibold text-earth-550 dark:text-earth-400 mt-1">
            Welcome back! Manage crop listings, check active wholesale orders, and view live market stats.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Notification Bell Badge */}
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-3 rounded-xl bg-earth-100 hover:bg-primary-100 dark:bg-earth-900 dark:hover:bg-primary-900/30 text-earth-700 dark:text-earth-300 relative cursor-pointer focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle notifications"
          >
            <Bell className="w-5.5 h-5.5" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-card" />
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-sm font-extrabold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        
        {/* Earnings Card */}
        <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-earth-500 uppercase tracking-wider">Total Earnings</span>
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <BadgeDollarSign className="w-5.5 h-5.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground">${earnings.toLocaleString()}.00</div>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.4% this week
            </span>
          </div>
        </div>

        {/* Offers Card */}
        <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-earth-500 uppercase tracking-wider">Active Offers</span>
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <ShoppingCart className="w-5.5 h-5.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground">{totalOffers} bids</div>
            <span className="text-[10px] font-bold text-earth-500 mt-1 block">Awaiting farmer selection</span>
          </div>
        </div>

        {/* Most Viewed Crop Card */}
        <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-earth-500 uppercase tracking-wider">Crop Views</span>
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <Eye className="w-5.5 h-5.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground">2,400 views</div>
            <span className="text-[10px] font-bold text-emerald-500 mt-1 block">Potatoes: Most viewed (980)</span>
          </div>
        </div>

        {/* Demand Trends Card */}
        <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-earth-500 uppercase tracking-wider">Demand Trends</span>
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <TrendingUp className="w-5.5 h-5.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground">High Index</div>
            <span className="text-[10px] font-bold text-emerald-500 mt-1 block">Tomatoes: Strong buy index (+18%)</span>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Earnings Area Chart */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-black text-foreground">Earnings Overview</h3>
            <p className="text-xs font-semibold text-earth-550 dark:text-earth-400">Monthly crop sales and payouts ledger</p>
          </div>

          <div className="relative h-60 w-full bg-earth-50/50 dark:bg-earth-950/20 rounded-2xl overflow-hidden border border-border/40">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={generateSvgAreaPath(earningsPoints)} fill="url(#earningsGrad)" />
              <path d={generateSvgPath(earningsPoints)} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex justify-between px-2 text-[10px] font-black uppercase text-earth-450">
            {months.map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
        </div>

        {/* Demand Trends Bar Chart */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-black text-foreground">Demand Trends</h3>
            <p className="text-xs font-semibold text-earth-550 dark:text-earth-400">Local crops demand comparison index</p>
          </div>

          {/* Simple custom SVG bar chart */}
          <div className="relative flex-grow flex items-end justify-around h-60 bg-earth-50/50 dark:bg-earth-950/20 rounded-2xl p-4 border border-border/40">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 bg-primary-500 rounded-t-lg transition-all" style={{ height: '140px' }} />
              <span className="text-[10px] font-black text-foreground">Tomatoes</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 bg-harvest-500 rounded-t-lg transition-all" style={{ height: '90px' }} />
              <span className="text-[10px] font-black text-foreground">Wheat</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 bg-primary-400 rounded-t-lg transition-all" style={{ height: '110px' }} />
              <span className="text-[10px] font-black text-foreground">Potatoes</span>
            </div>
          </div>
        </div>

      </div>

      {/* Lists Section: Listings & Nearby Buyers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Crops Listings */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border pb-5">
            <div>
              <h3 className="text-lg font-black text-foreground">My Harvest Listings</h3>
              <p className="text-xs font-bold text-earth-500">List of crops active on the marketplace</p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4.5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span>List Harvest</span>
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {listings.map((list) => (
              <div
                key={list.id}
                className="p-5 rounded-2xl border border-border bg-background hover:border-primary-500/30 transition-all flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Icon and Basic Info */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-650 flex items-center justify-center shrink-0">
                      <Sprout className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-foreground leading-tight flex flex-wrap items-center gap-2">
                        {list.name}
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-earth-100 dark:bg-earth-900 text-earth-650 border border-border/40">
                          {list.category}
                        </span>
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-earth-500 mt-1 font-bold">
                        <span>Qty: {list.quantity} {list.unit}</span>
                        <span>•</span>
                        <span>Target: ${list.expected_price} / {list.unit}</span>
                        <span>•</span>
                        <span className="text-earth-455">Harvested: {list.harvest_date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Dropdown & Bids */}
                  <div className="flex items-center gap-5 justify-between sm:justify-end border-t border-earth-100 dark:border-earth-900 pt-3 sm:pt-0 sm:border-0">
                    <div className="flex items-center gap-4 text-xs font-black text-earth-500">
                      <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {list.views ?? 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4 text-primary-500" /> {list.offers ?? 0} bids</span>
                    </div>

                    <div className="relative flex items-center">
                      <select
                        value={list.status}
                        onChange={(e) => handleStatusChange(list.id, e.target.value as 'Available' | 'Reserved' | 'Sold')}
                        className={`pl-3 pr-7 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-border/20 cursor-pointer focus:outline-none appearance-none min-w-[100px] text-center ${
                          list.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : list.status === 'Reserved'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                        }`}
                      >
                        <option value="Available" className="bg-card text-foreground">Available</option>
                        <option value="Reserved" className="bg-card text-foreground">Reserved</option>
                        <option value="Sold" className="bg-card text-foreground">Sold</option>
                      </select>
                      <span className="absolute right-2.5 text-[6px] pointer-events-none font-black text-earth-500">▼</span>
                    </div>
                  </div>
                </div>

                {/* Sub-Info & Action Buttons Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs font-bold text-earth-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-earth-400" /> {list.location}
                    </span>
                    <span>•</span>
                    <span className="text-earth-455">Quality: {list.quality_type}</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleEditClick(list)}
                      className="px-3 py-1.5 rounded-lg border border-border hover:bg-earth-100 dark:hover:bg-earth-900 text-foreground transition-all cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(list.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/5 text-red-500 transition-all cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Buyers Bids */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
          <div className="border-b border-border pb-5">
            <h3 className="text-lg font-black text-foreground">Nearby Buyer Bids</h3>
            <p className="text-xs font-bold text-earth-500">Vetted agents looking for local procurement</p>
          </div>

          <div className="flex flex-col gap-5">
            {buyerBids.length > 0 ? (
              buyerBids.map((bid) => (
                <div
                  key={bid.id}
                  className="p-5 rounded-2xl bg-earth-50 dark:bg-earth-950 border border-border flex flex-col gap-4.5 text-left"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary-500 flex items-center gap-1 mb-1">
                        <User className="w-3.5 h-3.5" /> {bid.buyerName}
                      </span>
                      <h4 className="font-extrabold text-foreground text-sm sm:text-base leading-snug">{bid.crop}</h4>
                      <span className="text-xs text-earth-500 font-bold flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-earth-400 shrink-0" /> {bid.location}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-foreground">{bid.offerPrice}</div>
                      <span className="text-[10px] font-bold text-earth-550 block">Requested: {bid.qty}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptBid(bid.id, bid.crop, bid.offerPrice)}
                      className="flex-1 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Bid</span>
                    </button>
                    <button
                      onClick={() => setBuyerBids(buyerBids.filter(b => b.id !== bid.id))}
                      className="px-4 py-3.5 rounded-xl border border-red-500/20 text-red-500 font-extrabold text-xs hover:bg-red-500/5 transition-all cursor-pointer text-center"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-sm font-semibold text-earth-500">
                ✓ No pending local bids. Check back later.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* POPUP MODAL: Add / Edit Crop Listing */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
              className="absolute top-4 right-4 p-2 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-650 hover:text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
              <PlusCircle className="w-5.5 h-5.5 text-primary-500" />
              <span>{editingCrop ? 'Edit Crop Listing' : 'List Crop Harvest'}</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              {/* Crop Name */}
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="modal-crop-name" className="text-xs font-bold text-foreground">Crop Name / Variety</label>
                <input
                  id="modal-crop-name"
                  type="text"
                  placeholder="e.g. Organic Durum Wheat, Vine Tomatoes"
                  value={cropName}
                  onChange={(e) => {
                    setCropName(e.target.value);
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold ${
                    formErrors.name ? 'border-red-500 focus:ring-red-500/25' : 'border-border'
                  }`}
                />
                {formErrors.name && <span className="text-[10px] font-bold text-red-500 mt-0.5">{formErrors.name}</span>}
              </div>

              {/* Category & Quality Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="modal-crop-category" className="text-xs font-bold text-foreground">Category</label>
                  <select
                    id="modal-crop-category"
                    value={cropCategory}
                    onChange={(e) => setCropCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold cursor-pointer"
                  >
                    <option value="Grains">Grains / धान्य</option>
                    <option value="Vegetables">Vegetables / भाज्या</option>
                    <option value="Fruits">Fruits / फळे</option>
                    <option value="Oilseeds">Oilseeds / तेलबिया</option>
                    <option value="Pulses">Pulses / डाळी</option>
                    <option value="Spices">Spices / मसाले</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="modal-quality-type" className="text-xs font-bold text-foreground">Quality Grade</label>
                  <select
                    id="modal-quality-type"
                    value={cropQualityType}
                    onChange={(e) => setCropQualityType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold cursor-pointer"
                  >
                    <option value="Premium">Premium / उच्च गुणवत्ता</option>
                    <option value="Grade A">Grade A / श्रेणी अ</option>
                    <option value="Grade B">Grade B / श्रेणी ब</option>
                    <option value="Grade C">Grade C / श्रेणी क</option>
                  </select>
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="modal-crop-qty" className="text-xs font-bold text-foreground">Quantity</label>
                  <input
                    id="modal-crop-qty"
                    type="text"
                    placeholder="e.g. 3.5"
                    value={cropQty}
                    onChange={(e) => {
                      setCropQty(e.target.value);
                      if (formErrors.qty) setFormErrors({ ...formErrors, qty: '' });
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold ${
                      formErrors.qty ? 'border-red-500 focus:ring-red-500/25' : 'border-border'
                    }`}
                  />
                  {formErrors.qty && <span className="text-[10px] font-bold text-red-500 mt-0.5">{formErrors.qty}</span>}
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="modal-crop-unit" className="text-xs font-bold text-foreground">Unit</label>
                  <select
                    id="modal-crop-unit"
                    value={cropUnit}
                    onChange={(e) => setCropUnit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold cursor-pointer"
                  >
                    <option value="Tons">Tons</option>
                    <option value="Quintals">Quintals</option>
                    <option value="kg">kg</option>
                    <option value="Bags">Bags</option>
                  </select>
                </div>
              </div>

              {/* Expected Price & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="modal-crop-price" className="text-xs font-bold text-foreground">Expected Price ($ per unit)</label>
                  <input
                    id="modal-crop-price"
                    type="text"
                    placeholder="e.g. 280"
                    value={cropPrice}
                    onChange={(e) => {
                      setCropPrice(e.target.value);
                      if (formErrors.price) setFormErrors({ ...formErrors, price: '' });
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold ${
                      formErrors.price ? 'border-red-500 focus:ring-red-500/25' : 'border-border'
                    }`}
                  />
                  {formErrors.price && <span className="text-[10px] font-bold text-red-500 mt-0.5">{formErrors.price}</span>}
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="modal-crop-location" className="text-xs font-bold text-foreground">Location</label>
                  <input
                    id="modal-crop-location"
                    type="text"
                    placeholder="e.g. Nashik, Maharashtra"
                    value={cropLocation}
                    onChange={(e) => {
                      setCropLocation(e.target.value);
                      if (formErrors.location) setFormErrors({ ...formErrors, location: '' });
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold ${
                      formErrors.location ? 'border-red-500 focus:ring-red-500/25' : 'border-border'
                    }`}
                  />
                  {formErrors.location && <span className="text-[10px] font-bold text-red-500 mt-0.5">{formErrors.location}</span>}
                </div>
              </div>

              {/* Harvest Date & Crop Status */}
              <div className={editingCrop ? "grid grid-cols-2 gap-4" : "flex flex-col gap-1.5 text-left"}>
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="modal-harvest-date" className="text-xs font-bold text-foreground">Harvest Date</label>
                  <input
                    id="modal-harvest-date"
                    type="date"
                    value={cropHarvestDate}
                    onChange={(e) => {
                      setCropHarvestDate(e.target.value);
                      if (formErrors.harvestDate) setFormErrors({ ...formErrors, harvestDate: '' });
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold ${
                      formErrors.harvestDate ? 'border-red-500 focus:ring-red-500/25' : 'border-border'
                    }`}
                  />
                  {formErrors.harvestDate && <span className="text-[10px] font-bold text-red-500 mt-0.5">{formErrors.harvestDate}</span>}
                </div>

                {editingCrop && (
                  <div className="flex flex-col gap-1.5 text-left">
                    <label htmlFor="modal-crop-status" className="text-xs font-bold text-foreground">Listing Status</label>
                    <select
                      id="modal-crop-status"
                      value={cropStatus}
                      onChange={(e) => setCropStatus(e.target.value as 'Available' | 'Reserved' | 'Sold')}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold cursor-pointer"
                    >
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="modal-crop-desc" className="text-xs font-bold text-foreground">Additional Details (Optional)</label>
                <textarea
                  id="modal-crop-desc"
                  rows={2}
                  placeholder="Soil specs, moisture content, organic certifications..."
                  value={cropDescription}
                  onChange={(e) => setCropDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-base shadow-md transition-colors cursor-pointer mt-2"
              >
                {editingCrop ? 'Save Changes' : 'List Harvest'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SLIDE-OUT PANEL: Notifications */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-100 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-card border-l border-border h-full p-6 flex flex-col shadow-2xl relative animate-slide-in">
            <button
              onClick={() => setIsNotifOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-650 hover:text-foreground cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mt-8 border-b border-border pb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-500" />
                <span>Alert Logs</span>
              </h3>
              <button
                onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                className="text-xs font-bold text-primary-600 hover:text-primary-700"
              >
                Mark all read
              </button>
            </div>

            <div className="flex-grow flex flex-col gap-4 mt-6 overflow-y-auto pr-1">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border flex flex-col gap-1.5 text-left transition-colors ${
                      notif.read
                        ? 'border-border/60 bg-background/50 text-earth-500'
                        : 'border-primary-500/20 bg-primary-50/5 text-foreground'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />}
                      <span className="text-xs font-semibold leading-relaxed">{notif.text}</span>
                    </div>
                    <span className="text-[10px] font-bold text-earth-450 self-end">{notif.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm font-semibold text-earth-500 py-10">
                  No notifications yet.
                </div>
              )}
            </div>
          </div>
          {/* Click outside to close drawer */}
          <div onClick={() => setIsNotifOpen(false)} className="flex-grow h-full cursor-pointer hidden sm:block" />
        </div>
      )}

    </div>
  );
}
