"use client";

import { useQuery } from "@tanstack/react-query";

import { getFilterOptions } from "@/lib/api/filter-options";

export const filterOptionsKey = ["filter-options"] as const;

export function useFilterOptions() {
  return useQuery({
    queryKey: filterOptionsKey,
    queryFn: getFilterOptions,
    staleTime: Infinity,
  });
}
