import { MovieWithSynopsis } from "@/types/movie";
import { api } from "./client";
import { ApiResponse } from "@/types/api";

const NOW_PLAYING_LIMIT = 10;

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
