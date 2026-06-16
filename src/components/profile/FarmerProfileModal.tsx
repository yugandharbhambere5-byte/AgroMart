import React from 'react';
import { 
  X, MapPin, Phone, Star, ShieldCheck, Clock, Calendar, 
  Briefcase, FileText, ExternalLink, User, MessageSquare
} from 'lucide-react';

export interface FarmerReview {
  id: string;
  reviewerName: string;
  reviewerRole: 'Buyer' | 'Admin';
  rating: number;
  comment: string;
  date: string;
}

export interface FarmerListing {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
}

export interface FarmerProfile {
  id: string;
  name: string;
  profilePhoto?: string;
  bannerImage?: string;
  contactNumber: string;
  address: string;
  googleMapsUrl?: string;
  isVerified: boolean;
  ratings: number;
  reviewsCount: number;
  memberSince: string;
  trustScore: number;
  activeCrops: string;
  listings: FarmerListing[];
  reviews: FarmerReview[];
}

interface FarmerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FarmerProfile;
  onCall: () => void;
  onMessage: () => void;
  language: 'en' | 'mr' | 'hi';
  onSendDemand?: () => void;
  onRequestSample?: () => void;
}

export function FarmerProfileModal({
  isOpen,
  onClose,
  profile,
  onCall,
  onMessage,
  language,
  onSendDemand,
  onRequestSample
}: FarmerProfileModalProps) {
  if (!isOpen) return null;

  const t = {
    en: {
      verifiedFarmer: 'Verified Farmer',
      memberSince: 'Member Since',
      trustScore: 'Trust Score',
      reviews: 'Reviews',
      call: 'Call',
      message: 'Chat',
      location: 'View Location',
      sendDemand: 'Send Demand',
      requestSample: 'Request Sample',
      noContact: 'Contact number not available',
      noLocation: 'Location maps link not available',
      contactAddress: 'Contact & Farm Address',
      operatingHours: 'Operating Hours',
      activeCrops: 'Crops Cultivated',
      otherListings: 'Active Listings',
      recentReviews: 'Farmer Ratings & Reviews',
      noReviews: 'No reviews yet.',
      priveCall: 'Secure Web Call',
      priveCallSub: 'Number Hidden for Privacy',
      directions: 'Open in Google Maps'
    },
    mr: {
      verifiedFarmer: 'पडताळणीकृत शेतकरी',
      memberSince: 'सदस्य कालावधी',
      trustScore: 'विश्वासू गुणांक',
      reviews: 'अभिप्राय',
      call: 'कॉल करा',
      message: 'चॅट करा',
      location: 'स्थान पहा',
      sendDemand: 'मागणी पाठवा',
      requestSample: 'नमुना विनंती करा',
      noContact: 'संपर्क क्रमांक उपलब्ध नाही',
      noLocation: 'स्थान नकाशा दुवा उपलब्ध नाही',
      contactAddress: 'संपर्क आणि शेतीचा पत्ता',
      operatingHours: 'कामाची वेळ',
      activeCrops: 'पिके',
      otherListings: 'सक्रिय पिके यादी',
      recentReviews: 'शेतकरी रेटिंग आणि अभिप्राय',
      noReviews: 'अद्याप कोणतेही अभिप्राय नाहीत.',
      priveCall: 'सुरक्षित वेब कॉल',
      priveCallSub: 'गोपनीयतेसाठी क्रमांक लपविला आहे',
      directions: 'गुगल मॅपवर पहा'
    },
    hi: {
      verifiedFarmer: 'सत्यापित किसान',
      memberSince: 'सदस्यता वर्ष',
      trustScore: 'विश्वास स्कोर',
      reviews: 'समीक्षाएं',
      call: 'कॉल करें',
      message: 'चैट करें',
      location: 'स्थान देखें',
      sendDemand: 'मांग भेजें',
      requestSample: 'नमूना अनुरोध करें',
      noContact: 'संपर्क नंबर उपलब्ध नहीं है',
      noLocation: 'स्थान मानचित्र लिंक उपलब्ध नहीं है',
      contactAddress: 'संपर्क और खेत का पता',
      operatingHours: 'कार्य समय',
      activeCrops: 'फसलें',
      otherListings: 'सक्रिय फसलें',
      recentReviews: 'किसान रेटिंग और समीक्षाएं',
      noReviews: 'अभी तक कोई समीक्षा नहीं है।',
      priveCall: 'सुरक्षित वेब कॉल',
      priveCallSub: 'गोपनीयता के लिए नंबर छिपा है',
      directions: 'गूगल मैप पर देखें'
    }
  }[language];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in no-scrollbar bg-card border border-border">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full bg-card rounded-3xl overflow-hidden animate-fade-in">
          {/* Banner & Avatar */}
          <div className="relative h-44 sm:h-52 w-full">
            <img 
              src={profile.bannerImage || "https://images.unsplash.com/photo-1595123550441-d377e017de6a?auto=format&fit=crop&q=80"} 
              alt="Farm Banner" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            
            <div className="absolute -bottom-10 left-6 sm:left-8 flex items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-card bg-earth-100 dark:bg-earth-900 shadow-xl overflow-hidden shrink-0">
                {profile.profilePhoto ? (
                  <img 
                    src={profile.profilePhoto} 
                    alt="Farmer" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600">
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="mb-12 text-white">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                  {profile.name}
                  {profile.isVerified && (
                    <ShieldCheck className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                  )}
                </h1>
                {profile.isVerified && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-400/20">
                    {t.verifiedFarmer} (L3)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-6 sm:px-8 pt-16 pb-8 flex flex-col gap-6">
            
            {/* Action Buttons Panel */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => {
                  if (profile.contactNumber) {
                    window.location.href = `tel:${profile.contactNumber.replace(/\s+/g, '')}`;
                    if (onCall) onCall();
                  } else {
                    alert(t.noContact);
                  }
                }}
                className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>{t.call}</span>
              </button>
              <button 
                onClick={onMessage}
                className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t.message}</span>
              </button>
              <button 
                onClick={() => {
                  if (profile.googleMapsUrl) {
                    window.open(profile.googleMapsUrl, '_blank');
                  } else {
                    alert(t.noLocation);
                  }
                }}
                className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl border border-border hover:bg-earth-100 dark:hover:bg-earth-900 text-foreground font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-primary-500" />
                <span>{t.location}</span>
              </button>
              {onSendDemand && (
                <button 
                  onClick={onSendDemand}
                  className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t.sendDemand}</span>
                </button>
              )}
              {onRequestSample && (
                <button 
                  onClick={onRequestSample}
                  className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl border border-primary-500/20 bg-primary-50/5 hover:bg-primary-50/10 text-primary-600 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>{t.requestSample}</span>
                </button>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-earth-50 dark:bg-earth-900/30 border border-border flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="font-black text-lg leading-none">{profile.ratings.toFixed(1)}</span>
                </div>
                <span className="text-[10px] font-black uppercase text-earth-500">{profile.reviewsCount} {t.reviews}</span>
              </div>

              <div className="p-4 rounded-2xl bg-earth-50 dark:bg-earth-900/30 border border-border flex flex-col gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1.5" />
                <span className="font-black text-sm text-foreground">{profile.trustScore}%</span>
                <span className="text-[10px] font-black uppercase text-earth-500">{t.trustScore}</span>
              </div>

              <div className="p-4 rounded-2xl bg-earth-50 dark:bg-earth-900/30 border border-border flex flex-col gap-1">
                <Calendar className="w-4 h-4 text-primary-500 mb-1.5" />
                <span className="font-black text-sm text-foreground">{profile.memberSince}</span>
                <span className="text-[10px] font-black uppercase text-earth-500">{t.memberSince}</span>
              </div>

              <div className="p-4 rounded-2xl bg-earth-50 dark:bg-earth-900/30 border border-border flex flex-col gap-1">
                <Briefcase className="w-4 h-4 text-blue-500 mb-1.5" />
                <span className="font-black text-sm text-foreground truncate">{profile.activeCrops}</span>
                <span className="text-[10px] font-black uppercase text-earth-500">{t.activeCrops}</span>
              </div>
            </div>

            <div className="w-full h-px bg-border" />

            {/* Location & Address */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-earth-500">{t.contactAddress}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl border border-border/40 hover:bg-earth-50 dark:hover:bg-earth-900/20 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-earth-100 dark:bg-earth-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                    <Phone className="w-4.5 h-4.5 text-emerald-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-foreground">{t.priveCall}</span>
                    <span className="text-xs font-semibold text-earth-500">{t.priveCallSub}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-border/40 hover:bg-earth-50 dark:hover:bg-earth-900/20 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-earth-100 dark:bg-earth-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col gap-1.5 w-full">
                    <span className="font-semibold text-sm text-foreground leading-snug">{profile.address}</span>
                    {profile.googleMapsUrl && (
                      <a 
                        href={profile.googleMapsUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 w-fit"
                      >
                        {t.directions} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-border" />

            {/* Active crop listings */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-earth-500">{t.otherListings}</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {profile.listings.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-border bg-earth-50/30 dark:bg-earth-900/10 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-sm text-foreground">{item.name}</span>
                      <span className="text-[10px] font-bold text-earth-500">Qty: {item.quantity} {item.unit}</span>
                    </div>
                    <span className="font-black text-emerald-600 dark:text-emerald-500 text-base">₹{item.price.toLocaleString('en-IN')}<span className="text-[10px] font-bold text-earth-500">/{item.unit.toLowerCase().replace(/s$/, '')}</span></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-border" />

            {/* Reviews list */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-earth-500">{t.recentReviews}</h3>
              {profile.reviews && profile.reviews.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {profile.reviews.map((rev) => (
                    <div 
                      key={rev.id} 
                      className="p-5 rounded-2xl bg-earth-50/50 dark:bg-earth-900/10 border border-border flex flex-col gap-3 hover:border-primary-500/20 transition-all text-left"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-extrabold text-sm text-foreground block">{rev.reviewerName}</span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary-500 bg-primary-100/40 dark:bg-primary-950/40 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {rev.reviewerRole}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[...Array(5)].map((_, idx) => (
                              <Star 
                                key={idx} 
                                className={`w-3 h-3 ${idx < rev.rating ? 'fill-amber-500' : 'text-earth-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-earth-500 font-bold">
                            {new Date(rev.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-earth-600 dark:text-earth-300 font-semibold leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 border border-dashed border-border rounded-2xl text-center text-xs text-earth-500 font-bold">
                  {t.noReviews}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
