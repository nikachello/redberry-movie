import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { TicketOrder } from "@/types/ticket";

export type TicketFilter = "upcoming" | "past";

export async function getTickets(filter: TicketFilter): Promise<TicketOrder[]> {
  const response = await api<ApiResponse<TicketOrder[]>>(
    `/tickets?filter=${filter}`,
  );

  return response.data;
}

export async function refundTicket(reference: string): Promise<TicketOrder> {
  const response = await api<ApiResponse<TicketOrder>>(
    `/orders/${encodeURIComponent(reference)}/refund`,
    {
      method: "POST",
    },
  );

  return response.data;
}
