import { MovieEntry } from '../types';

const STORAGE_KEY = 'cinetrack_entries_v1';

export const getEntries = (): MovieEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load entries", e);
    return [];
  }
};

export const saveEntry = (entry: MovieEntry): MovieEntry[] => {
  const current = getEntries();
  const updated = [entry, ...current]; // Newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const updateEntry = (updatedEntry: MovieEntry): MovieEntry[] => {
  const current = getEntries();
  const updated = current.map(e => e.id === updatedEntry.id ? updatedEntry : e);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteEntry = (id: string): MovieEntry[] => {
  const current = getEntries();
  const updated = current.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// Seed some data if empty for demo purposes
export const seedInitialData = () => {
  const current = getEntries();
  
  // 1. Initial Seed if empty
  if (current.length === 0) {
    const dummy: MovieEntry[] = [
      {
        id: '1',
        title: '盗梦空间',
        director: '克里斯托弗·诺兰',
        year: 2010,
        watchedDate: '2023-11-15',
        rating: 5,
        genre: '科幻',
        notes: '至今仍然是经典，结构太精妙了。',
        posterUrl: 'https://image.tmdb.org/t/p/original/9gk7admal4zl67Yrxt8Mvru6k.jpg'
      },
      {
        id: '2',
        title: '布达佩斯大饭店',
        director: '韦斯·安德森',
        year: 2014,
        watchedDate: '2024-01-20',
        rating: 4,
        genre: '喜剧',
        notes: '色彩美学满分。',
        posterUrl: 'https://image.tmdb.org/t/p/original/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg'
      },
      {
        id: '3',
        title: '奥本海默',
        director: '克里斯托弗·诺兰',
        year: 2023,
        watchedDate: '2024-02-10',
        rating: 5,
        genre: '历史',
        notes: '震撼人心，配乐很强。',
        posterUrl: 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
    return;
  }

  // 2. Migration fix: Inject posters into existing demo data if missing
  // This ensures the user sees the update even if they already have data
  let hasUpdates = false;
  const updated = current.map(entry => {
      if (!entry.posterUrl) {
          if (entry.title === '盗梦空间') {
              hasUpdates = true;
              return { ...entry, posterUrl: 'https://image.tmdb.org/t/p/original/9gk7admal4zl67Yrxt8Mvru6k.jpg' };
          }
          if (entry.title === '布达佩斯大饭店') {
              hasUpdates = true;
              return { ...entry, posterUrl: 'https://image.tmdb.org/t/p/original/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg' };
          }
          if (entry.title === '奥本海默') {
              hasUpdates = true;
              return { ...entry, posterUrl: 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' };
          }
      }
      return entry;
  });

  if (hasUpdates) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};