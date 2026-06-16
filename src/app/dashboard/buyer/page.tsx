'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  Search, Filter, Heart, ArrowRight, ShieldCheck, TrendingUp, Info, MapPin, Tag,
  ShoppingCart, Send, LayoutDashboard, Star, CheckCircle, Clock, X, Check,
  AlertTriangle, IndianRupee, LogOut, ArrowDownRight, Compass, MessageSquare, Sparkles, Globe,
  PlusCircle, Bell, Timer, Gavel, HelpCircle, Menu, Sprout, Loader2
} from 'lucide-react';
import { useTranslation, Language } from '@/context/LanguageContext';
import { HelpCenter } from '@/components/support/HelpCenter';
import MapComponent, { MapMarker } from '@/components/MapComponent';
import { LiveMarketRates } from '@/components/market/LiveMarketRates';
import { TransactionHistory } from '@/components/finance/TransactionHistory';
import { SmartSearch } from '@/components/search/SmartSearch';
import { UpcomingBookings } from '@/components/scheduling/UpcomingBookings';
import { BuyerProfileCard } from '@/components/profile/BuyerProfileCard';
import { BuyerProfileEditModal } from '@/components/profile/BuyerProfileEditModal';
import { BuyerProfile } from '@/types/buyer';
import { Transaction } from '@/types/transaction';
import { FileText, User, Edit } from 'lucide-react';
import { CropDetailModal } from '@/components/market/CropDetailModal';
import { FarmerProfileModal, FarmerProfile } from '@/components/profile/FarmerProfileModal';
import SecureCallModal from '@/components/voice/SecureCallModal';

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
  images?: string[];
  farmer_name?: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
  is_verified?: boolean;
  is_otp_verified?: boolean;
  is_gst_verified?: boolean;
  is_kyc_verified?: boolean;
  trust_score?: number;
  is_auction?: boolean;
  auction_end_time?: string;
  bids?: AuctionBid[];
  highest_bid?: number;
}

export interface AuctionBid {
  id: string;
  buyer_id: string;
  buyer_name: string;
  amount: number;
  time: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface OfferItem {
  id: string;
  cropId: string;
  cropName: string;
  farmerName: string;
  originalPrice: number;
  offeredPrice: number;
  quantity: number;
  unit: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn';
  date: string;
}

export interface Message {
  id: string;
  senderRole: 'buyer' | 'farmer';
  text: string;
  timestamp: string;
  discussionType?: 'price' | 'quantity' | 'delivery' | 'general';
}

export interface ChatThread {
  id: string;
  cropId: string;
  cropName: string;
  buyerName: string;
  farmerName: string;
  messages: Message[];
  lastUpdated: string;
  unreadForBuyer: boolean;
  unreadForFarmer: boolean;
  demandId?: string;
}

export interface CropDemand {
  id: string;
  buyer_id: string;
  buyer_name: string;
  crop_name: string;
  category: string;
  quantity: number;
  unit: string;
  expected_price: number;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  created_at: string;
  status: 'Open' | 'Closed';
  is_verified?: boolean;
  is_otp_verified?: boolean;
  is_gst_verified?: boolean;
  is_kyc_verified?: boolean;
  trust_score?: number;
}

interface NotificationItem {
  id: string;
  type?: string;
  text: string;
  time: string;
  read: boolean;
  role?: string;
}

const getLocalizedNotifText = (type: string | undefined, fallbackText: string, t: any) => {
  if (!t.notifications || !type) return fallbackText;
  switch (type) {
    case 'new_offer': return t.notifications.newOffer;
    case 'offer_accepted': return t.notifications.offerAccepted;
    case 'offer_rejected': return t.notifications.offerRejected;
    case 'listing_approved': return t.notifications.listingApproved;
    case 'market_update': return t.notifications.marketUpdate;
    case 'demand_alert': return t.notifications.demandAlert;
    default: return fallbackText;
  }
};

export const initialDemandsSeed: CropDemand[] = [
  {
    id: 'd-1',
    buyer_id: 'mock-buyer-1',
    buyer_name: 'Premium Agro Buyers',
    crop_name: 'Organic Durum Wheat',
    category: 'Grains',
    quantity: 15,
    unit: 'Tons',
    expected_price: 25000,
    location: 'Nashik, Maharashtra',
    latitude: 19.9975,
    longitude: 73.7898,
    description: 'Looking for premium high-gluten wheat with moisture level strictly below 13%.',
    created_at: '2026-06-09T10:00:00.000Z',
    status: 'Open'
  },
  {
    id: 'd-2',
    buyer_id: 'mock-buyer-1',
    buyer_name: 'Premium Agro Buyers',
    crop_name: 'Vine-Ripened Tomatoes',
    category: 'Vegetables',
    quantity: 5,
    unit: 'Tons',
    expected_price: 36000,
    location: 'Manchar, Maharashtra',
    latitude: 19.0064,
    longitude: 73.9392,
    description: 'Need fully colored red tomatoes for processing unit. Temperature-controlled delivery preferred.',
    created_at: '2026-06-08T15:30:00.000Z',
    status: 'Open'
  }
];

const locationCoordinates: Record<string, { lat: number; lon: number }> = {
  pune: { lat: 18.5204, lon: 73.8567 },
  nashik: { lat: 19.9975, lon: 73.7898 },
  manchar: { lat: 19.0064, lon: 73.9392 },
  baramati: { lat: 18.1506, lon: 74.5768 },
  nagpur: { lat: 21.1458, lon: 79.0882 },
  thane: { lat: 19.2183, lon: 72.9781 },
  mumbai: { lat: 19.0760, lon: 72.8777 },
  shimla: { lat: 31.1048, lon: 77.1734 },
  solapur: { lat: 17.6599, lon: 75.9064 },
  kolhapur: { lat: 16.7050, lon: 74.2433 },
  satara: { lat: 17.6805, lon: 73.9918 },
  sangamner: { lat: 19.5761, lon: 74.2070 },
  narayangaon: { lat: 19.1170, lon: 73.9730 }
};

const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
};

const getCoordinates = (locStr: string) => {
  if (!locStr) return locationCoordinates.pune;
  const clean = locStr.toLowerCase();
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    if (clean.includes(key)) {
      return coords;
    }
  }
  return locationCoordinates.pune;
};

export const initialChatsSeed: ChatThread[] = [
  {
    id: 't-1',
    cropId: 'crop-1',
    cropName: 'Organic Durum Wheat',
    buyerName: 'Premium Agro Buyers',
    farmerName: 'Ramesh Patil',
    lastUpdated: '2026-06-09T14:30:00.000Z',
    unreadForBuyer: false,
    unreadForFarmer: false,
    messages: [
      {
        id: 'm1',
        senderRole: 'buyer',
        text: 'Hello Ramesh, I saw your listing for Organic Durum Wheat. Is the price of ₹24,500 per Ton negotiable for a bulk order of 10 tons?',
        timestamp: '2026-06-09T14:20:00.000Z',
        discussionType: 'price'
      },
      {
        id: 'm2',
        senderRole: 'farmer',
        text: 'Hello! Yes, since you are ordering 10 tons, I can adjust the price slightly to ₹23,800 per Ton. How does that sound?',
        timestamp: '2026-06-09T14:25:00.000Z',
        discussionType: 'price'
      },
      {
        id: 'm3',
        senderRole: 'buyer',
        text: 'That sounds fair. Let me submit the official contract offer now. Thanks!',
        timestamp: '2026-06-09T14:30:00.000Z',
        discussionType: 'price'
      }
    ]
  },
  {
    id: 't-2',
    cropId: 'crop-2',
    cropName: 'Russet Baking Potatoes',
    buyerName: 'Premium Agro Buyers',
    farmerName: 'Suresh Deshmukh',
    lastUpdated: '2026-06-08T10:15:00.000Z',
    unreadForBuyer: false,
    unreadForFarmer: true,
    messages: [
      {
        id: 'm4',
        senderRole: 'buyer',
        text: 'Hi Suresh, we need to arrange cold storage transport for the Russet Potatoes. Can your packaging sustain 3 days in transit?',
        timestamp: '2026-06-08T10:10:00.000Z',
        discussionType: 'delivery'
      },
      {
        id: 'm5',
        senderRole: 'farmer',
        text: 'Yes, absolutely. We package them in aerated crates and they are stored at 8°C right up to loading. They will hold up perfectly.',
        timestamp: '2026-06-08T10:15:00.000Z',
        discussionType: 'delivery'
      }
    ]
  }
];

export const getSimulatedReply = (userMsg: string, cropName: string, userRole: 'buyer' | 'farmer'): string => {
  const msg = userMsg.toLowerCase();
  if (userRole === 'buyer') {
    if (msg.includes('price') || msg.includes('rate') || msg.includes('discount') || msg.includes('negotiable') || msg.includes('cost')) {
      return `For ${cropName}, I want to make sure we both get a fair deal. Since quality is premium, I can offer a 2% discount on bulk, but not much lower. What price were you thinking?`;
    }
    if (msg.includes('quantity') || msg.includes('qty') || msg.includes('volume') || msg.includes('ton') || msg.includes('bag') || msg.includes('kg')) {
      return `We have the listed volume available right now in our storage. If you need more than what's listed, let me know, and I can check with neighboring farms in our cooperative.`;
    }
    if (msg.includes('delivery') || msg.includes('transport') || msg.includes('shipping') || msg.includes('dispatch') || msg.includes('route') || msg.includes('mandi') || msg.includes('location')) {
      return `We are located in Maharashtra and can load the truck by tomorrow morning. We advise temperature-controlled vehicles to preserve freshness during transport.`;
    }
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return `Hello! Thanks for reaching out about ${cropName}. How can I help you with your procurement today?`;
    }
    return `Thank you for the update. Let me review these terms for ${cropName} and check my warehouse availability. I will get back to you shortly.`;
  } else {
    if (msg.includes('price') || msg.includes('rate') || msg.includes('agree') || msg.includes('cost') || msg.includes('payout')) {
      return `Great, thank you for agreeing to the rate. We will deposit the funds into the AgroMart escrow account right away so you can begin harvest.`;
    }
    if (msg.includes('quantity') || msg.includes('volume') || msg.includes('ton')) {
      return `We have standard bulk demands. As long as the grading checks out on arrival, we will likely subscribe to a weekly delivery contract with your farm.`;
    }
    if (msg.includes('ready') || msg.includes('loaded') || msg.includes('dispatch') || msg.includes('delivery')) {
      return `Perfect, please share the driver's contact details and transit manifest as soon as the truck leaves. Our warehouse team is ready for receipt inspection.`;
    }
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return `Hello! We are looking to finalize the procurement details. Let me know if you can meet our price and timeline parameters.`;
    }
    return `Understood. Please let us know once the load is ready for inspection. We're looking forward to standardizing this trade channel!`;
  }
};

export const mockCrops: ActiveListing[] = [
  {
    id: 'crop-1',
    farmer_id: 'farmer-1',
    name: 'Organic Durum Wheat',
    category: 'Grains',
    quantity: 12,
    unit: 'Tons',
    expected_price: 24500,
    description: 'Dry harvested wheat, moisture level strictly below 13.5%. High gluten content.',
    harvest_date: '2026-06-02',
    quality_type: 'Premium',
    location: 'Nashik, Maharashtra',
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop'],
    farmer_name: 'Ramesh Patil',
    rating: 4.8,
    is_verified: true,
    is_otp_verified: true,
    is_gst_verified: true,
    is_kyc_verified: true,
    trust_score: 100
  },
  {
    id: 'crop-2',
    farmer_id: 'farmer-2',
    name: 'Russet Baking Potatoes',
    category: 'Vegetables',
    quantity: 8,
    unit: 'Tons',
    expected_price: 15200,
    description: 'Perfect Grade-A baking potatoes, uniform sizing and solid quality.',
    harvest_date: '2026-06-08',
    quality_type: 'Grade A',
    location: 'Pune Mandi, Maharashtra',
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop'],
    farmer_name: 'Suresh Deshmukh',
    rating: 4.6,
    is_verified: true,
    is_otp_verified: true,
    is_gst_verified: true,
    is_kyc_verified: true,
    trust_score: 100
  },
  {
    id: 'crop-3',
    farmer_id: 'farmer-3',
    name: 'Vine-Ripened Tomatoes',
    category: 'Vegetables',
    quantity: 3,
    unit: 'Tons',
    expected_price: 35000,
    description: 'Juicy premium tomatoes, handpicked and packed in temperature-controlled crates.',
    harvest_date: '2026-06-09',
    quality_type: 'Premium',
    location: 'Manchar, Maharashtra',
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'],
    farmer_name: 'Anil Shinde',
    rating: 4.9,
    is_verified: true,
    is_otp_verified: true,
    is_gst_verified: true,
    is_kyc_verified: true,
    trust_score: 100
  },
  {
    id: '4',
    farmer_id: 'mock-farmer',
    name: 'Premium Soybeans',
    category: 'Grains',
    quantity: 100,
    unit: 'Quintals',
    expected_price: 4500,
    description: 'High protein content soybeans, newly harvested.',
    harvest_date: '2026-06-11',
    quality_type: 'Grade A',
    location: 'Latur, Maharashtra',
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1599839619722-39751411ea63?w=600&auto=format&fit=crop'],
    farmer_name: 'Anil Pawar',
    rating: 4.7,
    is_verified: true,
    is_otp_verified: true,
    is_gst_verified: true,
    is_kyc_verified: true,
    trust_score: 100,
    is_auction: true,
    auction_end_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    bids: [
      { id: 'ab1', buyer_id: 'b-1', buyer_name: 'AgriCorp', amount: 4500, time: new Date(Date.now() - 5*60000).toISOString(), status: 'pending' },
      { id: 'ab2', buyer_id: 'b-2', buyer_name: 'SoyProcessors Ltd', amount: 4650, time: new Date(Date.now() - 2*60000).toISOString(), status: 'pending' },
    ],
    highest_bid: 4650,
  },
  {
    id: 'crop-4',
    farmer_id: 'farmer-4',
    name: 'Golden Sweet Corn',
    category: 'Grains',
    quantity: 5,
    unit: 'Tons',
    expected_price: 18500,
    description: 'Super sweet yellow corn. Grade A ears, zero pesticide residues.',
    harvest_date: '2026-06-05',
    quality_type: 'Grade A',
    location: 'Baramati, Maharashtra',
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1551754655-cd27e38d20f6?w=600&auto=format&fit=crop'],
    farmer_name: 'Vijay Kakade',
    rating: 4.7,
    is_verified: true,
    is_otp_verified: true,
    is_gst_verified: true,
    is_kyc_verified: true,
    trust_score: 100
  },
  {
    id: 'crop-5',
    farmer_id: 'farmer-5',
    name: 'Fresh Honeycrisp Apples',
    category: 'Fruits',
    quantity: 2,
    unit: 'Tons',
    expected_price: 95000,
    description: 'Crisp and sweet honeycrisp variety, harvested from high altitude orchard.',
    harvest_date: '2026-06-01',
    quality_type: 'Premium',
    location: 'Shimla, Himachal Pradesh',
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600&auto=format&fit=crop'],
    farmer_name: 'Rajinder Sharma',
    rating: 4.95,
    is_verified: false,
    is_otp_verified: false,
    is_gst_verified: false,
    is_kyc_verified: false,
    trust_score: 0
  },
];

const mockFarmers = [
  { name: 'Ramesh Patil', location: 'Nashik (12km away)', rating: 4.8, activeCrops: 'Wheat, Grapes', certified: true },
  { name: 'Suresh Deshmukh', location: 'Pune (28km away)', rating: 4.6, activeCrops: 'Potatoes, Onions', certified: true },
  { name: 'Anil Shinde', location: 'Manchar (45km away)', rating: 4.9, activeCrops: 'Tomatoes, Cauliflower', certified: true },
  { name: 'Vijay Kakade', location: 'Baramati (72km away)', rating: 4.7, activeCrops: 'Corn, Sugarcane', certified: true },
];

const categoryMap: Record<string, Record<string, string>> = {
  en: { Grains: 'Grains', Vegetables: 'Vegetables', Fruits: 'Fruits', Oilseeds: 'Oilseeds', Pulses: 'Pulses', Spices: 'Spices' },
  mr: { Grains: 'धान्य', Vegetables: 'भाज्या', Fruits: 'फळे', Oilseeds: 'तेलबिया', Pulses: 'डाळी', Spices: 'मसाले' },
  hi: { Grains: 'अनाज', Vegetables: 'सब्जियां', Fruits: 'फल', Oilseeds: 'तिलहन', Pulses: 'दालें', Spices: 'मसाले' }
};

const gradeMap: Record<string, Record<string, string>> = {
  en: { Premium: 'Premium', 'Grade A': 'Grade A', 'Grade B': 'Grade B', 'Grade C': 'Grade C' },
  mr: { Premium: 'उत्कृष्ट (Premium)', 'Grade A': 'अ दर्जा (Grade A)', 'Grade B': 'ब दर्जा (Grade B)', 'Grade C': 'क दर्जा (Grade C)' },
  hi: { Premium: 'प्रीमियम (Premium)', 'Grade A': 'ए ग्रेड (Grade A)', 'Grade B': 'बी ग्रेड (Grade B)', 'Grade C': 'सी ग्रेड (Grade C)' }
};

const unitMap: Record<string, Record<string, string>> = {
  en: { Tons: 'Tons', Ton: 'Ton', Kgs: 'Kgs', Kg: 'Kg', Quintals: 'Quintals', Quintal: 'Quintal', Bags: 'Bags', Bag: 'Bag' },
  mr: { Tons: 'टण', Ton: 'टण', Kgs: 'किलो', Kg: 'किलो', Quintals: 'क्विंटल', Quintal: 'क्विंटल', Bags: 'पोती', Bag: 'पोते' },
  hi: { Tons: 'टन', Ton: 'टन', Kgs: 'किलो', Kg: 'किलो', Quintals: 'क्विंटल', Quintal: 'क्विंटल', Bags: 'बोरी', Bag: 'बोरी' }
};

const menuLabels = {
  en: {
    viewProfile: 'View Profile',
    editProfile: 'Edit Profile',
    langSettings: 'Language Settings',
    helpCenter: 'Help Center',
    logout: 'Log Out'
  },
  mr: {
    viewProfile: 'प्रोफाईल पहा',
    editProfile: 'प्रोफाईल संपादित करा',
    langSettings: 'भाषा सेटिंग्स',
    helpCenter: 'मदत केंद्र',
    logout: 'लॉग आउट'
  },
  hi: {
    viewProfile: 'प्रोफ़ाइल देखें',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    langSettings: 'भाषा सेटिंग्स',
    helpCenter: 'सहायता केंद्र',
    logout: 'लॉग आउट'
  }
};

const chatLabels = {
  en: {
    title: 'Inquiries & Chats',
    subtitle: 'Direct negotiations with growers',
    discussionOn: 'Discussion on:',
    tag: 'Tag:',
    priceDiscussion: 'Price Discussion',
    volumeInquiry: 'Volume Inquiry',
    deliveryRoute: 'Delivery Route',
    typeMessage: 'Type message details...',
    send: 'Send',
    selectThread: 'Select an Inquiry Thread',
    selectThreadSubtitle: 'Direct peer-to-peer negotiations on prices, logistics and crop volumes',
    general: 'General',
    price: 'Price',
    quantity: 'Quantity',
    delivery: 'Delivery',
    discussionType: 'Discussion Type'
  },
  mr: {
    title: 'चौकशी आणि गप्पा',
    subtitle: 'शेतकऱ्यांशी थेट बोलणी करा',
    discussionOn: 'चर्चा विषय:',
    tag: 'टॅग:',
    priceDiscussion: 'किंमत चर्चा',
    volumeInquiry: 'प्रमाण चौकशी',
    deliveryRoute: 'वाहतूक मार्ग',
    typeMessage: 'मेसेज टाईप करा...',
    send: 'पाठवा',
    selectThread: 'चर्चा निवड करा',
    selectThreadSubtitle: 'किंमत, वाहतूक आणि मालाचे प्रमाण यावर थेट बोलणी करा',
    general: 'सामान्य',
    price: 'किंमत',
    quantity: 'प्रमाण',
    delivery: 'वितरण',
    discussionType: 'चर्चा प्रकार'
  },
  hi: {
    title: 'पूछताछ और चैट',
    subtitle: 'किसानों के साथ सीधी बातचीत करें',
    discussionOn: 'चर्चा विषय:',
    tag: 'टैग:',
    priceDiscussion: 'कीमत चर्चा',
    volumeInquiry: 'मात्रा पूछताछ',
    deliveryRoute: 'परिवहन मार्ग',
    typeMessage: 'संदेश टाइप करें...',
    send: 'भेजें',
    selectThread: 'चर्चा का चयन करें',
    selectThreadSubtitle: 'कीमत, परिवहन और मात्रा पर सीधी बातचीत करें',
    general: 'सामान्य',
    price: 'कीमत',
    quantity: 'मात्रा',
    delivery: 'वितरण',
    discussionType: 'चर्चा प्रकार'
  }
};

const getLocalizedMessageText = (msgId: string, defaultText: string, lang: string) => {
  const translations: Record<string, Record<string, string>> = {
    m1: {
      en: 'Hello Ramesh, I saw your listing for Organic Durum Wheat. Is the price of ₹24,500 per Ton negotiable for a bulk order of 10 tons?',
      mr: 'नमस्कार रमेशजी, मी तुमचे सेंद्रिय गहूचे लिस्टिंग पाहिले. १० टन बल्क ऑर्डरसाठी ₹२४,५०० प्रति टन किंमत कमी होऊ शकते का?',
      hi: 'नमस्कार रमेशजी, मैंने आपकी जैविक गेहूं की लिस्टिंग देखी। १० टन थोक ऑर्डर के लिए ₹२४,५०० प्रति टन कीमत कम हो सकती है क्या?'
    },
    m2: {
      en: 'Hello! Yes, since you are ordering 10 tons, I can adjust the price slightly to ₹23,800 per Ton. How does that sound?',
      mr: 'नमस्कार! होय, तुम्ही १० टन ऑर्डर करत असल्यामुळे, मी किंमत थोडी कमी करून ₹२३,८०० प्रति टन करू शकतो. तुम्हाला काय वाटते?',
      hi: 'नमस्कार! हाँ, चूंकि आप १० टन ऑर्डर कर रहे हैं, मैं कीमत थोड़ी कम करके ₹२३,८०० प्रति टन कर सकता हूँ। आपको कैसा लगा?'
    },
    m3: {
      en: 'That sounds fair. Let me submit the official contract offer now. Thanks!',
      mr: 'हे योग्य वाटते. मी आता अधिकृत करार ऑफर पाठवतो. धन्यवाद!',
      hi: 'यह ठीक लग रहा है। मैं अभी आधिकारिक अनुबंध प्रस्ताव भेजता हूँ। धन्यवाद!'
    },
    m4: {
      en: 'Hi Suresh, we need to arrange cold storage transport for the Russet Potatoes. Can your packaging sustain 3 days in transit?',
      mr: 'हाय सुरेशजी, आपल्याला बटाट्यांसाठी कोल्ड स्टोरेज वाहतुकीची सोय करावी लागेल. warme तुमचे पॅकेजिंग ३ दिवस वाहतुकीमध्ये टिकू शकेल का?',
      hi: 'हाय सुरेशजी, हमें आलू के लिए कोल्ड स्टोरेज परिवहन की व्यवस्था करनी होगी। क्या आपकी पैकेजिंग ३ दिनों तक परिवहन में टिक पाएगी?'
    },
    m5: {
      en: 'Yes, absolutely. We package them in aerated crates and they are stored at 8°C right up to loading. They will hold up perfectly.',
      mr: 'होय, नक्कीच. आम्ही ते हवेशीर क्रेट्समध्ये पॅक करतो आणि लोड करेपर्यंत ८°C तापमानात ठेवतो. ते अगदी सुरक्षित राहतील.',
      hi: 'हाँ, बिल्कुल। हम उन्हें हवादार क्रेटों में पैक करते हैं और लोड होने तक ८°C तापमान पर रखते हैं। वे बिल्कुल सुरक्षित रहेंगे।'
    }
  };
  return translations[msgId] ? (translations[msgId][lang] || defaultText) : defaultText;
};

export default function BuyerDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const { language, setLanguage, t } = useTranslation();

  const [selectedCropForDetail, setSelectedCropForDetail] = useState<ActiveListing | null>(null);
  const [selectedFarmerProfile, setSelectedFarmerProfile] = useState<FarmerProfile | null>(null);
  const [activeCallRecipient, setActiveCallRecipient] = useState<string | null>(null);

  const getFarmerProfileByName = (name: string): FarmerProfile => {
    const farmer = mockFarmers.find(f => f.name === name) || mockFarmers[0];
    return {
      id: `farmer-${name.replace(/\s+/g, '-').toLowerCase()}`,
      name: farmer.name,
      contactNumber: '+91 98765 43210',
      address: `${farmer.location.split(' ')[0]}, Maharashtra, India`,
      isVerified: farmer.certified,
      ratings: farmer.rating,
      reviewsCount: 42,
      memberSince: '2022',
      trustScore: 95,
      activeCrops: farmer.activeCrops,
      listings: crops.filter(c => c.farmer_name === farmer.name).map(c => ({
        id: c.id,
        name: c.name,
        price: c.expected_price,
        unit: c.unit,
        quantity: c.quantity
      })),
      reviews: [
        {
          id: 'r1',
          reviewerName: 'Premium Agro Buyers',
          reviewerRole: 'Buyer',
          rating: 5,
          comment: 'Excellent quality crops and very smooth transaction.',
          date: '2026-05-15T00:00:00.000Z'
        }
      ]
    };
  };

  // Notification States
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [activeToasts, setActiveToasts] = useState<{ id: string; type: string; text: string }[]>([]);

  const pushNotification = (type: string, text: string, role: 'farmer' | 'buyer' | 'admin') => {
    const logStr = localStorage.getItem('agromart_notifications_log');
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
    return newNotif;
  };

  const triggerToast = (id: string, type: string, text: string) => {
    const newToast = { id, type, text };
    setActiveToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Load and seed notifications on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let logStr = localStorage.getItem('agromart_notifications_log');
      if (!logStr) {
        const initialLogs = [
          {
            id: 'n-seed-1',
            type: 'new_offer',
            text: 'New bid received from Patil Wholesale Veggies (+12% above target)',
            time: '5m ago',
            read: false,
            role: 'farmer'
          },
          {
            id: 'n-seed-2',
            type: 'listing_approved',
            text: 'Your verification registration approved!',
            time: '2h ago',
            read: true,
            role: 'farmer'
          },
          {
            id: 'n-seed-3',
            type: 'offer_accepted',
            text: 'Your offer for Organic Durum Wheat was accepted by Ramesh Patil!',
            time: '3h ago',
            read: false,
            role: 'buyer'
          },
          {
            id: 'n-seed-4',
            type: 'demand_alert',
            text: 'New buyer crop requirement posted for Vine-Ripened Tomatoes!',
            time: '1d ago',
            read: true,
            role: 'buyer'
          }
        ];
        localStorage.setItem('agromart_notifications_log', JSON.stringify(initialLogs));
        logStr = JSON.stringify(initialLogs);
      }
      const logs = JSON.parse(logStr);
      // Deduplicate on mount loading
      const uniqueLogs: any[] = [];
      const seenIds = new Set<string>();
      for (const log of logs) {
        if (!seenIds.has(log.id)) {
          seenIds.add(log.id);
          uniqueLogs.push(log);
        }
      }
      setNotifications(uniqueLogs.filter((notif: any) => notif.role === 'buyer'));
    }
  }, []);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageNotifs = (e: StorageEvent) => {
      if (e.key === 'agromart_notifications_log' && e.newValue) {
        const newLogs = JSON.parse(e.newValue);
        
        // Deduplicate logs
        const uniqueLogs: any[] = [];
        const seenIds = new Set<string>();
        for (const log of newLogs) {
          if (!seenIds.has(log.id)) {
            seenIds.add(log.id);
            uniqueLogs.push(log);
          }
        }
        
        setNotifications(prev => {
          const prevIds = new Set(prev.map(p => p.id));
          const newItems = uniqueLogs.filter((notif: any) => notif.role === 'buyer' && !prevIds.has(notif.id));
          
          newItems.forEach((item: any) => {
            triggerToast(item.id, item.type, item.text);
          });

          return uniqueLogs.filter((notif: any) => notif.role === 'buyer');
        });
      }
    };
    window.addEventListener('storage', handleStorageNotifs);
    return () => window.removeEventListener('storage', handleStorageNotifs);
  }, []);

  // Auction Countdown Ticker & Auto-close
  useEffect(() => {
    const timer = setInterval(() => {
      setCrops(prev => {
        let changed = false;
        const now = Date.now();
        const upd = prev.map(l => {
          if (l.is_auction && l.auction_end_time && new Date(l.auction_end_time).getTime() <= now && l.status === 'Available') {
            changed = true;
            return { ...l, status: 'Sold' as const };
          }
          return l;
        });
        return changed ? upd : prev;
      });
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Listen for auction bids via localStorage
  useEffect(() => {
    const handleAuctionBid = (e: StorageEvent) => {
      if (e.key !== 'agromart_auction_bids') return;
      const allBids: { listingId: string; bid: AuctionBid }[] = e.newValue ? JSON.parse(e.newValue) : [];
      if (allBids.length === 0) return;
      
      const latest = allBids[0];
      setCrops(prev => prev.map(l => {
        if (l.id === latest.listingId && l.is_auction) {
          const newBids = [latest.bid, ...(l.bids || [])];
          return {
            ...l,
            bids: newBids,
            highest_bid: Math.max(l.highest_bid || l.expected_price, latest.bid.amount)
          };
        }
        return l;
      }));
    };
    window.addEventListener('storage', handleAuctionBid);
    return () => window.removeEventListener('storage', handleAuctionBid);
  }, []);

  // Listen for menu toggle event from layout header
  useEffect(() => {
    const handleToggle = () => {
      setIsMobileMenuOpen(prev => !prev);
      setIsSidebarOpen(prev => !prev);
    };
    window.addEventListener('toggle-mobile-menu', handleToggle);
    return () => window.removeEventListener('toggle-mobile-menu', handleToggle);
  }, []);

  const handlePlaceBid = (listing: ActiveListing) => {
    const amount = Number(bidInputs[listing.id] || 0);
    if (!amount || isNaN(amount)) return;
    const currentHigh = listing.highest_bid || listing.expected_price;
    if (amount <= currentHigh) {
      triggerToast(`err-${Date.now()}`, 'error', `Bid must be higher than ₹${currentHigh.toLocaleString()}`);
      return;
    }

    const newBid: AuctionBid = {
      id: `ab-${Date.now()}`,
      buyer_id: user?.id || 'mock-buyer-1',
      buyer_name: user?.user_metadata?.fullName || 'Premium Agro Buyers',
      amount,
      time: new Date().toISOString(),
      status: 'pending'
    };

    // Update local state
    setCrops(prev => prev.map(l => {
      if (l.id === listing.id) {
        return {
          ...l,
          bids: [newBid, ...(l.bids || [])],
          highest_bid: amount
        };
      }
      return l;
    }));
    
    // Clear input
    setBidInputs(prev => ({ ...prev, [listing.id]: '' }));

    // Sync via storage
    const stored = localStorage.getItem('agromart_auction_bids');
    const allBids = stored ? JSON.parse(stored) : [];
    const updated = [{ listingId: listing.id, bid: newBid }, ...allBids];
    localStorage.setItem('agromart_auction_bids', JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', { key: 'agromart_auction_bids', newValue: JSON.stringify(updated) }));

    triggerToast(`bid-${Date.now()}`, 'success', `Successfully bid ₹${amount.toLocaleString()} for ${listing.name}`);
    pushNotification('new_offer', `You placed a bid of ₹${amount.toLocaleString()} for ${listing.name}.`, 'buyer');
  };

  const handleMarkAllRead = () => {
    const logStr = localStorage.getItem('agromart_notifications_log');
    if (logStr) {
      const logs = JSON.parse(logStr);
      const updated = logs.map((notif: any) => {
        if (notif.role === 'buyer') {
          return { ...notif, read: true };
        }
        return notif;
      });
      localStorage.setItem('agromart_notifications_log', JSON.stringify(updated));
      setNotifications(updated.filter((notif: any) => notif.role === 'buyer'));
    }
  };

  const handleMarkRead = (id: string) => {
    const logStr = localStorage.getItem('agromart_notifications_log');
    if (logStr) {
      const logs = JSON.parse(logStr);
      const updated = logs.map((notif: any) => {
        if (notif.id === id) {
          return { ...notif, read: true };
        }
        return notif;
      });
      localStorage.setItem('agromart_notifications_log', JSON.stringify(updated));
      setNotifications(updated.filter((notif: any) => notif.role === 'buyer'));
    }
  };

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'marketplace' | 'offers' | 'saved' | 'trends' | 'chat' | 'recommendations' | 'demands' | 'profile' | 'transactions' | 'support'>('marketplace');

  // Verification States
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isGstModalOpen, setIsGstModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [gstInput, setGstInput] = useState('');
  const [kycDocType, setKycDocType] = useState('Aadhaar');
  const [fakeKycFileName, setFakeKycFileName] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccessMsg, setVerificationSuccessMsg] = useState('');
  const [simulatedBusiness, setSimulatedBusiness] = useState('');
  const [isScanningKyc, setIsScanningKyc] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Crop Demands States
  const [demands, setDemands] = useState<CropDemand[]>([]);
  const [isPostDemandOpen, setIsPostDemandOpen] = useState(false);
  const [demandCropName, setDemandCropName] = useState('');
  const [demandCategory, setDemandCategory] = useState('Grains');
  const [demandQty, setDemandQty] = useState('');
  const [demandUnit, setDemandUnit] = useState('Tons');
  const [demandPrice, setDemandPrice] = useState('');
  const [demandLocation, setDemandLocation] = useState('');
  const [demandLatitude, setDemandLatitude] = useState<number | null>(null);
  const [demandLongitude, setDemandLongitude] = useState<number | null>(null);
  const [demandDescription, setDemandDescription] = useState('');
  const [demandFormErrors, setDemandFormErrors] = useState<Record<string, string>>({});
  const [demandGpsLoading, setDemandGpsLoading] = useState(false);
  const [isDemandMapOpen, setIsDemandMapOpen] = useState(false);

  // User details & location
  const [user, setUser] = useState<any>(null);
  const [userLocation, setUserLocation] = useState('');
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [hasFetchedProfile, setHasFetchedProfile] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [parsedLocation, setParsedLocation] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [radiusFilter, setRadiusFilter] = useState<string>('All');
  const [sortByDistance, setSortByDistance] = useState<boolean>(false);
  const [selectedCropMarkerId, setSelectedCropMarkerId] = useState<string | null>(null);
  const [routeDestination, setRouteDestination] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);

  // Data States
  const [crops, setCrops] = useState<ActiveListing[]>(mockCrops);
  const isFarmerVerified = (farmerName: string, cropId?: string) => {
    if (['Ramesh Patil', 'Suresh Deshmukh', 'Anil Shinde', 'Vijay Kakade'].includes(farmerName)) {
      return true;
    }
    const crop = crops.find(c => (cropId && c.id === cropId) || c.farmer_name === farmerName);
    return !!crop?.is_verified;
  };

  const syncBuyerDemandsVerification = (updatedUser: any) => {
    const isOtp = !!updatedUser?.user_metadata?.is_otp_verified;
    const isGst = !!updatedUser?.user_metadata?.is_gst_verified;
    const isKyc = !!updatedUser?.user_metadata?.is_kyc_verified;
    const score = (isOtp ? 30 : 0) + (isGst ? 35 : 0) + (isKyc ? 35 : 0);
    const isVerified = isOtp || isGst || isKyc;

    const stored = localStorage.getItem('agromart_crop_demands');
    if (stored) {
      try {
        const demandsList: CropDemand[] = JSON.parse(stored);
        const updatedDemands = demandsList.map(d => {
          if (d.buyer_id === updatedUser.id || d.buyer_name === (updatedUser.user_metadata?.fullName || 'Premium Agro Buyers')) {
            return {
              ...d,
              is_verified: isVerified,
              is_otp_verified: isOtp,
              is_gst_verified: isGst,
              is_kyc_verified: isKyc,
              trust_score: score
            };
          }
          return d;
        });
        localStorage.setItem('agromart_crop_demands', JSON.stringify(updatedDemands));
        setDemands(updatedDemands);
      } catch (e) {
        console.warn('Failed to sync demands verification:', e);
      }
    }
  };

  const [savedIds, setSavedIds] = useState<string[]>(['crop-2']); // Initial bookmark
  const [sentOffers, setSentOffers] = useState<OfferItem[]>([
    {
      id: 'o-1',
      cropId: 'crop-1',
      cropName: 'Organic Durum Wheat',
      farmerName: 'Ramesh Patil',
      originalPrice: 24500,
      offeredPrice: 23800,
      quantity: 5,
      unit: 'Tons',
      status: 'Pending',
      date: '2026-06-09'
    },
    {
      id: 'o-2',
      cropId: 'crop-4',
      cropName: 'Golden Sweet Corn',
      farmerName: 'Vijay Kakade',
      originalPrice: 18500,
      offeredPrice: 18500,
      quantity: 2,
      unit: 'Tons',
      status: 'Accepted',
      date: '2026-06-08'
    }
  ]);

  // Modal Bid States
  const [selectedCrop, setSelectedCrop] = useState<ActiveListing | null>(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidQty, setBidQty] = useState('');
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});

  // Chat Inbox States
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatCategory, setChatCategory] = useState<'price' | 'quantity' | 'delivery' | 'general'>('general');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const tabsList = [
    { id: 'marketplace', icon: ShoppingCart, label: t.dashboard.buyer.tabMarketplace, showNotification: false },
    { id: 'offers', icon: Send, label: t.dashboard.buyer.tabOffers, showNotification: sentOffers.filter(o => o.status === 'Pending').length > 0 },
    { id: 'chat', icon: MessageSquare, label: t.dashboard.buyer.tabChat, showNotification: threads.some(thread => thread.unreadForBuyer), isChatDot: true },
    { id: 'saved', icon: Heart, label: `${t.dashboard.buyer.tabSaved} (${savedIds.length})`, showNotification: false },
    { id: 'trends', icon: TrendingUp, label: t.dashboard.buyer.tabTrends, showNotification: false },
    { id: 'recommendations', icon: Sparkles, label: t.dashboard.buyer.tabRecommendations, showNotification: false },
    { id: 'demands', icon: Compass, label: t.cropDemands.tabMyDemands, showNotification: false },
    { id: 'transactions', icon: FileText, label: language === 'mr' ? 'व्यवहार' : language === 'hi' ? 'लेन-देन' : 'Transactions', showNotification: false },
    { id: 'support', icon: HelpCircle, label: language === 'mr' ? 'मदत व तक्रार' : language === 'hi' ? 'मदद और सहायता' : 'Help & Support', showNotification: false },
  ] as const;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agromart_chats');
      if (stored) {
        setThreads(JSON.parse(stored));
      } else {
        localStorage.setItem('agromart_chats', JSON.stringify(initialChatsSeed));
        setThreads(initialChatsSeed);
      }
    }
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'agromart_chats' && e.newValue) {
        setThreads(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agromart_crop_demands');
      if (stored) {
        setDemands(JSON.parse(stored));
      } else {
        localStorage.setItem('agromart_crop_demands', JSON.stringify(initialDemandsSeed));
        setDemands(initialDemandsSeed);
      }
    }
  }, []);

  useEffect(() => {
    const handleStorageDemands = (e: StorageEvent) => {
      if (e.key === 'agromart_crop_demands' && e.newValue) {
        setDemands(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageDemands);
    return () => window.removeEventListener('storage', handleStorageDemands);
  }, []);

  // Buyer Dashboard Farmer replier simulation
  useEffect(() => {
    if (threads.length === 0 || !activeThreadId) return;
    const activeThread = threads.find(t => t.id === activeThreadId);
    if (!activeThread) return;
    const messages = activeThread.messages;
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (lastMsg.senderRole === 'buyer') {
      setIsTyping(true);
      const delay = setTimeout(() => {
        setIsTyping(false);
        const replyText = getSimulatedReply(lastMsg.text, activeThread.cropName, 'buyer');
        const replyMsg: Message = {
          id: `m-rep-${Date.now()}`,
          senderRole: 'farmer',
          text: replyText,
          timestamp: new Date().toISOString(),
          discussionType: lastMsg.discussionType || 'general'
        };
        const updated = threads.map(t => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              messages: [...t.messages, replyMsg],
              lastUpdated: new Date().toISOString(),
              unreadForBuyer: true,
              unreadForFarmer: false
            };
          }
          return t;
        });
        setThreads(updated);
        localStorage.setItem('agromart_chats', JSON.stringify(updated));
      }, 1500);
      return () => clearTimeout(delay);
    }
  }, [threads, activeThreadId]);

  const startChatWithFarmer = (crop: ActiveListing) => {
    const existing = threads.find(t => t.cropId === crop.id);
    if (existing) {
      setActiveThreadId(existing.id);
      const updated = threads.map(t => t.id === existing.id ? { ...t, unreadForBuyer: false } : t);
      setThreads(updated);
      localStorage.setItem('agromart_chats', JSON.stringify(updated));
    } else {
      const newThread: ChatThread = {
        id: `t-${Date.now()}`,
        cropId: crop.id,
        cropName: crop.name,
        buyerName: 'Premium Agro Buyers',
        farmerName: crop.farmer_name || 'Verified Farmer',
        lastUpdated: new Date().toISOString(),
        unreadForBuyer: false,
        unreadForFarmer: true,
        messages: [
          {
            id: `m-${Date.now()}`,
            senderRole: 'farmer',
            text: `Hello! I listed ${crop.name} at ₹${crop.expected_price.toLocaleString('en-IN')} / ${crop.unit.toLowerCase().replace(/s$/, '')}. Let me know if you would like to discuss price negotiations, volume availability, or cold chain logistics delivery!`,
            timestamp: new Date().toISOString(),
            discussionType: 'general'
          }
        ]
      };
      const updated = [newThread, ...threads];
      setThreads(updated);
      localStorage.setItem('agromart_chats', JSON.stringify(updated));
      setActiveThreadId(newThread.id);
    }
    setActiveTab('chat');
  };

  const startChatWithFarmerName = (farmerName: string) => {
    const matchingCrop = crops.find(c => c.farmer_name === farmerName) || {
      id: 'crop-1',
      name: 'Organic Durum Wheat',
      farmer_name: farmerName,
      expected_price: 24500,
      unit: 'Tons',
      location: 'Nashik, Maharashtra',
      category: 'Grains',
      status: 'Available',
      description: '',
      harvest_date: '',
      quality_type: 'Premium'
    };
    startChatWithFarmer(matchingCrop as any);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeThreadId) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderRole: 'buyer',
      text: chatInput.trim(),
      timestamp: new Date().toISOString(),
      discussionType: chatCategory
    };

    const updated = threads.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          messages: [...t.messages, newMsg],
          lastUpdated: new Date().toISOString(),
          unreadForFarmer: true,
          unreadForBuyer: false
        };
      }
      return t;
    });

    setThreads(updated);
    localStorage.setItem('agromart_chats', JSON.stringify(updated));
    setChatInput('');
  };

  const handleDetectBuyerLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await supabase.auth.updateUser({
            data: { latitude, longitude }
          });
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user);
          setUserLocation(`GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          setGpsLoading(false);
        } catch (e) {
          console.error(e);
          setGpsLoading(false);
        }
      },
      (error) => {
        console.error('GPS error:', error);
        alert('Failed to detect location: ' + error.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    // Check active session and load user metadata
    const checkUserSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const metadata = currentUser.user_metadata || {};
          const userLoc = [metadata.village, metadata.district, metadata.state]
            .filter(Boolean)
            .join(', ');
          setUserLocation(userLoc);
        }
      } catch (e) {
        console.warn('Supabase session load failed:', e);
      }
    };
    checkUserSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    // Attempt to load from database if active table, synchronizing with localStorage
    const loadDbCrops = async () => {
      let activeCropsList = [...mockCrops];
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('agromart_crops');
        if (stored) {
          try {
            activeCropsList = JSON.parse(stored);
          } catch (e) {
            console.warn('Error parsing agromart_crops from localStorage');
          }
        } else {
          localStorage.setItem('agromart_crops', JSON.stringify(mockCrops));
        }
      }

      try {
        const { data, error } = await supabase
          .from('crops')
          .select('*')
          .eq('status', 'Available');
        if (!error && data && data.length > 0) {
          // Merge Database crops with fallback active crops list
          const merged = [...data.map((c: any) => ({
            ...c,
            farmer_name: c.farmer_name || 'Verified Farmer',
            rating: c.rating || 4.5,
            images: c.images || ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600']
          })), ...activeCropsList.filter(mc => !data.some((d: any) => d.id === mc.id || d.name === mc.name))];
          setCrops(merged);
          if (typeof window !== 'undefined') {
            localStorage.setItem('agromart_crops', JSON.stringify(merged));
          }
        } else {
          setCrops(activeCropsList);
        }
      } catch (e) {
        console.warn('Database fetch failed, using localStorage crops list.');
        setCrops(activeCropsList);
      }
    };
    loadDbCrops();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Trust Calculations
  const isOtpVerified = !!user?.user_metadata?.is_otp_verified;
  const isGstVerified = !!user?.user_metadata?.is_gst_verified;
  const isKycVerified = !!user?.user_metadata?.is_kyc_verified;
  const gstNumber = user?.user_metadata?.gst_number || '';
  const kycDocTypeSelected = user?.user_metadata?.kyc_doc_type || '';

  const trustScore = (isOtpVerified ? 30 : 0) + (isGstVerified ? 35 : 0) + (isKycVerified ? 35 : 0);

  const fetchProfileFromSupabase = async (userId: string) => {
    setIsProfileLoading(true);
    setProfileError(null);
    console.log('[DEBUG] Auth user ID:', userId);

    try {
      // Try buyer_profiles table first
      let { data, error } = await supabase
        .from('buyer_profiles')
        .select('*')
        .eq('user_id', userId);

      let activeTable = 'buyer_profiles';
      let profileRow = data && data.length > 0 ? data[0] : null;

      if (error) {
        console.warn('[DEBUG] Error fetching from buyer_profiles, checking profiles table:', error.message);
        // Try profiles table
        const fallback = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId);
        
        profileRow = fallback.data && fallback.data.length > 0 ? fallback.data[0] : null;
        error = fallback.error;
        activeTable = 'profiles';
      }

      console.log('[DEBUG] Fetched profile data from table', activeTable, ':', profileRow);

      if (error) {
        throw error;
      }

      if (profileRow) {
        // Map database record to BuyerProfile object
        const mappedProfile: BuyerProfile = {
          id: userId,
          shopName: profileRow.shop_name || profileRow.shopName || '',
          ownerName: profileRow.owner_name || profileRow.ownerName || '',
          profilePhoto: profileRow.profile_photo || profileRow.profile_photo_url || profileRow.profilePhoto || '',
          bannerImage: profileRow.banner_image || profileRow.shop_banner_image_url || profileRow.bannerImage || '',
          contactNumber: profileRow.contact_number || profileRow.contactNumber || '',
          address: profileRow.address || profileRow.shop_address || '',
          googleMapsUrl: profileRow.google_maps_url || profileRow.google_maps_link || profileRow.googleMapsUrl || '',
          businessType: profileRow.business_type || profileRow.businessType || 'Other',
          gstNumber: profileRow.gst_number || profileRow.gstNumber || '',
          isVerified: !!(profileRow.is_verified ?? profileRow.isVerified),
          ratings: Number(profileRow.ratings ?? profileRow.rating ?? 4.8),
          reviewsCount: Number(profileRow.reviews_count ?? profileRow.reviewsCount ?? 0),
          workingDays: profileRow.working_days || profileRow.workingDays || 'Monday - Saturday',
          timings: profileRow.timings || (profileRow.opening_time && profileRow.closing_time ? `${profileRow.opening_time} - ${profileRow.closing_time}` : '09:00 AM - 06:00 PM'),
          memberSince: profileRow.created_at || profileRow.member_since || profileRow.memberSince || new Date().toISOString(),
          reviews: profileRow.reviews || [],
          buyingRates: profileRow.buying_rates || [],
          recentDeals: profileRow.recent_deals || [],
        };
        setBuyerProfile(mappedProfile);
        setHasFetchedProfile(true);
        return mappedProfile;
      } else {
        // Profile does not exist yet. Initialize blank profile structure without sample/demo data.
        const blankProfile: BuyerProfile = {
          id: userId,
          shopName: '',
          ownerName: user?.user_metadata?.fullName || user?.user_metadata?.full_name || '',
          profilePhoto: '',
          bannerImage: '',
          contactNumber: user?.phone || '',
          address: '',
          googleMapsUrl: '',
          businessType: 'Other',
          gstNumber: user?.user_metadata?.gst_number || '',
          isVerified: false,
          ratings: 5.0,
          reviewsCount: 0,
          workingDays: 'Monday - Saturday',
          timings: '09:00 AM - 06:00 PM',
          memberSince: new Date().toISOString(),
          reviews: [],
          buyingRates: [],
          recentDeals: [],
        };
        setBuyerProfile(blankProfile);
        setHasFetchedProfile(true);
        return blankProfile;
      }
    } catch (err: any) {
      console.error('[DEBUG] Fetch Profile Error:', err);
      setProfileError(err.message || 'Failed to load profile details.');
      throw err;
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleOpenEditProfile = async () => {
    if (!user?.id) {
      alert('You must be logged in to edit your profile.');
      return;
    }
    try {
      await fetchProfileFromSupabase(user.id);
      setIsProfileEditOpen(true);
    } catch (err: any) {
      // Error is already logged and set in state
    }
  };

  // Initial Load from Supabase Auth user transition
  useEffect(() => {
    if (user?.id) {
      fetchProfileFromSupabase(user.id).catch((e) => {
        console.warn('Initial profile load from Supabase failed, trying localStorage:', e);
        const storageKey = `agromart_buyer_profile_${user.id}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            setBuyerProfile(JSON.parse(stored));
          } catch {}
        }
      });
    }
  }, [user]);

  const handleSaveProfile = async (updatedProfile: BuyerProfile) => {
    if (!user?.id) return;
    
    setIsProfileLoading(true);
    setProfileError(null);

    // Map camelCase fields to snake_case structure
    const dbData: any = {
      shop_name: updatedProfile.shopName,
      owner_name: updatedProfile.ownerName,
      profile_photo: updatedProfile.profilePhoto,
      banner_image: updatedProfile.bannerImage,
      contact_number: updatedProfile.contactNumber,
      business_type: updatedProfile.businessType,
      gst_number: updatedProfile.gstNumber,
      address: updatedProfile.address,
      google_maps_url: updatedProfile.googleMapsUrl,
      working_days: updatedProfile.workingDays,
      timings: updatedProfile.timings,
    };

    console.log('[DEBUG] Saving profile data to Supabase:', dbData);

    try {
      let activeTable = 'buyer_profiles';
      
      // Check if row already exists in buyer_profiles
      let { data: existingRows, error: checkError } = await supabase
        .from('buyer_profiles')
        .select('id')
        .eq('user_id', user.id);

      let existingRow = existingRows && existingRows.length > 0 ? existingRows[0] : null;

      if (checkError) {
        console.warn('[DEBUG] Error checking buyer_profiles table, switching to profiles table:', checkError.message);
        activeTable = 'profiles';
        
        // Check profiles table
        const fallbackCheck = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id);
        
        existingRow = fallbackCheck.data && fallbackCheck.data.length > 0 ? fallbackCheck.data[0] : null;
      }

      let saveResponse: any = null;

      if (activeTable === 'buyer_profiles') {
        if (existingRow) {
          saveResponse = await supabase
            .from('buyer_profiles')
            .update(dbData)
            .eq('user_id', user.id)
            .select();
        } else {
          saveResponse = await supabase
            .from('buyer_profiles')
            .insert({ ...dbData, user_id: user.id })
            .select();
        }
      } else {
        if (existingRow) {
          saveResponse = await supabase
            .from('profiles')
            .update(dbData)
            .eq('id', user.id)
            .select();
        } else {
          saveResponse = await supabase
            .from('profiles')
            .insert({ ...dbData, id: user.id })
            .select();
        }
      }

      console.log('[DEBUG] Update response:', saveResponse);

      if (saveResponse?.error) {
        throw saveResponse.error;
      }

      setBuyerProfile(updatedProfile);
      if (typeof window !== 'undefined') {
        const storageKey = `agromart_buyer_profile_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
      }

      pushNotification(
        'listing_approved',
        'Your shop profile details have been updated successfully and are now visible to farmers.',
        'buyer'
      );
    } catch (err: any) {
      console.error('[DEBUG] Save Profile Error:', err);
      setProfileError(err.message || 'Failed to save profile details.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleSendOtp = () => {
    setSmsSent(true);
    setVerificationSuccessMsg(t.verification.otpSent || 'OTP code has been sent!');
    setVerificationError('');
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setVerificationError('Please enter a valid 6-digit OTP code.');
      return;
    }
    setVerificationError('');
    const { data, error } = await supabase.auth.updateUser({
      data: { is_otp_verified: true }
    });
    if (!error && data?.user) {
      setUser(data.user);
      syncBuyerDemandsVerification(data.user);
      pushNotification(
        'listing_approved',
        `Mobile OTP verification approved! Trust Score: 30%.`,
        'buyer'
      );
      setVerificationSuccessMsg(t.verification.verificationSuccess || 'Credential verified successfully!');
      setTimeout(() => {
        setIsOtpModalOpen(false);
      }, 1000);
    } else {
      setVerificationError('Failed to verify OTP. Please try again.');
    }
  };

  const handleGstChange = (val: string) => {
    setGstInput(val);
    if (val.length === 15) {
      setSimulatedBusiness('Agro Wholesale Partners Pvt. Ltd. (Maharashtra Region Linked)');
    } else {
      setSimulatedBusiness('');
    }
  };

  const handleVerifyGstSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gstInput.length !== 15) {
      setVerificationError('GST registration code must be exactly 15 characters long.');
      return;
    }
    setVerificationError('');
    const { data, error } = await supabase.auth.updateUser({
      data: { is_gst_verified: true, gst_number: gstInput }
    });
    if (!error && data?.user) {
      setUser(data.user);
      syncBuyerDemandsVerification(data.user);
      const isOtp = !!data.user?.user_metadata?.is_otp_verified;
      const isKyc = !!data.user?.user_metadata?.is_kyc_verified;
      const newScore = (isOtp ? 30 : 0) + 35 + (isKyc ? 35 : 0);
      pushNotification(
        'listing_approved',
        `GST registration verification approved for ${gstInput}! Trust Score: ${newScore}%.`,
        'buyer'
      );
      setVerificationSuccessMsg(t.verification.verificationSuccess || 'Credential verified successfully!');
      setTimeout(() => {
        setIsGstModalOpen(false);
      }, 1000);
    } else {
      setVerificationError('Failed to verify GST. Please try again.');
    }
  };

  const handleVerifyKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fakeKycFileName) {
      setVerificationError('Please select a photo or file document to upload.');
      return;
    }
    setVerificationError('');
    setIsScanningKyc(true);
    setScanProgress(10);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishKycVerification();
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  const finishKycVerification = async () => {
    const { data, error } = await supabase.auth.updateUser({
      data: { is_kyc_verified: true, kyc_doc_type: kycDocType }
    });
    if (!error && data?.user) {
      setUser(data.user);
      syncBuyerDemandsVerification(data.user);
      setIsScanningKyc(false);
      const isOtp = !!data.user?.user_metadata?.is_otp_verified;
      const isGst = !!data.user?.user_metadata?.is_gst_verified;
      const newScore = (isOtp ? 30 : 0) + (isGst ? 35 : 0) + 35;
      pushNotification(
        'listing_approved',
        `KYC document verification (${kycDocType}) approved! Trust Score: ${newScore}%.`,
        'buyer'
      );
      setVerificationSuccessMsg(t.verification.verificationSuccess || 'Credential verified successfully!');
      setTimeout(() => {
        setIsKycModalOpen(false);
      }, 1000);
    } else {
      setIsScanningKyc(false);
      setVerificationError('Failed to verify document. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Toggle Save / Bookmark
  const handleToggleSave = (cropId: string) => {
    if (savedIds.includes(cropId)) {
      setSavedIds(prev => prev.filter(id => id !== cropId));
    } else {
      setSavedIds(prev => [...prev, cropId]);
    }
  };

  // Trigger Bid Modal
  const openBidModal = (crop: ActiveListing) => {
    setSelectedCrop(crop);
    setBidPrice(crop.expected_price.toString());
    setBidQty(crop.quantity.toString());
    setBidError(null);
    setBidSuccess(false);
    setEditingOfferId(null);
  };

  // Trigger Edit Bid Modal
  const handleEditOfferClick = (offer: OfferItem) => {
    const crop = crops.find(c => c.id === offer.cropId) || {
      id: offer.cropId,
      farmer_id: '',
      name: offer.cropName,
      farmer_name: offer.farmerName,
      expected_price: offer.originalPrice,
      quantity: offer.quantity,
      unit: offer.unit,
      category: 'Grains',
      location: '',
      status: 'Available' as const,
      description: '',
      harvest_date: '',
      quality_type: 'Premium'
    };
    setSelectedCrop(crop);
    setBidPrice(offer.offeredPrice.toString());
    setBidQty(offer.quantity.toString());
    setEditingOfferId(offer.id);
    setBidError(null);
    setBidSuccess(false);
  };

  const handleWithdrawOffer = (offerId: string) => {
    if (!confirm('Are you sure you want to withdraw this direct offer?')) return;
    setSentOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'Withdrawn' } : o));
  };

  const handleSendOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBidError(null);

    if (!selectedCrop) return;

    const priceNum = Number(bidPrice);
    const qtyNum = Number(bidQty);

    if (isNaN(priceNum) || priceNum <= 0) {
      setBidError('Offer price must be a valid positive number.');
      return;
    }

    if (isNaN(qtyNum) || qtyNum <= 0 || qtyNum > selectedCrop.quantity) {
      setBidError(`Quantity must be a positive number up to available (${selectedCrop.quantity} ${selectedCrop.unit}).`);
      return;
    }

    if (editingOfferId) {
      setSentOffers(prev => prev.map(o => o.id === editingOfferId ? {
        ...o,
        offeredPrice: priceNum,
        quantity: qtyNum,
        date: new Date().toISOString().split('T')[0]
      } : o));
    } else {
      const newOffer: OfferItem = {
        id: `o-${Date.now()}`,
        cropId: selectedCrop.id,
        cropName: selectedCrop.name,
        farmerName: selectedCrop.farmer_name || 'Verified Farmer',
        originalPrice: selectedCrop.expected_price,
        offeredPrice: priceNum,
        quantity: qtyNum,
        unit: selectedCrop.unit,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      };
      setSentOffers(prev => [newOffer, ...prev]);

      // Notify farmer
      const pricePercent = Math.round(((priceNum - selectedCrop.expected_price) / selectedCrop.expected_price) * 100);
      const percentSign = pricePercent >= 0 ? '+' : '';
      pushNotification(
        'new_offer',
        `New offer received for ${selectedCrop.name} from ${user?.user_metadata?.fullName || 'Premium Agro Buyers'} (${percentSign}${pricePercent}% vs target rate)`,
        'farmer'
      );
    }

    setBidSuccess(true);
    setTimeout(() => {
      setSelectedCrop(null);
      setEditingOfferId(null);
      setBidSuccess(false);
    }, 1200);
  };

  const handleDetectDemandLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDemandGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDemandLatitude(latitude);
        setDemandLongitude(longitude);
        setDemandLocation(`Detected GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setDemandGpsLoading(false);
      },
      (error) => {
        console.error('GPS error:', error);
        alert('Failed to detect location: ' + error.message);
        setDemandGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePostDemandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!demandCropName.trim()) errors.name = 'Crop Required is required';
    if (!demandQty.trim() || isNaN(Number(demandQty)) || Number(demandQty) <= 0) {
      errors.qty = 'Quantity must be a positive number';
    }
    if (!demandPrice.trim() || isNaN(Number(demandPrice)) || Number(demandPrice) <= 0) {
      errors.price = 'Expected Price must be a positive number';
    }
    if (!demandLocation.trim()) errors.location = 'Location is required';

    if (Object.keys(errors).length > 0) {
      setDemandFormErrors(errors);
      return;
    }

    const newDemand: CropDemand = {
      id: `d-${Date.now()}`,
      buyer_id: user?.id || 'mock-buyer-1',
      buyer_name: user?.user_metadata?.fullName || 'Premium Agro Buyers',
      crop_name: demandCropName.trim(),
      category: demandCategory,
      quantity: Number(demandQty),
      unit: demandUnit,
      expected_price: Number(demandPrice),
      location: demandLocation.trim(),
      latitude: demandLatitude || 18.5204, // Default Pune
      longitude: demandLongitude || 73.8567,
      description: demandDescription.trim(),
      created_at: new Date().toISOString(),
      status: 'Open',
      is_verified: !!user?.user_metadata?.is_otp_verified || !!user?.user_metadata?.is_gst_verified || !!user?.user_metadata?.is_kyc_verified,
      is_otp_verified: !!user?.user_metadata?.is_otp_verified,
      is_gst_verified: !!user?.user_metadata?.is_gst_verified,
      is_kyc_verified: !!user?.user_metadata?.is_kyc_verified,
      trust_score: (user?.user_metadata?.is_otp_verified ? 30 : 0) + (user?.user_metadata?.is_gst_verified ? 35 : 0) + (user?.user_metadata?.is_kyc_verified ? 35 : 0)
    };

    const updated = [newDemand, ...demands];
    setDemands(updated);
    localStorage.setItem('agromart_crop_demands', JSON.stringify(updated));

    // Notify farmers about the new crop requirement
    pushNotification(
      'demand_alert',
      `New buyer crop requirement posted for ${demandCropName.trim()} in ${demandLocation.trim()}`,
      'farmer'
    );

    // Reset Form
    setDemandCropName('');
    setDemandCategory('Grains');
    setDemandQty('');
    setDemandUnit('Tons');
    setDemandPrice('');
    setDemandLocation('');
    setDemandLatitude(null);
    setDemandLongitude(null);
    setDemandDescription('');
    setDemandFormErrors({});
    setIsPostDemandOpen(false);

    alert(t.cropDemands.postSuccess || 'Requirement posted successfully!');
  };

  const handleToggleDemandStatus = (demandId: string, currentStatus: 'Open' | 'Closed') => {
    const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
    const updated = demands.map(d => d.id === demandId ? { ...d, status: newStatus as 'Open' | 'Closed' } : d);
    setDemands(updated);
    localStorage.setItem('agromart_crop_demands', JSON.stringify(updated));
  };

  const handleDeleteDemand = (demandId: string) => {
    if (!confirm('Are you sure you want to delete this crop requirement?')) return;
    const updated = demands.filter(d => d.id !== demandId);
    setDemands(updated);
    localStorage.setItem('agromart_crop_demands', JSON.stringify(updated));
  };

  const metadataCoords = user?.user_metadata?.latitude && user?.user_metadata?.longitude
    ? { lat: Number(user.user_metadata.latitude), lon: Number(user.user_metadata.longitude) }
    : null;
  const userCoords = metadataCoords || getCoordinates(userLocation);

  const handleSmartSearch = (query: string, parsedCrop?: string, parsedLoc?: string) => {
    setSearchQuery(parsedCrop || query);
    setParsedLocation(parsedLoc || null);
  };

  const getCropDistance = (crop: ActiveListing) => {
    const startCoords = userCoords;
    const cropCoords = crop.latitude && crop.longitude
      ? { lat: crop.latitude, lon: crop.longitude }
      : getCoordinates(crop.location);
    return getDistanceInKm(startCoords.lat, startCoords.lon, cropCoords.lat, cropCoords.lon);
  };

  // Filter logic
  const filteredCrops = crops.filter(crop => {
    // Search filter
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          crop.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === 'All' || crop.category === categoryFilter;

    // Price filter
    let matchesPrice = true;
    if (priceFilter === 'under-200') matchesPrice = crop.expected_price < 20000;
    else if (priceFilter === '200-500') matchesPrice = crop.expected_price >= 20000 && crop.expected_price <= 50000;
    else if (priceFilter === 'over-500') matchesPrice = crop.expected_price > 50000;

    // Quality Grade filter
    const matchesGrade = gradeFilter === 'All' || crop.quality_type === gradeFilter;

    // Distance filter
    let matchesDistance = true;
    if (radiusFilter !== 'All') {
      const distance = getCropDistance(crop);
      matchesDistance = distance <= Number(radiusFilter);
    }

    return matchesSearch && matchesCategory && matchesPrice && matchesGrade && matchesDistance && crop.status === 'Available';
  });

  const sortedCrops = [...filteredCrops].sort((a, b) => {
    if (sortByDistance) {
      return getCropDistance(a) - getCropDistance(b);
    }
    return 0;
  });
  const dummyBuyerProfile: BuyerProfile = {
    id: user?.id || 'buyer-1',
    shopName: 'Premium Agro Traders',
    ownerName: user?.user_metadata?.fullName || 'Premium Agro Buyers',
    profilePhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1595123550441-d377e017de6a?auto=format&fit=crop&q=80',
    contactNumber: user?.phone || '+91 98765 43210',
    address: 'Shop No. 42, Krushi Utpanna Bazar Samiti, Pune',
    googleMapsUrl: 'https://maps.google.com/?q=Pune',
    businessType: 'Wholesaler',
    gstNumber: gstNumber || '27AABCU9603R1ZX',
    isVerified: isKycVerified && isGstVerified,
    ratings: 4.8,
    reviewsCount: 156,
    workingDays: 'Monday - Saturday',
    timings: '06:00 AM - 08:00 PM',
    memberSince: '2023-01-15T00:00:00.000Z'
  };

  const displayFullName = user?.user_metadata?.fullName || user?.user_metadata?.full_name || 'Buyer';
  const trustLevelLabel = trustScore === 100 ? t.verification.verifiedBuyer : t.verification.verifiedBadge;

  return (
    <div className="flex flex-col gap-0 animate-fade-in-up relative w-full">

      <div className="lg:flex lg:gap-0 items-stretch min-h-[calc(100vh-4rem)] w-full">
        {/* Desktop Sidebar Panel */}
        <aside className={`shrink-0 bg-card border-r border-border sticky top-16 self-stretch flex-col gap-6 h-[calc(100vh-4rem)] overflow-y-auto scroll-smooth transition-all duration-300 ${isSidebarOpen ? 'w-72 p-6' : 'w-20 p-4 items-center'} hidden lg:flex`}>
          
          {/* Logo or Profile Info */}
          <div className={`flex flex-col items-center text-center pb-5 border-b border-border gap-3 ${isSidebarOpen ? '' : 'hidden'}`}>
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 font-black text-2xl uppercase border border-primary-500/10">
              {displayFullName.charAt(0)}
            </div>
            <div>
              <h4 className="font-extrabold text-foreground text-base leading-tight">{displayFullName}</h4>
              <p className="text-xs text-earth-500 font-bold mt-1 uppercase tracking-wider">{userLocation || 'Akola Hub'}</p>
            </div>
            {trustScore > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wide border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{trustLevelLabel}</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 w-full relative">
            {tabsList.map(tab => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center rounded-xl text-sm font-extrabold transition-all cursor-pointer w-full ${isSidebarOpen ? 'px-4 py-3.5 gap-3 justify-start' : 'p-3 justify-center'} ${
                    isSelected
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10'
                      : 'text-earth-500 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-800'
                  }`}
                  title={tab.label}
                >
                  <tab.icon className="w-5 h-5 shrink-0" />
                  <span className={`truncate ${isSidebarOpen ? '' : 'hidden'}`}>{tab.label}</span>
                  
                  {isSidebarOpen && tab.id === 'offers' && sentOffers.filter(o => o.status === 'Pending').length > 0 && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-red-500" />
                  )}
                  {isSidebarOpen && tab.id === 'chat' && threads.some(t => t.unreadForBuyer) && (
                    <span className={`ml-auto w-2 h-2 rounded-full bg-red-500`}></span>
                  )}
                </button>
              );
            })}

            {/* Divider */}
            <div className="my-2 border-t border-border" />

            {/* View Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`relative flex items-center rounded-xl text-sm font-extrabold transition-all cursor-pointer w-full ${isSidebarOpen ? 'px-4 py-3.5 gap-3 justify-start' : 'p-3 justify-center'} ${
                activeTab === 'profile'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10'
                  : 'text-earth-550 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-800'
              }`}
              title={menuLabels[language].viewProfile}
            >
              <User className="w-5 h-5 shrink-0" />
              <span className={`truncate ${isSidebarOpen ? '' : 'hidden'}`}>{menuLabels[language].viewProfile}</span>
            </button>

            {/* Edit Profile */}
            <button
              onClick={handleOpenEditProfile} className={`relative flex items-center rounded-xl text-sm font-extrabold transition-all cursor-pointer w-full ${isSidebarOpen ? 'px-4 py-3.5 gap-3 justify-start' : 'p-3 justify-center'} text-earth-550 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-800`} title={menuLabels[language].editProfile}
            >
              <Edit className="w-5 h-5 shrink-0" />
              <span className={`truncate ${isSidebarOpen ? '' : 'hidden'}`}>{menuLabels[language].editProfile}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className={`relative flex items-center rounded-xl text-sm font-extrabold transition-all cursor-pointer w-full ${isSidebarOpen ? 'px-4 py-3.5 gap-3 justify-start' : 'p-3 justify-center'} border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500`}
              title={menuLabels[language].logout}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className={`truncate ${isSidebarOpen ? '' : 'hidden'}`}>{menuLabels[language].logout}</span>
            </button>
          </nav>
        </aside>

        {/* Right Content Column */}
        <div className="flex-grow flex flex-col gap-8 min-w-0 w-full px-4 sm:px-6 lg:px-8 py-10 pb-24 lg:pb-10">

      {/* Mobile Sidebar/Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative flex flex-col w-80 max-w-[85vw] h-full bg-card border-r border-border p-6 shadow-2xl animate-slide-in-left">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-border">
              <span className="text-lg font-black tracking-tight text-foreground">
                Agro<span className="text-primary-500">Mart</span>
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-earth-100 hover:bg-earth-200 dark:bg-earth-900 dark:hover:bg-earth-800 text-earth-700 dark:text-earth-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <div className="flex-grow overflow-y-auto py-6 flex flex-col gap-1">
              {tabsList.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer justify-start ${
                    activeTab === tab.id
                      ? 'bg-primary-500/10 text-primary-600 border border-primary-500/20'
                      : 'text-earth-550 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-800'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.id === 'offers' && sentOffers.filter(o => o.status === 'Pending').length > 0 && (
                    <span className="ml-auto w-2.5 h-2.5 rounded-full bg-red-500" />
                  )}
                  {tab.id === 'chat' && threads.some(t => t.unreadForBuyer) && (
                    <span className="ml-auto w-2.5 h-2.5 rounded-full bg-red-500" />
                  )}
                </button>
              ))}

              {/* Divider */}
              <div className="my-2 border-t border-border" />

              {/* View Profile */}
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer justify-start ${
                  activeTab === 'profile'
                    ? 'bg-primary-500/10 text-primary-600 border border-primary-500/20'
                    : 'text-earth-550 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-800'
                }`}
              >
                <User className="w-5 h-5" />
                <span>{menuLabels[language].viewProfile}</span>
              </button>

              {/* Edit Profile */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleOpenEditProfile();
                }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer justify-start text-earth-550 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-800"
              >
                <Edit className="w-5 h-5" />
                <span>{menuLabels[language].editProfile}</span>
              </button>

              {/* Logout */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="flex items-center justify-start gap-3 px-4 py-3.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-sm font-extrabold transition-all cursor-pointer mt-1"
              >
                <LogOut className="w-5 h-5" />
                <span>{menuLabels[language].logout}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header & Sign Out */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex flex-wrap items-center gap-3">
              <span>{t.dashboard.buyer.title}</span>
              {trustScore > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{trustLevelLabel}</span>
                </span>
              )}
            </h1>
            <p className="text-sm font-semibold text-earth-555 dark:text-earth-400 mt-1">
              {t.dashboard.buyer.subtitle}
            </p>
          </div>
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
        </div>
      </div>


      {/* TAB 1: Marketplace Browse */}
      {activeTab === 'marketplace' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-card border border-border">
            
            {/* Search Input */}
            <div className="relative flex items-center md:col-span-1">
              <SmartSearch 
                initialValue={searchQuery}
                onSearch={handleSmartSearch}
              />
            </div>

            {/* Category Select */}
            <div className="relative flex items-center">
              <Filter className="absolute left-3.5 w-4 h-4 text-earth-455 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm cursor-pointer appearance-none"
              >
                <option value="All">{t.dashboard.buyer.allCategories}</option>
                <option value="Grains">{language === 'mr' ? 'धान्य' : language === 'hi' ? 'अनाज' : 'Grains'}</option>
                <option value="Vegetables">{language === 'mr' ? 'भाज्या' : language === 'hi' ? 'सब्जियां' : 'Vegetables'}</option>
                <option value="Fruits">{language === 'mr' ? 'फळे' : language === 'hi' ? 'फल' : 'Fruits'}</option>
                <option value="Pulses">{language === 'mr' ? 'डाळी' : language === 'hi' ? 'दालें' : 'Pulses'}</option>
                <option value="Spices">{language === 'mr' ? 'मसाले' : language === 'hi' ? 'मसाले' : 'Spices'}</option>
              </select>
            </div>

            {/* Price Select */}
            <div className="relative flex items-center">
              <Tag className="absolute left-3.5 w-4 h-4 text-earth-455 pointer-events-none" />
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm cursor-pointer appearance-none"
              >
                <option value="All">{t.dashboard.buyer.allPrices}</option>
                <option value="under-200">{language === 'mr' ? '₹२०,००० पेक्षा कमी / टन' : language === 'hi' ? '₹20,000 से कम / टन' : 'Under ₹20,000 / Ton'}</option>
                <option value="200-500">{language === 'mr' ? '₹२०,००० - ₹५०,००० / टन' : language === 'hi' ? '₹20,000 - ₹50,000 / टन' : '₹20,000 - ₹50,000 / Ton'}</option>
                <option value="over-500">{language === 'mr' ? '₹५०,००० पेक्षा जास्त / टन' : language === 'hi' ? '₹50,000 से अधिक / टन' : 'Over ₹50,000 / Ton'}</option>
              </select>
            </div>

            {/* Grade Select */}
            <div className="relative flex items-center">
              <ShieldCheck className="absolute left-3.5 w-4 h-4 text-earth-455 pointer-events-none" />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm cursor-pointer appearance-none"
              >
                <option value="All">{t.dashboard.buyer.allGrades}</option>
                <option value="Premium">{language === 'mr' ? 'उत्कृष्ट (Premium)' : language === 'hi' ? 'प्रीमियम (Premium)' : 'Premium'}</option>
                <option value="Grade A">{language === 'mr' ? 'श्रेणी अ (Grade A)' : language === 'hi' ? 'ग्रेड ए (Grade A)' : 'Grade A'}</option>
                <option value="Grade B">{language === 'mr' ? 'श्रेणी ब (Grade B)' : language === 'hi' ? 'ग्रेड बी (Grade B)' : 'Grade B'}</option>
              </select>
            </div>

          </div>

          {/* Smart Location & Map Panel */}
          <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-455 flex items-center justify-center border border-primary-500/10">
                  <MapPin className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">{language === 'mr' ? 'खरेदी नकाशा आणि जीपीएस स्थान ट्रॅकर' : language === 'hi' ? 'खरीद मानचित्र और जीपीएस स्थान ट्रैकर' : 'Sourcing Map & Geolocation Locator'}</h3>
                  <p className="text-[11px] text-earth-500 font-bold">
                    {language === 'mr' ? 'सध्याचे स्थान:' : language === 'hi' ? 'वर्तमान स्थान:' : 'Current Location:'} <span className="text-primary-600 dark:text-primary-400 font-black">{userLocation || (language === 'mr' ? 'अकोला केंद्र' : language === 'hi' ? 'अकोला केंद्र' : 'Akola Hub')}</span> 
                    {userCoords && ` (${userCoords.lat.toFixed(4)}° N, {userCoords.lon.toFixed(4)}° E)`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Distance Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-earth-500 whitespace-nowrap">{language === 'mr' ? 'त्रिज्या:' : language === 'hi' ? 'त्रिज्या:' : 'Radius:'}</span>
                  <select
                    value={radiusFilter}
                    onChange={(e) => setRadiusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-black focus:outline-none cursor-pointer"
                  >
                    <option value="All">{language === 'mr' ? 'सर्व दाखवा' : language === 'hi' ? 'सभी दिखाएं' : 'Show All'}</option>
                    <option value="15">{language === 'mr' ? '१५ किमी अंतरावर' : language === 'hi' ? '१5 किमी के भीतर' : 'Within 15 KM'}</option>
                    <option value="50">{language === 'mr' ? '५० किमी अंतरावर' : language === 'hi' ? '५० किमी के भीतर' : 'Within 50 KM'}</option>
                    <option value="100">{language === 'mr' ? '१०० किमी अंतरावर' : language === 'hi' ? '१०० किमी के भीतर' : 'Within 100 KM'}</option>
                    <option value="250">{language === 'mr' ? '२५० किमी अंतरावर' : language === 'hi' ? '२५० किमी के भीतर' : 'Within 250 KM'}</option>
                  </select>
                </div>

                {/* Sort Toggle */}
                <button
                  onClick={() => setSortByDistance(!sortByDistance)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${
                    sortByDistance 
                      ? 'bg-primary-600 border-primary-500 text-white shadow-xs' 
                      : 'border-border bg-background text-foreground hover:bg-earth-100 dark:hover:bg-earth-900'
                  }`}
                >
                  🚀 {language === 'mr' ? 'जवळचे आधी' : language === 'hi' ? 'निकटतम पहले' : 'Nearest First'}
                </button>

                {/* GPS Detect */}
                <button
                  onClick={handleDetectBuyerLocation}
                  disabled={gpsLoading}
                  className="px-3 py-1.5 rounded-lg border border-primary-500/20 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-xs font-black uppercase transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {gpsLoading ? (language === 'mr' ? '⏳ शोधत आहे...' : language === 'hi' ? '⏳ खोज रहे हैं...' : '⏳ Locating...') : (language === 'mr' ? '🎯 माझे स्थान' : language === 'hi' ? '🎯 मेरा स्थान' : '🎯 Detect Me')}
                </button>
              </div>
            </div>

            {/* Sourcing Leaflet Map */}
            <div className="h-80 w-full rounded-xl overflow-hidden border border-border">
              <MapComponent
                center={[userCoords.lat, userCoords.lon]}
                zoom={9}
                markers={[
                  {
                    id: 'buyer-self',
                    lat: userCoords.lat,
                    lon: userCoords.lon,
                    label: 'My Sourcing Point / खरेदी केंद्र',
                    popupText: userLocation || 'Active Buyer Point',
                    type: 'user'
                  },
                  ...filteredCrops.map(crop => {
                    const cCoords = crop.latitude && crop.longitude
                      ? { lat: crop.latitude, lon: crop.longitude }
                      : getCoordinates(crop.location);
                    return {
                      id: crop.id,
                      lat: cCoords.lat,
                      lon: cCoords.lon,
                      label: crop.name,
                      popupText: `Expected: ₹${crop.expected_price.toLocaleString()} • distance: ${getCropDistance(crop)} KM`,
                      type: 'crop' as const
                    };
                  }),
                  ...mockFarmers.map((f, idx) => {
                    let locKey = 'pune';
                    if (f.location.toLowerCase().includes('nashik')) locKey = 'nashik';
                    else if (f.location.toLowerCase().includes('manchar')) locKey = 'manchar';
                    else if (f.location.toLowerCase().includes('baramati')) locKey = 'baramati';
                    const fCoords = getCoordinates(locKey);
                    return {
                      id: `farmer-pin-${idx}`,
                      lat: fCoords.lat,
                      lon: fCoords.lon,
                      label: f.name,
                      popupText: `Certified Farmer • ${f.activeCrops}`,
                      type: 'user' as const
                    };
                  })
                ]}
                selectedMarkerId={selectedCropMarkerId}
                showRouteTo={routeDestination}
              />
            </div>
          </div>

          {/* Sourcing Listings Grid */}
          {sortedCrops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sortedCrops.map((crop) => {
                const isSaved = savedIds.includes(crop.id);
                return (
                  <div
                    key={crop.id}
                    className="group relative bg-card border border-border rounded-3xl overflow-hidden hover-lift flex flex-col h-full"
                  >
                    {/* Crop Image */}
                    <div 
                      onClick={() => setSelectedCropForDetail(crop)} 
                      className="relative h-48 bg-earth-100 dark:bg-earth-900 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={crop.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600'}
                        alt={crop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Save/Bookmark Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSave(crop.id);
                        }}
                        className={`absolute top-4 right-4 p-2.5 rounded-xl border backdrop-blur-md transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-rose-500 border-rose-500 text-white'
                            : 'bg-black/40 border-white/10 text-white hover:bg-black/60'
                        }`}
                        aria-label="Save listing"
                      >
                        <Heart className="w-4.5 h-4.5" fill={isSaved ? 'currentColor' : 'none'} />
                      </button>

                      {/* Grade Badge */}
                      <span className="absolute bottom-4 left-4 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white border border-white/10">
                        {gradeMap[language]?.[crop.quality_type] || crop.quality_type}
                      </span>
                    </div>

                    {crop.is_auction && (
                      <div className="absolute top-0 left-0 w-full bg-amber-500/90 backdrop-blur-md px-3 py-1.5 flex items-center justify-between text-white border-b border-amber-600/50 shadow-md z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Gavel className="w-3.5 h-3.5" /> LIVE AUCTION
                        </span>
                        <span className="text-[10px] font-black flex items-center gap-1" suppressHydrationWarning>
                          <Timer className="w-3 h-3" />
                          {new Date(crop.auction_end_time || '').getTime() > Date.now() 
                            ? new Date(crop.auction_end_time || '').toLocaleTimeString()
                            : 'Closed'}
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary-500">
                          {categoryMap[language]?.[crop.category] || crop.category}
                        </span>
                        <h3 
                          onClick={() => setSelectedCropForDetail(crop)} 
                          className="text-lg font-black text-foreground group-hover:text-primary-655 transition-colors leading-tight cursor-pointer"
                        >
                          {crop.name}
                        </h3>
                      </div>

                      {/* Location & Farmer */}
                      <div className="flex flex-col gap-2 text-xs font-semibold text-earth-550 dark:text-earth-400">
                        <span className="flex items-center gap-1.5 justify-between">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-earth-455" />
                            <span>{crop.location}</span>
                          </span>
                          <span className="text-[10px] font-black text-primary-500 bg-primary-100/40 dark:bg-primary-950/40 px-2 py-0.5 rounded">
                            🚗 {getCropDistance(crop)} {language === 'mr' ? 'किमी दूर' : language === 'hi' ? 'किमी दूर' : 'KM away'}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                          <span>{language === 'mr' ? 'शेतकरी:' : language === 'hi' ? 'किसान:' : 'Farmer:'} {crop.farmer_name} ({crop.rating}★)</span>
                          {(crop.is_verified || ['Ramesh Patil', 'Suresh Deshmukh', 'Anil Shinde', 'Vijay Kakade'].includes(crop.farmer_name || '')) && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase transition-all"
                              title={`Trust Index: ${crop.trust_score !== undefined ? crop.trust_score : 100}%`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10 shrink-0" />
                              <span>{language === 'mr' ? 'पडताळणीकृत' : language === 'hi' ? 'सत्यापित' : 'Verified'}</span>
                              <span className="text-[8px] bg-emerald-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center font-black ml-0.5">
                                L{crop.trust_score !== undefined ? (crop.trust_score === 100 ? '3' : crop.trust_score >= 65 ? '2' : crop.trust_score >= 30 ? '1' : '0') : '3'}
                              </span>
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Description */}
                      {crop.description && (
                        <p className="text-xs text-earth-500 font-medium line-clamp-2 leading-relaxed">
                          {crop.description}
                        </p>
                      )}

                      {/* Payout & Volume Footer */}
                      <div className="border-t border-border pt-4 mt-auto flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-earth-500 uppercase">{language === 'mr' ? 'अपेक्षित किंमत' : language === 'hi' ? 'अपेक्षित कीमत' : 'Expected Price'}</div>
                          <span className="text-lg font-black text-foreground">
                            ₹{crop.expected_price.toLocaleString('en-IN')} <span className="text-xs font-semibold text-earth-550">/ {unitMap[language]?.[crop.unit.toLowerCase().replace(/s$/, '')] || crop.unit.toLowerCase().replace(/s$/, '')}</span>
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] font-bold text-earth-500 uppercase">{language === 'mr' ? 'उपलब्ध प्रमाण' : language === 'hi' ? 'उपलब्ध मात्रा' : 'Available Volume'}</div>
                          <span className="text-sm font-extrabold text-foreground">
                            {crop.quantity} {unitMap[language]?.[crop.unit] || crop.unit}
                          </span>
                        </div>
                      </div>

                      {/* Action trigger */}
                      <div className="flex gap-1.5 w-full mt-auto flex-wrap">
                        {crop.is_auction ? (
                          new Date(crop.auction_end_time || '').getTime() > Date.now() ? (
                            <div className="w-full flex gap-1.5">
                              <input 
                                type="number"
                                placeholder={`Min: ₹${(crop.highest_bid || crop.expected_price).toLocaleString()}`}
                                value={bidInputs[crop.id] || ''}
                                onChange={(e) => setBidInputs(prev => ({ ...prev, [crop.id]: e.target.value }))}
                                className="flex-grow min-w-0 w-1/2 py-2 px-3 rounded-xl border border-border bg-background text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                              <button
                                onClick={() => handlePlaceBid(crop)}
                                className="flex-grow w-1/2 py-2 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] uppercase shadow flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                              >
                                <Gavel className="w-3 h-3" /> Place Bid
                              </button>
                            </div>
                          ) : (
                            <button disabled className="flex-grow py-3 px-4 rounded-xl bg-earth-300 dark:bg-earth-800 text-white font-extrabold text-xs flex items-center justify-center gap-1 opacity-70 cursor-not-allowed w-full">
                              <Timer className="w-3.5 h-3.5" /> Auction Ended
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => openBidModal(crop)}
                            className="flex-grow py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs shadow-md shadow-primary-600/10 flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{language === 'mr' ? 'ऑफर खरेदी करा' : language === 'hi' ? 'ऑफर खरीदें' : 'Buy Offer'}</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            const cCoords = crop.latitude && crop.longitude
                              ? { lat: crop.latitude, lon: crop.longitude }
                              : getCoordinates(crop.location);
                            setSelectedCropMarkerId(crop.id);
                            setRouteDestination(cCoords);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow ${
                            selectedCropMarkerId === crop.id
                              ? 'bg-primary-500 border-primary-500 text-white'
                              : 'bg-card border-border text-foreground hover:bg-earth-100 dark:hover:bg-earth-900'
                          }`}
                          title="Plot Route on Map"
                        >
                          🗺️
                        </button>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lon}&destination=${
                            crop.latitude && crop.longitude 
                              ? `${crop.latitude},${crop.longitude}` 
                              : getCoordinates(crop.location).lat + ',' + getCoordinates(crop.location).lon
                          }&travelmode=driving`}
                          target="_blank"
                          className="p-3 rounded-xl border border-border bg-card hover:bg-earth-100 dark:hover:bg-earth-900 text-foreground transition-all cursor-pointer flex items-center justify-center shadow"
                          title="Open Route in Google Maps"
                        >
                          🚗
                        </a>

                        <button
                          onClick={() => startChatWithFarmer(crop)}
                          className="p-3 rounded-xl border border-border bg-card hover:bg-earth-100 dark:hover:bg-earth-900 text-foreground transition-all cursor-pointer flex items-center justify-center shadow"
                          aria-label="Chat with Farmer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-primary-500" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 border-2 border-dashed border-border rounded-3xl text-center text-earth-500 font-bold">
              No crop listings matched your selected filters. Try broadening your query!
            </div>
          )}

          {/* Nearby Farmers Section */}
          <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-black text-foreground">Nearby Certified Farmers</h3>
              <p className="text-xs font-bold text-earth-500">Farmers registered close to your delivery range</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {mockFarmers.map((f, i) => {
                let locKey = 'pune';
                if (f.location.toLowerCase().includes('nashik')) locKey = 'nashik';
                else if (f.location.toLowerCase().includes('manchar')) locKey = 'manchar';
                else if (f.location.toLowerCase().includes('baramati')) locKey = 'baramati';
                const fCoords = getCoordinates(locKey);
                const distance = getDistanceInKm(userCoords.lat, userCoords.lon, fCoords.lat, fCoords.lon);
                
                return (
                  <div key={i} className="p-5 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-border flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-extrabold text-foreground">{f.name}</span>
                      <span className="text-xs font-black text-amber-500">{f.rating}★</span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-earth-500 font-semibold">
                      <span className="flex items-center gap-1.5 justify-between">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {locKey.charAt(0).toUpperCase() + locKey.slice(1)}</span>
                        <span className="text-[9px] font-black text-primary-500 bg-primary-100/40 dark:bg-primary-950/40 px-2 py-0.5 rounded">
                          🚗 {distance} KM
                        </span>
                      </span>
                      <span>Produce: {f.activeCrops}</span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-1 border-t border-border/40 pt-2 mt-1">
                      <button
                        onClick={() => {
                          setSelectedCropMarkerId(`farmer-pin-${i}`);
                          setRouteDestination(fCoords);
                        }}
                        className="text-[9px] font-black uppercase text-primary-500 hover:underline cursor-pointer"
                      >
                        🗺️ Show Route
                      </button>
                      
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lon}&destination=${fCoords.lat},${fCoords.lon}&travelmode=driving`}
                        target="_blank"
                        className="text-[9px] font-black uppercase text-earth-500 hover:underline"
                      >
                        🚗 Directions
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Sent Offers List */}
      {activeTab === 'offers' && (
        <div className="flex flex-col gap-6 animate-fade-in text-left">
          
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-black text-foreground">Sent Direct Buy Offers</h3>
              <p className="text-xs font-bold text-earth-500">Track acceptance status of direct farmer contract offers</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs font-black uppercase tracking-wider text-earth-550">
                    <th className="py-4.5 px-4">Crop Harvest</th>
                    <th className="py-4.5 px-4">Farmer Partner</th>
                    <th className="py-4.5 px-4">Offered Price</th>
                    <th className="py-4.5 px-4">Offer Volume</th>
                    <th className="py-4.5 px-4">Date Sent</th>
                    <th className="py-4.5 px-4">Status</th>
                    <th className="py-4.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {sentOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-earth-50/30 dark:hover:bg-earth-950/10 transition-colors font-semibold">
                      <td className="py-4.5 px-4 text-foreground font-black">{offer.cropName}</td>
                      <td className="py-4.5 px-4">{offer.farmerName}</td>
                      <td className="py-4.5 px-4">
                        <span className="text-foreground">₹{offer.offeredPrice.toLocaleString('en-IN')} / {offer.unit.toLowerCase().replace(/s$/, '')}</span>
                        {offer.offeredPrice < offer.originalPrice && (
                          <span className="text-[10px] text-red-500 font-bold ml-1.5 block">
                            (Bid: -₹{(offer.originalPrice - offer.offeredPrice).toLocaleString('en-IN')})
                          </span>
                        )}
                      </td>
                      <td className="py-4.5 px-4">{offer.quantity} {offer.unit}</td>
                      <td className="py-4.5 px-4 text-xs font-bold text-earth-500">{offer.date}</td>
                      <td className="py-4.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          offer.status === 'Accepted'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : offer.status === 'Rejected'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                            : offer.status === 'Withdrawn'
                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {offer.status === 'Accepted' && <Check className="w-3.5 h-3.5" />}
                          {offer.status === 'Rejected' && <X className="w-3.5 h-3.5" />}
                          {offer.status === 'Withdrawn' && <X className="w-3.5 h-3.5" />}
                          {offer.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                          <span>{offer.status}</span>
                        </span>
                      </td>
                      <td className="py-4.5 px-4 text-right">
                        {offer.status === 'Pending' ? (
                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              onClick={() => handleEditOfferClick(offer)}
                              className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-earth-100 dark:hover:bg-earth-900 text-foreground transition-all cursor-pointer font-extrabold text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleWithdrawOffer(offer.id)}
                              className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all cursor-pointer font-extrabold text-xs"
                            >
                              Withdraw
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-earth-450 font-bold">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* TAB 5: Chat Inbox */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-card border border-border overflow-hidden h-[600px] animate-fade-in text-left">
          
          {/* Left: Threads List (4 cols) */}
          <div className="md:col-span-4 border-r border-border flex flex-col h-full bg-background/30">
            <div className="p-5 border-b border-border">
              <h3 className="font-black text-lg text-foreground">Inquiries & Chats</h3>
              <p className="text-xs text-earth-500 font-semibold mt-0.5">Direct negotiations with growers</p>
            </div>
            
            <div className="flex-grow overflow-y-auto divide-y divide-border/60">
              {threads.length > 0 ? (
                threads.map(thread => {
                  const lastMsg = thread.messages[thread.messages.length - 1];
                  const isActive = thread.id === activeThreadId;
                  return (
                    <button
                      key={thread.id}
                      onClick={() => {
                        setActiveThreadId(thread.id);
                        const updated = threads.map(t => t.id === thread.id ? { ...t, unreadForBuyer: false } : t);
                        setThreads(updated);
                        localStorage.setItem('agromart_chats', JSON.stringify(updated));
                      }}
                      className={`w-full p-4 flex items-start gap-3 text-left transition-colors cursor-pointer relative ${
                        isActive
                          ? 'bg-primary-50/10 dark:bg-primary-950/20 border-l-4 border-primary-500'
                          : 'hover:bg-earth-50/50 dark:hover:bg-earth-950/10'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-655 flex items-center justify-center font-bold text-sm border border-border shrink-0">
                        {thread.farmerName.charAt(0)}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-baseline gap-1">
                          <h4 className="font-extrabold text-sm text-foreground truncate flex items-center gap-1">
                            <span>{thread.farmerName}</span>
                            {isFarmerVerified(thread.farmerName, thread.cropId) && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10 shrink-0" />
                            )}
                          </h4>
                          <span className="text-[9px] text-earth-450 font-bold shrink-0">
                            {new Date(thread.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-xs font-black text-primary-500 truncate mt-0.5">{thread.cropName}</div>
                        {lastMsg && (
                          <p className="text-xs text-earth-500 font-medium truncate mt-1 leading-relaxed">
                            {lastMsg.senderRole === 'buyer' ? 'You: ' : ''}{lastMsg.text}
                          </p>
                        )}
                      </div>
                      
                      {thread.unreadForBuyer && (
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 absolute top-4 right-4 border-2 border-card" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-earth-500 font-semibold">
                  No active chats. Start one from the Marketplace!
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Message Window (8 cols) */}
          <div className="md:col-span-8 flex flex-col h-full bg-card">
            {activeThreadId ? (
              (() => {
                const thread = threads.find(t => t.id === activeThreadId);
                if (!thread) return null;
                return (
                  <>
                    {/* Thread Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between gap-4 bg-background/20">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-foreground flex items-center gap-1">
                            <span>{thread.farmerName}</span>
                            {isFarmerVerified(thread.farmerName, thread.cropId) && (
                              <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-500/10 shrink-0" />
                            )}
                          </h3>
                          {isFarmerVerified(thread.farmerName, thread.cropId) ? (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase"
                              title={`Trust Score: ${(() => {
                                const crop = crops.find(c => (thread.cropId && c.id === thread.cropId) || c.farmer_name === thread.farmerName);
                                return crop?.trust_score !== undefined ? crop.trust_score : 100;
                              })()}%`}
                            >
                              <span>{language === 'mr' ? 'पडताळणीकृत शेतकरी' : language === 'hi' ? 'सत्यापित किसान' : 'Verified Farmer'}</span>
                              <span className="text-[8px] bg-emerald-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center font-black ml-0.5">
                                L{(() => {
                                  const crop = crops.find(c => (thread.cropId && c.id === thread.cropId) || c.farmer_name === thread.farmerName);
                                  const score = crop?.trust_score !== undefined ? crop.trust_score : 100;
                                  return score === 100 ? '3' : score >= 65 ? '2' : score >= 30 ? '1' : '0';
                                })()}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-earth-450 bg-earth-100 dark:bg-earth-900 px-2 py-0.5 rounded">
                              {language === 'mr' ? 'अपडताळणीकृत' : language === 'hi' ? 'असत्यापित' : 'Standard Member'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-earth-500 font-bold mt-0.5">Discussion on: <span className="text-primary-500 font-black">{thread.cropName}</span></p>
                      </div>
                      
                      {/* Discussion Type Filter */}
                      <div className="flex items-center gap-1.5 shrink-0 bg-background/50 border border-border p-1 rounded-xl">
                        <span className="text-[9px] font-extrabold text-earth-500 uppercase px-2">Tag:</span>
                        {(['general', 'price', 'quantity', 'delivery'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setChatCategory(type)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                              chatCategory === type
                                ? 'bg-primary-600 text-white shadow-xs'
                                : 'text-earth-550 hover:bg-earth-100 dark:hover:bg-earth-900'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Messages Container */}
                    <div className="flex-grow p-5 overflow-y-auto space-y-4 bg-background/10">
                      {thread.messages.map((msg) => {
                        const isSelf = msg.senderRole === 'buyer';
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isSelf ? 'justify-end' : 'justify-start'} animate-fade-in`}
                          >
                            <div className={`max-w-[75%] rounded-2xl p-4 flex flex-col gap-1 shadow-xs border ${
                              isSelf
                                ? 'bg-primary-600 border-primary-500 text-white rounded-tr-none'
                                : 'bg-card border-border text-foreground rounded-tl-none'
                            }`}>
                              {/* Message Text */}
                              <p className="text-xs font-semibold leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                              
                              {/* Footer (timestamp + tag) */}
                              <div className={`flex items-center gap-2 mt-1.5 text-[9px] font-bold self-end uppercase ${
                                isSelf ? 'text-primary-100' : 'text-earth-450'
                              }`}>
                                {msg.discussionType && msg.discussionType !== 'general' && (
                                  <span className={`px-1.5 py-0.5 rounded font-black ${
                                    isSelf ? 'bg-white/10 text-white' : 'bg-earth-100 dark:bg-earth-900 text-primary-500'
                                  }`}>
                                    {msg.discussionType}
                                  </span>
                                )}
                                <span>
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Simulated Typing Indicator */}
                      {isTyping && (
                        <div className="flex justify-start animate-pulse">
                          <div className="bg-card border border-border text-foreground rounded-2xl rounded-tl-none p-4 flex items-center gap-1.5 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-earth-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-earth-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-earth-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span className="text-[10px] font-bold text-earth-450 ml-1">Farmer is typing...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Template quick-action prompts */}
                    <div className="px-5 py-2.5 border-t border-border bg-background/10 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setChatCategory('price');
                          setChatInput(`Hello, can we discuss a bulk price adjustment for ${thread.cropName}?`);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-earth-50 dark:hover:bg-earth-950 text-[11px] font-bold text-foreground cursor-pointer flex items-center gap-1"
                      >
                        💸 Price Discussion
                      </button>
                      <button
                        onClick={() => {
                          setChatCategory('quantity');
                          setChatInput(`Can you confirm if you have larger crop volumes available for immediate dispatch?`);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-earth-50 dark:hover:bg-earth-950 text-[11px] font-bold text-foreground cursor-pointer flex items-center gap-1"
                      >
                        📦 Volume Inquiry
                      </button>
                      <button
                        onClick={() => {
                          setChatCategory('delivery');
                          setChatInput(`Hi, what are the transit cold storage arrangements for dispatching to Pune/Nagpur?`);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-earth-50 dark:hover:bg-earth-950 text-[11px] font-bold text-foreground cursor-pointer flex items-center gap-1"
                      >
                        🚚 Delivery Route
                      </button>
                    </div>
                    
                    {/* Chat Input form */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-background/30 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type message details..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-grow px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                      <button
                        type="submit"
                        className="px-5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-sm"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </button>
                    </form>
                  </>
                );
              })()
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center gap-3 text-center text-earth-500 p-8">
                <MessageSquare className="w-12 h-12 text-earth-300" />
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Select an Inquiry Thread</h3>
                  <p className="text-xs text-earth-500 font-semibold mt-1">Direct peer-to-peer negotiations on prices, logistics and crop volumes</p>
                </div>
              </div>
            )}
          </div>
          
        </div>
      )}

      {/* TAB 3: Saved Listings */}
      {activeTab === 'saved' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          {savedIds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {crops.filter(c => savedIds.includes(c.id)).map((crop) => (
                <div
                  key={crop.id}
                  className="group bg-card border border-border rounded-3xl overflow-hidden hover-lift flex flex-col h-full text-left"
                >
                  <div className="relative h-44 bg-earth-100 dark:bg-earth-900 overflow-hidden">
                    <img
                      src={crop.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600'}
                      alt={crop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    <button
                      onClick={() => handleToggleSave(crop.id)}
                      className="absolute top-4 right-4 p-2.5 rounded-xl bg-rose-500 border border-rose-500 text-white cursor-pointer"
                    >
                      <Heart className="w-4.5 h-4.5" fill="currentColor" />
                    </button>
                  </div>

                  <div className="p-6 flex flex-col flex-grow gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-primary-500">{crop.category}</span>
                      <h3 className="text-base font-black text-foreground leading-snug">{crop.name}</h3>
                    </div>

                    <div className="flex items-center justify-between text-sm font-semibold border-t border-border pt-4 mt-auto">
                      <div>
                        <span className="text-[10px] text-earth-500 font-bold block">PRICE</span>
                        <span className="font-black">₹{crop.expected_price.toLocaleString('en-IN')} / {crop.unit.toLowerCase().replace(/s$/, '')}</span>
                      </div>
                      <button
                        onClick={() => openBidModal(crop)}
                        className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs cursor-pointer shadow"
                      >
                        Buy Offer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 border-2 border-dashed border-border rounded-3xl text-center text-earth-500 font-bold">
              You haven't bookmarked any harvests yet. Add items to your saved listings from the Marketplace!
            </div>
          )}

        </div>
      )}

      {/* TAB 4: Price Comparison & Trends */}
      {activeTab === 'trends' && (
        <div className="animate-fade-in text-left">
          <LiveMarketRates />
        </div>
      )}

      {activeTab === 'recommendations' && (
        (() => {
          const metadataCoords = user?.user_metadata?.latitude && user?.user_metadata?.longitude
            ? { lat: Number(user.user_metadata.latitude), lon: Number(user.user_metadata.longitude) }
            : null;
          const userCoords = metadataCoords || getCoordinates(userLocation);
          
          const nearbyFarmers = [
            { name: 'Ramesh Patil', location: 'Nashik, Maharashtra', activeCrops: 'Organic Durum Wheat', rating: 4.8 },
            { name: 'Suresh Deshmukh', location: 'Pune Mandi, Maharashtra', activeCrops: 'Russet Baking Potatoes', rating: 4.6 },
            { name: 'Anil Shinde', location: 'Manchar, Maharashtra', activeCrops: 'Tomatoes, Cauliflower', rating: 4.9 },
            { name: 'Vijay Kakade', location: 'Baramati, Maharashtra', activeCrops: 'Golden Sweet Corn', rating: 4.7 }
          ].map((f, idx) => {
            const coords = getCoordinates(f.location);
            const dist = getDistanceInKm(userCoords.lat, userCoords.lon, coords.lat, coords.lon);
            return { ...f, id: `farmer-rec-${idx}`, distance: dist };
          }).sort((a, b) => a.distance - b.distance);

          const mockMarkets = [
            { name: 'Pune APMC Mandi', location: 'Pune, Maharashtra', dailyArrivals: '1,200 Tons', status: 'High Volume Yard' },
            { name: 'Nashik APMC Mandi', location: 'Nashik, Maharashtra', dailyArrivals: '850 Tons', status: 'Major Hub Yard' },
            { name: 'Manchar Sub-Market Yard', location: 'Manchar, Maharashtra', dailyArrivals: '320 Tons', status: 'Local Yard' },
            { name: 'Kalyan APMC Mandi', location: 'Thane, Maharashtra', dailyArrivals: '600 Tons', status: 'Regional Hub' },
            { name: 'Vashi APMC Mandi', location: 'Mumbai, Maharashtra', dailyArrivals: '2,500 Tons', status: 'Central Distribution Yard' }
          ].map((m, idx) => {
            const coords = getCoordinates(m.location);
            const dist = getDistanceInKm(userCoords.lat, userCoords.lon, coords.lat, coords.lon);
            return { ...m, id: `mkt-rec-${idx}`, distance: dist };
          }).sort((a, b) => a.distance - b.distance);

          const bestNearbyRates = [...crops]
            .filter(c => c.status === 'Available')
            .map(c => {
              const coords = getCoordinates(c.location);
              const dist = getDistanceInKm(userCoords.lat, userCoords.lon, coords.lat, coords.lon);
              return { ...c, distance: dist };
            })
            .sort((a, b) => a.expected_price - b.expected_price);

          const highDemandCrops = [
            { name: 'Vine Tomatoes', index: 85, priceRange: '₹34,000 - ₹38,000 / Ton', region: 'Western Maharashtra', recommendation: 'Procure before rate spike' },
            { name: 'Garlic / लसूण', index: 92, priceRange: '₹1,20,000 - ₹1,50,000 / Ton', region: 'State-wide', recommendation: 'Extreme high demand, expect low margins' },
            { name: 'Onions / कांदा', index: 78, priceRange: '₹18,000 - ₹22,000 / Ton', region: 'Nashik / Lasalgaon', recommendation: 'Good buy rate for storage' },
            { name: 'Durum Wheat', index: 72, priceRange: '₹23,000 - ₹25,000 / Ton', region: 'Central Grains Belt', recommendation: 'Procure bulk contract' }
          ];

          return (
            <div className="flex flex-col gap-8 animate-fade-in text-left">
              
              {/* Location Profile Header */}
              <div className="p-6 rounded-3xl bg-linear-to-r from-primary-900/10 to-harvest-900/10 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-455 flex items-center justify-center shrink-0 border border-primary-500/20 shadow-xs">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground">Active Location Profile</h3>
                    <p className="text-xs text-earth-550 dark:text-earth-400 font-bold mt-0.5">
                      Coordinates: <span className="font-extrabold">{userCoords.lat.toFixed(4)}° N, {userCoords.lon.toFixed(4)}° E</span> • Zone: <span className="font-extrabold text-primary-600 dark:text-primary-400">{userLocation || 'Pune District Hub'}</span>
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-card border border-border text-[10px] font-black uppercase text-earth-550 tracking-wider">
                  🎯 Distance Precision: ±2 KM
                </div>
              </div>

              {/* Price & Demand Top Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* High Demand Crop Insights */}
                <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-black text-foreground">High-Demand Crop Insights</h3>
                    <p className="text-xs font-bold text-earth-500">Crops showing strongest market demand indices this season</p>
                  </div>

                  <div className="flex flex-col gap-5">
                    {highDemandCrops.map((crop, i) => (
                      <div key={i} className="p-4.5 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-border flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                            <span>{crop.name}</span>
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                              {crop.region}
                            </span>
                          </h4>
                          <span className="text-xs font-black text-emerald-500">{crop.index}% Demand Index</span>
                        </div>

                        {/* Bar */}
                        <div className="h-2 w-full bg-earth-100 dark:bg-earth-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${crop.index}%` }} />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-bold text-earth-500">
                          <span>Est. Price: <span className="text-foreground font-extrabold">{crop.priceRange}</span></span>
                          <span className="text-primary-600 dark:text-primary-450 font-extrabold">{crop.recommendation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best Nearby Rates (Lowest Prices) */}
                <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-black text-foreground">Best Nearby Rates (Lowest Prices)</h3>
                    <p className="text-xs font-bold text-earth-500">Most affordable direct farmer prices available in your range</p>
                  </div>

                  <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
                    {bestNearbyRates.length > 0 ? (
                      bestNearbyRates.map((crop, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-earth-50/30 dark:bg-earth-950/10 border border-border/80 flex items-center justify-between gap-4">
                          <div>
                            <h4 className="font-extrabold text-foreground text-xs">{crop.name}</h4>
                            <div className="text-[10px] font-bold text-earth-500 mt-1 uppercase flex flex-wrap gap-x-2 gap-y-0.5">
                              <span>Farmer: <span className="text-foreground font-extrabold">{crop.farmer_name}</span></span>
                              <span>•</span>
                              <span>📍 {crop.distance} KM</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-black text-foreground block">₹{crop.expected_price.toLocaleString('en-IN')} / {crop.unit.toLowerCase().replace(/s$/, '')}</span>
                            <button
                              onClick={() => startChatWithFarmerName(crop.farmer_name || 'Verified Farmer')}
                              className="text-[9px] font-black uppercase text-primary-600 dark:text-primary-450 mt-1 block hover:underline"
                            >
                              Negotiate 💬
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-earth-500 py-10 font-bold">
                        No active crops available for price comparison.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Mandis & Farmers Bottom Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Nearby Mandis List */}
                <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-black text-foreground">Suggested Nearby Mandis</h3>
                    <p className="text-xs font-bold text-earth-500">Wholesale APMC market yards in your geographical range</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {mockMarkets.map((m) => (
                      <div key={m.id} className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-border flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                            <span>{m.name}</span>
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-earth-100 dark:bg-earth-900 text-earth-650 border border-border/40">
                              {m.status}
                            </span>
                          </h4>
                          <span className="text-xs text-earth-550 dark:text-earth-400 font-bold block mt-1">Daily Trade volume: {m.dailyArrivals}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-primary-500 bg-primary-100/40 dark:bg-primary-950/40 px-2.5 py-1.5 rounded-xl border border-primary-500/10 block">
                            🚗 {m.distance} KM
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nearby Certified Farmers */}
                <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-black text-foreground">Nearby Certified Farmers</h3>
                    <p className="text-xs font-bold text-earth-500">Registered growers located within your delivery radius</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {nearbyFarmers.map((f) => (
                      <div key={f.id} className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-border flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h4 className="font-extrabold text-foreground text-sm">{f.name}</h4>
                            <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">★ {f.rating}</span>
                          </div>
                          <span className="text-xs text-earth-550 dark:text-earth-400 font-bold block">Grows: {f.activeCrops}</span>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-[10px] font-black text-earth-500 uppercase bg-earth-100 dark:bg-earth-900 px-2.5 py-1 rounded-md border border-border/30">
                            📍 {f.distance} KM away
                          </span>
                          <button
                            onClick={() => startChatWithFarmerName(f.name)}
                            className="px-3.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          );
        })()
      )}

      {activeTab === 'demands' && (
        <div className="flex flex-col gap-6 animate-fade-in text-left">
          
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <h3 className="text-lg font-black text-foreground">{t.cropDemands.demandTitle}</h3>
                <p className="text-xs font-bold text-earth-555 dark:text-earth-400">{t.cropDemands.demandSubtitle}</p>
              </div>

              <button
                onClick={() => {
                  setIsPostDemandOpen(true);
                }}
                className="flex items-center gap-1.5 px-4.5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span>{t.cropDemands.postDemandBtn}</span>
              </button>
            </div>

            {/* List Grid */}
            {demands.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {demands.map((demand) => {
                  const responsesCount = threads.filter(t => t.demandId === demand.id).length;
                  return (
                    <div
                      key={demand.id}
                      className="p-5 rounded-2xl border border-border bg-background hover:border-primary-500/30 transition-all flex flex-col gap-4 relative"
                    >
                      {/* Top Row: Crop and Status */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary-500 bg-primary-100/40 dark:bg-primary-950/40 px-2 py-0.5 rounded">
                            {categoryMap[language]?.[demand.category] || demand.category}
                          </span>
                          <h4 className="font-extrabold text-foreground text-sm sm:text-base mt-1.5 leading-snug">{demand.crop_name}</h4>
                          <span className="text-xs text-earth-555 font-bold flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-earth-400 shrink-0" />
                            <span>{demand.location}</span>
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-border/20 ${
                            demand.status === 'Open'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {demand.status === 'Open' ? (language === 'mr' ? 'सक्रिय' : language === 'hi' ? 'सक्रिय' : 'Open') : (language === 'mr' ? 'बंद' : language === 'hi' ? 'बंद' : 'Closed')}
                          </span>
                          <span className="text-[10px] font-bold text-earth-500">
                            {new Date(demand.created_at).toLocaleDateString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {demand.description && (
                        <p className="text-xs text-earth-500 font-semibold leading-relaxed line-clamp-2">
                          {demand.description}
                        </p>
                      )}

                      {/* Price & Quantity Stats */}
                      <div className="border-t border-border/40 pt-3 flex items-center justify-between text-xs font-semibold text-earth-550">
                        <div>
                          <span className="text-[10px] text-earth-500 font-bold block uppercase">{language === 'mr' ? 'अपेक्षित दर' : language === 'hi' ? 'अपेक्षित दर' : 'Expected Price'}</span>
                          <span className="text-foreground font-black text-sm">
                            ₹{demand.expected_price.toLocaleString('en-IN')} <span className="text-[10px] font-bold text-earth-500">/ {unitMap[language]?.[demand.unit.toLowerCase().replace(/s$/, '')] || demand.unit.toLowerCase().replace(/s$/, '')}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-earth-500 font-bold block uppercase">{language === 'mr' ? 'आवश्यक प्रमाण' : language === 'hi' ? 'आवश्यक मात्रा' : 'Qty Required'}</span>
                          <span className="text-foreground font-black text-sm">
                            {demand.quantity} {unitMap[language]?.[demand.unit] || demand.unit}
                          </span>
                        </div>
                      </div>

                      {/* Responses Log & Action Row */}
                      <div className="border-t border-border/40 pt-3 flex items-center justify-between gap-4 mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-earth-550 font-black">
                          <MessageSquare className="w-4 h-4 text-primary-500" />
                          <span>{responsesCount} {t.cropDemands.responsesCount}</span>
                          {responsesCount > 0 && (
                            <button
                              onClick={() => {
                                const matchingThread = threads.find(t => t.demandId === demand.id);
                                if (matchingThread) {
                                  setActiveThreadId(matchingThread.id);
                                  setActiveTab('chat');
                                }
                              }}
                              className="text-[10px] text-primary-500 font-black uppercase hover:underline ml-1 cursor-pointer"
                            >
                              ({language === 'mr' ? 'पहा' : language === 'hi' ? 'देखें' : 'View'})
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleDemandStatus(demand.id, demand.status)}
                            className="px-2.5 py-1.5 rounded-lg border border-border text-[10px] font-black uppercase text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 cursor-pointer"
                          >
                            {demand.status === 'Open' ? t.cropDemands.closeRequirement : (language === 'mr' ? 'मागणी सुरू करा' : language === 'hi' ? 'मांग शुरू करें' : 'Open Requirement')}
                          </button>
                          <button
                            onClick={() => handleDeleteDemand(demand.id)}
                            className="px-2.5 py-1.5 rounded-lg border border-red-500/20 text-[10px] font-black uppercase text-red-500 hover:bg-red-500/5 cursor-pointer"
                          >
                            {language === 'mr' ? 'हटवा' : language === 'hi' ? 'हटाएं' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 border-2 border-dashed border-border rounded-3xl text-center text-earth-500 font-bold animate-pulse">
                {t.cropDemands.noDemands}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="flex flex-col gap-8 animate-fade-in text-left">
          {/* Top: Public Profile Card */}
          {buyerProfile ? (
            <BuyerProfileCard profile={buyerProfile} onEdit={handleOpenEditProfile} />
          ) : (
            <div className="py-20 bg-card border border-border rounded-3xl flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              <p className="text-sm font-bold text-foreground">Loading profile...</p>
            </div>
          )}

          {/* Bottom: Verification Settings */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-foreground">{t.verification.title}</h3>
                <p className="text-xs font-bold text-earth-500 mt-1">{t.verification.trustHUDSubtitle}</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-500/10">
                <ShieldCheck className="w-4 h-4 animate-pulse" />
                <span>Level {trustScore === 100 ? '3' : trustScore >= 65 ? '2' : trustScore >= 30 ? '1' : '0'}</span>
              </div>
            </div>

            {/* Circular HUD Tracker */}
            <div className="p-6 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-border flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90 absolute">
                  <circle cx="48" cy="48" r="40" className="stroke-earth-200 dark:stroke-earth-850" strokeWidth="8" fill="transparent" />
                  <circle cx="48" cy="48" r="40" className="stroke-emerald-500 transition-all duration-500" strokeWidth="8" fill="transparent"
                          strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * trustScore) / 100} />
                </svg>
                <div className="flex flex-col items-center justify-center z-10">
                  <span className="text-xl font-black text-foreground">{trustScore}%</span>
                  <span className="text-[9px] font-black uppercase text-earth-450">Score</span>
                </div>
              </div>

              <div className="flex-grow text-center sm:text-left">
                <h4 className="font-extrabold text-sm text-foreground">{t.verification.trustIndex}</h4>
                <p className="text-xs text-earth-500 font-semibold mt-1 leading-relaxed">{t.verification.trustScoreTip}</p>
                
                {/* Unlocked Badges */}
                <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                  {isOtpVerified && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/20">
                      ✓ OTP Enabled
                    </span>
                  )}
                  {isGstVerified && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/20">
                      ✓ GST Linked
                    </span>
                  )}
                  {isKycVerified && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/20">
                      ✓ KYC Verified
                    </span>
                  )}
                  {!isOtpVerified && !isGstVerified && !isKycVerified && (
                    <span className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-955/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase border border-red-500/20 animate-pulse">
                      ⚠️ No Verifications
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-4">
              {/* Checklist 1: SMS OTP */}
              <div className="p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-3 items-start">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isOtpVerified 
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-455 border-emerald-500/20' 
                      : 'bg-earth-100 dark:bg-earth-900 text-earth-500 border-border'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 flex-wrap">
                      <span>{t.verification.otpStatus}</span>
                      {isOtpVerified && <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-100/40 dark:bg-emerald-955/30 px-1.5 py-0.5 rounded">Verified (+30%)</span>}
                    </h4>
                    <p className="text-xs text-earth-500 font-semibold mt-1">{t.verification.otpDesc}</p>
                    {isOtpVerified && (
                      <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-455 mt-1 block">
                        Linked phone: {user?.phone || '+91 98765 43210'}
                      </span>
                    )}
                  </div>
                </div>

                {!isOtpVerified && (
                  <button
                    onClick={() => {
                      setIsOtpModalOpen(true);
                      setVerificationError('');
                      setVerificationSuccessMsg('');
                      setSmsSent(false);
                      setOtpCode('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xs cursor-pointer shadow-xs transition-colors shrink-0 self-end sm:self-auto"
                  >
                    {t.verification.verifyBtn}
                  </button>
                )}
              </div>

              {/* Checklist 2: GST Verification */}
              <div className="p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-3 items-start">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isGstVerified 
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-455 border-emerald-500/20' 
                      : 'bg-earth-100 dark:bg-earth-900 text-earth-500 border-border'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 flex-wrap">
                      <span>{t.verification.gstStatus}</span>
                      {isGstVerified && <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-100/40 dark:bg-emerald-955/30 px-1.5 py-0.5 rounded">Verified (+35%)</span>}
                    </h4>
                    <p className="text-xs text-earth-500 font-semibold mt-1">{t.verification.gstDesc}</p>
                    {isGstVerified && (
                      <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-455 mt-1 block">
                        Registered GST: {gstNumber}
                      </span>
                    )}
                  </div>
                </div>

                {!isGstVerified && (
                  <button
                    onClick={() => {
                      setIsGstModalOpen(true);
                      setVerificationError('');
                      setVerificationSuccessMsg('');
                      setGstInput('');
                      setSimulatedBusiness('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xs cursor-pointer shadow-xs transition-colors shrink-0 self-end sm:self-auto"
                  >
                    {t.verification.verifyBtn}
                  </button>
                )}
              </div>

              {/* Checklist 3: KYC Document */}
              <div className="p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-3 items-start">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isKycVerified 
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-455 border-emerald-500/20' 
                      : 'bg-earth-100 dark:bg-earth-900 text-earth-500 border-border'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 flex-wrap">
                      <span>{t.verification.kycStatus}</span>
                      {isKycVerified && <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-100/40 dark:bg-emerald-955/30 px-1.5 py-0.5 rounded">Verified (+35%)</span>}
                    </h4>
                    <p className="text-xs text-earth-500 font-semibold mt-1">{t.verification.kycDesc}</p>
                    {isKycVerified && (
                      <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-455 mt-1 block">
                        Verified via: {kycDocTypeSelected} Document
                      </span>
                    )}
                  </div>
                </div>

                {!isKycVerified && (
                  <button
                    onClick={() => {
                      setIsKycModalOpen(true);
                      setVerificationError('');
                      setVerificationSuccessMsg('');
                      setKycDocType('Aadhaar');
                      setFakeKycFileName('');
                      setIsScanningKyc(false);
                      setScanProgress(0);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xs cursor-pointer shadow-xs transition-colors shrink-0 self-end sm:self-auto"
                  >
                    {t.verification.verifyBtn}
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SUPPORT TAB */}
      {activeTab === 'support' && (
        <HelpCenter language={language} userId={user?.id || 'default'} userRole="buyer" userName={buyerProfile?.ownerName || 'Buyer'} />
      )}

      {/* POPUP MODAL: SMS OTP Verification */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsOtpModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-655 hover:text-foreground cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5.5 h-5.5 text-primary-500" />
              <span>{t.verification.otpTitle}</span>
            </h3>

            <p className="text-xs text-earth-500 font-bold mb-6 text-left">
              {t.verification.otpDesc}
            </p>

            {verificationError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-start gap-2 text-left animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{verificationError}</span>
              </div>
            )}

            {verificationSuccessMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-start gap-2 text-left">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{verificationSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtpSubmit} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-foreground">Mobile Phone Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-grow px-4 py-2.5 rounded-xl border border-border bg-earth-50 dark:bg-earth-950/40 text-foreground font-semibold placeholder-earth-400 focus:outline-none"
                    placeholder="+91 98765 43210"
                    disabled={smsSent}
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-4 py-2.5 rounded-xl bg-primary-655 hover:bg-primary-700 text-white font-black text-xs cursor-pointer transition-colors"
                  >
                    {smsSent ? 'Resend' : 'Send Code'}
                  </button>
                </div>
              </div>

              {smsSent && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="otp-token-input" className="text-xs font-bold text-foreground">Enter 6-Digit Passcode</label>
                  <input
                    id="otp-token-input"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold tracking-widest text-center text-lg font-mono"
                    placeholder="123456"
                    required
                  />
                  <span className="text-[10px] text-earth-500 font-bold">Use mock passcode e.g., 123456 to test</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!smsSent}
                className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-base shadow-md transition-colors cursor-pointer mt-4 disabled:opacity-50"
              >
                {t.verification.submitVerification}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: GST ID Verification */}
      {isGstModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsGstModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-655 hover:text-foreground cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5.5 h-5.5 text-primary-500" />
              <span>{t.verification.gstTitle}</span>
            </h3>

            <p className="text-xs text-earth-500 font-bold mb-6 text-left">
              {t.verification.gstDesc}
            </p>

            {verificationError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-start gap-2 text-left animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{verificationError}</span>
              </div>
            )}

            {verificationSuccessMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-start gap-2 text-left">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{verificationSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyGstSubmit} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gst-number-input" className="text-xs font-bold text-foreground">GST Identification Number (GSTIN)</label>
                <input
                  id="gst-number-input"
                  type="text"
                  value={gstInput}
                  onChange={(e) => handleGstChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold uppercase font-mono"
                  placeholder="27AAAAA1111A1Z1"
                  required
                />
                <span className="text-[10px] text-earth-500 font-bold">Must be a 15-character legal GST alphanumeric code</span>
              </div>

              {simulatedBusiness && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse">
                  🏛️ GST Match Found: <span className="font-extrabold text-foreground">{simulatedBusiness}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-base shadow-md transition-colors cursor-pointer mt-4"
              >
                {t.verification.submitVerification}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: KYC Document Upload */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsKycModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-655 hover:text-foreground cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5.5 h-5.5 text-primary-500" />
              <span>{t.verification.kycTitle}</span>
            </h3>

            <p className="text-xs text-earth-500 font-bold mb-6 text-left">
              {t.verification.kycDesc}
            </p>

            {verificationError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-start gap-2 text-left animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{verificationError}</span>
              </div>
            )}

            {verificationSuccessMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-start gap-2 text-left">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{verificationSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyKycSubmit} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="kyc-doc-type-select" className="text-xs font-bold text-foreground">Select Document Type</label>
                <select
                  id="kyc-doc-type-select"
                  value={kycDocType}
                  onChange={(e) => setKycDocType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold"
                >
                  <option value="Aadhaar">Aadhaar Card (UIDAI)</option>
                  <option value="PAN">PAN Card (Income Tax Dept)</option>
                  <option value="License">Driver's License / Land Title Certificate</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">Upload Document Photo</label>
                <div className="relative border-2 border-dashed border-border hover:border-primary-500/40 rounded-2xl p-6 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFakeKycFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <span className="text-xs font-bold text-earth-500 block">
                    {fakeKycFileName ? `✓ Selected: ${fakeKycFileName}` : 'Click or drag photo to upload'}
                  </span>
                  <span className="text-[10px] text-earth-450 block mt-1">JPEG, PNG up to 5MB</span>
                </div>
              </div>

              {isScanningKyc && (
                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-earth-50/50 dark:bg-earth-950/20 border border-border">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-earth-500">
                    <span>🔍 OCR Scanner analyzing document authenticity...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-earth-100 dark:bg-earth-900 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isScanningKyc}
                className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-base shadow-md transition-colors cursor-pointer mt-4 disabled:opacity-50"
              >
                {isScanningKyc ? 'Scanning Document...' : 'Upload & Scan Credential'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Post Crop Requirement */}
      {isPostDemandOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsPostDemandOpen(false);
                setDemandCropName('');
                setDemandCategory('Grains');
                setDemandQty('');
                setDemandUnit('Tons');
                setDemandPrice('');
                setDemandLocation('');
                setDemandLatitude(null);
                setDemandLongitude(null);
                setDemandDescription('');
                setDemandFormErrors({});
                setIsDemandMapOpen(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-650 hover:text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-2 text-left">
              <Compass className="w-5.5 h-5.5 text-primary-500" />
              <span>{t.cropDemands.postDemandBtn}</span>
            </h3>

            {demandFormErrors.name || demandFormErrors.qty || demandFormErrors.price || demandFormErrors.location ? (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-start gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold uppercase text-[10px] tracking-wide mb-1">Please fix the following validation errors:</div>
                  <ul className="list-disc list-inside flex flex-col gap-0.5">
                    {demandFormErrors.name && <li>{demandFormErrors.name}</li>}
                    {demandFormErrors.qty && <li>{demandFormErrors.qty}</li>}
                    {demandFormErrors.price && <li>{demandFormErrors.price}</li>}
                    {demandFormErrors.location && <li>{demandFormErrors.location}</li>}
                  </ul>
                </div>
              </div>
            ) : null}

            <form onSubmit={handlePostDemandSubmit} className="flex flex-col gap-4">
              {/* Crop Required */}
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="demand-crop-name" className="text-xs font-bold text-foreground">{t.cropDemands.cropRequired}</label>
                <input
                  id="demand-crop-name"
                  type="text"
                  placeholder={language === 'mr' ? 'उदा. सेंद्रिय गहू, ताजे टोमॅटो' : language === 'hi' ? 'जैसे जैविक गेहूं, ताजे टमाटर' : 'e.g. Organic Wheat, Fresh Tomatoes'}
                  value={demandCropName}
                  onChange={(e) => setDemandCropName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Category Selection */}
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="demand-category" className="text-xs font-bold text-foreground">Category</label>
                <select
                  id="demand-category"
                  value={demandCategory}
                  onChange={(e) => setDemandCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Grains">Grains / धान्य</option>
                  <option value="Vegetables">Vegetables / भाज्या</option>
                  <option value="Fruits">Fruits / फळे</option>
                  <option value="Oilseeds">Oilseeds / तेलबिया</option>
                  <option value="Pulses">Pulses / डाळी</option>
                  <option value="Spices">Spices / मसाले</option>
                </select>
              </div>

              {/* Quantity Required & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="demand-qty" className="text-xs font-bold text-foreground">{t.cropDemands.qtyRequired}</label>
                  <input
                    id="demand-qty"
                    type="text"
                    placeholder="e.g. 10"
                    value={demandQty}
                    onChange={(e) => setDemandQty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="demand-unit" className="text-xs font-bold text-foreground">Unit</label>
                  <select
                    id="demand-unit"
                    value={demandUnit}
                    onChange={(e) => setDemandUnit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  <label htmlFor="demand-price" className="text-xs font-bold text-foreground">{t.cropDemands.expectedPrice} (₹ per unit)</label>
                  <input
                    id="demand-price"
                    type="text"
                    placeholder="e.g. 24000"
                    value={demandPrice}
                    onChange={(e) => setDemandPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label htmlFor="demand-location" className="text-xs font-bold text-foreground">Location</label>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-primary-500">
                      <button
                        type="button"
                        onClick={handleDetectDemandLocation}
                        disabled={demandGpsLoading}
                        className="hover:underline cursor-pointer disabled:opacity-50"
                      >
                        {demandGpsLoading ? '⏳ Detecting...' : '🎯 GPS'}
                      </button>
                      <span>|</span>
                      <button
                        type="button"
                        onClick={() => setIsDemandMapOpen(!isDemandMapOpen)}
                        className="hover:underline cursor-pointer"
                      >
                        🗺️ Map
                      </button>
                    </div>
                  </div>
                  <input
                    id="demand-location"
                    type="text"
                    placeholder="e.g. Nashik, Maharashtra"
                    value={demandLocation}
                    onChange={(e) => setDemandLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  {demandLatitude && demandLongitude && (
                    <span className="text-[9px] font-black uppercase text-emerald-500 mt-1 block">
                      ✅ Linked: {demandLatitude.toFixed(4)}° N, {demandLongitude.toFixed(4)}° E
                    </span>
                  )}
                </div>
              </div>

              {/* Map Component Selection Panel */}
              {isDemandMapOpen && (
                <div className="h-44 w-full rounded-xl overflow-hidden border border-border mt-1 relative z-10">
                  <MapComponent
                    center={demandLatitude && demandLongitude ? [demandLatitude, demandLongitude] : [18.5204, 73.8567]}
                    zoom={10}
                    interactive={true}
                    onMapClick={(lat, lon) => {
                      setDemandLatitude(lat);
                      setDemandLongitude(lon);
                      setDemandLocation(`Map Pin (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
                    }}
                  />
                </div>
              )}

              {/* Description */}
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="demand-description" className="text-xs font-bold text-foreground">Requirement details</label>
                <textarea
                  id="demand-description"
                  placeholder="Provide quality requirements, delivery schedule, grading specifications..."
                  rows={3}
                  value={demandDescription}
                  onChange={(e) => setDemandDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-md transition-colors cursor-pointer mt-2"
              >
                {t.cropDemands.postDemandBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Send direct custom buy bid */}
      {selectedCrop && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setSelectedCrop(null);
                setEditingOfferId(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-650 hover:text-foreground cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {bidSuccess ? (
              <div className="py-10 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-foreground">Direct Offer Dispatched!</h3>
                <p className="text-xs font-bold text-earth-550 max-w-[250px]">
                  Your direct buy offer has been sent to {selectedCrop.farmer_name}. We will notify you when they approve!
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5.5 h-5.5 text-primary-500" />
                  <span>{editingOfferId ? 'Edit Direct Buy Offer' : 'Send Direct Buy Offer'}</span>
                </h3>

                <p className="text-xs text-earth-500 font-bold mb-6 text-left">
                  {editingOfferId ? 'Editing offer details for harvest crop listing: ' : 'Bidding on harvest crop listing: '}
                  <span className="text-foreground font-black">{selectedCrop.name}</span> by {selectedCrop.farmer_name}.
                </p>

                {bidError && (
                  <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-start gap-2 text-left">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{bidError}</span>
                  </div>
                )}

                <form onSubmit={handleSendOfferSubmit} className="flex flex-col gap-4">
                  {/* Price Bid Input */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label htmlFor="bid-price-input" className="text-xs font-bold text-foreground">
                      Offer Price (₹ per {selectedCrop.unit.toLowerCase().replace(/s$/, '')})
                    </label>
                    <div className="relative flex items-center">
                      <IndianRupee className="absolute left-3 w-4 h-4 text-earth-455 pointer-events-none" />
                      <input
                        id="bid-price-input"
                        type="text"
                        value={bidPrice}
                        onChange={(e) => setBidPrice(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold"
                        placeholder={selectedCrop.expected_price.toString()}
                        required
                      />
                    </div>
                    <span className="text-[10px] font-bold text-earth-500">
                      Farmer expected: ₹{selectedCrop.expected_price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Quantity Offer Input */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label htmlFor="bid-qty-input" className="text-xs font-bold text-foreground">
                      Offer Volume ({selectedCrop.unit})
                    </label>
                    <input
                      id="bid-qty-input"
                      type="text"
                      value={bidQty}
                      onChange={(e) => setBidQty(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold"
                      placeholder={selectedCrop.quantity.toString()}
                      required
                    />
                    <span className="text-[10px] font-bold text-earth-500">
                      Total available: {selectedCrop.quantity} {selectedCrop.unit}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-base shadow-md transition-colors cursor-pointer mt-4"
                  >
                    {editingOfferId ? 'Save Offer Changes' : 'Send Offer Details'}
                  </button>
                </form>
              </>
            )}
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
                <span>{t.notifications.title || 'Notifications Alert Log'}</span>
              </h3>
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 cursor-pointer"
              >
                {t.notifications.markAllRead || 'Mark all read'}
              </button>
            </div>

            <div className="flex-grow flex flex-col gap-4 mt-6 overflow-y-auto pr-1">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && handleMarkRead(notif.id)}
                    className={`p-4 rounded-xl border flex flex-col gap-1.5 text-left transition-colors ${
                      !notif.read ? 'cursor-pointer hover:border-primary-500/40 bg-primary-50/5 text-foreground' : 'border-border/60 bg-background/50 text-earth-500'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />}
                      <span className="text-xs font-semibold leading-relaxed">
                        {getLocalizedNotifText(notif.type, notif.text, t)}
                        {notif.type && notif.type !== 'market_update' && notif.text && (
                          <span className="block text-[11px] font-medium text-earth-500 mt-1">{notif.text}</span>
                        )}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-earth-455 self-end">{notif.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm font-semibold text-earth-500 py-10">
                  {t.notifications.noNotifications || 'No alerts yet'}
                </div>
              )}
            </div>
          </div>
          {/* Click outside to close drawer */}
          <div onClick={() => setIsNotifOpen(false)} className="flex-grow h-full cursor-pointer hidden sm:block" />
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="flex flex-col gap-6">
          <UpcomingBookings userRole="buyer" userId={user?.id || 'mock-buyer-1'} />
          <TransactionHistory userRole="buyer" userId={user?.id || 'mock-buyer-1'} />
        </div>
      )}

        </div>{/* end Right Content Column */}
      </div>{/* end lg:flex lg:gap-8 items-start */}

      {/* Floating In-App Toasts Stack */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {activeToasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-card border border-border p-4.5 rounded-2xl shadow-2xl relative overflow-hidden flex gap-3 items-start animate-slide-in-right"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-655 flex items-center justify-center shrink-0 border border-primary-500/10">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-grow pr-4">
              <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                {getLocalizedNotifText(toast.type, 'Notification', t)}
              </h4>
              <p className="text-xs font-semibold text-earth-555 dark:text-earth-400 mt-1 leading-relaxed">
                {toast.text}
              </p>
            </div>
            <button
              onClick={() => setActiveToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="p-1 rounded-lg hover:bg-earth-100 dark:hover:bg-earth-900 text-earth-500 hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 h-1 bg-primary-500 animate-toast-progress" />
          </div>
        ))}
      </div>

      {/* Edit Profile Modal */}
      {buyerProfile && (
        <BuyerProfileEditModal
          profile={buyerProfile}
          isOpen={isProfileEditOpen}
          onClose={() => setIsProfileEditOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Crop Detail Modal */}
      {selectedCropForDetail && (
        <CropDetailModal
          isOpen={!!selectedCropForDetail}
          onClose={() => setSelectedCropForDetail(null)}
          crop={selectedCropForDetail}
          distance={getCropDistance(selectedCropForDetail)}
          marketRate={24000}
          similarCrops={crops.filter(c => c.category === selectedCropForDetail.category && c.id !== selectedCropForDetail.id)}
          language={language}
          onCall={() => {
            const prof = getFarmerProfileByName(selectedCropForDetail.farmer_name || 'Ramesh Patil');
            if (prof && prof.contactNumber) {
              window.location.href = `tel:${prof.contactNumber.replace(/\s+/g, '')}`;
            } else {
              alert(language === 'mr' ? 'संपर्क क्रमांक उपलब्ध नाही' : language === 'hi' ? 'संपर्क नंबर उपलब्ध नहीं है' : 'Contact number not available');
            }
          }}
          onMessage={() => {
            startChatWithFarmer(selectedCropForDetail);
            setSelectedCropForDetail(null);
          }}
          onSendDemand={() => {
            openBidModal(selectedCropForDetail);
            setSelectedCropForDetail(null);
          }}
          onViewFarmerProfile={(farmerName) => {
            const prof = getFarmerProfileByName(farmerName);
            setSelectedFarmerProfile(prof);
          }}
        />
      )}

      {/* Farmer Profile Modal */}
      {selectedFarmerProfile && (
        <FarmerProfileModal
          isOpen={!!selectedFarmerProfile}
          onClose={() => setSelectedFarmerProfile(null)}
          profile={selectedFarmerProfile}
          language={language}
          onCall={() => {
            if (selectedFarmerProfile.contactNumber) {
              window.location.href = `tel:${selectedFarmerProfile.contactNumber.replace(/\s+/g, '')}`;
            } else {
              alert(language === 'mr' ? 'संपर्क क्रमांक उपलब्ध नाही' : language === 'hi' ? 'संपर्क नंबर उपलब्ध नहीं है' : 'Contact number not available');
            }
          }}
          onMessage={() => {
            startChatWithFarmerName(selectedFarmerProfile.name);
            setSelectedFarmerProfile(null);
            setSelectedCropForDetail(null);
          }}
          onSendDemand={() => {
            setSelectedFarmerProfile(null);
            const matchingCrop = crops.find(c => c.farmer_name === selectedFarmerProfile.name) || crops[0];
            if (matchingCrop) {
              openBidModal(matchingCrop);
            }
          }}
          onRequestSample={() => {
            const lang = language || 'en';
            const msg = lang === 'mr' ? `नमुना विनंती यशस्वीरीत्या ${selectedFarmerProfile.name} कडे पाठविली गेली!` : lang === 'hi' ? `नमूना अनुरोध ${selectedFarmerProfile.name} को सफलतापूर्वक भेजा गया!` : `Sample request sent to ${selectedFarmerProfile.name} successfully!`;
            alert(msg);
            setSelectedFarmerProfile(null);
          }}
        />
      )}

      {/* Secure Call Modal */}
      {activeCallRecipient && (
        <SecureCallModal
          isOpen={!!activeCallRecipient}
          calleeName={activeCallRecipient}
          onClose={() => setActiveCallRecipient(null)}
          language={language}
        />
      )}

      {isProfileLoading && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center gap-3 shadow-xl max-w-xs text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-sm font-bold text-foreground">Loading profile...</p>
          </div>
        </div>
      )}

      {profileError && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center gap-4 shadow-xl max-w-sm text-center">
            <AlertTriangle className="w-8 h-8 text-rose-500 animate-bounce" />
            <div>
              <p className="text-sm font-bold text-foreground">Failed to load profile</p>
              <p className="text-xs text-earth-500 mt-1">{profileError}</p>
            </div>
            <button 
              onClick={() => setProfileError(null)}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-toast-progress {
          animation: shrink-width 4s linear forwards;
        }
      `}} />

    </div>
  );
}
