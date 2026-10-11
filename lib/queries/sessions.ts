"use client";

import { useQuery } from "@tanstack/react-query";

import { getSessions } from "@/lib/api/sessions";
import type { SessionsFilters } from "@/types/session-list";

export function useSessions(filters: SessionsFilters) {
  return useQuery({
    queryKey: [
      "sessions",
      filters.date,
      filters.venues,
      filters.formats,
      filters.languages,
      filters.bands,
      filters.search,
      filters.sort,
      filters.page,
    ],
    queryFn: () => getSessions(filters),
    staleTime: 30_000,
  });
}
