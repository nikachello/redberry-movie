import type { Session } from "@/types/session";
import type { Movie } from "@/types/movie";

export type SessionsFilters = {
  date?: string;
  venues?: string[];
  formats?: string[];
  languages?: string[];
  bands?: string[];
  search?: string;
  sort?: string;
  page?: number;
};

export type SessionsMovieGroup = {
  movie: Movie;
  sessions: Session[];
};

export type SessionsMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  totalSessions: number;
  totalMovies: number;
  date: string;
};

export type SessionsListResponse = {
  data: SessionsMovieGroup[];
  meta: SessionsMeta;
};
