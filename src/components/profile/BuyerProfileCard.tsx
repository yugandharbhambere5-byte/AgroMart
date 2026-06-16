import React from 'react';
import { 
  MapPin, Phone, Star, ShieldCheck, Clock, Calendar, 
  Briefcase, FileText, ExternalLink, User, Pencil, MessageSquare
} from 'lucide-react';
import { BuyerProfile } from '@/types/buyer';

interface BuyerProfileCardProps {
  profile: BuyerProfile;
  onEdit?: () => void;
  onCall?: () => void;
  onMessage?: () => void;
  onSendOffer?: () => void;
  onRequestVisit?: () => void;
  language?: 'en' | 'mr' | 'hi';
}

export function BuyerProfileCard({ 
  profile, 
  onEdit,
  onCall,
  onMessage,
  onSendOffer,
  onRequestVisit,
  language
}: BuyerProfileCardProps) {
  return (
    <div className="w-full bg-card rounded-3xl overflow-hidden shadow-xl border border-border animate-fade-in">
      {/* Banner & Avatar */}
      <div className="relative h-48 sm:h-56 w-full">
        <img 
          src={profile.bannerImage || "https://images.unsplash.com/photo-1595123550441-d377e017de6a?auto=format&fit=crop&q=80"} 
          alt="Shop Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {onEdit && (
          <button 
            onClick={onEdit}
            className="absolute top-4 right-4 z-10 px-4 py-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white font-extrabold text-xs flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all border border-white/10 shadow"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        )}

        <div className="absolute -bottom-10 left-6 sm:left-8 flex items-end gap-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-card bg-earth-100 dark:bg-earth-900 shadow-xl overflow-hidden shrink-0">
            {profile.profilePhoto ? (
              <img 
                src={profile.profilePhoto} 
                alt="Profile" 
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
              {profile.shopName}
              {profile.isVerified && (
                <ShieldCheck className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
              )}
            </h1>
            <p className="text-sm font-bold opacity-90">{profile.ownerName}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 sm:px-8 pt-16 pb-8 flex flex-col gap-8">
        
        {/* Action Buttons Panel */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              const lang = language || 'en';
              const tNoContact = lang === 'mr' ? 'संपर्क क्रमांक उपलब्ध नाही' : lang === 'hi' ? 'संपर्क नंबर उपलब्ध नहीं है' : 'Contact number not available';
              if (profile.contactNumber) {
                window.location.href = `tel:${profile.contactNumber.replace(/\s+/g, '')}`;
                if (onCall) onCall();
              } else {
                alert(tNoContact);
              }
            }}
            className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span>
              {language === 'mr' ? 'कॉल करा' : language === 'hi' ? 'कॉल करें' : 'Call'}
            </span>
          </button>
          {onMessage && (
            <button 
              onClick={onMessage}
              className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>
                {language === 'mr' ? 'चॅट करा' : language === 'hi' ? 'चैट करें' : 'Chat'}
              </span>
            </button>
          )}
          <button 
            onClick={() => {
              const lang = language || 'en';
              const tNoLocation = lang === 'mr' ? 'स्थान नकाशा दुवा उपलब्ध नाही' : lang === 'hi' ? 'स्थान मानचित्र लिंक उपलब्ध नहीं है' : 'Location maps link not available';
              if (profile.googleMapsUrl) {
                window.open(profile.googleMapsUrl, '_blank');
              } else {
                alert(tNoLocation);
              }
            }}
            className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl border border-border hover:bg-earth-100 dark:hover:bg-earth-900 text-foreground font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-primary-500" />
            <span>
              {language === 'mr' ? 'स्थान पहा' : language === 'hi' ? 'स्थान देखें' : 'View Location'}
            </span>
          </button>
          {onSendOffer && (
            <button 
              onClick={onSendOffer}
              className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>
                {language === 'mr' ? 'पीक ऑफर पाठवा' : language === 'hi' ? 'फसल प्रस्ताव भेजें' : 'Send Crop Offer'}
              </span>
            </button>
          )}
          {onRequestVisit && (
            <button 
              onClick={onRequestVisit}
              className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl border border-primary-500/20 bg-primary-50/5 hover:bg-primary-50/10 text-primary-600 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>
                {language === 'mr' ? 'भेट देण्याची विनंती' : language === 'hi' ? 'भेंट का अनुरोध' : 'Request Visit'}
              </span>
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
            <span className="text-[10px] font-black uppercase text-earth-500">{profile.reviewsCount} Reviews</span>
          </div>

          <div className="p-4 rounded-2xl bg-earth-50 dark:bg-earth-900/30 border border-border flex flex-col gap-1">
            <Briefcase className="w-4 h-4 text-primary-500 mb-1.5" />
            <span className="font-black text-sm text-foreground">{profile.businessType}</span>
            <span className="text-[10px] font-black uppercase text-earth-500">Business Type</span>
          </div>

          <div className="p-4 rounded-2xl bg-earth-50 dark:bg-earth-900/30 border border-border flex flex-col gap-1">
            <Calendar className="w-4 h-4 text-emerald-500 mb-1.5" />
            <span className="font-black text-sm text-foreground">{new Date(profile.memberSince).getFullYear()}</span>
            <span className="text-[10px] font-black uppercase text-earth-500">Member Since</span>
          </div>

          <div className="p-4 rounded-2xl bg-earth-50 dark:bg-earth-900/30 border border-border flex flex-col gap-1">
            <FileText className="w-4 h-4 text-blue-500 mb-1.5" />
            <span className="font-black text-sm text-foreground truncate">{profile.gstNumber || 'N/A'}</span>
            <span className="text-[10px] font-black uppercase text-earth-500">GST Number</span>
          </div>
        </div>

        <div className="w-full h-px bg-border" />

        {/* Contact & Location */}
        <div className="grid sm:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-earth-500">Contact & Address</h3>
            
            <div 
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-earth-50 dark:hover:bg-earth-900/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-earth-100 dark:bg-earth-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                <Phone className="w-4.5 h-4.5 text-emerald-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-foreground">🛡️ 🟢 Web Call Secure</span>
                <span className="text-xs font-semibold text-earth-500">Number Hidden for Privacy</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-earth-50 dark:hover:bg-earth-900/20 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-earth-100 dark:bg-earth-800 flex items-center justify-center shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <span className="font-semibold text-sm text-foreground leading-snug">{profile.address}</span>
                {profile.googleMapsUrl && (
                  <a 
                    href={profile.googleMapsUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-700 w-fit"
                  >
                    View on Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-earth-500">Operating Hours</h3>
            
            <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-extrabold">{profile.workingDays}</span>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase">
                  Open Today
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-earth-400" />
                <span className="text-sm font-black">{profile.timings}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-border" />

        {/* Crops They Buy & Current Buying Rates */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-earth-500">Crops Purchased & Current Rates</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {profile.buyingRates && profile.buyingRates.length > 0 ? (
              profile.buyingRates.map((rate, i) => (
                <div key={i} className="p-4 rounded-2xl border border-border bg-earth-50/30 dark:bg-earth-900/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-foreground">{rate.cropName}</span>
                    <span className="text-[10px] font-bold text-earth-500">Per {rate.unit}</span>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-500 text-base">₹{rate.buyingPrice}</span>
                </div>
              ))
            ) : (
              [
                { cropName: 'Soybean', buyingPrice: 4250, unit: 'Quintal' },
                { cropName: 'Tur (Pigeon Pea)', buyingPrice: 7800, unit: 'Quintal' },
                { cropName: 'Wheat', buyingPrice: 2450, unit: 'Quintal' }
              ].map((rate, i) => (
                <div key={i} className="p-4 rounded-2xl border border-border bg-earth-50/30 dark:bg-earth-900/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-foreground">{rate.cropName}</span>
                    <span className="text-[10px] font-bold text-earth-500 font-extrabold">Per {rate.unit}</span>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-500 text-base">₹{rate.buyingPrice}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-full h-px bg-border" />

        {/* Recent Deals */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-earth-500">Recent Marketplace Deals</h3>
          {profile.recentDeals && profile.recentDeals.length > 0 ? (
            <div className="flex flex-col gap-2">
              {profile.recentDeals.map((deal) => (
                <div key={deal.id} className="p-4 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center">✓</div>
                    <div className="flex flex-col">
                      <span className="text-foreground">{deal.cropName}</span>
                      <span className="text-[10px] text-earth-500">Qty: {deal.quantity} {deal.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span className="text-foreground">Total: ₹{deal.amount.toLocaleString()}</span>
                    <span className="text-earth-400 font-semibold">{new Date(deal.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {[
                { id: 'd-1', cropName: 'Soybean', quantity: 20, unit: 'Quintals', amount: 85000, date: '2026-06-10T10:00:00Z' },
                { id: 'd-2', cropName: 'Wheat', quantity: 15, unit: 'Quintals', amount: 36750, date: '2026-06-08T15:30:00Z' }
              ].map((deal) => (
                <div key={deal.id} className="p-4 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center font-bold">✓</div>
                    <div className="flex flex-col">
                      <span className="text-foreground font-bold">{deal.cropName}</span>
                      <span className="text-[10px] text-earth-500 font-bold">Qty: {deal.quantity} {deal.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end font-bold">
                    <span className="text-foreground">Total: ₹{deal.amount.toLocaleString()}</span>
                    <span className="text-earth-400">{new Date(deal.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ratings & Reviews List */}
        <div className="w-full h-px bg-border" />
        
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-earth-500 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-earth-400" />
              <span>Ratings & Reviews</span>
            </h3>
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-foreground">{profile.ratings.toFixed(1)} out of 5</span>
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < Math.round(profile.ratings) ? 'fill-amber-500' : 'text-earth-300'}`} 
                  />
                ))}
              </div>
            </div>
          </div>

          {profile.reviews && profile.reviews.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.reviews.map((rev) => (
                <div 
                  key={rev.id} 
                  className="p-5 rounded-2xl bg-earth-50/50 dark:bg-earth-900/10 border border-border flex flex-col gap-3 hover:border-primary-500/20 transition-all"
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
            <div className="py-12 border-2 border-dashed border-border rounded-2xl text-center text-earth-500 font-bold">
              No review details available yet. Completed marketplace bookings automatically generate farmer feedback.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

