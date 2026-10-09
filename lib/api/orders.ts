import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { CreateOrderPayload, Order } from "@/types/order";

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const response = await api<ApiResponse<Order>>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}
