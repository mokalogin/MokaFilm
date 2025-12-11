
import React, { useMemo } from 'react';
import { MovieEntry } from '../types';
import { User, Trophy, Clapperboard, Award, Calendar } from 'lucide-react';
import { Logo } from './Logo';

interface ProfileViewProps {
  entries: MovieEntry[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ entries }) => {
  
  const yearlyStats = useMemo(() => {
    const grouped: Record<number, MovieEntry[]> = {};
    
    entries.forEach(entry => {
      const year = new Date(entry.watchedDate).getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(entry);
    });

    const years = Object.keys(grouped).map(Number).sort((a, b) => b - a);

    return years.map(year => {
      const yearEntries = grouped[year];
      
      const getTop3 = (extractor: (e: MovieEntry) => string) => {
        const counts: Record<string, number> = {};
        yearEntries.forEach(e => {
            const val = extractor(e);
            if (!val) return;
            const parts = val.split(/[,\s，\/]+/).filter(Boolean);
            parts.forEach(p => {
                counts[p] = (counts[p] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => ({ name, count }));
      };

      return {
        year,
        total: yearEntries.length,
        topDirectors: getTop3(e => e.director),
        topGenres: getTop3(e => e.genre)
      };
    });
  }, [entries]);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-xl py-3 px-4 z-20 border-b border-slate-800/50 flex items-center justify-between shadow-lg shadow-black/20">
        <div className="flex items-center gap-2">
            <Logo className="w-7 h-7 text-primary" />
            <h1 className="text-lg font-bold tracking-tight text-white">我的档案</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 animate-in fade-in duration-500">
        
        {/* User Profile Card */}
        <div className="bg-gradient-to-br from-surface to-slate-900 border border-slate-700 rounded-3xl p-5 flex flex-col items-center text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent"></div>
            
            <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-3 relative z-10 shadow-2xl">
                <User size={40} className="text-slate-400" />
            </div>
            
            <h2 className="text-xl font-bold text-white relative z-10">Movie Fan</h2>
            <p className="text-slate-400 text-xs mt-1 mb-4 relative z-10">阅片无数，心中有光</p>
            
            <div className="flex items-center gap-6 mt-1 relative z-10">
                <div className="flex flex-col">
                    <span className="text-xl font-black text-primary">{entries.length}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">总观影</span>
                </div>
                <div className="w-px h-6 bg-slate-700"></div>
                <div className="flex flex-col">
                    <span className="text-xl font-black text-white">{yearlyStats.length}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">活跃年份</span>
                </div>
            </div>
        </div>

        {/* Yearly Timeline */}
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pl-1">
                <Calendar size={12} />
                年度观影报告
            </h3>

            {yearlyStats.length === 0 ? (
                <div className="text-center text-slate-500 py-8 bg-surface/30 rounded-2xl border border-dashed border-slate-700">
                    <p className="text-xs">暂无年度数据，快去记录吧！</p>
                </div>
            ) : (
                yearlyStats.map(stat => (
                    <div key={stat.year} className="bg-surface rounded-xl overflow-hidden border border-slate-800 shadow-md">
                        {/* Year Header */}
                        <div className="bg-slate-800/50 p-3 flex items-center justify-between border-b border-slate-700/50">
                            <span className="text-xl font-black text-white/90">{stat.year}</span>
                            <span className="text-[10px] font-bold bg-primary text-black px-1.5 py-0.5 rounded">
                                {stat.total} 部影片
                            </span>
                        </div>

                        <div className="p-4 grid grid-cols-1 gap-4">
                            
                            {/* Top Directors */}
                            <div>
                                <div className="flex items-center gap-1.5 mb-2 text-slate-400">
                                    <Award size={12} className="text-yellow-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">最爱导演 Top 3</span>
                                </div>
                                <div className="space-y-1.5">
                                    {stat.topDirectors.length > 0 ? (
                                        stat.topDirectors.map((d, i) => (
                                            <div key={d.name} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${
                                                        i === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400'
                                                    }`}>{i + 1}</span>
                                                    <span className="text-xs text-slate-200">{d.name}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-mono">x{d.count}</span>
                                            </div>
                                        ))
                                    ) : <span className="text-[10px] text-slate-600">数据不足</span>}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-slate-700/50"></div>

                            {/* Top Genres */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-slate-400">
                                    <Clapperboard size={14} className="text-green-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider">最爱类型 Top 3</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {stat.topGenres.length > 0 ? (
                                        stat.topGenres.map((g, i) => (
                                            <div key={g.name} className={`
                                                flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium
                                                ${i === 0 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-300'}
                                            `}>
                                                <span>{g.name}</span>
                                                <span className="opacity-60 border-l border-white/10 pl-1.5 ml-1">{g.count}</span>
                                            </div>
                                        ))
                                    ) : <span className="text-xs text-slate-600">数据不足</span>}
                                </div>
                            </div>

                        </div>
                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
};
