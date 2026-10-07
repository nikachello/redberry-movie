import { MovieWithSynopsis } from "@/types/movie";
import { api } from "./client";
import { ApiResponse } from "@/types/api";

export async function getFeaturedMovies() {
  const response =
    await api<ApiResponse<MovieWithSynopsis[]>>("/movies/featured");
  return response.data;
}
