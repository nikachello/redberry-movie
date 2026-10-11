import type { SeatMap } from "@/types/session";
import type {
  SessionsFilters,
  SessionsListResponse,
} from "@/types/session-list";
import type { ApiResponse } from "@/types/api";

import { api } from "./client";

export async function getSessionSeats(sessionId: number): Promise<SeatMap> {
  const response = await api<ApiResponse<SeatMap>>(
    `/sessions/${sessionId}/seats`,
  );

  return response.data;
}

export async function getSessions(
  filters: SessionsFilters = {},
): Promise<SessionsListResponse> {
  const params = new URLSearchParams();

  if (filters.date) {
    params.set("date", filters.date);
  }

  for (const venue of filters.venues ?? []) {
    params.append("venues[]", venue);
  }

  for (const format of filters.formats ?? []) {
    params.append("formats[]", format);
  }

  for (const language of filters.languages ?? []) {
    params.append("languages[]", language);
  }

  for (const band of filters.bands ?? []) {
    params.append("bands[]", band);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  const query = params.toString();

  return api<SessionsListResponse>(`/sessions${query ? `?${query}` : ""}`);
}
