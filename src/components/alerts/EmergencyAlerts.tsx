'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CloudRain, Bug, TrendingDown, AlertTriangle, X, Bell, ChevronDown,
  ChevronRight, MapPin, Clock, ShieldCheck, Radio, Zap, Eye, EyeOff,
  Wind, Thermometer, Droplets, BarChart2, VolumeX, Volume2, Info
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertType = 'rainfall' | 'disease' | 'market' | 'wind' | 'heat' | 'frost';
export type AlertSeverity = 'info' | 'warning' | 'danger' | 'critical';

export interface EmergencyAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  titleMr?: string;
  titleHi?: string;
  message: string;
  messageMr?: string;
  messageHi?: string;
  affectedDistricts: string[];
  affectedStates: string[];
  issuedBy: string;
  issuedAt: string;        // ISO string
  expiresAt?: string;      // ISO string
  actionRequired?: string;
  actionRequiredMr?: string;
  isActive: boolean;
  read?: boolean;
}

export interface EmergencyAlertsProps {
  /** User's location string e.g. "Nashik, Maharashtra" — used to filter relevant alerts */
  userLocation?: string;
  /** If true, show the compact banner strip only (no drawer) */
  bannerOnly?: boolean;
  /** If true, render as an admin panel with broadcast controls */
  adminMode?: boolean;
}

// ─── Static Alert Dataset ─────────────────────────────────────────────────────

const INITIAL_ALERTS: EmergencyAlert[] = [
  {
    id: 'a1',
    type: 'rainfall',
    severity: 'critical',
    title: 'Extreme Rainfall Warning — Red Alert',
    titleMr: 'अतिवृष्टी इशारा — रेड अलर्ट',
    titleHi: 'भारी वर्षा चेतावनी — रेड अलर्ट',
    message: 'IMD has issued a RED alert for extremely heavy rainfall (>204mm in 24h) across Nashik, Pune, Ahmednagar, and Satara districts. Farmers are advised to harvest any ready crops immediately and secure storage. Flash floods expected near rivers.',
    messageMr: 'हवामान विभागाने नाशिक, पुणे, अहमदनगर आणि सातारा जिल्ह्यांमध्ये अतिवृष्टीचा (२४ तासांत >२०४मिमी) रेड अलर्ट जाहीर केला आहे. शेतकऱ्यांनी तयार पिके तातडीने काढावीत व साठवणूक सुरक्षित करावी.',
    messageHi: 'IMD ने नासिक, पुणे, अहमदनगर और सातारा जिलों में भारी वर्षा (24 घंटे में >204mm) की रेड अलर्ट जारी की है। किसानों को तैयार फसल तुरंत काटकर भंडारण सुरक्षित करने की सलाह दी गई है।',
    affectedDistricts: ['Nashik', 'Pune', 'Ahmednagar', 'Satara', 'Kolhapur'],
    affectedStates: ['Maharashtra'],
    issuedBy: 'IMD Pune',
    issuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    actionRequired: 'Harvest crops immediately. Move livestock to higher ground. Avoid river-adjacent fields.',
    actionRequiredMr: 'पिके तत्काळ काढा. जनावरे उंच ठिकाणी हलवा. नदीलगतच्या शेतात जाणे टाळा.',
    isActive: true,
  },
  {
    id: 'a2',
    type: 'disease',
    severity: 'danger',
    title: 'Soybean Mosaic Virus Outbreak Detected',
    titleMr: 'सोयाबीन मोझेक विषाणू उद्रेक',
    titleHi: 'सोयाबीन मोज़ेक वायरस फैलाव',
    message: 'Agricultural Department has confirmed rapid spread of Soybean Mosaic Virus (SMV) in Latur, Osmanabad, and Nanded. Report yellowing/mosaic leaf patterns immediately. Avoid transferring farm equipment between fields without disinfection.',
    messageMr: 'कृषी विभागाने लातूर, उस्मानाबाद व नांदेडमध्ये सोयाबीन मोझेक विषाणूचा (SMV) वेगाने प्रसार होत असल्याचे निदान केले आहे. पाने पिवळी किंवा मोझेक नमुन्यांची तत्काळ तक्रार करा.',
    messageHi: 'कृषि विभाग ने लातूर, उस्मानाबाद और नांदेड में सोयाबीन मोज़ेक वायरस (SMV) के तेज़ प्रसार की पुष्टि की है। पत्तियों के पीले/मोज़ेक पैटर्न की तुरंत रिपोर्ट करें।',
    affectedDistricts: ['Latur', 'Osmanabad', 'Nanded', 'Beed'],
    affectedStates: ['Maharashtra'],
    issuedBy: 'Maharashtra Agri Dept.',
    issuedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    actionRequired: 'Inspect crops immediately. Apply recommended fungicide. Contact local Krishi Kendra.',
    actionRequiredMr: 'पिकांची त्वरित तपासणी करा. शिफारस केलेले बुरशीनाशक लावा. स्थानिक कृषी केंद्राशी संपर्क करा.',
    isActive: true,
  },
  {
    id: 'a3',
    type: 'market',
    severity: 'warning',
    title: 'Onion Price Crash — Market Emergency',
    titleMr: 'कांदा भाव कोसळला — बाजार आणीबाणी',
    titleHi: 'प्याज भाव गिरावट — बाजार आपातकाल',
    message: 'Wholesale onion prices have crashed 38% in Nashik APMC due to unexpected import surge. Government advisory: hold stocks if possible, register for MSP protection scheme. NAFED procurement center opened at Lasalgaon.',
    messageMr: 'आयातीच्या अचानक वाढीमुळे नाशिक APMC मध्ये कांद्याचे घाऊक भाव ३८% घसरले आहेत. शक्य असल्यास माल थांबवा, MSP संरक्षण योजनेसाठी नोंदणी करा.',
    messageHi: 'अप्रत्याशित आयात वृद्धि के कारण नासिक APMC में प्याज के थोक भाव 38% गिरे। MSP सुरक्षा योजना के लिए पंजीकरण करें।',
    affectedDistricts: ['Nashik', 'Ahmednagar', 'Pune', 'Dhule'],
    affectedStates: ['Maharashtra'],
    issuedBy: 'NAFED / Agri Ministry',
    issuedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    actionRequired: 'Register at lasalgaon.nafed.in for MSP support. Hold stock 2–3 weeks if storage available.',
    actionRequiredMr: 'MSP सहाय्यासाठी lasalgaon.nafed.in वर नोंदणी करा. साठवण क्षमता असल्यास 2-3 आठवडे माल थांबवा.',
    isActive: true,
  },
  {
    id: 'a4',
    type: 'wind',
    severity: 'warning',
    title: 'Strong Winds Advisory — Cyclone Remnants',
    titleMr: 'जोरदार वारे — चक्रीवादळाचे अवशेष',
    titleHi: 'तेज़ हवाएं — चक्रवात के अवशेष',
    message: 'Cyclonic remnants are causing strong gusty winds (60–80 km/h) across coastal and adjacent districts. Protect crops with windbreaks. Remove polytunnel coverings to prevent structural damage.',
    messageMr: 'चक्रीवादळाचे अवशेष किनारी व जवळील जिल्ह्यांमध्ये जोरदार वारे (60-80 km/h) आणत आहेत. पॉलीटनेल आवरणे काढा.',
    messageHi: 'चक्रवाती अवशेष तटीय जिलों में तेज़ हवाएं (60-80 km/h) ला रहे हैं। पॉलीटनेल कवर हटाएं।',
    affectedDistricts: ['Ratnagiri', 'Sindhudurg', 'Raigad', 'Thane', 'Mumbai Suburban'],
    affectedStates: ['Maharashtra'],
    issuedBy: 'IMD Mumbai',
    issuedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
    actionRequired: 'Secure poly tunnels. Stake tall crops. Avoid field spraying.',
    isActive: true,
  },
  {
    id: 'a5',
    type: 'disease',
    severity: 'info',
    title: 'Pink Bollworm Alert — Cotton Belt',
    titleMr: 'गुलाबी बोंड अळी — कापूस क्षेत्र',
    titleHi: 'पिंक बॉलवर्म चेतावनी — कपास क्षेत्र',
    message: 'Early-season pink bollworm (Pectinophora gossypiella) infestation reported in Vidarbha cotton belt. Set up pheromone traps immediately. Spray chlorpyriphos as per Krishi Vigyan Kendra recommendation.',
    messageMr: 'विदर्भातील कापूस पट्ट्यात गुलाबी बोंड अळीचा प्राथमिक प्रादुर्भाव नोंदवला गेला आहे. तत्काळ फेरोमोन सापळे लावा.',
    messageHi: 'विदर्भ कपास क्षेत्र में गुलाबी बोंड अळी का प्रारंभिक प्रकोप रिपोर्ट हुआ। तुरंत फेरोमोन ट्रैप लगाएं।',
    affectedDistricts: ['Nagpur', 'Wardha', 'Yavatmal', 'Amravati', 'Akola'],
    affectedStates: ['Maharashtra'],
    issuedBy: 'KVK Yavatmal',
    issuedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    actionRequired: 'Install pheromone traps at 5/acre. Spray chlorpyriphos 2ml/L. Monitor weekly.',
    isActive: true,
  },
  {
    id: 'a6',
    type: 'market',
    severity: 'info',
    title: 'Tomato Price Surge — Sell Opportunity',
    titleMr: 'टोमॅटो भाव वाढ — विक्री संधी',
    titleHi: 'टमाटर भाव उछाल — बिक्री अवसर',
    message: 'Tomato prices have surged 62% to ₹62/kg at Mumbai wholesale market due to supply shortage from Nashik. Farmers with ready stock should list immediately on AgroMart for best prices.',
    messageMr: 'नाशिकहून पुरवठा कमी झाल्याने मुंबई घाऊक बाजारात टोमॅटोचे भाव ६२% वाढून ₹६२/किलो झाले आहेत. तयार माल असलेल्या शेतकऱ्यांनी AgroMart वर तत्काळ यादी करावी.',
    messageHi: 'नासिक से आपूर्ति कमी होने से मुंबई थोक बाजार में टमाटर 62% बढ़कर ₹62/kg हुआ। AgroMart पर तुरंत लिस्ट करें।',
    affectedDistricts: ['Nashik', 'Pune', 'Mumbai', 'Thane'],
    affectedStates: ['Maharashtra'],
    issuedBy: 'AgroMart Market Intel',
    issuedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    actionRequired: 'List tomatoes on AgroMart now. Connect with Mumbai buyers directly.',
    actionRequiredMr: 'आत्ताच AgroMart वर टोमॅटो यादी करा. मुंबई खरेदीदारांशी थेट संपर्क साधा.',
    isActive: true,
  },
];

// ─── Config Maps ──────────────────────────────────────────────────────────────

const ALERT_ICONS: Record<AlertType, React.ElementType> = {
  rainfall: CloudRain,
  disease: Bug,
  market: BarChart2,
  wind: Wind,
  heat: Thermometer,
  frost: Droplets,
};

const SEVERITY_CONFIG: Record<AlertSeverity, { banner: string; bg: string; border: string; badge: string; dot: string; icon: string }> = {
  critical: {
    banner: 'bg-gradient-to-r from-red-600 to-rose-600 text-white',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-500/40',
    badge: 'bg-red-600 text-white',
    dot: 'bg-red-500',
    icon: 'text-red-500',
  },
  danger: {
    banner: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-500/30',
    badge: 'bg-orange-500 text-white',
    dot: 'bg-orange-500',
    icon: 'text-orange-500',
  },
  warning: {
    banner: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500 text-white',
    dot: 'bg-amber-400',
    icon: 'text-amber-500',
  },
  info: {
    banner: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500 text-white',
    dot: 'bg-blue-400',
    icon: 'text-blue-500',
  },
};

const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  critical: '🔴 Critical',
  danger: '🟠 Danger',
  warning: '🟡 Warning',
  info: '🔵 Info',
};

const TYPE_LABEL: Record<AlertType, string> = {
  rainfall: 'Rainfall',
  disease: 'Disease',
  market: 'Market',
  wind: 'Wind',
  heat: 'Heat Wave',
  frost: 'Frost',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DISTRICT_KEYWORDS = [
  'Nashik', 'Pune', 'Ahmednagar', 'Satara', 'Kolhapur', 'Sangli', 'Solapur',
  'Latur', 'Osmanabad', 'Nanded', 'Beed', 'Aurangabad', 'Jalgaon',
  'Dhule', 'Nandurbar', 'Nagpur', 'Wardha', 'Yavatmal', 'Amravati', 'Akola',
  'Ratnagiri', 'Sindhudurg', 'Raigad', 'Thane', 'Mumbai', 'Manchar',
];

const extractDistricts = (location: string): string[] => {
  if (!location) return [];
  return DISTRICT_KEYWORDS.filter(d => location.toLowerCase().includes(d.toLowerCase()));
};

const isAlertRelevant = (alert: EmergencyAlert, userLocation: string): boolean => {
  if (!userLocation) return true; // show all if no location set
  const userDistricts = extractDistricts(userLocation);
  if (userDistricts.length === 0) return true;
  return userDistricts.some(d =>
    alert.affectedDistricts.some(ad => ad.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(ad.toLowerCase()))
  );
};

const timeAgo = (iso: string): string => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const timeUntil = (iso: string): string => {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  if (diff < 0) return 'Expired';
  if (diff < 3600) return `${Math.floor(diff / 60)}m remaining`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h remaining`;
  return `${Math.floor(diff / 86400)}d remaining`;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EmergencyAlerts({ userLocation = '', bannerOnly = false, adminMode = false }: EmergencyAlertsProps) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(INITIAL_ALERTS);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | AlertType>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | AlertSeverity>('all');
  const [isMuted, setIsMuted] = useState(false);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const rotateRef = useRef<any>(null);
  // Track which alert IDs have already been pushed to the notification log
  const pushedAlertIdsRef = useRef<Set<string>>(new Set());

  // Admin broadcast state
  const [broadcastForm, setBroadcastForm] = useState({
    type: 'rainfall' as AlertType,
    severity: 'warning' as AlertSeverity,
    title: '',
    message: '',
    districts: '',
    issuedBy: 'Admin',
  });
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Persist read/dismissed to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('agromart_alert_read');
    if (saved) setReadIds(new Set(JSON.parse(saved)));
    const dismissed = localStorage.getItem('agromart_alert_dismissed');
    if (dismissed) setDismissedIds(new Set(JSON.parse(dismissed)));
  }, []);

  const markRead = useCallback((id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('agromart_alert_read', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('agromart_alert_dismissed', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const markAllRead = () => {
    const allIds = relevantAlerts.map(a => a.id);
    setReadIds(prev => {
      const next = new Set([...prev, ...allIds]);
      localStorage.setItem('agromart_alert_read', JSON.stringify([...next]));
      return next;
    });
  };

  // Derived alert lists
  const relevantAlerts = alerts.filter(a => a.isActive && !dismissedIds.has(a.id) && isAlertRelevant(a, userLocation));
  const filteredAlerts = relevantAlerts.filter(a =>
    (filterType === 'all' || a.type === filterType) &&
    (filterSeverity === 'all' || a.severity === filterSeverity)
  );
  const unreadCount = relevantAlerts.filter(a => !readIds.has(a.id)).length;

  // Critical/danger alerts for the banner strip
  const bannerAlerts = relevantAlerts.filter(a => a.severity === 'critical' || a.severity === 'danger');

  // Rotate banner
  useEffect(() => {
    if (bannerAlerts.length <= 1) return;
    rotateRef.current = setInterval(() => {
      setCurrentBannerIdx(i => (i + 1) % bannerAlerts.length);
    }, 6000);
    return () => clearInterval(rotateRef.current);
  }, [bannerAlerts.length]);

  // Push to notification log for the bell system — runs ONCE per unique alert id
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const critAlerts = alerts.filter(
      a => a.isActive && (a.severity === 'critical' || a.severity === 'danger') && isAlertRelevant(a, userLocation)
    );
    if (critAlerts.length === 0) return;

    // Only push alerts we haven't pushed before in this session (prevents re-firing on re-renders)
    const freshAlerts = critAlerts.filter(a => !pushedAlertIdsRef.current.has(a.id));
    if (freshAlerts.length === 0) return;

    const logStr = localStorage.getItem('agromart_notifications_log');
    const logs = logStr ? JSON.parse(logStr) : [];
    const existingIds = new Set(logs.map((l: any) => l.id));
    const newNotifs = freshAlerts
      .filter(a => !existingIds.has(`emergency-${a.id}`))
      .map(a => ({
        id: `emergency-${a.id}`,
        type: 'demand_alert',
        text: `🚨 ${a.title}`,
        time: timeAgo(a.issuedAt),
        read: false,
        role: 'farmer',
      }));
    // Mark all freshAlerts as pushed regardless of whether they were new in localStorage
    freshAlerts.forEach(a => pushedAlertIdsRef.current.add(a.id));
    if (newNotifs.length > 0) {
      const updated = [...newNotifs, ...logs];
      localStorage.setItem('agromart_notifications_log', JSON.stringify(updated));
      // NOTE: Do NOT dispatch a manual StorageEvent here — it would fire handleStorage
      // in the same tab, causing re-render cascades. Cross-tab sync happens natively.
    }
  }, [alerts, userLocation]);

  // Broadcast new alert (admin)
  const handleBroadcast = () => {
    if (!broadcastForm.title || !broadcastForm.message) return;
    const newAlert: EmergencyAlert = {
      id: `broadcast-${Date.now()}`,
      type: broadcastForm.type,
      severity: broadcastForm.severity,
      title: broadcastForm.title,
      message: broadcastForm.message,
      affectedDistricts: broadcastForm.districts.split(',').map(d => d.trim()).filter(Boolean),
      affectedStates: ['Maharashtra'],
      issuedBy: broadcastForm.issuedBy || 'Admin',
      issuedAt: new Date().toISOString(),
      isActive: true,
    };
    setAlerts(prev => [newAlert, ...prev]);
    // Write to localStorage for cross-tab pickup
    // NOTE: Do NOT dispatch manual StorageEvent — it fires in same tab and causes re-render cascades.
    if (typeof window !== 'undefined') {
      const logStr = localStorage.getItem('agromart_notifications_log');
      const logs = logStr ? JSON.parse(logStr) : [];
      const notif = { id: `emergency-${newAlert.id}`, type: 'demand_alert', text: `🚨 ALERT: ${newAlert.title}`, time: 'Just now', read: false, role: 'farmer' };
      const notifB = { ...notif, id: `emergency-${newAlert.id}-b`, role: 'buyer' };
      const updated = [notif, notifB, ...logs];
      localStorage.setItem('agromart_notifications_log', JSON.stringify(updated));
    }
    setBroadcastForm({ type: 'rainfall', severity: 'warning', title: '', message: '', districts: '', issuedBy: 'Admin' });
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const currentBanner = bannerAlerts[currentBannerIdx % Math.max(bannerAlerts.length, 1)];
  const cfg = currentBanner ? SEVERITY_CONFIG[currentBanner.severity] : null;
  const BannerIcon = currentBanner ? ALERT_ICONS[currentBanner.type] : AlertTriangle;

  return (
    <div className="w-full flex flex-col gap-0">

      {/* ── Scrolling Alert Banner Strip ──────────────────────────────────── */}
      {bannerAlerts.length > 0 && !isMuted && (
        <div className={`relative ${cfg!.banner} flex items-center gap-3 px-4 py-2.5 overflow-hidden`}>
          {/* Animated pulse dot */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>

          <BannerIcon className="w-4 h-4 shrink-0" />

          <div className="flex-grow min-w-0 flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wide shrink-0 opacity-80">
              {SEVERITY_LABEL[currentBanner.severity]}
            </span>
            <span className="text-[11px] font-black truncate">{currentBanner.title}</span>
            {currentBanner.affectedDistricts.length > 0 && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold opacity-80 shrink-0">
                <MapPin className="w-3 h-3" />{currentBanner.affectedDistricts.slice(0, 3).join(', ')}
              </span>
            )}
          </div>

          {bannerAlerts.length > 1 && (
            <span className="text-[10px] font-black opacity-70 shrink-0">
              {currentBannerIdx + 1}/{bannerAlerts.length}
            </span>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-black cursor-pointer transition-all"
            >
              View All
            </button>
            <button
              onClick={() => setIsMuted(true)}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white cursor-pointer transition-all"
              title="Mute banner"
            >
              <VolumeX className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Muted indicator */}
      {isMuted && bannerAlerts.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-earth-900 text-earth-400 text-[10px] font-bold">
          <VolumeX className="w-3 h-3" />
          <span>Alert banner muted</span>
          <button onClick={() => setIsMuted(false)} className="underline text-primary-400 cursor-pointer ml-1">Unmute</button>
        </div>
      )}

      {/* ── Alert Bell Button ──────────────────────────────────────────────── */}
      {!bannerOnly && (
        <div className="flex justify-end px-4 py-2">
          <button
            id="emergency-alerts-btn"
            onClick={() => setIsDrawerOpen(o => !o)}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-earth-50 dark:hover:bg-earth-900 text-earth-600 dark:text-earth-300 text-sm font-extrabold transition-all cursor-pointer shadow-sm"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Emergency Alerts</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── Drawer Backdrop ────────────────────────────────────────────────── */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* ── Alerts Drawer ──────────────────────────────────────────────────── */}
      {isDrawerOpen && (
        <div className={`fixed right-0 top-0 bottom-0 h-[100dvh] w-full ${adminMode ? 'max-w-4xl' : 'max-w-lg'} z-[210] flex flex-col md:flex-row bg-card border-l border-border shadow-2xl animate-slide-in overflow-hidden`}>
          
          <div className="flex flex-col flex-1 min-w-0 h-full">

          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-red-600/5 to-orange-500/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md shadow-red-500/20">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-foreground">Emergency Alerts</h2>
                <p className="text-[10px] font-bold text-earth-500">
                  {userLocation
                    ? `Showing alerts for ${userLocation}`
                    : 'All Maharashtra districts'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="px-2.5 py-1 rounded-lg bg-earth-100 dark:bg-earth-900 text-earth-600 text-[10px] font-black cursor-pointer hover:bg-earth-200 dark:hover:bg-earth-800 transition-colors">
                  Mark all read
                </button>
              )}
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-xl hover:bg-earth-100 dark:hover:bg-earth-900 text-earth-500 cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-3 border-b border-border flex flex-wrap gap-2 shrink-0 bg-background/50">
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'rainfall', 'disease', 'market', 'wind'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all capitalize ${
                    filterType === t ? 'bg-foreground text-background' : 'border border-border text-earth-500 hover:text-foreground'
                  }`}
                >{t === 'all' ? 'All Types' : TYPE_LABEL[t]}</button>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'critical', 'danger', 'warning', 'info'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all capitalize ${
                    filterSeverity === s ? 'bg-red-500 text-white' : 'border border-border text-earth-500 hover:text-foreground'
                  }`}
                >{s === 'all' ? 'All Levels' : s}</button>
              ))}
            </div>
          </div>

          {/* Alert List */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24 flex flex-col gap-3">
            {filteredAlerts.length === 0 && (
              <div className="py-16 text-center flex flex-col items-center gap-3">
                <ShieldCheck className="w-12 h-12 text-emerald-500 opacity-60" />
                <p className="text-sm font-extrabold text-emerald-600">No active alerts for your area</p>
                <p className="text-xs font-semibold text-earth-500">Your district is currently safe. Stay alert.</p>
              </div>
            )}

            {filteredAlerts.map(alert => {
              const isExpanded = expandedId === alert.id;
              const isRead = readIds.has(alert.id);
              const Icon = ALERT_ICONS[alert.type];
              const sc = SEVERITY_CONFIG[alert.severity];
              const isExpiring = alert.expiresAt && new Date(alert.expiresAt).getTime() - Date.now() < 3 * 60 * 60 * 1000;

              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl border flex flex-col transition-all ${sc.bg} ${sc.border} ${!isRead ? 'ring-1 ring-current ring-opacity-20' : ''}`}
                >
                  {/* Alert Header */}
                  <div className="p-4 flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${sc.badge}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0" onClick={() => { setExpandedId(isExpanded ? null : alert.id); markRead(alert.id); }}>
                      <div className="flex items-center gap-2 flex-wrap mb-1 cursor-pointer">
                        {!isRead && <span className={`w-2 h-2 rounded-full ${sc.dot} shrink-0`} />}
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${sc.badge}`}>{SEVERITY_LABEL[alert.severity]}</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-earth-200/60 dark:bg-earth-800/60 text-earth-600 dark:text-earth-400">{TYPE_LABEL[alert.type]}</span>
                        {isExpiring && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Expiring soon</span>}
                      </div>
                      <h3 className="text-sm font-extrabold text-foreground leading-snug cursor-pointer">{alert.title}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold text-earth-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{timeAgo(alert.issuedAt)} · {alert.issuedBy}
                        </span>
                        {alert.expiresAt && (
                          <span className="text-[10px] font-bold text-earth-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />{timeUntil(alert.expiresAt)}
                          </span>
                        )}
                      </div>
                      {/* Districts */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {alert.affectedDistricts.slice(0, 4).map(d => (
                          <span key={d} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-earth-200/60 dark:bg-earth-800 text-earth-600 dark:text-earth-400 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />{d}
                          </span>
                        ))}
                        {alert.affectedDistricts.length > 4 && (
                          <span className="text-[9px] font-bold text-earth-400">+{alert.affectedDistricts.length - 4} more</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => { setExpandedId(isExpanded ? null : alert.id); markRead(alert.id); }}
                        className="p-1.5 rounded-lg border border-border text-earth-500 hover:bg-earth-100 dark:hover:bg-earth-900 cursor-pointer transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1.5 rounded-lg border border-border text-earth-400 hover:bg-earth-100 dark:hover:bg-earth-900 cursor-pointer transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="px-4 pb-4 flex flex-col gap-3 border-t border-current border-opacity-10 pt-3">
                      <p className="text-xs font-semibold text-foreground/80 leading-relaxed">{alert.message}</p>

                      {alert.actionRequired && (
                        <div className="flex gap-2.5 p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-current border-opacity-15">
                          <Zap className={`w-4 h-4 shrink-0 mt-0.5 ${sc.icon}`} />
                          <div>
                            <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${sc.icon}`}>Action Required</p>
                            <p className="text-xs font-semibold text-foreground leading-relaxed">{alert.actionRequired}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-bold text-earth-500">
                        <span>Source: {alert.issuedBy}</span>
                        <span>Issued: {new Date(alert.issuedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </div>

          {/* ── Admin Broadcast Panel (only in adminMode) ──────────────────── */}
          {adminMode && (
            <div className="md:w-96 p-6 shrink-0 bg-earth-50/50 dark:bg-earth-950/30 flex flex-col gap-4 overflow-y-auto border-t md:border-t-0 md:border-l border-border z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-black text-foreground">Broadcast Emergency Alert</h3>
              </div>
              {broadcastSent && (
                <div className="px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 text-xs font-black animate-fade-in">
                  ✓ Alert broadcast to all farmers & buyers!
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-earth-500 uppercase tracking-wider">Type</label>
                  <select value={broadcastForm.type} onChange={e => setBroadcastForm(p => ({ ...p, type: e.target.value as AlertType }))}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none cursor-pointer">
                    {(['rainfall', 'disease', 'market', 'wind', 'heat', 'frost'] as AlertType[]).map(t => (
                      <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-earth-500 uppercase tracking-wider">Severity</label>
                  <select value={broadcastForm.severity} onChange={e => setBroadcastForm(p => ({ ...p, severity: e.target.value as AlertSeverity }))}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:outline-none cursor-pointer">
                    {(['info', 'warning', 'danger', 'critical'] as AlertSeverity[]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-earth-500 uppercase tracking-wider">Alert Title *</label>
                  <input value={broadcastForm.title} onChange={e => setBroadcastForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Flash Flood Warning — Red Alert"
                    className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-earth-500 uppercase tracking-wider">Message *</label>
                  <textarea rows={2} value={broadcastForm.message} onChange={e => setBroadcastForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Describe the alert and what farmers should do..."
                    className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-earth-500 uppercase tracking-wider">Affected Districts (comma separated)</label>
                  <input value={broadcastForm.districts} onChange={e => setBroadcastForm(p => ({ ...p, districts: e.target.value }))}
                    placeholder="e.g. Nashik, Pune, Ahmednagar"
                    className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
              <button onClick={handleBroadcast}
                disabled={!broadcastForm.title || !broadcastForm.message}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-sm cursor-pointer transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                <Radio className="w-4 h-4" />Broadcast Alert to All Users
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
