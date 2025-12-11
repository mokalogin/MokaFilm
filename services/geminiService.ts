
import { GoogleGenAI, Type } from "@google/genai";
import { MovieEntry, Recommendation, FeaturedRecommendation } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export interface MovieDetailsResponse {
  director: string;
  year: number;
  genre: string;
  summary: string;
  posterUrl?: string;
}

export interface HomeContentResponse {
  latest: Recommendation[];
  upcoming: Recommendation[];
}

export const fetchMovieDetails = async (title: string, director?: string): Promise<MovieDetailsResponse | null> => {
  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash';
    
    const context = director 
      ? `directed by "${director}"` 
      : '';
    
    const prompt = `Provide factual details for the movie or TV show titled "${title}" ${context}. 
    Reference data from Douban (豆瓣) or IMDb.
    Return JSON with the following fields in **Simplified Chinese**:
    - "director": The director's name in Chinese (e.g. 克里斯托弗·诺兰).
    - "year": Release year (number).
    - "genre": Primary genre in Chinese (e.g. 剧情, 科幻).
    - "summary": A very short 1-sentence summary in Chinese.
    - "posterUrl": A valid public HTTPS URL to the movie poster (vertical format) if available, otherwise return empty string.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            director: { type: Type.STRING },
            year: { type: Type.INTEGER },
            genre: { type: Type.STRING },
            summary: { type: Type.STRING },
            posterUrl: { type: Type.STRING },
          },
          required: ["director", "year", "genre", "summary"],
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as MovieDetailsResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const fetchPersonalizedRecommendation = async (history: MovieEntry[]): Promise<FeaturedRecommendation | null> => {
    try {
        const ai = getClient();
        const model = 'gemini-2.5-flash';
        
        // Prepare context from history (Top rated movies)
        const topMovies = history
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 8)
            .map(m => `${m.title} (${m.rating} stars)`);
        
        const historyText = topMovies.length > 0 
            ? `Based on the user's highly rated history: ${topMovies.join(', ')}`
            : `The user has no history yet. Recommend a universally acclaimed visual masterpiece.`;

        const prompt = `
            ${historyText}
            
            Recommend ONE single movie or TV show that the user has likely NOT watched yet but would love.
            Return JSON in **Simplified Chinese**:
            - "title": Movie title.
            - "year": Release year (string).
            - "director": Director name.
            - "genre": Primary genre.
            - "reason": A short, persuasive 1-sentence reason why this fits their taste (e.g. "既然你喜欢诺兰，这部烧脑神作不可错过").
            - "posterUrl": A valid public HTTPS URL to the movie poster (high quality vertical image).
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        year: { type: Type.STRING },
                        director: { type: Type.STRING },
                        genre: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        posterUrl: { type: Type.STRING }
                    },
                    required: ["title", "year", "director", "genre", "reason", "posterUrl"]
                }
            }
        });

        const text = response.text;
        if (!text) return null;
        return JSON.parse(text) as FeaturedRecommendation;

    } catch (error) {
        console.error("Gemini Personal Rec Error:", error);
        // Fallback
        return {
            title: "星际穿越",
            year: "2014",
            director: "克里斯托弗·诺兰",
            genre: "科幻",
            reason: "爱是唯一可以穿越时间与空间的事物。",
            posterUrl: "https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
        };
    }
}

export const fetchTrendingContent = async (): Promise<HomeContentResponse> => {
  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      Generate two distinct lists of global movie/TV recommendations for a home screen app:
      
      1. "latest": The Top 10 recently released (late 2024 to present) movies or TV shows, strictly sorted by highest combined IMDb/Douban rating (High Score First).
      2. "upcoming": The Top 10 highly anticipated upcoming (future 2025-2026) movies or TV shows, sorted by popularity/anticipation.

      Return a JSON object with two arrays: "latest" and "upcoming".
      Each item must have:
      - title: Title in Simplified Chinese (e.g. 沙丘2).
      - year: Release Year (string, e.g. "2024" or "2025").
      - type: "movie" or "tv".
      - imdbRating: Estimated IMDb rating (e.g. "8.2") or "N/A" if unreleased.
      - doubanRating: Estimated Douban rating (e.g. "8.5") or "N/A" if unreleased.
      - reason: A short 2-4 character catchy tag in Chinese (e.g. 口碑炸裂, 值得期待).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             latest: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                    title: { type: Type.STRING },
                    year: { type: Type.STRING },
                    type: { type: Type.STRING },
                    imdbRating: { type: Type.STRING },
                    doubanRating: { type: Type.STRING },
                    reason: { type: Type.STRING }
                    },
                    required: ["title", "year", "type", "imdbRating", "doubanRating", "reason"]
                }
             },
             upcoming: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                    title: { type: Type.STRING },
                    year: { type: Type.STRING },
                    type: { type: Type.STRING },
                    imdbRating: { type: Type.STRING },
                    doubanRating: { type: Type.STRING },
                    reason: { type: Type.STRING }
                    },
                    required: ["title", "year", "type", "imdbRating", "doubanRating", "reason"]
                }
             }
          },
          required: ["latest", "upcoming"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as HomeContentResponse;

  } catch (error) {
    console.error("Gemini Trending Error:", error);
    // Fallback data
    return {
        latest: [
            { title: "沙丘2", year: "2024", type: "movie", imdbRating: "8.6", doubanRating: "8.3", reason: "科幻史诗" },
            { title: "幕府将军", year: "2024", type: "tv", imdbRating: "8.8", doubanRating: "8.5", reason: "年度神剧" },
            { title: "奥本海默", year: "2023", type: "movie", imdbRating: "8.4", doubanRating: "8.8", reason: "诺兰新作" },
        ],
        upcoming: [
             { title: "米奇17", year: "2025", type: "movie", imdbRating: "N/A", doubanRating: "N/A", reason: "奉俊昊新作" },
             { title: "阿凡达3", year: "2025", type: "movie", imdbRating: "N/A", doubanRating: "N/A", reason: "视觉盛宴" },
        ]
    };
  }
};

export const generateYearlyRecap = async (entries: MovieEntry[], year: number): Promise<string> => {
    try {
        const ai = getClient();
        const relevantEntries = entries.filter(e => e.watchedDate.startsWith(String(year)));
        
        if (relevantEntries.length === 0) return `${year}年还没有观影记录哦！`;

        const simplifiedList = relevantEntries.map(e => `${e.title} (${e.rating}/5 stars, Dir: ${e.director})`).join("\n");

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Here is a list of movies I watched in ${year}:\n${simplifiedList}\n\nWrite a short, fun, 2-3 sentence personalized recap of my movie year in **Simplified Chinese**. Mention my favorite director or genre if obvious. Be encouraging and use a casual tone like a Douban review.`,
        });

        return response.text || "你的年度观影总结！";
    } catch (error) {
        console.error("Gemini Recap Error:", error);
        return `你在 ${year} 年共看了 ${entries.filter(e => e.watchedDate.startsWith(String(year))).length} 部影视作品！`;
    }
}
