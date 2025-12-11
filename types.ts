
export interface MovieEntry {
  id: string;
  title: string;
  director: string;
  year: number; // Release year
  watchedDate: string; // ISO string YYYY-MM-DD
  rating: number; // 1-5
  genre: string;
  notes?: string;
  posterUrl?: string; // URL to the movie poster image
  posterPrompt?: string; 
}

export type ViewState = 'home' | 'list' | 'add' | 'stats' | 'share' | 'profile';

export interface Recommendation {
  title: string;
  year: string;
  type: 'movie' | 'tv';
  imdbRating: string;
  doubanRating: string;
  reason: string;
}

export interface FeaturedRecommendation {
  title: string;
  year: string;
  director: string;
  genre: string;
  reason: string;
  posterUrl: string;
}

export interface AnnualStats {
  year: number;
  totalWatched: number;
  topDirector: string;
  topGenre: string;
  averageRating: number;
  monthlyData: { name: string; count: number }[];
}

export enum GeminiStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
