import { FilterOptions } from "@/types/filter-options";
import { api } from "./client";

import type { ApiResponse } from "@/types/api";

export async function getFilterOptions() {
  const response = await api<ApiResponse<FilterOptions>>("/filter-options");

  return response.data;
}
