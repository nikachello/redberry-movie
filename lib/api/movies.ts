import { MovieWithSynopsis } from "@/types/movie";
import { api } from "./client";
import { ApiResponse } from "@/types/api";

export async function getFeaturedMovies() {
  const response =
    await api<ApiResponse<MovieWithSynopsis[]>>("/movies/featured");
  return response.data;
}

export async function getNowPlayingMovies() {
  const response = await api<ApiResponse<MovieWithSynopsis[]>>("/movies/now-playing");
  return response.data;
}
