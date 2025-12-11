
import React from 'react';
import { Film, PlusCircle, PieChart, Home, User } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItemClass = (view: ViewState) =>
    `flex flex-col items-center justify-center w-full h-full space-y-0.5 ${
      currentView === view ? 'text-primary' : 'text-secondary hover:text-slate-300'
    } transition-colors`;

  return (
    <div className="fixed bottom-0 left-0 w-full h-14 bg-surface border-t border-slate-700 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-full max-w-md mx-auto px-1">
        <button onClick={() => setView('home')} className={navItemClass('home')}>
          <Home size={22} />
          <span className="text-[9px] font-medium">首页</span>
        </button>

        <button onClick={() => setView('list')} className={navItemClass('list')}>
          <Film size={22} />
          <span className="text-[9px] font-medium">列表</span>
        </button>
        
        <button onClick={() => setView('add')} className={`${navItemClass('add')} -mt-3`}>
          <div className="relative">
             <div className={`rounded-full p-1 transition-all duration-300 ${currentView === 'add' ? 'bg-primary/20 scale-105' : ''}`}>
                 <PlusCircle 
                    size={42} 
                    className={`transition-all duration-300 ${currentView === 'add' ? 'fill-primary text-black' : 'fill-surface text-primary'}`} 
                    strokeWidth={1.5}
                 />
             </div>
             {currentView === 'add' && <div className="absolute inset-0 bg-primary opacity-30 blur-lg rounded-full" />}
          </div>
        </button>
        
        <button onClick={() => setView('stats')} className={navItemClass('stats')}>
          <PieChart size={22} />
          <span className="text-[9px] font-medium">统计</span>
        </button>

        <button onClick={() => setView('profile')} className={navItemClass('profile')}>
          <User size={22} />
          <span className="text-[9px] font-medium">我的</span>
        </button>
      </div>
    </div>
  );
};
