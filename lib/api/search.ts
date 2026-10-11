import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { Movie } from "@/types/movie";

export async function searchMovies(query: string): Promise<Movie[]> {
  const response = await api<ApiResponse<Movie[]>>(
    `/search?q=${encodeURIComponent(query)}`,
  );

  return response.data;
}
