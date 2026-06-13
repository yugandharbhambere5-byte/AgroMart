'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Bookmark, BookmarkCheck, Clock, User, Eye, ThumbsUp, X, ArrowRight, Star, Heart } from 'lucide-react';
import { EducationArticle, EducationCategory } from '@/types/education';
import { createClient } from '@/utils/supabase/client';

interface FarmerEducationCenterProps {
  language: 'en' | 'mr' | 'hi';
  userId: string;
}

export const SEED_ARTICLES: EducationArticle[] = [
  {
    id: 'art-1',
    titleEn: 'Tomato Crop Care: Maximizing Yield in Monsoon',
    titleHi: 'टमाटर की फसल की देखभाल: मानसून में अधिक उपज पाएं',
    titleMr: 'टोमॅटो पीक काळजी: पावसाळ्यात भरपूर उत्पादन मिळवा',
    summaryEn: 'Essential guide on staking, pruning, and drainage management for tomato crops during heavy rains.',
    summaryHi: 'भारी बारिश के दौरान टमाटर की फसलों के लिए जल निकासी, छंटाई और सहारा देने पर एक विस्तृत गाइड।',
    summaryMr: 'मुसळधार पावसाळ्यात टोमॅटो पिकासाठी योग्य पाणी निचरा, छाटणी आणि आधाराबाबत सविस्तर मार्गदर्शक.',
    contentEn: `Monsoon season brings critical challenges for tomato cultivators. Excess water logging, lack of proper staking, and humidity can invite fungal infections. Follow this comprehensive care guide to maximize your yield:

### 1. Soil Drainage Management
Ensure that raised beds are at least 15-20 cm high. Channels between beds must be kept clear to drain excess rainwater within minutes. Waterlogged roots starve of oxygen and rot quickly.

### 2. Double Staking Method
Support tomato plants using bamboo poles and strong jute strings. Heavy rain and strong winds can snap branches loaded with raw fruit. Staking keeps fruits away from the wet soil, preventing rot.

### 3. Systematic Pruning
Remove suckers and ground-touching foliage up to 9 inches from the base. This improves air circulation, keeps the leaves dry, and reduces the risk of early and late blight.

### 4. Spray Schedule
Apply copper-based fungicides or Trichoderma viride bio-fungicides proactively every 10-12 days to control fungal spores.`,
    contentHi: `मानसून का मौसम टमाटर उत्पादकों के लिए महत्वपूर्ण चुनौतियाँ लेकर आता है। पानी का जमाव, उचित सहारे की कमी और उच्च आर्द्रता से फंगल संक्रमण का खतरा बढ़ जाता है। अपनी उपज बढ़ाने के लिए इस मार्गदर्शिका का पालन करें:

### 1. जल निकासी प्रबंधन
सुनिश्चित करें कि उठी हुई क्यारियां कम से कम 15-20 सेमी ऊंची हों। क्यारियों के बीच की नालियों को साफ रखें ताकि बारिश का अतिरिक्त पानी तुरंत निकल सके।

### 2. दोहरी स्टैकिंग (सहारा) विधि
बांस के खंभों और जूट की रस्सियों का उपयोग करके टमाटर के पौधों को सहारा दें। भारी हवाओं के कारण फलदार शाखाएं टूट सकती हैं।

### 3. व्यवस्थित छंटाई
जमीन से सटे पत्तों और अतिरिक्त टहनियों को छांट दें ताकि हवा का प्रवाह बना रहे और पत्तियां सूखी रहें।`,
    contentMr: `पावसाळा हा टोमॅटो उत्पादक शेतकऱ्यांसाठी मोठा आव्हानात्मक काळ असतो. शेतात साचलेले पाणी, पिकाला योग्य आधाराचा अभाव आणि हवेतील आर्द्रता यामुळे बुरशीजन्य रोगांचा प्रादुर्भाव वाढतो. आपले उत्पादन वाढवण्यासाठी या नियमांचे पालन करा:

### 1. पाण्याचा निचरा व्यवस्थापन
टोमॅटोची लागवड गादीवाफ्यावर (Raised Beds) करावी, ज्याची उंची किमान १५-२० सेमी असावी. वाफ्यांमधील नाले नेहमी स्वच्छ ठेवा जेणेकरून अतिरिक्त पाणी साचणार नाही.

### 2. बांबू आणि सुतळीने आधार देणे (Staking)
पिकाला बांबू आणि मजबूत सुतळीच्या साहाय्याने चांगला आधार द्या. वादळी वाऱ्यामुळे फळांनी लगडलेल्या फांद्या मोडण्यापासून वाचतील आणि फळे जमिनीला न टेकल्यामुळे सडणार नाहीत.

### 3. नियमित छाटणी (Pruning)
खालचे आणि जमिनीला स्पर्श करणारे पान नियमितपणे तोडून टाका जेणेकरून झाडामध्ये हवा खेळती राहील.`,
    category: 'crop_care',
    author: 'Dr. Suresh Patil (Agri Scientist)',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600',
    isFeatured: true,
    date: '2026-06-10T10:00:00.000Z',
    likes: 245,
    views: 1205
  },
  {
    id: 'art-2',
    titleEn: 'Prevention of Downy Mildew in Grape Vineyards',
    titleHi: 'अंगूर के बागों में डाउनी मिल्ड्यू रोग की रोकथाम',
    titleMr: 'द्राक्ष बागेतील केवडा (Downy Mildew) रोगाचे नियंत्रण',
    summaryEn: 'How to identify downy mildew early and apply organic/chemical countermeasures effectively.',
    summaryHi: 'डाउनी मिल्ड्यू की जल्दी पहचान कैसे करें और जैविक/रासायनिक उपायों का प्रभावी ढंग से उपयोग कैसे करें।',
    summaryMr: 'द्राक्ष बागेवर पडणाऱ्या केवडा रोगाची लक्षणे वेळेत ओळखून त्याचे जैविक व रासायनिक नियंत्रण कसे करावे.',
    contentEn: `Downy mildew is a highly destructive disease affecting grape leaves and berries. It appears as yellow, oily spots on the upper leaf surface, followed by a white, cottony fungal growth on the underside.

### Preventive Guidelines:
1. **Vine Canopy Management**: Thin out excessive foliage during pruning to ensure sunlight penetrates inside the canopy.
2. **Biological Sprays**: Spray Pseudomonas fluorescens (5g/liter of water) during early leaf emergence.
3. **Chemical Sprays**: If weather is cloudy and humid, spray Metalaxyl + Mancozeb (2g/liter) before rain starts.`,
    contentHi: `डाउनी मिल्ड्यू अंगूर की पत्तियों और फलों को प्रभावित करने वाला एक अत्यंत हानिकारक रोग है।

### बचाव के उपाय:
1. **कैनोपी प्रबंधन**: छंटाई के दौरान अतिरिक्त पत्तियों को हटा दें ताकि धूप अंदर तक जा सके।
2. **जैविक छिड़काव**: शुरुआत में स्यूडोमोनास फ्लोरेसेंस (5 ग्राम/लीटर) का छिड़काव करें।
3. **रासायनिक नियंत्रण**: यदि बादल छाए हों, तो मेटलैक्सिल + मैनकोज़ेब (2 ग्राम/लीटर) का उपयोग करें।`,
    contentMr: `केवडा (Downy Mildew) हा द्राक्ष पिकावरील अत्यंत घातक रोग आहे. पानांच्या वरच्या बाजूला पिवळसर तेलकट ठिपके दिसणे आणि पानांच्या पाठीमागे पांढरी कापसासारखी बुरशी वाढणे ही याची मुख्य लक्षणे आहेत.

### प्रतिबंधात्मक उपाय:
1. **सूर्यप्रकाश मिळवणे**: छाटणी करताना द्राक्ष वेलीची गर्दी कमी करा जेणेकरून आतपर्यंत सूर्यप्रकाश आणि हवा पोहोचेल.
2. **जैविक फवारणी**: सुरुवातीच्या काळात सुडोमोनास फ्लोरोसन्स (५ ग्रॅम प्रति लीटर पाणी) ची फवारणी करावी.
3. **रासायनिक फवारणी**: ढगाळ वातावरणात पाऊस पडण्यापूर्वी मेटलॅक्सिल + मँकोझेब (२ ग्रॅम प्रति लीटर) फवारणी करावी.`,
    category: 'disease_prevention',
    author: 'Prof. Anil Deshmukh (Agri College Pune)',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1532509774891-b4ecdf65d154?w=600',
    isFeatured: false,
    date: '2026-06-11T12:00:00.000Z',
    likes: 189,
    views: 890
  },
  {
    id: 'art-3',
    titleEn: 'NPK Balance: Smart Fertilization for Cotton Farmers',
    titleHi: 'एनपीके संतुलन: कपास किसानों के लिए वैज्ञानिक उर्वरक सलाह',
    titleMr: 'एनपीके (NPK) संतुलन: कापूस उत्पादक शेतकऱ्यांसाठी खत नियोजन',
    summaryEn: 'Understand the correct ratio of Nitrogen, Phosphorus, and Potassium for BT Cotton crops.',
    summaryHi: 'बीटी कपास की फसलों के लिए नाइट्रोजन, फास्फोरस और पोटेशियम के सही अनुपात को समझें।',
    summaryMr: 'बीटी कापूस पिकासाठी नत्र, स्फुरद आणि पालाश (NPK) यांचे योग्य प्रमाण आणि देण्याची वेळ.',
    contentEn: `Over-use of Nitrogen fertilizer causes cotton plants to grow excessively tall without producing boll clusters. Balancing NPK is crucial for higher cotton yield.

### Recommended Ratio for Cotton:
- **Nitrogen (N)**: Promotes plant growth. Use 120 kg/hectare divided into 3 splits.
- **Phosphorus (P)**: Essential for strong root development and flower initiation. Apply 60 kg/hectare at sowing.
- **Potassium (K)**: Increases boll weight and resistance to sucking pests. Apply 60 kg/hectare in 2 splits.`,
    contentHi: `नाइट्रोजन उर्वरक के अत्यधिक उपयोग से कपास के पौधे बहुत बड़े हो जाते हैं, लेकिन उनमें फल नहीं लगते।

### अनुशंसित मात्रा:
- **नाइट्रोजन (N)**: 120 किलोग्राम/हेक्टेयर (3 भागों में विभाजित करके डालें)।
- **फास्फोरस (P)**: 60 किलोग्राम/हेक्टेयर बुवाई के समय।
- **Potassium (K)**: 60 किलोग्राम/हेक्टेयर (2 भागों में)।`,
    contentMr: `कापूस पिकाला केवळ नत्र (युरिया) खत जास्त दिल्याने झाडांची शाकीय वाढ भरपूर होते पण बोंडे कमी लागतात. यासाठी रासायनिक खतांचे संतुलित नियोजन गरजेचे आहे.

### कापूस पिकासाठी खत शिफारसी:
- **नत्र (Nitrogen)**: प्रति हेक्टरी १२० किलो (३ समान हप्त्यांमध्ये विभागून द्यावे).
- **स्फुरद (Phosphorus)**: प्रति हेक्टरी ६० किलो (पेरणीच्या वेळी संपूर्ण द्यावे).
- **पालाश (Potassium)**: प्रति हेक्टरी ६० किलो (२ हप्त्यांमध्ये विभागून द्यावे).`,
    category: 'fertilizer_recommendations',
    author: 'Krishi Vigyan Kendra Baramati',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600',
    isFeatured: false,
    date: '2026-06-08T08:30:00.000Z',
    likes: 312,
    views: 1450
  },
  {
    id: 'art-4',
    titleEn: 'Smart Market Tips: When to Sell Onion Stock',
    titleHi: 'स्मार्ट बाजार युक्तियां: प्याज के स्टॉक को कब बेचें',
    titleMr: 'बाजार सल्ला: साठवणूक केलेला कांदा कधी विक्री करावा?',
    summaryEn: 'Analysis of market arrivals, monsoon trends, and cold storage storage management for Onions.',
    summaryHi: 'प्याज के भंडारण, बाजार में आवक और कीमतों के रुझान का संपूर्ण विश्लेषण।',
    summaryMr: 'कांदा साठवणूक, बाजारातील आवक आणि मान्सूनच्या काळातील संभाव्य दरवाढ विश्लेषण.',
    contentEn: `Onion prices are notoriously volatile. Understanding seasonal market trends can help you fetch 30% higher profit margins:

1. **July to September Storage**: Keep onion stock in dry, well-ventilated bamboo huts (Kanda Chawl). Do not sell immediately in May/June when APMC arrival peaks.
2. **Monitor Southern Arrivals**: Keep an eye on onion sowing rates in Karnataka. If sowing is delayed due to poor rainfall, Maharashtra rates will rise.
3. **Grade Before Selling**: Sort onions into Big (Gola), Medium, and Small (Chingri) sizes. Selling mixed lots reduces the overall price.`,
    contentHi: `प्याज की कीमतें अत्यधिक अस्थिर रहती हैं। सही समय पर बिक्री करके किसान अधिक मुनाफा कमा सकते हैं:

1. **भंडारण का महत्व**: मई-जून की आवक के दौरान सारा प्याज न बेचें, प्याज को सूखे प्याज घर (चाळ) में रखें।
2. **ग्रेडिंग करें**: प्याज का आकार के अनुसार वर्गीकरण करें। मिश्रित प्याज बेचने से कम कीमत मिलती है।`,
    contentMr: `कांद्याचे दर नेहमी चढ-उतार दाखवत असतात. योग्य वेळी विक्रीचे नियोजन करून शेतकरी ३० टक्क्यांपर्यंत जादा नफा मिळवू शकतात.

1. **चाळीतील साठवणूक**: मे-जून महिन्यात मिळणाऱ्या कमी दरात घाईघाईने विक्री न करता कांदा कोरड्या व हवेशीर चाळीत साठवावा.
2. **ग्रेडिंग करून विक्री**: कांद्याचे गोल, मध्यम आणि चिंगरी असे प्रतवारीनुसार वर्गीकरण करून विक्री करा. मिक्स कांदा विकल्यास कमी भाव मिळतो.`,
    category: 'market_tips',
    author: 'AgroMart Market Desk',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600',
    isFeatured: true,
    date: '2026-06-12T09:00:00.000Z',
    likes: 420,
    views: 1980
  },
  {
    id: 'art-5',
    titleEn: 'PM-KUSUM Scheme: Solar Pumps with 90% Subsidy',
    titleHi: 'पीएम-कुसुम योजना: 90% सब्सिडी पर सोलर पंप पाएं',
    titleMr: 'पीएम-कुसुम योजना: ९०% अनुदानावर सौर कृषी पंप मिळवा',
    summaryEn: 'Step-by-step guide to applying for solar pump sets under the Government subsidy program.',
    summaryHi: 'सरकारी सब्सिडी योजना के तहत सोलर पंप सेट के लिए आवेदन करने की पूरी प्रक्रिया।',
    summaryMr: 'सोलर कृषी पंपासाठी लागणारी आवश्यक कागदपत्रे आणि अर्ज करण्याची सोपी पद्धत.',
    contentEn: `Under the PM-KUSUM component B scheme, farmers can install 3HP, 5HP, or 7.5HP solar agricultural pumps at heavily discounted rates:

### Subsidy Structure:
- **Central Government Share**: 30%
- **State Government Share**: 60%
- **Farmer Share**: Only 10%

### Required Documents:
1. Aadhaar Card
2. 7/12 Land Record Extracts
3. Bank Passbook copy
4. Mobile number linked to Aadhaar`,
    contentHi: `पीएम-कुसुम योजना के तहत किसान सोलर वाटर पंप लगाने के लिए 90% तक की सब्सिडी का लाभ उठा सकते हैं:

### आवश्यक दस्तावेज:
1. आधार कार्ड
2. भूमि के कागजात (खतौनी / 7/12)
3. बैंक पासबुक
4. आधार से जुड़ा मोबाइल नंबर`,
    contentMr: `पीएम-कुसुम योजनेच्या माध्यमातून शेतकरी ३, ५ किंवा ७.५ अश्वशक्तीचे (HP) सोलर पंप ९०% अनुदानावर बसवू शकतात.

### अनुदानाचे स्वरूप:
- **केंद्र सरकारचा हिस्सा**: ३०%
- **राज्य सरकारचा हिस्सा**: ६०%
- **शेतकऱ्याचा हिस्सा**: फक्त १०%

### लागणारी कागदपत्रे:
1. आधार कार्ड
2. ७/१२ आणि ८-अ चा उतारा
3. बँकेचे पासबुक
4. आधार लिंक असलेला मोबाईल क्रमांक`,
    category: 'govt_schemes',
    author: 'District Agriculture Office',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600',
    isFeatured: false,
    date: '2026-06-05T06:00:00.000Z',
    likes: 560,
    views: 2540
  },
  {
    id: 'art-6',
    titleEn: 'Hydroponic Fodder: Green Feed in Just 7 Days',
    titleHi: 'हाइड्रोपोनिक चारा: केवल 7 दिनों में हरा चारा तैयार करें',
    titleMr: 'हायड्रोपोनिक चारा निर्मिती: फक्त ७ दिवसांत हिरवा चारा',
    summaryEn: 'Grow high-protein maize/barley green fodder inside low-cost tray units without soil.',
    summaryHi: 'बिना मिट्टी के कम लागत वाली ट्रे इकाइयों में मक्का और जौ का पौष्टिक चारा उगाएं।',
    summaryMr: 'मातीविना, ट्रे आणि पाण्याचा वापर करून जनावरांसाठी पौष्टिक मका किंवा बाजरीचा चारा तयार करण्याची कृती.',
    contentEn: `Hydroponic green fodder is an excellent alternative for dairy farmers facing water scarcity. You can produce 10 kg of green feed from just 1 kg of seed inside a 7-day cycle:

### Benefits:
- **Water Saving**: Consumes 90% less water than conventional field cultivation.
- **High Nutrition**: Increases milk yield by 10-15% due to high digestible protein content.
- **Low Space**: Multi-tier vertical stands require minimal space.`,
    contentHi: `हाइड्रोपोनिक चारा पानी की कमी का सामना कर रहे डेयरी किसानों के लिए एक उत्कृष्ट विकल्प है:

### फायदे:
- **पानी की बचत**: 90% कम पानी का उपयोग।
- **अधिक दूध उत्पादन**: पौष्टिक चारे से दूध की मात्रा 10-15% बढ़ती है।`,
    contentMr: `दुग्ध व्यवसाय करणाऱ्या शेतकऱ्यांसाठी कमी पाण्यात पौष्टिक चारा तयार करण्याचे हायड्रोपोनिक तंत्रज्ञान वरदान ठरत आहे.

### फायदे:
- **पाण्याची प्रचंड बचत**: नेहमीच्या शेतीपेक्षा ९०% कमी पाणी लागते.
- **दुधात वाढ**: चार्‍यातील प्रथिनांमुळे जनावरांचे दूध उत्पादन १० ते १५ टक्क्यांनी वाढते.`,
    category: 'modern_techniques',
    author: 'Agrotech Innovation Lab',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600',
    isFeatured: false,
    date: '2026-06-03T11:00:00.000Z',
    likes: 290,
    views: 1120
  }
];


export function FarmerEducationCenter({ language, userId }: FarmerEducationCenterProps) {
  const supabase = createClient();
  const [articles, setArticles] = useState<EducationArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);
  const [activeArticle, setActiveArticle] = useState<EducationArticle | null>(null);

  // Load articles from Supabase with localStorage / SEED_ARTICLES fallback
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const { data, error } = await supabase.from('education_articles').select('*');
        if (!error && data && data.length > 0) {
          setArticles(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('agromart_education_articles', JSON.stringify(data));
          }
          return;
        }
      } catch (err) {
        console.warn('Supabase articles fetch failed, falling back:', err);
      }

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('agromart_education_articles');
        if (stored) {
          setArticles(JSON.parse(stored));
        } else {
          localStorage.setItem('agromart_education_articles', JSON.stringify(SEED_ARTICLES));
          setArticles(SEED_ARTICLES);
        }
      }
    };

    loadArticles();

    if (typeof window !== 'undefined') {
      // Load saved articles
      const savedKey = `agromart_saved_articles_${userId}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        setSavedArticleIds(JSON.parse(saved));
      }
    }
  }, [userId]);

  // Handle saving/bookmarking an article
  const toggleSaveArticle = (articleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = savedArticleIds.includes(articleId)
      ? savedArticleIds.filter(id => id !== articleId)
      : [...savedArticleIds, articleId];
    
    setSavedArticleIds(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`agromart_saved_articles_${userId}`, JSON.stringify(updated));
    }
  };

  const handleArticleClick = async (article: EducationArticle) => {
    setActiveArticle(article);
    // Increment views locally
    const updatedArticles = articles.map(art => {
      if (art.id === article.id) {
        const nextViews = art.views + 1;
        return { ...art, views: nextViews };
      }
      return art;
    });
    setArticles(updatedArticles);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agromart_education_articles', JSON.stringify(updatedArticles));
    }

    try {
      const target = updatedArticles.find(art => art.id === article.id);
      if (target) {
        await supabase.from('education_articles').upsert([target]);
      }
    } catch (err) {
      console.warn('Supabase views upsert failed:', err);
    }
  };

  const handleLikeClick = async (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedArticles = articles.map(art => {
      if (art.id === articleId) {
        return { ...art, likes: art.likes + 1 };
      }
      return art;
    });
    setArticles(updatedArticles);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agromart_education_articles', JSON.stringify(updatedArticles));
    }
    if (activeArticle && activeArticle.id === articleId) {
      setActiveArticle({ ...activeArticle, likes: activeArticle.likes + 1 });
    }

    try {
      const target = updatedArticles.find(art => art.id === articleId);
      if (target) {
        await supabase.from('education_articles').upsert([target]);
      }
    } catch (err) {
      console.warn('Supabase likes upsert failed:', err);
    }
  };

  // Translations
  const t = {
    en: {
      title: 'Farmer Education Center',
      subtitle: 'Learn modern agriculture techniques, crop health guides, government benefits, and trading strategies.',
      searchPlaceholder: 'Search agricultural guides...',
      all: 'All Guides',
      crop_care: 'Crop Care',
      disease_prevention: 'Disease Prevention',
      fertilizer_recommendations: 'Fertilizers',
      market_tips: 'Market Tips',
      govt_schemes: 'Govt Schemes',
      modern_techniques: 'Modern Tech',
      featured: 'Featured Guide',
      readMore: 'Read Article',
      savedGuides: 'Saved Guides Only',
      author: 'Author',
      published: 'Published',
      likes: 'Likes',
      views: 'Views',
      noArticles: 'No guides found. Try matching another search query.',
      close: 'Close',
    },
    hi: {
      title: 'किसान शिक्षा केंद्र',
      subtitle: 'आधुनिक कृषि तकनीक, फसल स्वास्थ्य मार्गदर्शिका, सरकारी लाभ और व्यापारिक रणनीतियाँ सीखें।',
      searchPlaceholder: 'कृषि गाइड खोजें...',
      all: 'सभी गाइड',
      crop_care: 'फसल देखभाल',
      disease_prevention: 'रोग रोकथाम',
      fertilizer_recommendations: 'उर्वरक',
      market_tips: 'बाजार युक्तियाँ',
      govt_schemes: 'सरकारी योजनाएं',
      modern_techniques: 'आधुनिक तकनीक',
      featured: 'विशेष रुप से प्रदर्शित गाइड',
      readMore: 'लेख पढ़ें',
      savedGuides: 'केवल सहेजे गए लेख',
      author: 'लेखक',
      published: 'प्रकाशित',
      likes: 'पसंद',
      views: 'देखा गया',
      noArticles: 'कोई गाइड नहीं मिला। कृपया कुछ और खोजें।',
      close: 'बंद करें',
    },
    mr: {
      title: 'शेतकरी शिक्षण केंद्र',
      subtitle: 'आधुनिक कृषी तंत्रज्ञान, पीक संरक्षण मार्गदर्शक, सरकारी योजना आणि बाजार धोरणे शिका.',
      searchPlaceholder: 'कृषी मार्गदर्शक शोधा...',
      all: 'सर्व मार्गदर्शक',
      crop_care: 'पीक काळजी',
      disease_prevention: 'रोग प्रतिबंध',
      fertilizer_recommendations: 'खते शिफारसी',
      market_tips: 'बाजार सल्ला',
      govt_schemes: 'सरकारी योजना',
      modern_techniques: 'आधुनिक तंत्रज्ञान',
      featured: 'विशेष मार्गदर्शक',
      readMore: 'माहिती वाचा',
      savedGuides: 'फक्त जतन केलेले मार्गदर्शक',
      author: 'लेखक',
      published: 'प्रसिद्धी दिनांक',
      likes: 'लाईक्स',
      views: 'वाचक संख्या',
      noArticles: 'एकही मार्गदर्शक सापडला नाही. कृपया दुसरा शब्द शोधा.',
      close: 'बंद करा',
    }
  }[language];

  const categoriesList = [
    { id: 'all', label: t.all },
    { id: 'crop_care', label: t.crop_care },
    { id: 'disease_prevention', label: t.disease_prevention },
    { id: 'fertilizer_recommendations', label: t.fertilizer_recommendations },
    { id: 'market_tips', label: t.market_tips },
    { id: 'govt_schemes', label: t.govt_schemes },
    { id: 'modern_techniques', label: t.modern_techniques },
  ];

  // Filters
  const filtered = articles.filter(art => {
    const title = language === 'mr' ? art.titleMr : language === 'hi' ? art.titleHi : art.titleEn;
    const summary = language === 'mr' ? art.summaryMr : language === 'hi' ? art.summaryHi : art.summaryEn;
    const matchSearch = searchTerm.trim() === '' || 
      title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if category is saved only filter
    if (selectedCategory === 'saved') {
      return matchSearch && savedArticleIds.includes(art.id);
    }
    
    const matchCategory = selectedCategory === 'all' || art.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const featuredArticle = articles.find(art => art.isFeatured);

  const getLocalizedTitle = (art: EducationArticle) => {
    return language === 'mr' ? art.titleMr : language === 'hi' ? art.titleHi : art.titleEn;
  };

  const getLocalizedSummary = (art: EducationArticle) => {
    return language === 'mr' ? art.summaryMr : language === 'hi' ? art.summaryHi : art.summaryEn;
  };

  const getLocalizedContent = (art: EducationArticle) => {
    return language === 'mr' ? art.contentMr : language === 'hi' ? art.contentHi : art.contentEn;
  };

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in relative pb-16">
      
      {/* Header and Summary description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-500" />
            <span>{t.title}</span>
          </h2>
          <p className="text-xs font-semibold text-earth-550 dark:text-earth-400 mt-1">
            {t.subtitle}
          </p>
        </div>
        
        {/* Toggle Saved Articles filter */}
        <button
          onClick={() => setSelectedCategory(selectedCategory === 'saved' ? 'all' : 'saved')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border font-extrabold text-xs transition-all cursor-pointer ${
            selectedCategory === 'saved'
              ? 'bg-primary-600 border-primary-600 text-white shadow'
              : 'border-border bg-card text-foreground hover:bg-earth-100 dark:hover:bg-earth-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{t.savedGuides} ({savedArticleIds.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-400 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-sm"
        />
      </div>

      {/* Category Pills horizontally scrollable */}
      <div className="flex gap-1.5 p-1 bg-earth-100/60 dark:bg-earth-900/60 rounded-2xl w-full overflow-x-auto no-scrollbar shrink-0">
        {categoriesList.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex-1 text-center ${
              selectedCategory === cat.id
                ? 'bg-card text-primary-600 shadow-sm border border-border'
                : 'text-earth-500 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Section (if no category/search filter applied) */}
      {selectedCategory === 'all' && searchTerm.trim() === '' && featuredArticle && (
        <div 
          onClick={() => handleArticleClick(featuredArticle)}
          className="w-full bg-card border border-border rounded-3xl overflow-hidden hover-lift flex flex-col md:flex-row cursor-pointer group shadow"
        >
          <div className="h-48 md:h-auto md:w-2/5 relative shrink-0">
            <img 
              src={featuredArticle.image} 
              alt="Featured crop care" 
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <span className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-500 text-white shadow-md">
              👑 {t.featured}
            </span>
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-between flex-grow gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary-500">
                {featuredArticle.category.replace('_', ' ')}
              </span>
              <h3 className="text-lg md:text-xl font-black text-foreground group-hover:text-primary-655 transition-colors leading-tight">
                {getLocalizedTitle(featuredArticle)}
              </h3>
              <p className="text-xs text-earth-500 font-semibold leading-relaxed mt-1">
                {getLocalizedSummary(featuredArticle)}
              </p>
            </div>
            
            <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
              <div className="flex items-center gap-3 text-[10px] text-earth-500 font-bold uppercase">
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{featuredArticle.author.split(' ')[0]}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featuredArticle.readTime}</span>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); handleArticleClick(featuredArticle); }}
                className="text-xs font-black text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <span>{t.readMore}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map(art => {
            const isSaved = savedArticleIds.includes(art.id);
            return (
              <div
                key={art.id}
                onClick={() => handleArticleClick(art)}
                className="group bg-card border border-border rounded-3xl overflow-hidden hover-lift flex flex-col h-full cursor-pointer shadow-sm hover:shadow"
              >
                {/* Image */}
                <div className="relative h-44 bg-earth-100 dark:bg-earth-900 overflow-hidden shrink-0">
                  <img
                    src={art.image}
                    alt={getLocalizedTitle(art)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => toggleSaveArticle(art.id, e)}
                    className="absolute top-3 right-3 p-2 rounded-xl border backdrop-blur-md transition-colors cursor-pointer bg-black/40 border-white/10 text-white hover:bg-black/60"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <span className="absolute bottom-3 left-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white border border-white/10">
                    {art.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow gap-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-black text-foreground group-hover:text-primary-655 transition-colors leading-snug line-clamp-2">
                      {getLocalizedTitle(art)}
                    </h4>
                    <p className="text-[11px] text-earth-500 font-semibold leading-relaxed line-clamp-2 mt-1">
                      {getLocalizedSummary(art)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 pt-3.5 mt-auto text-[10px] text-earth-500 font-bold uppercase">
                    <span className="flex items-center gap-1 truncate max-w-[100px]">
                      <User className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{art.author}</span>
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{art.readTime}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 border-2 border-dashed border-border rounded-3xl text-center text-earth-500 font-bold">
          {t.noArticles}
        </div>
      )}

      {/* ARTICLE READER MODAL OVERLAY */}
      {activeArticle && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setActiveArticle(null)}
          />
          
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in bg-card border border-border no-scrollbar pb-10">
            {/* Cover Image */}
            <div className="relative h-60 sm:h-72 w-full shrink-0">
              <img 
                src={activeArticle.image} 
                alt="Guide cover" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <button 
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors border border-white/10 shadow"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute -bottom-1 left-6 right-6 pb-6 text-white flex flex-col gap-2">
                <span className="w-fit text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-primary-600 text-white shadow">
                  {activeArticle.category.replace('_', ' ')}
                </span>
                <h3 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
                  {getLocalizedTitle(activeArticle)}
                </h3>
              </div>
            </div>

            {/* Header info */}
            <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-border flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-earth-550">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-primary-500" />{t.author}: <span className="text-foreground font-black">{activeArticle.author}</span></span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary-500" />{activeArticle.readTime}</span>
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-primary-500" />{activeArticle.views} {t.views}</span>
            </div>

            {/* Markdown/Article Content */}
            <div className="px-6 sm:px-8 py-6 text-left">
              <div className="prose dark:prose-invert max-w-none text-earth-800 dark:text-earth-200 text-sm font-semibold leading-relaxed flex flex-col gap-4">
                {getLocalizedContent(activeArticle).split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('### ')) {
                    return <h4 key={index} className="text-base font-black text-foreground mt-4 mb-2">{paragraph.replace('### ', '')}</h4>;
                  }
                  if (paragraph.startsWith('- ')) {
                    return (
                      <ul key={index} className="list-disc pl-5 flex flex-col gap-1">
                        {paragraph.split('\n').map((li, idx) => (
                          <li key={idx} className="text-sm font-semibold">{li.replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (paragraph.match(/^\d+\./)) {
                    return (
                      <ol key={index} className="list-decimal pl-5 flex flex-col gap-1">
                        {paragraph.split('\n').map((li, idx) => (
                          <li key={idx} className="text-sm font-semibold">{li.replace(/^\d+\.\s*/, '')}</li>
                        ))}
                      </ol>
                    );
                  }
                  return <p key={index}>{paragraph}</p>;
                })}
              </div>
            </div>

            {/* Like & Save Interaction Bar */}
            <div className="px-6 sm:px-8 pt-4 border-t border-border flex items-center justify-between">
              <button 
                onClick={(e) => handleLikeClick(activeArticle.id, e)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-earth-50 dark:bg-earth-900/50 hover:bg-earth-100 text-foreground font-extrabold text-xs cursor-pointer transition-all active:scale-95"
              >
                <ThumbsUp className="w-4 h-4 text-primary-500" />
                <span>{activeArticle.likes} {t.likes}</span>
              </button>

              <button 
                onClick={() => toggleSaveArticle(activeArticle.id)}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border font-extrabold text-xs transition-all cursor-pointer ${
                  savedArticleIds.includes(activeArticle.id)
                    ? 'bg-primary-600 border-primary-600 text-white shadow'
                    : 'border-border bg-card text-foreground hover:bg-earth-100 dark:hover:bg-earth-900'
                }`}
              >
                {savedArticleIds.includes(activeArticle.id) ? (
                  <><BookmarkCheck className="w-4 h-4" />Saved</>
                ) : (
                  <><Bookmark className="w-4 h-4" />Save Guide</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
