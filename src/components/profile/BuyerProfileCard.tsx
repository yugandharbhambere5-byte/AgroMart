import React from 'react';
import { 
  MapPin, Phone, Star, ShieldCheck, Clock, Calendar, 
  Briefcase, FileText, ExternalLink, User, Pencil, MessageSquare
} from 'lucide-react';
import { BuyerProfile } from '@/types/buyer';

interface BuyerProfileCardProps {
  profile: BuyerProfile;
  onEdit?: () => void;
}

export function BuyerProfileCard({ profile, onEdit }: BuyerProfileCardProps) {
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
            
            <a 
              href={`tel:${profile.contactNumber}`}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-earth-50 dark:hover:bg-earth-900/20 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-earth-100 dark:bg-earth-800 flex items-center justify-center shrink-0 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-foreground">{profile.contactNumber}</span>
                <span className="text-xs font-semibold text-earth-500">Mobile Number</span>
              </div>
            </a>

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

