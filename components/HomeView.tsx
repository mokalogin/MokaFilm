
import React, { useEffect, useState } from 'react';
import { Recommendation, GeminiStatus, MovieEntry, FeaturedRecommendation } from '../types';
import { fetchTrendingContent, fetchPersonalizedRecommendation, HomeContentResponse } from '../services/geminiService';
import { Logo } from './Logo';
import { Plus, RefreshCw, Flame, CalendarClock, Sparkles, Star } from 'lucide-react';

interface HomeViewProps {
  onQuickAdd: (title: string) => void;
  entries: MovieEntry[];
}

export const HomeView: React.FC<HomeViewProps> = ({ onQuickAdd, entries }) => {
  const [data, setData] = useState<HomeContentResponse>({ latest: [], upcoming: [] });
  const [featured, setFeatured] = useState<FeaturedRecommendation | null>(null);
  const [status, setStatus] = useState<GeminiStatus>(GeminiStatus.IDLE);
  const [featuredStatus, setFeaturedStatus] = useState<GeminiStatus>(GeminiStatus.IDLE);

  const loadData = async () => {
    // 1. Load Trending
    setStatus(GeminiStatus.LOADING);
    const result = await fetchTrendingContent();
    setData(result);
    setStatus(GeminiStatus.SUCCESS);

    // 2. Load Personalized Recommendation
    setFeaturedStatus(GeminiStatus.LOADING);
    const rec = await fetchPersonalizedRecommendation(entries);
    setFeatured(rec);
    setFeaturedStatus(GeminiStatus.SUCCESS);
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Components ---

  const HeroSection = () => {
      if (featuredStatus === GeminiStatus.LOADING) {
          return (
              <div className="w-full h-[460px] bg-slate-800 animate-pulse flex items-center justify-center relative">
                  <Logo className="w-12 h-12 text-slate-700 animate-bounce" />
              </div>
          );
      }

      if (!featured) return (
          <div className="w-full h-[280px] bg-slate-900 flex items-center justify-center">
              {/* Empty state */}
          </div>
      );

      return (
        <div className="relative w-full h-[480px] bg-slate-900 group overflow-hidden">
            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url(${featured.posterUrl})` }}
            >
                {/* Darken overlay */}
                <div className="absolute inset-0 bg-black/40" /> 
            </div>

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-4 pb-8 z-10 flex flex-col justify-end h-full">
                <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-2 animate-in slide-in-from-bottom-2 fade-in duration-700">
                        <span className="bg-primary text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                            <Sparkles size={9} /> 今日推荐
                        </span>
                        <span className="text-slate-200 text-[10px] font-medium border border-white/20 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md">
                            {featured.genre} · {featured.year}
                        </span>
                    </div>
                    
                    <h1 className="text-3xl font-black text-white leading-none mb-1.5 drop-shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
                        {featured.title}
                    </h1>
                    
                    <p className="text-xs text-slate-200 font-medium mb-3 drop-shadow-md opacity-90 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200">
                        导演: {featured.director}
                    </p>

                    <div className="bg-surface/60 backdrop-blur-md border border-white/10 p-3 rounded-xl mb-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 shadow-lg">
                        <p className="text-xs text-white/95 italic leading-relaxed font-medium">
                            “{featured.reason}”
                        </p>
                    </div>

                    <button 
                        onClick={() => onQuickAdd(featured.title)}
                        className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-[0.98] transition-all shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-700 delay-400 text-sm"
                    >
                        <Plus size={16} />
                        加入待看
                    </button>
                </div>
            </div>
        </div>
      );
  };

  const HorizontalCard = ({ item, rank, isLatest }: { item: Recommendation, rank: number, isLatest: boolean }) => (
    <div className="flex-shrink-0 w-[150px] bg-surface/40 backdrop-blur-sm border border-white/5 rounded-xl p-3 flex flex-col justify-between relative group hover:bg-surface hover:border-white/10 transition-all duration-300 snap-start">
        
        {/* Top Row: Rank & Type */}
        <div className="flex justify-between items-start mb-2">
             <div className={`
                w-6 h-6 flex items-center justify-center rounded-md font-black text-xs shadow-lg
                ${rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black' : 
                  rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-black' : 
                  rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black' : 
                  'bg-slate-800 text-slate-500 border border-slate-700'}
            `}>
                {rank}
            </div>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider bg-black/20 px-1 py-0.5 rounded border border-white/5">
                {item.type === 'movie' ? 'FILM' : 'TV'}
            </span>
        </div>

        {/* Title & Info */}
        <div className="mb-2">
             <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 mb-0.5 group-hover:text-primary transition-colors h-9">
                {item.title}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <span>{item.year}</span>
            </div>
        </div>

        {/* Reason */}
        <div className="mb-3 h-8">
            <p className="text-[10px] text-slate-400 leading-snug line-clamp-2 opacity-80">
                "{item.reason}"
            </p>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-2">
            {/* Rating */}
             <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${isLatest ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-400'}`}>
                <Star size={8} className="fill-current" />
                <span className="text-[10px] font-black">
                    {item.doubanRating !== 'N/A' ? item.doubanRating : item.imdbRating}
                </span>
             </div>

             <button 
                onClick={() => onQuickAdd(item.title)}
                className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 hover:bg-primary hover:text-black transition-all flex items-center justify-center shadow-md active:scale-90"
             >
                 <Plus size={14} />
             </button>
        </div>
    </div>
  );

  const LoadingCards = () => (
      <div className="flex gap-3 px-4 overflow-hidden">
          {[1,2,3].map(i => (
              <div key={i} className="flex-shrink-0 w-[150px] h-[180px] bg-surface/30 animate-pulse rounded-xl border border-slate-800/50"></div>
          ))}
      </div>
  );

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Floating Header */}
      <div className="absolute top-0 left-0 w-full py-3 px-4 z-30 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/60 to-transparent">
        <div className="flex items-center gap-2">
            <Logo className="w-7 h-7 text-primary drop-shadow-md shadow-black" />
            <div className="flex flex-col drop-shadow-md">
                <span className="font-black text-lg tracking-tight leading-none text-white shadow-black">MF</span>
                <span className="text-[9px] font-medium text-slate-300 uppercase tracking-[0.2em] leading-none shadow-black">Discover</span>
            </div>
        </div>
        <button 
          onClick={loadData} 
          disabled={status === GeminiStatus.LOADING || featuredStatus === GeminiStatus.LOADING}
          className="p-1.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-slate-700 text-white transition-colors border border-white/10"
        >
          <RefreshCw size={16} className={(status === GeminiStatus.LOADING || featuredStatus === GeminiStatus.LOADING) ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 1. Personalized Hero Recommendation */}
      <HeroSection />

      {/* Lists Container */}
      <div className="flex flex-col space-y-6 pt-6 relative z-20 bg-background -mt-4 rounded-t-3xl border-t border-slate-800/50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        
        {/* Section 2: Latest Released */}
        <div>
            <div className="px-4 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Flame size={16} className="text-orange-500" />
                    <h2 className="text-sm font-bold text-white tracking-tight">最新热映 Top 10</h2>
                </div>
                <span className="text-[9px] font-medium text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-700">高分榜</span>
            </div>
            
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar snap-x snap-mandatory">
                {status === GeminiStatus.LOADING ? <LoadingCards /> : (
                    data.latest.length > 0 ? (
                        data.latest.map((item, idx) => (
                            <HorizontalCard key={`latest-${idx}`} item={item} rank={idx + 1} isLatest={true} />
                        ))
                    ) : <p className="text-slate-500 text-xs px-4">暂无数据</p>
                )}
            </div>
        </div>

        {/* Section 3: Upcoming */}
        <div>
             <div className="px-4 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <CalendarClock size={16} className="text-blue-400" />
                    <h2 className="text-sm font-bold text-white tracking-tight">即将上映 Top 10</h2>
                </div>
                <span className="text-[9px] font-medium text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-700">期待榜</span>
            </div>

            <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar snap-x snap-mandatory">
                 {status === GeminiStatus.LOADING ? <LoadingCards /> : (
                    data.upcoming.length > 0 ? (
                        data.upcoming.map((item, idx) => (
                            <HorizontalCard key={`upcoming-${idx}`} item={item} rank={idx + 1} isLatest={false} />
                        ))
                    ) : <p className="text-slate-500 text-xs px-4">暂无数据</p>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};
