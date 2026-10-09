import { api } from "@/lib/api/client";

import type { ApiResponse } from "@/types/api";
import type { CreateHoldInput, SeatHold } from "@/types/booking";

export async function createSeatHold(
  sessionId: number,
  input: CreateHoldInput,
) {
  const response = await api<ApiResponse<SeatHold>>(
    `/sessions/${sessionId}/holds`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data;
}

export async function getSeatHold(holdId: string) {
  const response = await api<ApiResponse<SeatHold>>(`/holds/${holdId}`);

  return response.data;
}
