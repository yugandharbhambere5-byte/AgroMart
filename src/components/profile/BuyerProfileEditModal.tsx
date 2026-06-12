import React, { useState } from 'react';
import { X, Store, User, Phone, MapPin, Map, Briefcase, FileText, Calendar, Clock, Image } from 'lucide-react';
import { BuyerProfile } from '@/types/buyer';

interface BuyerProfileEditModalProps {
  profile: BuyerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: BuyerProfile) => void;
}

export function BuyerProfileEditModal({ profile, isOpen, onClose, onSave }: BuyerProfileEditModalProps) {
  const [shopName, setShopName] = useState(profile.shopName);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [profilePhoto, setProfilePhoto] = useState(profile.profilePhoto);
  const [bannerImage, setBannerImage] = useState(profile.bannerImage);
  const [contactNumber, setContactNumber] = useState(profile.contactNumber);
  const [address, setAddress] = useState(profile.address);
  const [googleMapsUrl, setGoogleMapsUrl] = useState(profile.googleMapsUrl || '');
  const [businessType, setBusinessType] = useState<BuyerProfile['businessType']>(profile.businessType);
  const [gstNumber, setGstNumber] = useState(profile.gstNumber || '');
  const [workingDays, setWorkingDays] = useState(profile.workingDays);
  
  // Parse timings e.g. "06:00 AM - 08:00 PM"
  const parseTime = (timingsStr: string, index: 0 | 1): string => {
    try {
      const parts = timingsStr.split(' - ');
      if (parts.length !== 2) return index === 0 ? '09:00' : '18:00';
      const timePart = parts[index];
      const match = timePart.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return index === 0 ? '09:00' : '18:00';
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    } catch {
      return index === 0 ? '09:00' : '18:00';
    }
  };

  const [openingTime, setOpeningTime] = useState(parseTime(profile.timings, 0));
  const [closingTime, setClosingTime] = useState(parseTime(profile.timings, 1));
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const formatTime12Hour = (time24: string): string => {
    const [hoursStr, minutesStr] = time24.split(':');
    let hours = parseInt(hoursStr);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours.toString().padStart(2, '0')}:${minutesStr} ${ampm}`;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!shopName.trim()) newErrors.shopName = 'Shop name is required';
    if (!ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber.toUpperCase())) {
      newErrors.gstNumber = 'Invalid GSTIN format (e.g. 27AAAAA1111A1Z1)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formattedTimings = `${formatTime12Hour(openingTime)} - ${formatTime12Hour(closingTime)}`;

    onSave({
      ...profile,
      shopName,
      ownerName,
      profilePhoto,
      bannerImage,
      contactNumber,
      address,
      googleMapsUrl,
      businessType,
      gstNumber: gstNumber.toUpperCase(),
      workingDays,
      timings: formattedTimings,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in bg-card border border-border no-scrollbar">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card/85 backdrop-blur-md z-10">
          <div>
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              <Store className="w-5.5 h-5.5 text-primary-655" />
              <span>Edit Profile Details</span>
            </h3>
            <p className="text-xs font-bold text-earth-500 mt-1">Update your shop public details visible to farmers</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-earth-100 dark:bg-earth-900 text-earth-500 hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 flex flex-col gap-6 text-left">
          {/* Shop & Owner Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-earth-400" />
                <span>Shop Name *</span>
              </label>
              <input 
                type="text" 
                value={shopName} 
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Premium Agro Traders"
                className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.shopName ? 'border-red-500' : 'border-border'}`}
              />
              {errors.shopName && <span className="text-[10px] font-bold text-red-500">{errors.shopName}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-earth-400" />
                <span>Owner Name *</span>
              </label>
              <input 
                type="text" 
                value={ownerName} 
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Rajendra Patil"
                className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.ownerName ? 'border-red-500' : 'border-border'}`}
              />
              {errors.ownerName && <span className="text-[10px] font-bold text-red-500">{errors.ownerName}</span>}
            </div>
          </div>

          {/* Media Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-earth-400" />
                <span>Profile Photo URL</span>
              </label>
              <input 
                type="text" 
                value={profilePhoto} 
                onChange={(e) => setProfilePhoto(e.target.value)}
                placeholder="URL to photo"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-earth-400" />
                <span>Shop Banner Image URL</span>
              </label>
              <input 
                type="text" 
                value={bannerImage} 
                onChange={(e) => setBannerImage(e.target.value)}
                placeholder="URL to banner image"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Contact, Business type & GST */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-earth-400" />
                <span>Contact Number *</span>
              </label>
              <input 
                type="text" 
                value={contactNumber} 
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.contactNumber ? 'border-red-500' : 'border-border'}`}
              />
              {errors.contactNumber && <span className="text-[10px] font-bold text-red-500">{errors.contactNumber}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-earth-400" />
                <span>Business Type</span>
              </label>
              <select 
                value={businessType} 
                onChange={(e) => setBusinessType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {['Wholesaler', 'Retailer', 'Exporter', 'Processor', 'Other'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-earth-400" />
                <span>GSTIN (GST Number)</span>
              </label>
              <input 
                type="text" 
                value={gstNumber} 
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="e.g. 27AAAAA1111A1Z1"
                className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground font-semibold uppercase font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.gstNumber ? 'border-red-500' : 'border-border'}`}
              />
              {errors.gstNumber && <span className="text-[10px] font-bold text-red-500">{errors.gstNumber}</span>}
            </div>
          </div>

          {/* Address & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 Gratuitous text-earth-400" />
                <span>Address *</span>
              </label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full physical shop address"
                className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.address ? 'border-red-500' : 'border-border'}`}
              />
              {errors.address && <span className="text-[10px] font-bold text-red-500">{errors.address}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground flex items-center gap-1">
                <Map className="w-3.5 h-3.5 text-earth-400" />
                <span>Google Maps URL</span>
              </label>
              <input 
                type="text" 
                value={googleMapsUrl} 
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="Google Maps link to location"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Operating Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-earth-400" />
                <span>Working Days</span>
              </label>
              <input 
                type="text" 
                value={workingDays} 
                onChange={(e) => setWorkingDays(e.target.value)}
                placeholder="e.g. Monday - Saturday"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-earth-400" />
                <span>Opening Time</span>
              </label>
              <input 
                type="time" 
                value={openingTime} 
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-earth-400" />
                <span>Closing Time</span>
              </label>
              <input 
                type="time" 
                value={closingTime} 
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4 border-t border-border pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border border-border text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 font-extrabold text-sm transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-md transition-colors cursor-pointer text-center"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
