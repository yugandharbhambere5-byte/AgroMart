'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit3, Trash2, X, Save, Image, Check, FileText } from 'lucide-react';
import { EducationArticle, EducationCategory } from '@/types/education';
import { SEED_ARTICLES } from './FarmerEducationCenter';

export function AdminEducationManager() {
  const [articles, setArticles] = useState<EducationArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<EducationArticle | null>(null);

  // Form Fields State
  const [titleEn, setTitleEn] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [titleMr, setTitleMr] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [summaryHi, setSummaryHi] = useState('');
  const [summaryMr, setSummaryMr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentHi, setContentHi] = useState('');
  const [contentMr, setContentMr] = useState('');
  const [category, setCategory] = useState<EducationCategory>('crop_care');
  const [author, setAuthor] = useState('');
  const [readTime, setReadTime] = useState('4 min read');
  const [image, setImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Simulated image upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Load articles
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agromart_education_articles');
      if (stored) {
        setArticles(JSON.parse(stored));
      } else {
        localStorage.setItem('agromart_education_articles', JSON.stringify(SEED_ARTICLES));
        setArticles(SEED_ARTICLES);
      }
    }
  }, []);

  // Save changes to localStorage
  const saveArticlesList = (list: EducationArticle[]) => {
    setArticles(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agromart_education_articles', JSON.stringify(list));
    }
  };

  // Open Form for Adding
  const handleOpenAdd = () => {
    setEditingArticle(null);
    setTitleEn(''); setTitleHi(''); setTitleMr('');
    setSummaryEn(''); setSummaryHi(''); setSummaryMr('');
    setContentEn(''); setContentHi(''); setContentMr('');
    setCategory('crop_care');
    setAuthor('AgroMart Admin');
    setReadTime('4 min read');
    setImage('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600');
    setIsFeatured(false);
    setUploadProgress(0);
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (article: EducationArticle) => {
    setEditingArticle(article);
    setTitleEn(article.titleEn);
    setTitleHi(article.titleHi);
    setTitleMr(article.titleMr);
    setSummaryEn(article.summaryEn);
    setSummaryHi(article.summaryHi);
    setSummaryMr(article.summaryMr);
    setContentEn(article.contentEn);
    setContentHi(article.contentHi);
    setContentMr(article.contentMr);
    setCategory(article.category);
    setAuthor(article.author);
    setReadTime(article.readTime);
    setImage(article.image);
    setIsFeatured(article.isFeatured);
    setUploadProgress(0);
    setIsFormOpen(true);
  };

  // Handle Simulated Image Upload
  const handleImageUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setUploadProgress(10);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          // Set a relevant unsplash image URL based on selected crop file name or default
          const query = file.name.toLowerCase().includes('disease') ? 'plant-disease' : 
                        file.name.toLowerCase().includes('fertilizer') ? 'fertilizer' : 'farming';
          setImage(`https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&q=80&sig=${Math.floor(Math.random() * 1000)}`);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  // Form Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !summaryEn || !contentEn) {
      alert('English Title, Summary, and Content fields are required.');
      return;
    }

    // Default translations if missing
    const finalTitleHi = titleHi || titleEn;
    const finalTitleMr = titleMr || titleEn;
    const finalSummaryHi = summaryHi || summaryEn;
    const finalSummaryMr = summaryMr || summaryEn;
    const finalContentHi = contentHi || contentEn;
    const finalContentMr = contentMr || contentEn;

    if (editingArticle) {
      // Edit
      const updated = articles.map(art => {
        if (art.id === editingArticle.id) {
          return {
            ...art,
            titleEn,
            titleHi: finalTitleHi,
            titleMr: finalTitleMr,
            summaryEn,
            summaryHi: finalSummaryHi,
            summaryMr: finalSummaryMr,
            contentEn,
            contentHi: finalContentHi,
            contentMr: finalContentMr,
            category,
            author,
            readTime,
            image,
            isFeatured,
          };
        }
        return art;
      });
      // If setting this to featured, toggle off all other articles featured flag
      if (isFeatured) {
        updated.forEach(art => {
          if (art.id !== editingArticle.id) art.isFeatured = false;
        });
      }
      saveArticlesList(updated);
    } else {
      // Add
      const newArt: EducationArticle = {
        id: `art-${Date.now()}`,
        titleEn,
        titleHi: finalTitleHi,
        titleMr: finalTitleMr,
        summaryEn,
        summaryHi: finalSummaryHi,
        summaryMr: finalSummaryMr,
        contentEn,
        contentHi: finalContentHi,
        contentMr: finalContentMr,
        category,
        author,
        readTime,
        image,
        isFeatured,
        date: new Date().toISOString(),
        likes: 0,
        views: 0,
      };
      
      let list = [newArt, ...articles];
      if (isFeatured) {
        list.forEach(art => {
          if (art.id !== newArt.id) art.isFeatured = false;
        });
      }
      saveArticlesList(list);
    }
    setIsFormOpen(false);
  };

  // Delete article
  const handleDeleteArticle = (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article? This cannot be undone.')) return;
    const filtered = articles.filter(art => art.id !== articleId);
    saveArticlesList(filtered);
  };

  const filtered = articles.filter(art => 
    art.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    art.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in relative pb-16">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h3 className="text-xl font-black text-foreground flex items-center gap-2">
            <BookOpen className="w-5.5 h-5.5 text-red-500" />
            <span>Educational Articles Manager</span>
          </h3>
          <p className="text-xs font-bold text-earth-500 mt-1">Publish guides, crop care manuals, and schemes updates for farmers.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Article</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-earth-400 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search articles by English title or author..."
          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold text-sm"
        />
      </div>

      {/* Articles List */}
      <div className="flex flex-col gap-4">
        {filtered.length > 0 ? (
          filtered.map(art => (
            <div 
              key={art.id} 
              className="p-5 rounded-2xl border border-border bg-card hover:border-red-500/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <img 
                  src={art.image} 
                  alt="Article cover" 
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm text-foreground truncate">{art.titleEn}</h4>
                    {art.isFeatured && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/30 text-amber-700 text-[8px] font-black uppercase border border-amber-500/10">Featured</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-earth-500 font-bold uppercase mt-1">
                    <span className="text-red-500 font-black">{art.category.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>By {art.author}</span>
                    <span>•</span>
                    <span>{art.readTime}</span>
                    <span>•</span>
                    <span>👍 {art.likes} likes</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 shrink-0 border-t border-border sm:border-0 pt-3 sm:pt-0 w-full sm:w-auto">
                <button 
                  onClick={() => handleOpenEdit(art)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-foreground hover:bg-earth-50 dark:hover:bg-earth-900 font-extrabold text-xs transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => handleDeleteArticle(art.id)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/5 font-extrabold text-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 border-2 border-dashed border-border rounded-3xl text-center text-earth-500 font-bold">
            No articles found matching search query.
          </div>
        )}
      </div>

      {/* FORM MODAL OVERLAY (ADD/EDIT) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsFormOpen(false)}
          />
          
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in bg-card border border-border no-scrollbar">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card/85 backdrop-blur-md z-10">
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <BookOpen className="w-5.5 h-5.5 text-red-500" />
                  <span>{editingArticle ? 'Edit Article Details' : 'Publish New Article'}</span>
                </h3>
                <p className="text-xs font-bold text-earth-500 mt-1">Fill in the fields below. English is required, others will fallback if empty.</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl bg-earth-100 dark:bg-earth-900 text-earth-500 hover:text-foreground cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 flex flex-col gap-6 text-left">
              {/* Category, Author, ReadTime & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-foreground">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value as EducationCategory)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                  >
                    <option value="crop_care">Crop Care</option>
                    <option value="disease_prevention">Disease Prevention</option>
                    <option value="fertilizer_recommendations">Fertilizer Recommendations</option>
                    <option value="market_tips">Market Tips</option>
                    <option value="govt_schemes">Government Schemes</option>
                    <option value="modern_techniques">Modern Techniques</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-foreground">Author</label>
                  <input 
                    type="text" 
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. AgroMart Research Desk"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-foreground">Read Time</label>
                  <input 
                    type="text" 
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="e.g. 5 min read"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              {/* Title Section */}
              <div className="flex flex-col gap-4 border-t border-border/40 pt-4">
                <span className="text-xs font-black uppercase text-red-500 tracking-wider">Localized Titles</span>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Title (English) *</label>
                  <input 
                    type="text" 
                    value={titleEn} 
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. Modern Crop Sowing Strategies"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Title (मराठी)</label>
                    <input 
                      type="text" 
                      value={titleMr} 
                      onChange={(e) => setTitleMr(e.target.value)}
                      placeholder="उदा. आधुनिक पीक पेरणी पद्धती"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Title (हिन्दी)</label>
                    <input 
                      type="text" 
                      value={titleHi} 
                      onChange={(e) => setTitleHi(e.target.value)}
                      placeholder="जैसे: आधुनिक फसल बुवाई तकनीक"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="flex flex-col gap-4 border-t border-border/40 pt-4">
                <span className="text-xs font-black uppercase text-red-500 tracking-wider">Short Summaries</span>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Summary (English) *</label>
                  <textarea 
                    rows={2}
                    value={summaryEn} 
                    onChange={(e) => setSummaryEn(e.target.value)}
                    placeholder="A brief summary showing on article previews..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Summary (मराठी)</label>
                    <textarea 
                      rows={2}
                      value={summaryMr} 
                      onChange={(e) => setSummaryMr(e.target.value)}
                      placeholder="काही शब्दांत सारांश द्या..."
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Summary (हिन्दी)</label>
                    <textarea 
                      rows={2}
                      value={summaryHi} 
                      onChange={(e) => setSummaryHi(e.target.value)}
                      placeholder="कुछ शब्दों में सारांश लिखें..."
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Full Content Section */}
              <div className="flex flex-col gap-4 border-t border-border/40 pt-4">
                <span className="text-xs font-black uppercase text-red-500 tracking-wider">Full Content (separate paragraphs with blank lines)</span>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Content (English) *</label>
                  <textarea 
                    rows={5}
                    value={contentEn} 
                    onChange={(e) => setContentEn(e.target.value)}
                    placeholder="Write the full educational guide content in English..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Content (मराठी)</label>
                  <textarea 
                    rows={3}
                    value={contentMr} 
                    onChange={(e) => setContentMr(e.target.value)}
                    placeholder="पूर्ण माहिती मराठीत लिहा..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Content (हिन्दी)</label>
                  <textarea 
                    rows={3}
                    value={contentHi} 
                    onChange={(e) => setContentHi(e.target.value)}
                    placeholder="पूरी जानकारी हिन्दी में लिखें..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Image URL & Upload Simulation */}
              <div className="flex flex-col gap-4 border-t border-border/40 pt-4">
                <span className="text-xs font-black uppercase text-red-500 tracking-wider">Media Cover Image</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Cover Image URL</label>
                    <input 
                      type="text" 
                      value={image} 
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Upload Local Image</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUploadSimulate}
                        id="admin-image-upload"
                        className="hidden"
                      />
                      <label 
                        htmlFor="admin-image-upload"
                        className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-earth-50"
                      >
                        <Image className="w-4 h-4 text-earth-450" />
                        <span>Select File</span>
                      </label>
                      {isUploading && (
                        <span className="text-[10px] font-black text-amber-500 animate-pulse">Uploading {uploadProgress}%</span>
                      )}
                      {!isUploading && image && (
                        <span className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5">✓ Ready</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2 border-t border-border/40 pt-4">
                <input 
                  type="checkbox" 
                  id="art-featured-toggle"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-border focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="art-featured-toggle" className="text-xs font-black text-foreground cursor-pointer">
                  Feature this article (will highlight on top of the educational dashboard)
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 mt-4 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3.5 rounded-xl border border-border text-foreground hover:bg-earth-50 font-extrabold text-sm transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md transition-colors cursor-pointer text-center"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
