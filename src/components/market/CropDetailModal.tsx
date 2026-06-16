import React, { useState } from 'react';
import { 
  X, MapPin, Star, ShieldCheck, Phone, MessageSquare, 
  Calendar, Info, ShoppingCart, Send, CalendarCheck, HelpCircle
} from 'lucide-react';
import { BuyerProfile, Review } from '@/types/buyer';

interface CropListing {
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
  status: 'Available' | 'Reserved' | 'Sold' | 'Pending Review';
  images?: string[];
  farmer_name?: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
  is_verified?: boolean;
  trust_score?: number;
  is_auction?: boolean;
  auction_end_time?: string;
  bids?: any[];
  highest_bid?: number;
}

interface CropDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  crop: CropListing;
  distance: number;
  marketRate: number | null;
  similarCrops: CropListing[];
  language: 'en' | 'mr' | 'hi';
  onCall: () => void;
  onMessage: () => void;
  onSendDemand: () => void;
  onViewFarmerProfile: (farmerName: string) => void;
}

export function CropDetailModal({
  isOpen,
  onClose,
  crop,
  distance,
  marketRate,
  similarCrops,
  language,
  onCall,
  onMessage,
  onSendDemand,
  onViewFarmerProfile
}: CropDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'farmer' | 'market'>('info');
  const [sampleRequested, setSampleRequested] = useState(false);
  const [slotScheduled, setSlotScheduled] = useState(false);

  if (!isOpen) return null;

  const t = {
    en: {
      detailsTitle: 'Crop details',
      aboutCrop: 'Crop Specifications',
      expectedPrice: 'Expected Price',
      availableQty: 'Available Quantity',
      harvestDate: 'Harvest Date',
      qualityGrade: 'Quality Grade',
      location: 'Location',
      distance: 'Distance',
      description: 'Farmer Notes',
      farmerInfo: 'Farmer Profile',
      marketRateComp: 'Market Price Comparison',
      bestSellingSuggest: 'AI Sales Recommendation',
      sendDemandBtn: 'Send Crop Demand',
      scheduleSlotBtn: 'Schedule Deal Slot',
      requestSampleBtn: 'Request Sample',
      sampleSuccess: 'Sample Request Submitted!',
      sampleSuccessDetail: 'The farmer will be notified to package and ship a sample of this crop.',
      slotSuccess: 'Deal Slot Scheduled!',
      slotSuccessDetail: 'A loading slot has been booked. View details in the Transactions tab.',
      similarCrops: 'Similar Crop Listings Nearby',
      chat: 'Chat',
      call: 'Call',
      viewFarmerProfile: 'View Farmer Profile',
      aboveMarket: 'Above local market rate',
      belowMarket: 'Below local market rate',
      fairMarket: 'Matches market rate (Fair Value)',
      noMarketRate: 'No official market rate found for this location.',
      auctionNotice: 'This is a Live Auction listing. Bids can be placed on the main market page.'
    },
    mr: {
      detailsTitle: 'पिकाचा तपशील',
      aboutCrop: 'पिकाची माहिती',
      expectedPrice: 'अपेक्षित किंमत',
      availableQty: 'उपलब्ध प्रमाण',
      harvestDate: 'काढणीची तारीख',
      qualityGrade: 'गुणवत्ता श्रेणी',
      location: 'स्थान',
      distance: 'अंतर',
      description: 'शेतकऱ्याची नोंद',
      farmerInfo: 'शेतकरी प्रोफाइल',
      marketRateComp: 'बाजारभावाची तुलना',
      bestSellingSuggest: 'एआय सल्ला',
      sendDemandBtn: 'मागणी पाठवा',
      scheduleSlotBtn: 'वेळ बुक करा (Schedule)',
      requestSampleBtn: 'नमुना मागवा (Sample)',
      sampleSuccess: 'नमुना विनंती पाठवली आहे!',
      sampleSuccessDetail: 'शेतकऱ्याला या पिकाचा नमुना पाठवण्यासाठी सूचित केले जाईल.',
      slotSuccess: 'वेळ शेड्युल झाली!',
      slotSuccessDetail: 'माल भरण्याची वेळ बुक झाली आहे. व्यवहार टॅबमध्ये पहा.',
      similarCrops: 'जवळपासची इतर पिके',
      chat: 'चॅट करा',
      call: 'कॉल करा',
      viewFarmerProfile: 'शेतकरी प्रोफाइल पहा',
      aboveMarket: 'बाजारदरापेक्षा जास्त',
      belowMarket: 'बाजारदरापेक्षा कमी',
      fairMarket: 'योग्य मूल्य (बाजारदरानुसार)',
      noMarketRate: 'या स्थानासाठी अधिकृत बाजारभाव सापडला नाही.',
      auctionNotice: 'ही थेट लिलाव यादी आहे. मुख्य बाजार पृष्ठावर बोली लावता येईल.'
    },
    hi: {
      detailsTitle: 'फसल का विवरण',
      aboutCrop: 'फसल की जानकारी',
      expectedPrice: 'अपेक्षित कीमत',
      availableQty: 'उपलब्ध मात्रा',
      harvestDate: 'कटाई की तारीख',
      qualityGrade: 'गुणवत्ता ग्रेड',
      location: 'स्थान',
      distance: 'दूरी',
      description: 'किसान के नोट्स',
      farmerInfo: 'किसान प्रोफाइल',
      marketRateComp: 'बाजार दर की तुलना',
      bestSellingSuggest: 'एआई सलाह',
      sendDemandBtn: 'मांग भेजें',
      scheduleSlotBtn: 'सौदा समय बुक करें',
      requestSampleBtn: 'नमूना मांगें',
      sampleSuccess: 'नमूना अनुरोध भेजा गया!',
      sampleSuccessDetail: 'किसान को इस फसल का नमूना भेजने के लिए सूचित किया जाएगा।',
      slotSuccess: 'समय निर्धारित हो गया!',
      slotSuccessDetail: 'माल लोडिंग समय बुक हो गया है। लेन-देन टैब में देखें।',
      similarCrops: 'आसपास की अन्य फसलें',
      chat: 'चैट करें',
      call: 'कॉल करें',
      viewFarmerProfile: 'किसान प्रोफाइल देखें',
      aboveMarket: 'बाजार दर से अधिक',
      belowMarket: 'बाजार दर से कम',
      fairMarket: 'उचित मूल्य (बाजार दर के अनुसार)',
      noMarketRate: 'इस स्थान के लिए कोई आधिकारिक बाजार दर नहीं मिली।',
      auctionNotice: 'यह लाइव नीलामी सूची है। मुख्य बाजार पृष्ठ पर बोली लगाई जा सकती है।'
    }
  }[language];

  // Calculate market rate comparison
  const priceDiff = marketRate ? crop.expected_price - marketRate : 0;
  const pricePercent = marketRate ? Math.round((priceDiff / marketRate) * 100) : 0;

  const handleRequestSample = () => {
    setSampleRequested(true);
    // Persist request in localStorage
    const savedRequests = localStorage.getItem('agromart_sample_requests');
    const requests = savedRequests ? JSON.parse(savedRequests) : [];
    requests.push({
      id: `sample-${Date.now()}`,
      cropId: crop.id,
      cropName: crop.name,
      farmerName: crop.farmer_name,
      date: new Date().toISOString()
    });
    localStorage.setItem('agromart_sample_requests', JSON.stringify(requests));
  };

  const handleScheduleSlot = () => {
    setSlotScheduled(true);
    // Persist booking in localStorage
    const savedBookings = localStorage.getItem('agromart_bookings');
    const bookings = savedBookings ? JSON.parse(savedBookings) : [];
    bookings.push({
      id: `bk-${Date.now()}`,
      cropId: crop.id,
      cropName: crop.name,
      farmerName: crop.farmer_name,
      status: 'scheduled',
      date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 2 days later
    });
    localStorage.setItem('agromart_bookings', JSON.stringify(bookings));
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 text-left">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in no-scrollbar bg-card border border-border">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Side: Crop Media Container (5 cols) */}
          <div className="md:col-span-5 relative h-64 md:h-auto bg-earth-100 dark:bg-earth-900 border-r border-border overflow-hidden">
            <img 
              src={crop.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600'} 
              alt={crop.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Overlay stats */}
            <div className="absolute bottom-6 left-6 text-white flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-primary-500 px-2 py-0.5 rounded w-fit">
                {crop.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black leading-tight tracking-tight mt-1">
                {crop.name}
              </h2>
            </div>
          </div>

          {/* Right Side: Crop Details & Actions (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col gap-6">
            {/* Tabs Selector */}
            <div className="flex border-b border-border">
              <button 
                onClick={() => setActiveTab('info')}
                className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer mr-6 ${
                  activeTab === 'info' 
                    ? 'border-primary-500 text-primary-600' 
                    : 'border-transparent text-earth-500 hover:text-foreground'
                }`}
              >
                {t.aboutCrop}
              </button>
              <button 
                onClick={() => setActiveTab('farmer')}
                className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer mr-6 ${
                  activeTab === 'farmer' 
                    ? 'border-primary-500 text-primary-600' 
                    : 'border-transparent text-earth-500 hover:text-foreground'
                }`}
              >
                {t.farmerInfo}
              </button>
              <button 
                onClick={() => setActiveTab('market')}
                className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === 'market' 
                    ? 'border-primary-500 text-primary-600' 
                    : 'border-transparent text-earth-500 hover:text-foreground'
                }`}
              >
                {t.marketRateComp}
              </button>
            </div>

            {/* TAB CONTENT: Crop Info */}
            {activeTab === 'info' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                {/* Price and quantity block */}
                <div className="flex justify-between items-center p-4 rounded-2xl bg-earth-50 dark:bg-earth-900/30 border border-border">
                  <div>
                    <span className="text-[10px] font-bold text-earth-500 uppercase">{t.expectedPrice}</span>
                    <div className="text-xl font-black text-foreground mt-0.5">
                      ₹{crop.expected_price.toLocaleString('en-IN')} 
                      <span className="text-xs font-bold text-earth-550"> / {crop.unit.toLowerCase().replace(/s$/, '')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-earth-500 uppercase">{t.availableQty}</span>
                    <div className="text-lg font-black text-foreground mt-0.5">
                      {crop.quantity} {crop.unit}
                    </div>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-earth-450">{t.harvestDate}</span>
                    <span className="text-sm font-extrabold text-foreground mt-1 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-earth-400" />
                      {crop.harvest_date}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-earth-450">{t.qualityGrade}</span>
                    <span className="text-sm font-extrabold text-foreground mt-1">
                      ⭐ {crop.quality_type}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-earth-450">{t.location}</span>
                    <span className="text-sm font-extrabold text-foreground mt-1 truncate">
                      📍 {crop.location}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-earth-450">{t.distance}</span>
                    <span className="text-sm font-extrabold text-primary-500 mt-1">
                      🚗 {distance} KM away
                    </span>
                  </div>
                </div>

                {crop.description && (
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-[10px] font-black uppercase text-earth-455">{t.description}</span>
                    <p className="text-xs text-earth-600 dark:text-earth-300 font-semibold leading-relaxed p-3.5 bg-earth-50/50 dark:bg-earth-950/20 border border-border/60 rounded-xl">
                      {crop.description}
                    </p>
                  </div>
                )}

                {crop.is_auction && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-start gap-2">
                    <Info className="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-500" />
                    <span>{t.auctionNotice}</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Farmer Profile */}
            {activeTab === 'farmer' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-900/15 border border-border">
                  <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 flex items-center justify-center font-black text-xl shrink-0 border border-primary-500/10">
                    {crop.farmer_name?.charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-extrabold text-foreground text-base truncate flex items-center gap-1.5">
                      <span>{crop.farmer_name}</span>
                      {crop.is_verified && (
                        <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 fill-emerald-500/10 shrink-0" />
                      )}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-earth-500 font-semibold">
                      <span className="flex items-center text-amber-500 gap-0.5">★ {crop.rating}</span>
                      <span>•</span>
                      <span>Trust Score: <span className="text-emerald-500 font-black">{crop.trust_score || 100}%</span></span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onViewFarmerProfile(crop.farmer_name || '')}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-earth-100 dark:hover:bg-earth-900 text-foreground text-xs font-black transition-colors cursor-pointer shrink-0"
                  >
                    {t.viewFarmerProfile}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button 
                    onClick={onCall}
                    className="py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{t.call}</span>
                  </button>
                  <button 
                    onClick={onMessage}
                    className="py-3.5 px-4 rounded-xl border border-border hover:bg-earth-100 dark:hover:bg-earth-900 text-foreground font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t.chat}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Market Compare */}
            {activeTab === 'market' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                {marketRate ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-900/20 border border-border flex flex-col">
                        <span className="text-[10px] font-black text-earth-500 uppercase">Local Market Rate</span>
                        <span className="text-lg font-black text-foreground mt-1">₹{marketRate.toLocaleString('en-IN')} / {crop.unit.toLowerCase().replace(/s$/, '')}</span>
                        <span className="text-[10px] text-earth-455 font-bold mt-1">APMC Sourced Daily Index</span>
                      </div>
                      
                      <div className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-900/20 border border-border flex flex-col justify-center">
                        <span className="text-[10px] font-black text-earth-500 uppercase">Price Variance</span>
                        <span className={`text-lg font-black mt-1 ${
                          priceDiff > 0 ? 'text-red-500' : priceDiff < 0 ? 'text-emerald-500' : 'text-primary-500'
                        }`}>
                          {priceDiff > 0 ? `+₹${priceDiff.toLocaleString()} (+${pricePercent}%)` : priceDiff < 0 ? `-₹${Math.abs(priceDiff).toLocaleString()} (-${Math.abs(pricePercent)}%)` : '0% Variance'}
                        </span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border flex items-start gap-2.5 text-xs font-semibold ${
                      pricePercent > 10
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
                        : pricePercent < -10
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                        : 'bg-primary-500/10 border-primary-500/20 text-primary-700 dark:text-primary-400'
                    }`}>
                      <Info className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-extrabold uppercase text-[10px] tracking-wide mb-0.5">
                          {priceDiff > 0 ? t.aboveMarket : priceDiff < 0 ? t.belowMarket : t.fairMarket}
                        </div>
                        <p className="leading-relaxed">
                          {priceDiff > 0 
                            ? `This listing's expected price is ₹${priceDiff.toLocaleString()} higher than the nearby APMC index. You can negotiate or check alternative crops.`
                            : priceDiff < 0
                            ? `Great Deal! Expected price is ₹${Math.abs(priceDiff).toLocaleString()} lower than local market rates. Sourcing is recommended.`
                            : `This crop matches the current APMC reference rate perfectly.`}
                        </p>
                      </div>
                    </div>

                    {/* AI Advisor Panel */}
                    <div className="p-4 rounded-2xl border border-primary-500/10 bg-primary-500/5 text-foreground flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                        <span>💡 {t.bestSellingSuggest}</span>
                      </div>
                      <p className="text-xs font-semibold text-earth-600 dark:text-earth-300 leading-relaxed">
                        Soybean/Wheat prices fluctuate by 3% weekly. Sourcing today guarantees stock safety. Transport during off-peak hours (10 PM to 4 AM) is advised to bypass highway tolls.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-earth-500 font-bold border border-dashed border-border rounded-2xl">
                    {t.noMarketRate}
                  </div>
                )}
              </div>
            )}

            <div className="w-full h-px bg-border mt-auto" />

            {/* Bottom Actions Row */}
            <div className="flex flex-wrap gap-2.5 items-center w-full">
              <button
                onClick={onCall}
                className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
              >
                <Phone className="w-4 h-4" />
                <span>{t.call}</span>
              </button>

              <button
                onClick={onMessage}
                className="py-4 px-6 rounded-2xl border border-border bg-card hover:bg-earth-100 dark:hover:bg-earth-900 text-foreground font-extrabold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t.chat}</span>
              </button>

              {!crop.is_auction && (
                <button
                  onClick={onSendDemand}
                  className="flex-grow min-w-[150px] py-4 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-md shadow-primary-500/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  <span>{t.sendDemandBtn}</span>
                </button>
              )}

              {/* Request Sample */}
              <button
                onClick={handleRequestSample}
                disabled={sampleRequested}
                className={`px-4.5 py-4 rounded-2xl border font-extrabold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  sampleRequested 
                    ? 'bg-earth-100 border-border text-earth-400 cursor-not-allowed'
                    : 'bg-card border-border text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 shadow-sm'
                }`}
              >
                <span>📦</span>
                <span>{sampleRequested ? t.sampleSuccess : t.requestSampleBtn}</span>
              </button>

              {/* Schedule Slot */}
              <button
                onClick={handleScheduleSlot}
                disabled={slotScheduled}
                className={`px-4.5 py-4 rounded-2xl border font-extrabold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  slotScheduled 
                    ? 'bg-earth-100 border-border text-earth-400 cursor-not-allowed'
                    : 'bg-card border-border text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 shadow-sm'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-primary-500" />
                <span>{slotScheduled ? t.slotSuccess : t.scheduleSlotBtn}</span>
              </button>
            </div>

            {/* Success Notifications */}
            {sampleRequested && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex flex-col gap-0.5 animate-fade-in-up">
                <span className="font-extrabold flex items-center gap-1">✓ {t.sampleSuccess}</span>
                <span className="text-[10px] text-earth-500 font-semibold">{t.sampleSuccessDetail}</span>
              </div>
            )}

            {slotScheduled && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex flex-col gap-0.5 animate-fade-in-up">
                <span className="font-extrabold flex items-center gap-1">✓ {t.slotSuccess}</span>
                <span className="text-[10px] text-earth-500 font-semibold">{t.slotSuccessDetail}</span>
              </div>
            )}

          </div>
        </div>

        {/* Similar Crops Section */}
        {similarCrops.length > 0 && (
          <div className="p-6 sm:p-8 bg-earth-50/50 dark:bg-earth-950/20 border-t border-border flex flex-col gap-4">
            <h3 className="font-black text-sm text-foreground uppercase tracking-wider">{t.similarCrops}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similarCrops.slice(0, 3).map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl bg-card border border-border flex flex-col gap-2 hover:border-primary-500/20 hover:shadow-md transition-all text-xs"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-foreground truncate max-w-[120px]">{item.name}</span>
                    <span className="font-black text-emerald-600">₹{item.expected_price.toLocaleString('en-IN')}/{item.unit.toLowerCase().replace(/s$/, '')}</span>
                  </div>
                  <div className="text-[10px] text-earth-500 font-semibold flex justify-between">
                    <span>📍 {item.location.split(',')[0]}</span>
                    <span>⭐ {item.quality_type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
