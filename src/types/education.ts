export type EducationCategory = 
  | 'crop_care' 
  | 'disease_prevention' 
  | 'fertilizer_recommendations' 
  | 'market_tips' 
  | 'govt_schemes' 
  | 'modern_techniques';

export interface EducationArticle {
  id: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  summaryEn: string;
  summaryHi: string;
  summaryMr: string;
  contentEn: string;
  contentHi: string;
  contentMr: string;
  category: EducationCategory;
  author: string;
  readTime: string; // e.g. "5 min read"
  image: string;
  isFeatured: boolean;
  date: string; // ISO date string
  likes: number;
  views: number;
}
