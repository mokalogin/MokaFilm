
import React, { useState, useEffect } from 'react';
import { Sparkles, Save, X, Loader2 } from 'lucide-react';
import { MovieEntry, GeminiStatus } from '../types';
import { fetchMovieDetails } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { Logo } from './Logo';

interface MovieFormProps {
  onSave: (entry: MovieEntry) => void;
  onCancel: () => void;
  initialTitle?: string;
}

export const MovieForm: React.FC<MovieFormProps> = ({ onSave, onCancel, initialTitle = '' }) => {
  const [title, setTitle] = useState(initialTitle);
  const [director, setDirector] = useState('');
  const [year, setYear] = useState<string>(''); 
  const [rating, setRating] = useState<number>(0);
  const [watchedDate, setWatchedDate] = useState(new Date().toISOString().split('T')[0]);
  const [genre, setGenre] = useState('');
  const [notes, setNotes] = useState('');
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<GeminiStatus>(GeminiStatus.IDLE);

  useEffect(() => {
    if (initialTitle) {
       setTitle(initialTitle);
    }
  }, [initialTitle]);

  const handleAutoFill = async (trigger: 'manual' | 'auto' = 'manual', overrideTitle?: string) => {
    const searchTitle = overrideTitle || title;
    if (!searchTitle) return;

    if (trigger === 'auto' && (genre || year)) return;

    setAiStatus(GeminiStatus.LOADING);
    
    const details = await fetchMovieDetails(searchTitle, director);
    
    if (details) {
      if(!director) setDirector(details.director);
      setYear(details.year.toString());
      setGenre(details.genre);
      if (!notes) setNotes(details.summary);
      if (details.posterUrl) setPosterUrl(details.posterUrl);
      setAiStatus(GeminiStatus.SUCCESS);
    } else {
      if (trigger === 'manual') {
        setAiStatus(GeminiStatus.ERROR);
      } else {
        setAiStatus(GeminiStatus.IDLE); 
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newEntry: MovieEntry = {
      id: uuidv4(),
      title,
      director,
      year: parseInt(year) || new Date().getFullYear(),
      watchedDate,
      rating,
      genre,
      notes,
      posterUrl
    };
    onSave(newEntry);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative z-50">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-xl py-3 px-4 border-b border-slate-800/50 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6 text-primary" />
            <h2 className="text-base font-bold text-white">记录影片</h2>
          </div>
          <button onClick={onCancel} className="bg-surface hover:bg-slate-700 text-secondary hover:text-white p-1.5 rounded-full transition-colors">
            <X size={18} />
          </button>
      </div>

      <div className="p-4 pb-24 animate-in slide-in-from-bottom-8 duration-300 flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
          
          {/* Title & AI Button */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-secondary font-bold uppercase tracking-wider ml-1">电影/剧集名称</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：盗梦空间"
                className="flex-1 bg-surface border border-slate-700 rounded-xl p-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-base"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleAutoFill('manual')}
                disabled={aiStatus === GeminiStatus.LOADING || !title}
                className={`w-12 rounded-xl border border-slate-700 flex items-center justify-center transition-all ${
                  aiStatus === GeminiStatus.LOADING ? 'bg-slate-800 cursor-wait' : 'bg-surface hover:bg-slate-700 hover:border-primary/50 text-primary active:scale-95'
                }`}
                title="自动填充信息"
              >
                {aiStatus === GeminiStatus.LOADING ? (
                   <Loader2 size={20} className="animate-spin opacity-50" />
                ) : (
                   <Sparkles size={20} />
                )}
              </button>
            </div>
            {aiStatus === GeminiStatus.ERROR && <p className="text-red-400 text-[10px] ml-1">未找到信息，请尝试手动输入。</p>}
          </div>

          {/* Director */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] text-secondary font-bold uppercase tracking-wider ml-1 flex justify-between">
              <span>导演</span>
              {aiStatus === GeminiStatus.LOADING && <span className="text-primary text-[10px] animate-pulse normal-case font-normal">正在同步...</span>}
            </label>
            <input
              type="text"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              onBlur={() => { if(title && director) handleAutoFill('auto'); }}
              placeholder="导演姓名"
              className="w-full bg-surface border border-slate-700 rounded-xl p-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all text-base"
            />
          </div>

          {/* Year & Date Row */}
          <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                  <label className="text-[10px] text-secondary font-bold uppercase tracking-wider ml-1">上映年份</label>
                  <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="YYYY"
                      className="w-full bg-surface border border-slate-700 rounded-xl p-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all text-base"
                  />
              </div>
              <div className="space-y-1.5">
                  <label className="text-[10px] text-secondary font-bold uppercase tracking-wider ml-1">观影日期</label>
                  <input
                      type="date"
                      value={watchedDate}
                      onChange={(e) => setWatchedDate(e.target.value)}
                      className="w-full bg-surface border border-slate-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-primary transition-all text-base"
                  />
              </div>
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-secondary font-bold uppercase tracking-wider ml-1">评分</label>
            <div className="flex gap-2 p-1 bg-surface border border-slate-700 rounded-xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`flex-1 py-2.5 rounded-lg transition-all flex justify-center ${
                    rating >= star ? 'bg-primary text-black shadow-sm' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  <span className={`text-base font-bold ${rating >= star ? '' : 'opacity-50'}`}>{star}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Genre */}
           <div className="space-y-1.5">
            <label className="text-[10px] text-secondary font-bold uppercase tracking-wider ml-1">类型</label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="例如：科幻, 剧情"
              className="w-full bg-surface border border-slate-700 rounded-xl p-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all text-base"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-secondary font-bold uppercase tracking-wider ml-1">笔记 / 短评</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="写下你的观后感..."
              className="w-full bg-surface border border-slate-700 rounded-xl p-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary resize-none transition-all text-base"
            />
          </div>

          {/* Hidden Poster Input for State tracking */}
          <input type="hidden" value={posterUrl} />

          <button
            type="submit"
            className="w-full bg-primary text-black font-bold text-base py-3.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 mt-2"
          >
            <Save size={20} />
            保存记录
          </button>
        </form>
      </div>
    </div>
  );
};
