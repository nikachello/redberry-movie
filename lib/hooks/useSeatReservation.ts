"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { getSeatHold } from "@/lib/api/bookings";
import type { ApiError } from "@/lib/api/client";
import { bookingFlowReducer, initialBookingFlow, isBookingBusy, isHoldLive, type BookingEvent } from "@/lib/booking/flow";
import { clearHoldId, getSavedHoldId, saveHoldId } from "@/lib/booking/hold-storage";
import { useBookingMutations } from "@/lib/queries/bookings";
import type { SelectedSeat } from "@/types/booking";
import type { CheckoutPayload } from "@/lib/validation/checkout";

const EXPIRED = "Your hold time expired. Please re-select your seats.";

export function useSeatReservation(userId: number, sessionId: number, movieSlug: string) {
  const [state, dispatch] = useReducer(bookingFlowReducer, initialBookingFlow);
  // Synchronous transitions prevent a second click before React renders the pending stage.
  const current = useRef(initialBookingFlow);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const { reserve, release, order } = useBookingMutations(sessionId, movieSlug);

  const send = useCallback((event: BookingEvent) => {
    current.current = bookingFlowReducer(current.current, event);
    dispatch(event);
  }, []);

  const clearSavedHold = useCallback(() => clearHoldId(userId, sessionId), [userId, sessionId]);
  const expire = useCallback(() => {
    if (current.current.stage !== "checkout") return;
    clearSavedHold();
    send({ type: "expired", message: EXPIRED });
  }, [clearSavedHold, send]);

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      // Complete initialization asynchronously, including when there is no saved hold.
      await Promise.resolve();
      if (cancelled) return;
      const holdId = getSavedHoldId(userId, sessionId);
      if (!holdId) {
        send({ type: "select" });
        return;
      }
      try {
        const hold = await getSeatHold(holdId);
        if (cancelled) return;
        if (hold.sessionId === sessionId && isHoldLive(hold)) {
          send({ type: "held", hold });
        } else {
          clearSavedHold();
          send({ type: "select", message: isHoldLive(hold) ? undefined : EXPIRED });
        }
      } catch (error) {
        if (cancelled) return;
        const failure = error as ApiError;
        if (failure.status === 403 || failure.status === 404) {
          clearSavedHold();
          send({ type: "select", message: "Your previous reservation is no longer accessible." });
        } else {
          send({ type: "restore-failed", message: "We couldn't check your existing reservation. Please try again." });
        }
      }
    }
    void restore();
    return () => { cancelled = true; };
  }, [userId, sessionId, restoreAttempt, clearSavedHold, send]);

  useEffect(() => {
    if (state.stage !== "checkout" || !state.hold) return;
    const delay = Math.max(0, new Date(state.hold.expiresAt).getTime() - Date.now());
    const timeout = window.setTimeout(() => {
      const latest = current.current;
      if (latest.stage === "checkout" && latest.hold && !isHoldLive(latest.hold)) expire();
    }, Math.min(delay, 2_147_483_647));
    return () => window.clearTimeout(timeout);
  }, [state.stage, state.hold, expire]);

  const retryRestoration = () => {
    if (current.current.stage !== "restore-error") return;
    send({ type: "restore" });
    setRestoreAttempt((attempt) => attempt + 1);
  };

  const reserveSeats = async (seats: SelectedSeat[]): Promise<string[]> => {
    if (current.current.stage !== "selecting") return [];
    send({ type: "reserve" });
    try {
      const hold = await reserve.mutateAsync({
        seats: seats.map((seat) => ({ seatId: seat.seatId, ticketType: seat.ticketTypeSlug })),
      });
      saveHoldId(userId, sessionId, hold.holdId);
      send({ type: "held", hold });
    } catch (error) {
      const failure = error as ApiError;
      const contested = failure.status === 409 ? failure.contested ?? [] : [];
      send({
        type: "select",
        message: failure.status === 409
          ? contested.length
            ? `Seats ${contested.join(", ")} are no longer available. Please select different seats.`
            : "Some selected seats are no longer available. Please review your selection."
          : failure.message || "Could not reserve your seats.",
      });
      return contested;
    }
    return [];
  };

  const pay = async (details: CheckoutPayload): Promise<ApiError | null> => {
    const { hold, stage } = current.current;
    if (stage !== "checkout" || !hold) return null;
    if (!isHoldLive(hold)) { expire(); return null; }
    send({ type: "pay" });
    try {
      const paidOrder = await order.mutateAsync({ ...details, holdId: hold.holdId });
      clearSavedHold();
      send({ type: "paid", order: paidOrder });
    } catch (error) {
      const failure = error as ApiError;
      if (failure.status === 409) {
        clearSavedHold();
        send({ type: "select", message: failure.contested?.length
          ? `Seats ${failure.contested.join(", ")} are no longer available. Please select different seats.`
          : "Some selected seats are no longer available. Please select again." });
      } else if ((failure.status === 422 && !failure.errors) || !isHoldLive(hold)) {
        send({ type: "payment-failed", message: null });
        expire();
      } else {
        send({ type: "payment-failed", message: failure.status === 422 && failure.errors ? null
          : failure.status === 403 ? "This reservation belongs to another account."
          : failure.status === 401 ? "Your session expired. Please log in again before completing payment."
          : failure.message || "Payment failed. Please try again." });
      }
      return failure;
    }
    return null;
  };

  const close = async (onClose: () => void) => {
    const { stage, hold } = current.current;
    if (isBookingBusy(stage)) return;
    if (stage === "confirmed") { onClose(); return; }
    send({ type: "release" });
    try {
      const holdId = hold?.holdId ?? getSavedHoldId(userId, sessionId);
      if (holdId && (!hold || isHoldLive(hold))) await release.mutateAsync(holdId);
      clearSavedHold();
      onClose();
    } catch {
      send({ type: "release-failed", message: "Could not release your reservation. Please try again." });
    }
  };

  return { ...state, reserveSeats, pay, close, retryRestoration };
}
