import { SeatMap } from "@/types/session";
import { api } from "./client";
import { ApiResponse } from "@/types/api";

export async function getSessionSeats(sessionId: number): Promise<SeatMap> {
  const response = await api<ApiResponse<SeatMap>>(
    `/sessions/${sessionId}/seats`,
  );
  return response.data;
}
