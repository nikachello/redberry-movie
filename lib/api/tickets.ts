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

export async function refundTicket(orderId: number): Promise<TicketOrder> {
  const response = await api<ApiResponse<TicketOrder>>(
    `/orders/${orderId}/refund`,
    { method: "POST" },
  );

  return response.data;
}
