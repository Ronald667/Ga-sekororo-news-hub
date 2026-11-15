import React, { useState } from "react";
import { Search, Heart, MessageSquare, Clock, ArrowRight, Sparkles, Filter } from "lucide-react";
import { StoryModal } from "./StoryModal";
import { getRelativeTimeString } from "../utils/time";

interface Article {
  id: string;
  title: string;
  category: "News" | "Sport" | "Drama" | "Community" | "Culture";
  body: string;
  image_url: string;
  author: string;
  created_at: string;
  likes: number;
  comments_count: number;
}

interface NewsPortalProps {
  articles: Article[];
  onLike: (id: string) => void;
  onNavigateAiStudio: () => void;
}

export const NewsPortal: React.FC<NewsPortalProps> = ({ articles, onLike, onNavigateAiStudio }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const categories = ["All", "News", "Community", "Sport", "Drama", "Culture"];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = articles[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-8 md:p-12 shadow-2xl border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Official Ga-Sekororo Voice & Media Portal
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Stories, Culture & Progress from the Valley
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Discover community news, traditional council updates, sports championships, and cultural highlights from Phokaneng, Mametja, and all across Ga-Sekororo.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={onNavigateAiStudio}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs md:text-sm transition-colors shadow-lg shadow-emerald-900/30 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Try AI Media Generator
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === category
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search stories..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>
      </div>

      {/* Featured Article Hero (if All or category matches) */}
      {featuredArticle && selectedCategory === "All" && !searchQuery && (
        <div 
          onClick={() => setSelectedArticle(featuredArticle)}
          className="group relative grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="lg:col-span-7 relative h-72 lg:h-auto min-h-[320px] overflow-hidden">
            <img
              src={featuredArticle.image_url}
              alt={featuredArticle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider shadow">
                Featured Story
              </span>
            </div>
          </div>
          <div className="lg:col-span-5 p-6 lg:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{featuredArticle.category}</span>
                <span aria-hidden="true">·</span>
                <span>{featuredArticle.author}</span>
                <span aria-hidden="true">·</span>
                <span>{getRelativeTimeString(featuredArticle.created_at)}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                {featuredArticle.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                {featuredArticle.body}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500" />
                  {featuredArticle.likes}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  {featuredArticle.comments_count}
                </span>
              </div>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read Story <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {selectedCategory === "All" ? "Latest Community Stories" : `${selectedCategory} Stories`}
          </h3>
          <span className="text-xs text-slate-500 font-medium">{filteredArticles.length} stories available</span>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            <p className="text-slate-500 text-sm font-medium">No stories found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map(article => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white text-xs font-semibold">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-2.5">
                    {/* Clean unboxed metadata with typographic separators */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{article.author}</span>
                      <span aria-hidden="true">·</span>
                      <span>{getRelativeTimeString(article.created_at)}</span>
                    </div>

                    <h4 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {article.title}
                    </h4>

                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {article.body}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-red-500" />
                        {article.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        {article.comments_count}
                      </span>
                    </div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Story Detail Modal */}
      <StoryModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onLike={onLike}
      />
    </div>
  );
};
