
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MovieEntry } from '../types';
import { Trash2, Calendar, Star, Clock, Loader2, Search, X } from 'lucide-react';
import { Logo } from './Logo';

interface MovieListProps {
  entries: MovieEntry[];
  onDelete: (id: string) => void;
}

const BATCH_SIZE = 20;

export const MovieList: React.FC<MovieListProps> = ({ entries, onDelete }) => {
  const [displayedCount, setDisplayedCount] = useState(BATCH_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const observerTarget = useRef<HTMLDivElement>(null);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const query = searchQuery.toLowerCase();
    return entries.filter(entry => 
      entry.title.toLowerCase().includes(query) ||
      entry.director.toLowerCase().includes(query) ||
      entry.genre.toLowerCase().includes(query)
    );
  }, [entries, searchQuery]);

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime());
  }, [filteredEntries]);

  useEffect(() => {
    setDisplayedCount(BATCH_SIZE);
  }, [searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedCount((prev) => {
             if (prev >= sortedEntries.length) return prev;
             return prev + BATCH_SIZE;
          });
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [sortedEntries.length]);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
      <div className="w-16 h-16 bg-surface/50 rounded-full flex items-center justify-center mb-4 text-primary animate-pulse">
        <Logo className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">欢迎使用 MF</h3>
      <p className="text-xs text-secondary max-w-xs mx-auto leading-relaxed">
        你的个人影视追踪助手。<br/>点击下方的 <span className="text-primary font-bold">记录</span> 按钮开始建立你的片单。
      </p>
    </div>
  );

  const recentEntries = sortedEntries.slice(0, 5);
  const visibleEntries = sortedEntries.slice(0, displayedCount);

  const grouped = visibleEntries.reduce((acc, entry) => {
    const date = new Date(entry.watchedDate);
    const key = `${date.getFullYear()}年`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {} as Record<string, MovieEntry[]>);

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const yearA = parseInt(a);
      const yearB = parseInt(b);
      return yearB - yearA;
  });

  return (
    <div className="flex flex-col min-h-screen">
       {/* Branding Header */}
       <div className="sticky top-0 bg-background/95 backdrop-blur-xl py-3 px-4 z-20 border-b border-slate-800/50 flex items-center justify-between shadow-lg shadow-black/20">
          <div className="flex items-center gap-2">
             <Logo className="w-7 h-7 text-primary" />
             <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight leading-none text-white">MF</span>
                <span className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.2em] leading-none">List</span>
             </div>
          </div>
          <div className="text-[10px] font-medium text-slate-400 bg-surface border border-slate-700/50 px-2.5 py-1 rounded-full">
             {filteredEntries.length} 部影片
          </div>
       </div>

      <div className="p-4 pb-20 space-y-5 animate-in fade-in duration-500 flex-1">
        
        {/* Search Bar */}
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索片名、导演或类型..."
                className="w-full bg-surface border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-9 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
            />
            {searchQuery && (
                <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                    <X size={12} />
                </button>
            )}
        </div>

        {entries.length === 0 ? <EmptyState /> : (
          <>
            {/* Search Empty State */}
            {filteredEntries.length === 0 && searchQuery && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                    <Search size={28} className="mb-2 opacity-20" />
                    <p className="text-xs">未找到与 "{searchQuery}" 相关的记录</p>
                </div>
            )}

            {/* Recent Watch Module */}
            {!searchQuery && filteredEntries.length > 0 && (
                <div className="space-y-2">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={12} className="text-primary" />
                    最近观影
                </h2>
                <div className="flex overflow-x-auto space-x-3 pb-2 no-scrollbar snap-x snap-mandatory">
                    {recentEntries.map((entry) => (
                    <div 
                        key={entry.id} 
                        className="snap-center min-w-[85%] sm:min-w-[280px] bg-surface border border-slate-700/50 rounded-xl relative overflow-hidden shadow-lg shadow-black/50 flex flex-col justify-end h-40 bg-cover bg-center group"
                        style={{
                            backgroundImage: entry.posterUrl ? `url(${entry.posterUrl})` : undefined
                        }}
                    >
                        {!entry.posterUrl && (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center opacity-50">
                                <Logo className="w-16 h-16 text-slate-700" />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90 transition-opacity" />
                        
                        <div className="relative z-10 p-4">
                            <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-bold text-black bg-primary px-1.5 py-0.5 rounded shadow-sm">
                                {entry.watchedDate}
                            </span>
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} className={i < Math.round(entry.rating) ? "fill-primary text-primary drop-shadow-sm" : "text-white/30"} />
                                ))}
                            </div>
                            </div>
                            <h3 className="text-lg font-bold text-white truncate pr-2 leading-tight drop-shadow-md">《{entry.title}》</h3>
                            <p className="text-xs text-slate-300 mt-0.5 drop-shadow-md">{entry.director}</p>
                            
                            {entry.genre && (
                            <div className="mt-2 flex">
                                    <span className="text-[9px] text-white/80 bg-white/10 backdrop-blur-sm border border-white/20 px-1.5 py-0.5 rounded-full">
                                        {entry.genre.split(/[,，]/)[0]}
                                    </span>
                            </div>
                            )}
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            )}

            {/* Yearly Archive List */}
            {filteredEntries.length > 0 && (
                <div className="space-y-5">
                    {sortedKeys.map(groupKey => (
                    <div key={groupKey}>
                        <div className="flex items-center gap-1.5 mb-2 pl-1">
                            <Calendar size={12} className="text-slate-500" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{groupKey} 归档</h3>
                        </div>
                        
                        <div className="bg-surface/50 rounded-xl border border-slate-700/30 overflow-hidden backdrop-blur-sm">
                        {grouped[groupKey].map((entry, index) => (
                            <div 
                            key={entry.id} 
                            className={`
                                relative group flex items-center justify-between p-3.5 hover:bg-slate-700/20 transition-colors
                                ${index !== grouped[groupKey].length - 1 ? 'border-b border-slate-700/30' : ''}
                            `}
                            >
                            <div className="text-sm text-slate-300 leading-relaxed pr-8 font-medium truncate w-full flex items-center">
                                <span className="text-slate-500 tabular-nums font-mono text-[10px] mr-2 opacity-70 w-16 flex-shrink-0">
                                    {entry.watchedDate.replace(/-/g, '.')}
                                </span>
                                <span className="text-white hover:text-primary transition-colors font-bold truncate">
                                    《{entry.title}》
                                </span>
                                <span className="text-slate-600 mx-1.5 text-xs">-</span>
                                <span className="text-slate-400 text-xs truncate">
                                    {entry.director}
                                </span>
                            </div>

                            <button 
                                onClick={() => onDelete(entry.id)}
                                className="absolute right-2 p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="删除"
                            >
                                <Trash2 size={14} />
                            </button>
                            </div>
                        ))}
                        </div>
                    </div>
                    ))}

                    {/* Loading Sentinel */}
                    {visibleEntries.length < sortedEntries.length && (
                        <div ref={observerTarget} className="flex justify-center py-4">
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        </div>
                    )}
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
