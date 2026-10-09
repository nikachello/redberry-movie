import { MovieDetail, MovieWithSynopsis } from "@/types/movie";
import { api } from "./client";
import { ApiResponse } from "@/types/api";
import { MovieSessionsGroup } from "@/types/session";

const NOW_PLAYING_LIMIT = 10;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export async function getFeaturedMovies() {
  const response =
    await api<ApiResponse<MovieWithSynopsis[]>>("/movies/featured");
  return response.data;
}

export async function getNowPlayingMovies() {
  const response = await api<ApiResponse<MovieWithSynopsis[]>>(
    `/movies/now-playing?limit=${NOW_PLAYING_LIMIT}`,
  );
  return response.data;
}

export async function getComingSoonMovies() {
  const response = await api<ApiResponse<MovieWithSynopsis[]>>(
    "/movies/coming-soon",
  );
  return response.data;
}

export async function getMovie(movie: string): Promise<MovieDetail> {
  const response = await fetch(
    `${API_URL}/movies/${encodeURIComponent(movie)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch movie.");
  }

  const result: ApiResponse<MovieDetail> = await response.json();

  return result.data;
}

export async function getMovieSessions(
  movie: string,
  date: string,
): Promise<MovieSessionsGroup[]> {
  const params = new URLSearchParams({
    date,
  });

  const response = await fetch(
    `${API_URL}/movies/${encodeURIComponent(movie)}/sessions?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch movie sessions.");
  }

  const result: ApiResponse<MovieSessionsGroup[]> = await response.json();

  return result.data;
}
