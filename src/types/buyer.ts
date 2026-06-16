export interface Review {
  id: string;
  reviewerName: string;
  reviewerRole: 'Farmer' | 'Buyer' | 'Admin';
  rating: number; // e.g. 5
  comment: string;
  date: string; // ISO date string or formatted date
}

export interface BuyerCropRate {
  cropName: string;
  buyingPrice: number;
  unit: string;
}

export interface BuyerDeal {
  id: string;
  cropName: string;
  quantity: number;
  unit: string;
  amount: number;
  date: string;
}

export interface BuyerProfile {
  id: string;
  shopName: string;
  ownerName: string;
  profilePhoto: string;
  bannerImage: string;
  contactNumber: string;
  address: string;
  googleMapsUrl?: string;
  businessType: 'Wholesaler' | 'Retailer' | 'Exporter' | 'Processor' | 'Other';
  gstNumber?: string;
  isVerified: boolean;
  ratings: number; // e.g., 4.8
  reviewsCount: number;
  workingDays: string; // e.g., "Monday - Saturday"
  timings: string; // e.g., "09:00 AM - 08:00 PM"
  memberSince: string; // ISO date string
  reviews?: Review[];
  buyingRates?: BuyerCropRate[];
  recentDeals?: BuyerDeal[];
  distance?: number;
}

