import { api } from "@/lib/api/client";
import type {
  SessionsFilters,
  SessionsListResponse,
} from "@/types/session-list";

export async function getSessions(
  filters: SessionsFilters,
): Promise<SessionsListResponse> {
  const params = new URLSearchParams();

  if (filters.date) params.set("date", filters.date);

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

  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page) params.set("page", String(filters.page));

  return api<SessionsListResponse>(`/sessions?${params.toString()}`);
}
