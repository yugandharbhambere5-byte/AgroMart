'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Search, MessageSquare, PlusCircle, CheckCircle, AlertTriangle, Paperclip, Send, X, Clock, HelpCircle as HelpIcon, FileText } from 'lucide-react';
import { SupportTicket, TicketResponse, SupportCategory, TicketStatus } from '@/types/support';
import { createClient } from '@/utils/supabase/client';

interface HelpCenterProps {
  language: 'en' | 'mr' | 'hi';
  userId: string;
  userRole: 'farmer' | 'buyer';
  userName: string;
}

interface FAQItem {
  qEn: string; qHi: string; qMr: string;
  aEn: string; aHi: string; aMr: string;
  cat: SupportCategory;
}

const FAQ_SEEDS: FAQItem[] = [
  {
    qEn: 'How do I increase my profile Trust Score?',
    qHi: 'मैं अपने प्रोफाइल ट्रस्ट स्कोर को कैसे बढ़ा सकता हूं?',
    qMr: 'मी माझ्या प्रोफाइलचा ट्रस्ट स्कोर (विश्वासार्हता) कसा वाढवू?',
    aEn: 'Navigate to the Profile & Trust tab. You can link your phone (+30%), verify your GSTIN number (+35%), and upload a government-issued identity card for KYC scan (+35%) to reach a 100% Trust Score.',
    aHi: 'प्रोफाइल और ट्रस्ट टैब पर जाएं। आप अपना फोन लिंक करके (+30%), जीएसटी नंबर सत्यापित करके (+35%) और केवाईसी स्कैन के लिए पहचान पत्र अपलोड करके (+35%) 100% स्कोर पा सकते हैं।',
    aMr: 'प्रोफाइल आणि ट्रस्ट टॅबवर जा. तुम्ही फोन लिंक करून (+३०%), जीएसटी नंबर व्हेरिफाय करून (+३५%), आणि केवायसी स्कॅनसाठी आधार/पॅन कार्ड अपलोड करून (+३५%) १००% ट्रस्ट स्कोर मिळवू शकता.',
    cat: 'account'
  },
  {
    qEn: 'How does crop bidding and Auction Mode work?',
    qHi: 'फसल की नीलामी (ऑक्शन मोड) कैसे काम करती है?',
    qMr: 'पीक लिलाव पद्धत (Auction Mode) कशी काम करते?',
    aEn: 'When listing a harvest, toggle "Enable Auction Mode" and choose a duration. Buyers can view your listing and submit bids. You can accept any bid early or let the timer run out to accept the highest bidder.',
    aHi: 'फसल की सूची बनाते समय "Enable Auction Mode" चालू करें। खरीदार आपकी फसल देख सकते हैं और बोलियां लगा सकते हैं। आप किसी भी बोली को पहले स्वीकार कर सकते हैं या टाइमर समाप्त होने पर उच्चतम बोलीदाता को चुन सकते हैं।',
    aMr: 'पिकाची यादी करताना "Enable Auction Mode" चालू करा आणि कालावधी निवडा. खरेदीदार तुमच्या पिकावर बोली लावू शकतील. तुम्ही वेळेपूर्वी कोणतीही बोली स्वीकारू शकता किंवा वेळ संपल्यावर सर्वाधिक बोली लावणाऱ्याला निवडू शकता.',
    cat: 'crop_listing'
  },
  {
    qEn: 'Is my transaction payment secure on AgroMart?',
    qHi: 'क्या एग्रोमार्ट पर मेरा भुगतान सुरक्षित है?',
    qMr: 'अ‍ॅग्रोमार्टवर माझे व्यवहार आणि पेमेंट सुरक्षित आहेत का?',
    aEn: 'Yes! AgroMart uses a secure Escrow mechanism. When a deal is locked, the buyer deposits the funds. The funds are securely held in escrow and released to the farmer only after successful crop transport and delivery verification.',
    aHi: 'हां! एग्रोमार्ट सुरक्षित एस्क्रो सिस्टम का उपयोग करता है। जब सौदा पक्का होता है, तो खरीदार पैसे जमा करता है। फसल की डिलीवरी के बाद ही पैसे किसान को जारी किए जाते हैं।',
    aMr: 'होय! अ‍ॅग्रोमार्ट सुरक्षित एस्क्रो (Escrow) पद्धतीचा वापर करते. व्यवहार निश्चित झाल्यावर खरेदीदार पैसे जमा करतो. मालाची डिलिव्हरी आणि तपासणी पूर्ण झाल्यानंतरच हे पैसे शेतकऱ्याला दिले जातात.',
    cat: 'payments'
  },
  {
    qEn: 'Who is responsible for crop transport logistics?',
    qHi: 'फसल परिवहन (लॉजिस्टिक्स) के लिए कौन जिम्मेदार है?',
    qMr: 'पीक वाहतुकीची (Transport) जबाबदारी कोणाची असते?',
    aEn: 'Transportation terms can be negotiated directly between the buyer and farmer in the built-in Chat thread. AgroMart recommends finalizing pickup coordinates and costs before accepting deals.',
    aHi: 'परिवहन शर्तों पर खरीदार और किसान सीधे चैट के माध्यम से बातचीत कर सकते हैं। हमारा सुझाव है कि सौदा स्वीकार करने से पहले किराया और स्थान तय कर लें।',
    aMr: 'वाहतुकीचे नियम व भाडे शेतकरी आणि खरेदीदार यांच्यात चॅटिंगद्वारे थेट ठरवले जाऊ शकतात. व्यवहार स्वीकारण्यापूर्वी वाहतूक खर्च आणि पिकअप ठिकाण निश्चित करण्याची शिफारस आम्ही करतो.',
    cat: 'transport'
  },
  {
    qEn: 'What happens if a dispute arises during cargo delivery?',
    qHi: 'यदि डिलीवरी के दौरान कोई विवाद उत्पन्न होता है तो क्या होगा?',
    qMr: 'माल पोहोचवताना काही वाद निर्माण झाल्यास काय करावे?',
    aEn: 'If the cargo quality does not match or a delivery issue occurs, do not release escrow. Navigate to this Help Center, click "Raise Complaint" with details and photos. Our administrators will mediate and resolve the dispute within 24 hours.',
    aHi: 'यदि फसल की गुणवत्ता मेल नहीं खाती या डिलीवरी में समस्या है, तो एस्क्रो जारी न करें। इस सहायता केंद्र में आएं, फ़ोटो के साथ शिकायत दर्ज करें। हमारे अधिकारी 24 घंटे में समाधान करेंगे।',
    aMr: 'पिकाची गुणवत्ता जुळत नसल्यास किंवा माल न मिळाल्यास पेमेंट रीलिझ करू नका. या मदत केंद्रात येऊन फोटोसह तक्रार नोंदवा. आमचे अधिकारी २४ तासांच्या आत मध्यस्थी करून तोडगा काढतील.',
    cat: 'general'
  }
];

export const INITIAL_TICKET_SEED = (userId: string, userName: string): SupportTicket[] => [
  {
    id: 'tkt-1',
    userId,
    userRole: 'farmer',
    userName,
    subject: 'Escrow Dispute: Delayed payment release for Potato order',
    description: 'Buyer Suresh Deshmukh received 8 tons of potatoes yesterday but has not released the payment. I have attached the transport bill.',
    category: 'payments',
    screenshot: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600',
    status: 'In Progress',
    date: '2026-06-12T08:00:00.000Z',
    responses: [
      {
        id: 'r-admin-1',
        senderRole: 'admin',
        senderName: 'Admin Neha',
        text: 'Hello, we have contacted buyer Suresh Deshmukh. He is verifying the moisture index check and has promised to release the escrow payout by today evening. Let us know if you do not receive it.',
        date: '2026-06-12T10:30:00.000Z'
      }
    ]
  }
];

export function HelpCenter({ language, userId, userRole, userName }: HelpCenterProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'faq' | 'tickets' | 'raise'>('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);

  // Raise Complaint Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportCategory>('general');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  // Ticket Chat Input
  const [replyText, setReplyText] = useState('');
  const ticketChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const { data, error } = await supabase.from('support_tickets').select('*');
        if (!error && data && data.length > 0) {
          setTickets(data);
          localStorage.setItem('agromart_support_tickets', JSON.stringify(data));
          return;
        }
      } catch (err) {
        console.warn('Supabase support ticket load failed:', err);
      }

      // Fallback
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('agromart_support_tickets');
        if (stored) {
          setTickets(JSON.parse(stored));
        } else {
          const seeds = INITIAL_TICKET_SEED(userId, userName);
          localStorage.setItem('agromart_support_tickets', JSON.stringify(seeds));
          setTickets(seeds);
        }
      }
    };
    loadTickets();
  }, [userId, userName]);

  useEffect(() => {
    if (activeTicket && ticketChatEndRef.current) {
      ticketChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket]);

  const saveTicketsList = async (list: SupportTicket[]) => {
    setTickets(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agromart_support_tickets', JSON.stringify(list));
    }
    try {
      await supabase.from('support_tickets').upsert(list);
    } catch (err) {
      console.warn('Supabase support ticket save failed:', err);
    }
  };

  const handleScreenshotUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setUploadPercent(10);
    const interval = setInterval(() => {
      setUploadPercent(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setScreenshotUrl('https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600');
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleRaiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Subject and Description fields are required.');
      return;
    }

    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      userId,
      userRole,
      userName,
      subject,
      description,
      category,
      screenshot: screenshotUrl || undefined,
      status: 'Open',
      date: new Date().toISOString(),
      responses: []
    };

    // Load current list from localStorage first (to avoid overwriting other users' tickets)
    let currentFullList: SupportTicket[] = [];
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agromart_support_tickets');
      if (stored) currentFullList = JSON.parse(stored);
    }
    
    const updatedFullList = [newTicket, ...currentFullList];
    saveTicketsList(updatedFullList);

    // Reset Form
    setSubject('');
    setDescription('');
    setScreenshotUrl('');
    setCategory('general');
    setActiveTab('tickets');
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !activeTicket) return;

    const newReply: TicketResponse = {
      id: `rep-${Date.now()}`,
      senderRole: 'user',
      senderName: userName,
      text: replyText.trim(),
      date: new Date().toISOString()
    };

    // Update tickets
    let currentFullList: SupportTicket[] = [];
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agromart_support_tickets');
      if (stored) currentFullList = JSON.parse(stored);
    }

    const updatedFullList = currentFullList.map(tkt => {
      if (tkt.id === activeTicket.id) {
        const updatedResponses = [...tkt.responses, newReply];
        // Automatically reopen ticket to "Open" status for admin review when user sends a new response
        return { ...tkt, responses: updatedResponses, status: 'Open' as TicketStatus };
      }
      return tkt;
    });

    saveTicketsList(updatedFullList);
    setReplyText('');

    const currentTkt = updatedFullList.find(tkt => tkt.id === activeTicket.id);
    if (currentTkt) {
      setActiveTicket(currentTkt);
    }
  };

  // Translations
  const t = {
    en: {
      title: 'Help & Support Center',
      subtitle: 'Browse answers to common questions, raise dispute complaints, and track ticket resolutions.',
      searchFaqs: 'Search help articles & FAQs...',
      raiseTab: 'Raise Complaint',
      faqTab: 'FAQs & Guides',
      ticketTab: 'Track Complaints',
      subject: 'Subject *',
      description: 'Detailed Description *',
      catLabel: 'Dispute Category',
      screenshot: 'Upload Attachment (Invoice / Photo)',
      submit: 'Submit Complaint',
      status: 'Status',
      date: 'Raised Date',
      category: 'Category',
      noTickets: 'You have not submitted any complaints yet.',
      noFaqs: 'No FAQs matching your query.',
      categoryFilter: 'FAQ Category',
      all: 'All',
      account: 'Account & Profile',
      crop_listing: 'Crop Listings',
      offer: 'Bids & Offers',
      payments: 'Payments & Escrow',
      transport: 'Logistics & Transport',
      general: 'General dispute',
    },
    hi: {
      title: 'सहायता और समर्थन केंद्र',
      subtitle: 'सामान्य प्रश्नों के उत्तर खोजें, विवाद की शिकायत दर्ज करें और टिकट समाधान ट्रैक करें।',
      searchFaqs: 'मदद लेख और अक्सर पूछे जाने वाले प्रश्न खोजें...',
      raiseTab: 'शिकायत दर्ज करें',
      faqTab: 'अक्सर पूछे जाने वाले प्रश्न',
      ticketTab: 'शिकायतें ट्रैक करें',
      subject: 'विषय *',
      description: 'विस्तृत विवरण *',
      catLabel: 'विवाद श्रेणी',
      screenshot: 'संलग्नक अपलोड करें (चालान / फोटो)',
      submit: 'शिकायत दर्ज करें',
      status: 'स्थिति',
      date: 'तारीख',
      category: 'श्रेणी',
      noTickets: 'आपने अभी तक कोई शिकायत दर्ज नहीं की है।',
      noFaqs: 'आपकी खोज से मेल खाता कोई प्रश्न नहीं मिला।',
      categoryFilter: 'श्रेणी फिल्टर',
      all: 'सभी',
      account: 'खाता और प्रोफाइल',
      crop_listing: 'फसल सूची',
      offer: 'बोलियां और प्रस्ताव',
      payments: 'भुगतान और एस्क्रो',
      transport: 'परिवहन और रसद',
      general: 'सामान्य विवाद',
    },
    mr: {
      title: 'मदत आणि तक्रार निवारण केंद्र',
      subtitle: 'सामान्य प्रश्नांची उत्तरे शोधा, पिकाबद्दलच्या तक्रारी नोंदवा आणि निवारण स्थिती तपासा.',
      searchFaqs: 'मदत लेख आणि FAQ शोधा...',
      raiseTab: 'तक्रार नोंदवा',
      faqTab: 'नेहमीचे प्रश्न (FAQ)',
      ticketTab: 'तक्रारींचा मागोवा घ्या',
      subject: 'तक्रारीचा विषय *',
      description: 'सविस्तर तक्रार वर्णन *',
      catLabel: 'तक्रार वर्गवारी',
      screenshot: 'पुरावा फोटो/बिल अपलोड करा',
      submit: 'तक्रार पाठवा',
      status: 'स्थिती',
      date: 'तक्रार दिनांक',
      category: 'वर्गवारी',
      noTickets: 'तुम्ही अद्याप कोणतीही तक्रार नोंदवली नाही.',
      noFaqs: 'या विषयावर सध्या माहिती उपलब्ध नाही.',
      categoryFilter: 'विषय फिल्टर',
      all: 'सर्व',
      account: 'खाते आणि प्रोफाइल',
      crop_listing: 'पीक यादी',
      offer: 'बोली व खरेदी ऑफर्स',
      payments: 'पेमेंट व एस्क्रो बँक',
      transport: 'वाहतूक व लॉजिस्टिक्स',
      general: 'इतर तक्रारी',
    }
  }[language];

  // Filters for User tickets only
  const userTickets = tickets.filter(tkt => tkt.userId === userId);

  // Filter FAQs
  const filteredFaqs = FAQ_SEEDS.filter(faq => {
    const qText = language === 'mr' ? faq.qMr : language === 'hi' ? faq.qHi : faq.qEn;
    const aText = language === 'mr' ? faq.aMr : language === 'hi' ? faq.aHi : faq.aEn;
    const matchSearch = searchTerm.trim() === '' || 
      qText.toLowerCase().includes(searchTerm.toLowerCase()) || 
      aText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = faqCategory === 'all' || faq.cat === faqCategory;
    return matchSearch && matchCat;
  });

  const getLocalizedFaqQ = (faq: FAQItem) => language === 'mr' ? faq.qMr : language === 'hi' ? faq.qHi : faq.qEn;
  const getLocalizedFaqA = (faq: FAQItem) => language === 'mr' ? faq.aMr : language === 'hi' ? faq.aHi : faq.aEn;

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in relative pb-16">
      
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary-500" />
          <span>{t.title}</span>
        </h2>
        <p className="text-xs font-semibold text-earth-550 dark:text-earth-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 bg-earth-100/60 dark:bg-earth-900/60 rounded-2xl w-full overflow-x-auto no-scrollbar shrink-0">
        <button onClick={() => setActiveTab('faq')} className={`px-4 py-2 rounded-xl text-xs font-extrabold flex-1 text-center cursor-pointer ${activeTab === 'faq' ? 'bg-card text-primary-600 shadow border border-border' : 'text-earth-500 hover:text-foreground'}`}>{t.faqTab}</button>
        <button onClick={() => setActiveTab('raise')} className={`px-4 py-2 rounded-xl text-xs font-extrabold flex-1 text-center cursor-pointer ${activeTab === 'raise' ? 'bg-card text-primary-600 shadow border border-border' : 'text-earth-500 hover:text-foreground'}`}>{t.raiseTab}</button>
        <button onClick={() => setActiveTab('tickets')} className={`px-4 py-2 rounded-xl text-xs font-extrabold flex-1 text-center cursor-pointer ${activeTab === 'tickets' ? 'bg-card text-primary-600 shadow border border-border' : 'text-earth-500 hover:text-foreground'}`}>{t.ticketTab} ({userTickets.length})</button>
      </div>

      {/* FAQ VIEW */}
      {activeTab === 'faq' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-earth-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchFaqs}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-sm"
              />
            </div>
            <select
              value={faqCategory}
              onChange={(e) => setFaqCategory(e.target.value)}
              className="px-3 py-3 rounded-xl border border-border bg-card text-xs font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shrink-0"
            >
              <option value="all">{t.categoryFilter}: {t.all}</option>
              <option value="account">{t.account}</option>
              <option value="crop_listing">{t.crop_listing}</option>
              <option value="payments">{t.payments}</option>
              <option value="transport">{t.transport}</option>
              <option value="general">{t.general}</option>
            </select>
          </div>

          <div className="flex flex-col gap-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, i) => (
                <div key={i} className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-2 hover:border-primary-500/20 transition-colors">
                  <h4 className="font-extrabold text-foreground text-sm flex items-start gap-2">
                    <HelpIcon className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                    <span>{getLocalizedFaqQ(faq)}</span>
                  </h4>
                  <p className="text-xs font-semibold text-earth-550 dark:text-earth-350 leading-relaxed pl-6">
                    {getLocalizedFaqA(faq)}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-12 border-2 border-dashed border-border rounded-2xl text-center text-earth-500 font-bold">{t.noFaqs}</div>
            )}
          </div>
        </div>
      )}

      {/* RAISE COMPLAINT VIEW */}
      {activeTab === 'raise' && (
        <form onSubmit={handleRaiseSubmit} className="p-6 rounded-3xl border border-border bg-card flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground">{t.subject}</label>
              <input 
                type="text" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Escrow payment not released by buyer"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-foreground">{t.catLabel}</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value as SupportCategory)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="general">{t.general}</option>
                <option value="account">{t.account}</option>
                <option value="crop_listing">{t.crop_listing}</option>
                <option value="offer">{t.offer}</option>
                <option value="payments">{t.payments}</option>
                <option value="transport">{t.transport}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-foreground">{t.description}</label>
            <textarea 
              rows={4}
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem in detail. Include crop listing name, weights, and dealer details..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              required
            />
          </div>

          {/* Simulated File attachment */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-foreground">{t.screenshot}</label>
            <div className="flex items-center gap-3">
              <input 
                type="file" 
                accept="image/*" 
                id="screenshot-file-upload" 
                className="hidden" 
                onChange={handleScreenshotUploadSimulate} 
              />
              <label 
                htmlFor="screenshot-file-upload" 
                className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-earth-50"
              >
                <Paperclip className="w-4 h-4 text-earth-500" />
                <span>Choose Image</span>
              </label>
              {isUploading && (
                <span className="text-[10px] font-black text-amber-500 animate-pulse">Uploading {uploadPercent}%</span>
              )}
              {screenshotUrl && !isUploading && (
                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5">✓ Attached screenshot</span>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-base transition-colors cursor-pointer mt-2 shadow"
          >
            {t.submit}
          </button>
        </form>
      )}

      {/* TRACK COMPLAINTS VIEW */}
      {activeTab === 'tickets' && (
        <div className="flex flex-col gap-4">
          {userTickets.length > 0 ? (
            userTickets.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => setActiveTicket(ticket)}
                className="p-5 rounded-2xl border border-border bg-card hover:border-primary-500/20 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex-grow min-w-0">
                  <h4 className="font-extrabold text-foreground text-sm truncate">{ticket.subject}</h4>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-earth-500 font-bold uppercase mt-1">
                    <span className="text-primary-600 font-black">{t[ticket.category]}</span>
                    <span>•</span>
                    <span>{t.date}: {new Date(ticket.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>💬 {ticket.responses.length} responses</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    ticket.status === 'Open' ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-500/10'
                    : ticket.status === 'In Progress' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-500/10'
                    : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-500/10'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className="text-[10px] text-primary-500 font-extrabold shrink-0">Open Details →</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 border-2 border-dashed border-border rounded-3xl text-center text-earth-500 font-bold">
              {t.noTickets}
            </div>
          )}
        </div>
      )}

      {/* COMPLAINT DETAIL & MESSAGE CHAT OVERLAY */}
      {activeTicket && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setActiveTicket(null)}
          />
          
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in bg-card border border-border no-scrollbar flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-600 border border-primary-500/10">
                  Complaint details
                </span>
                <h3 className="font-extrabold text-foreground text-base mt-2">{activeTicket.subject}</h3>
              </div>
              <button 
                onClick={() => setActiveTicket(null)}
                className="p-2 rounded-xl bg-earth-100 dark:bg-earth-900 text-earth-500 hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Info details */}
            <div className="p-6 border-b border-border/40 flex flex-col gap-3">
              <p className="text-xs text-earth-600 dark:text-earth-300 font-semibold leading-relaxed">
                {activeTicket.description}
              </p>
              
              {activeTicket.screenshot && (
                <a 
                  href={activeTicket.screenshot} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:underline w-fit mt-1 border border-blue-500/25 bg-blue-500/5 px-2.5 py-1.5 rounded-lg"
                >
                  <Paperclip className="w-3.5 h-3.5" /> View Attached screenshot
                </a>
              )}
            </div>

            {/* Responses Log list */}
            <div className="flex-grow p-6 overflow-y-auto min-h-[200px] max-h-[300px] bg-earth-50/30 dark:bg-earth-950/10 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-earth-500 mb-2">Message History</span>
              
              <div className="flex flex-col gap-3">
                {/* Initial Description from user */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-primary-600 text-white px-4 py-2.5 rounded-2xl rounded-br-none text-xs font-semibold leading-relaxed">
                    <span className="text-[9px] font-black block opacity-80 mb-1">{activeTicket.userName} (You)</span>
                    {activeTicket.description}
                  </div>
                </div>

                {activeTicket.responses.map(resp => (
                  <div key={resp.id} className={`flex ${resp.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                      resp.senderRole === 'user'
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-earth-100 dark:bg-earth-800 text-foreground rounded-bl-none'
                    }`}>
                      <span className="text-[9px] font-black block opacity-85 mb-1">
                        {resp.senderRole === 'user' ? `${resp.senderName} (You)` : `Support Agent: ${resp.senderName}`}
                      </span>
                      {resp.text}
                    </div>
                  </div>
                ))}
                <div ref={ticketChatEndRef} />
              </div>
            </div>

            {/* Input Bar */}
            {activeTicket.status !== 'Closed' ? (
              <div className="p-4 border-t border-border flex gap-3 bg-card sticky bottom-0">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                  placeholder="Type a message to reply..."
                  className="flex-grow px-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-4 bg-earth-100 text-center text-xs font-bold text-earth-500">
                This dispute ticket has been resolved and closed.
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
