
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { MovieList } from './components/MovieList';
import { MovieForm } from './components/MovieForm';
import { StatsView } from './components/StatsView';
import { HomeView } from './components/HomeView';
import { ProfileView } from './components/ProfileView';
import { ViewState, MovieEntry } from './types';
import * as storage from './services/storageService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home'); // Default to home
  const [entries, setEntries] = useState<MovieEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State to hold the title coming from Home view quick add
  const [prefillTitle, setPrefillTitle] = useState<string>('');

  useEffect(() => {
    // Initialize data
    storage.seedInitialData();
    setEntries(storage.getEntries());
    setLoading(false);
  }, []);

  const handleSaveEntry = (entry: MovieEntry) => {
    const updated = storage.saveEntry(entry);
    setEntries(updated);
    setPrefillTitle(''); // Clear prefill
    setView('list');
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm("确定要删除这条记录吗？")) {
        const updated = storage.deleteEntry(id);
        setEntries(updated);
    }
  };

  const handleQuickAdd = (title: string) => {
      setPrefillTitle(title);
      setView('add');
  };

  const handleCancelAdd = () => {
      setPrefillTitle('');
      setView('home'); // Or back to list? Home seems better if cancelling
  };

  if (loading) {
      return <div className="h-screen w-screen bg-background flex items-center justify-center text-primary">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-text font-sans antialiased selection:bg-primary selection:text-black">
      <div className="max-w-md mx-auto min-h-screen relative bg-background shadow-2xl overflow-hidden">
        
        {/* Main Content Area */}
        <main className="min-h-screen relative">
          
          {view === 'home' && (
            <HomeView onQuickAdd={handleQuickAdd} entries={entries} />
          )}

          {view === 'list' && (
            <MovieList entries={entries} onDelete={handleDeleteEntry} />
          )}
          
          {view === 'add' && (
            <MovieForm 
              onSave={handleSaveEntry} 
              onCancel={handleCancelAdd}
              initialTitle={prefillTitle}
            />
          )}

          {view === 'stats' && (
            <StatsView entries={entries} />
          )}

          {view === 'profile' && (
            <ProfileView entries={entries} />
          )}
        </main>

        {/* Navigation - Hidden on Add Screen for focus, visible otherwise */}
        {view !== 'add' && (
           <Navigation currentView={view} setView={setView} />
        )}
      </div>
    </div>
  );
};

export default App;
