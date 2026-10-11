"use client";

import { useQuery } from "@tanstack/react-query";
import { getSessions } from "@/lib/api/sessions-list";
import type { SessionsFilters } from "@/types/session-list";

export function useSessionsList(filters: SessionsFilters) {
  return useQuery({
    queryKey: ["sessions-list", filters],
    queryFn: () => getSessions(filters),
    staleTime: 30_000,
  });
}
