import { Movie } from "@/types/movie";

export { cn } from "cn";

const STORAGE_KEY = "recently-viewed";
const MAX_RECENT_MOVIES = 10;

export function getRecentlyViewed(): Movie[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) return [];

  try {
    return JSON.parse(stored) as Movie[];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(movie: Movie) {
  const movies = getRecentlyViewed();

  const withoutCurrentMovie = movies.filter(
    (recentMovie) => recentMovie.id !== movie.id,
  );

  const updatedMovies = [movie, ...withoutCurrentMovie].slice(
    0,
    MAX_RECENT_MOVIES,
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMovies));
}
