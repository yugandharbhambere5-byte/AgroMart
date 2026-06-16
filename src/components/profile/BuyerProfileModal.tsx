import React from 'react';
import { X } from 'lucide-react';
import { BuyerProfile } from '@/types/buyer';
import { BuyerProfileCard } from './BuyerProfileCard';

interface BuyerProfileModalProps {
  profile: BuyerProfile;
  onClose: () => void;
  onCall?: () => void;
  onMessage?: () => void;
  onSendOffer?: () => void;
  onRequestVisit?: () => void;
  language?: 'en' | 'mr' | 'hi';
}

export function BuyerProfileModal({ 
  profile, 
  onClose,
  onCall,
  onMessage,
  onSendOffer,
  onRequestVisit,
  language
}: BuyerProfileModalProps) {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in no-scrollbar bg-card border border-border">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <BuyerProfileCard 
          profile={profile} 
          onCall={onCall}
          onMessage={onMessage}
          onSendOffer={onSendOffer}
          onRequestVisit={onRequestVisit}
          language={language}
        />
      </div>
    </div>
  );
}
