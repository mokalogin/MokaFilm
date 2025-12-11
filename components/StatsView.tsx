
import React, { useMemo, useState, useEffect } from 'react';
import { MovieEntry, GeminiStatus } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Share2, Video, Sparkles, Star, Trophy, Clapperboard, User, X } from 'lucide-react';
import { generateYearlyRecap } from '../services/geminiService';
import { Logo } from './Logo';

interface StatsViewProps {
  entries: MovieEntry[];
}

export const StatsView: React.FC<StatsViewProps> = ({ entries }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [aiRecap, setAiRecap] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<GeminiStatus>(GeminiStatus.IDLE);
  const [showSharePoster, setShowSharePoster] = useState(false);

  const availableYears = useMemo(() => {
    const years = new Set(entries.map(e => new Date(e.watchedDate).getFullYear()));
    return Array.from(years).sort((a: number, b: number) => b - a);
  }, [entries]);

  useEffect(() => {
      if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
          setSelectedYear(availableYears[0]);
      }
  }, [availableYears, selectedYear]);

  const stats = useMemo(() => {
    const filtered = entries.filter(e => new Date(e.watchedDate).getFullYear() === selectedYear);
    
    const months = Array(12).fill(0).map((_, i) => ({
      name: `${i + 1}月`,
      count: 0
    }));
    
    filtered.forEach(e => {
      const monthIndex = new Date(e.watchedDate).getMonth();
      months[monthIndex].count++;
    });

    const getRanking = (keyExtractor: (e: MovieEntry) => string) => {
        const counts = filtered.reduce((acc, curr) => {
            const key = keyExtractor(curr);
            if (!key) return acc;
            const parts = key.split(/[,\s，\/]+/);
            const primary = parts[0].trim();
            if (primary) acc[primary] = (acc[primary] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1]) 
            .slice(0, 5) 
            .map(([name, count]) => ({ name, count }));
    };

    const topDirectors = getRanking(e => e.director);
    const topGenres = getRanking(e => e.genre);

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    filtered.forEach(e => {
        const r = Math.round(e.rating); 
        if (r >= 1 && r <= 5) ratingCounts[r]++;
    });
    
    const ratingDist = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: ratingCounts[star],
        percent: filtered.length > 0 ? (ratingCounts[star] / filtered.length) * 100 : 0
    }));

    return {
      total: filtered.length,
      monthlyData: months,
      topDirectors,
      topGenres,
      ratingDist
    };
  }, [entries, selectedYear]);

  const handleGenerateRecap = async () => {
    setAiStatus(GeminiStatus.LOADING);
    const recap = await generateYearlyRecap(entries, selectedYear);
    setAiRecap(recap);
    setAiStatus(GeminiStatus.SUCCESS);
  };

  const SharePosterModal = () => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="relative w-full max-w-sm bg-gradient-to-br from-slate-900 to-black border border-slate-700 rounded-3xl overflow-hidden shadow-2xl transform transition-all scale-100">
            <div className="bg-primary p-6 pb-12 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                    <Logo className="w-48 h-48 text-black" />
                 </div>
                 <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-black">
                        <Logo className="w-8 h-8" />
                        <span className="font-black text-xl tracking-tighter">MF</span>
                    </div>
                    <span className="text-black/60 font-bold text-xs uppercase tracking-widest border border-black/20 px-2 py-0.5 rounded-full">
                        {selectedYear} 年度报告
                    </span>
                 </div>
                 <h2 className="text-3xl font-black text-black mt-4 leading-none">我的<br/>观影时光</h2>
            </div>

            <div className="px-6 -mt-6 relative z-10 space-y-4 pb-8">
                <div className="bg-surface border border-slate-700 p-5 rounded-2xl shadow-lg flex items-center justify-between">
                     <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">年度阅片</p>
                        <p className="text-3xl font-black text-white">{stats.total} <span className="text-sm font-medium text-slate-500">部</span></p>
                     </div>
                     <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-primary">
                        <Video size={20} />
                     </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <div className="flex items-center gap-1.5 mb-2 text-yellow-500">
                             <User size={14} />
                             <span className="text-[10px] font-bold uppercase">最爱导演</span>
                        </div>
                        <p className="text-sm font-bold text-white truncate">
                            {stats.topDirectors[0]?.name || '-'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                             {stats.topDirectors[0]?.count ? `观看 ${stats.topDirectors[0].count} 部` : '暂无数据'}
                        </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                         <div className="flex items-center gap-1.5 mb-2 text-green-500">
                             <Clapperboard size={14} />
                             <span className="text-[10px] font-bold uppercase">最爱类型</span>
                        </div>
                        <p className="text-sm font-bold text-white truncate">
                            {stats.topGenres[0]?.name || '-'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                             {stats.topGenres[0]?.count ? `观看 ${stats.topGenres[0].count} 部` : '暂无数据'}
                        </p>
                    </div>
                </div>

                {aiRecap && (
                    <div className="bg-gradient-to-r from-indigo-900/40 to-slate-800/40 p-4 rounded-2xl border border-indigo-500/20 relative">
                        <Sparkles className="absolute top-3 left-3 text-indigo-400 opacity-50" size={12} />
                        <p className="text-xs text-indigo-100/90 italic text-center leading-relaxed px-2 pt-1">
                            "{aiRecap.length > 60 ? aiRecap.substring(0, 60) + '...' : aiRecap}"
                        </p>
                    </div>
                )}
                
                <div className="flex items-center justify-center pt-2 opacity-50">
                    <span className="text-[10px] text-slate-400 tracking-widest uppercase">Movie Fan App</span>
                </div>
            </div>
            
            <button 
                onClick={() => setShowSharePoster(false)}
                className="absolute top-2 right-2 p-2 text-black/50 hover:text-black transition-colors z-20"
            >
                <X size={20} />
            </button>
        </div>
        
        <div className="mt-6 flex flex-col items-center gap-3 animate-in slide-in-from-bottom-4 duration-500 delay-100">
            <p className="text-slate-400 text-xs font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                ✨ 请截图保存并分享 ✨
            </p>
            <button 
                onClick={() => setShowSharePoster(false)}
                className="text-white text-sm underline opacity-50 hover:opacity-100"
            >
                关闭预览
            </button>
        </div>
    </div>
  );

  if (entries.length === 0) {
      return (
        <div className="flex flex-col h-screen">
             <div className="sticky top-0 bg-background/95 backdrop-blur-xl py-3 px-4 z-20 border-b border-slate-800/50 flex items-center gap-2">
                <Logo className="w-6 h-6 text-primary" />
                <h1 className="text-base font-bold">观影分析</h1>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-secondary">
                <div className="mb-4 bg-surface p-4 rounded-full"><Trophy size={28} /></div>
                <p className="text-sm">记录一些影片来解锁你的统计数据。</p>
            </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen">
       {/* Branding Header */}
       <div className="sticky top-0 bg-background/95 backdrop-blur-xl py-3 px-4 z-20 border-b border-slate-800/50 flex items-center justify-between shadow-lg shadow-black/20">
            <div className="flex items-center gap-2">
                <Logo className="w-7 h-7 text-primary" />
                <h1 className="text-lg font-bold tracking-tight">观影分析</h1>
            </div>
            <div className="relative">
                <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-surface text-[10px] font-bold text-white border border-slate-700/50 rounded-full px-3 py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none text-center cursor-pointer hover:bg-slate-800 transition-colors pr-6"
                style={{textAlignLast: 'center'}}
                >
                {availableYears.map(y => <option key={y} value={y}>{y}年</option>)}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[8px]">▼</div>
            </div>
        </div>

      <div className="p-4 pb-20 space-y-5 animate-in slide-in-from-right-4 duration-500 flex-1">
        
        {/* Total Count Card */}
        <div className="bg-surface p-5 rounded-xl border border-slate-700/50 flex items-center justify-between shadow-sm relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-28 h-28 bg-primary/10 rounded-full blur-2xl" />
             <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">年度观影总量</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{stats.total}</span>
                    <span className="text-xs font-medium text-slate-500">部影片</span>
                </div>
             </div>
             <div className="w-10 h-10 rounded-full bg-surface border border-slate-700 flex items-center justify-center text-primary shadow-lg shadow-black/20 z-10">
                 <Video size={20} />
             </div>
        </div>

        {/* 1. Monthly Chart */}
        <div className="bg-surface p-4 rounded-xl border border-slate-700/50 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                月度观影趋势
            </h3>
            <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyData} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                        <XAxis 
                            dataKey="name" 
                            tick={{fill: '#64748b', fontSize: 9, fontWeight: 500}} 
                            axisLine={false} 
                            tickLine={false} 
                            dy={10}
                            interval={0} 
                        />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '4px 8px'}}
                            itemStyle={{color: '#fbbf24', fontSize: '12px', fontWeight: 'bold'}}
                            cursor={{fill: 'rgba(251, 191, 36, 0.1)', radius: 4}}
                            labelStyle={{display: 'none'}}
                        />
                        <Bar dataKey="count" radius={[3, 3, 3, 3]} maxBarSize={30}>
                            <LabelList dataKey="count" position="top" fill="#94a3b8" fontSize={9} formatter={(val: number) => val > 0 ? val : ''} />
                            {stats.monthlyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#fbbf24' : '#334155'} fillOpacity={entry.count > 0 ? 1 : 0.3} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 2. Rating Distribution */}
        <div className="bg-surface p-4 rounded-xl border border-slate-700/50 shadow-sm">
             <h3 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                评分分布
            </h3>
            <div className="space-y-2">
                {stats.ratingDist.map((item) => (
                    <div key={item.star} className="flex items-center gap-3">
                        <div className="flex items-center w-6 gap-1 flex-shrink-0">
                            <span className="text-xs font-bold text-slate-300">{item.star}</span>
                            <Star size={10} className="fill-slate-500 text-slate-500" />
                        </div>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500"
                                style={{ width: `${item.percent}%` }}
                            />
                        </div>
                        <div className="w-6 text-right text-[10px] text-slate-500 font-medium">
                            {item.count}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* 3. Leaderboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Top Directors */}
            <div className="bg-surface p-4 rounded-xl border border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <User size={14} className="text-blue-400" />
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">导演排行榜</h3>
                </div>
                {stats.topDirectors.length > 0 ? (
                    <div className="space-y-2">
                        {stats.topDirectors.map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between group">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className={`
                                        w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0
                                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                                          index === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' : 
                                          index === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' : 
                                          'bg-slate-800 text-slate-500'}
                                    `}>
                                        {index + 1}
                                    </div>
                                    <span className={`text-xs font-medium truncate ${index === 0 ? 'text-white' : 'text-slate-300'}`}>
                                        {item.name}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] text-slate-600 italic">暂无数据</p>
                )}
            </div>

            {/* Top Genres */}
             <div className="bg-surface p-4 rounded-xl border border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Clapperboard size={14} className="text-green-400" />
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">类型排行榜</h3>
                </div>
                {stats.topGenres.length > 0 ? (
                    <div className="space-y-2">
                         {stats.topGenres.map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className={`
                                        w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0
                                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                                          index === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' : 
                                          index === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' : 
                                          'bg-slate-800 text-slate-500'}
                                    `}>
                                        {index + 1}
                                    </div>
                                    <span className={`text-xs font-medium truncate ${index === 0 ? 'text-white' : 'text-slate-300'}`}>
                                        {item.name}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] text-slate-600 italic">暂无数据</p>
                )}
            </div>
        </div>

        {/* AI Recap Section */}
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/20 p-5 rounded-xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-700" />
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-indigo-400" size={16} />
                    <h3 className="text-indigo-200 font-bold tracking-tight text-sm">AI 年度总结</h3>
                </div>
                
                {aiStatus === GeminiStatus.SUCCESS && aiRecap ? (
                    <div className="text-indigo-100/90 text-xs leading-relaxed italic mb-4 font-medium border-l-2 border-indigo-500/50 pl-3 py-1">
                        "{aiRecap}"
                    </div>
                ) : (
                    <div className="text-indigo-300/60 text-xs mb-4 leading-relaxed">
                        {aiStatus === GeminiStatus.LOADING ? '正在分析你的观影习惯...' : '使用 Gemini AI 生成你的年度个性化总结。'}
                    </div>
                )}

                {aiStatus !== GeminiStatus.SUCCESS && (
                    <button 
                    onClick={handleGenerateRecap}
                    disabled={aiStatus === GeminiStatus.LOADING}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all w-full shadow-lg shadow-indigo-900/50 hover:shadow-indigo-900/80 active:scale-[0.98]"
                >
                    {aiStatus === GeminiStatus.LOADING ? '思考中...' : '生成总结'}
                </button>
                )}
            </div>
        </div>

        {/* Share Button */}
        <button 
            onClick={() => setShowSharePoster(true)}
            className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-lg active:scale-[0.98] text-sm"
        >
            <Share2 size={16} />
            分享海报
        </button>

      </div>

      {/* Render Modal if open */}
      {showSharePoster && <SharePosterModal />}
    </div>
  );
};
