"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSessionSeats } from "@/lib/api/sessions";
import { createSeatHold, releaseSeatHold } from "@/lib/api/bookings";
import { createOrder } from "@/lib/api/orders";
import type { CreateHoldInput } from "@/types/booking";

export const bookingKeys = {
  seats: (sessionId: number) => ["session-seats", sessionId] as const,
  userSeats: (sessionId: number, userId: number) => ["session-seats", sessionId, userId] as const,
};

export function useSessionSeats(sessionId: number, userId: number) {
  return useQuery({
    queryKey: bookingKeys.userSeats(sessionId, userId),
    queryFn: () => getSessionSeats(sessionId),
    refetchOnMount: "always",
    staleTime: 0,
  });
}

export function useBookingMutations(sessionId: number, movieSlug: string) {
  const queryClient = useQueryClient();
  const refreshAvailability = () => {
    void queryClient.invalidateQueries({ queryKey: bookingKeys.seats(sessionId) });
    void queryClient.invalidateQueries({ queryKey: ["movie-sessions", movieSlug] });
  };
  const reserve = useMutation({
    mutationFn: (input: CreateHoldInput) => createSeatHold(sessionId, input),
    onSettled: refreshAvailability,
  });
  const release = useMutation({ mutationFn: releaseSeatHold, onSettled: refreshAvailability });
  const order = useMutation({ mutationFn: createOrder, onSettled: refreshAvailability });
  return { reserve, release, order };
}
