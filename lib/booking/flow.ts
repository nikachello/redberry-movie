import type { SeatHold } from "@/types/booking";
import type { Order } from "@/types/order";

export type BookingStage = "restoring" | "restore-error" | "selecting" | "reserving" |
  "checkout" | "paying" | "releasing" | "confirmed";

export type BookingFlow = {
  stage: BookingStage;
  hold: SeatHold | null;
  order: Order | null;
  error: string | null;
};

export type BookingEvent =
  | { type: "restore" }
  | { type: "restore-failed"; message: string }
  | { type: "select"; message?: string }
  | { type: "expired"; message: string }
  | { type: "reserve" }
  | { type: "held"; hold: SeatHold }
  | { type: "pay" }
  | { type: "payment-failed"; message: string | null }
  | { type: "paid"; order: Order }
  | { type: "release" }
  | { type: "release-failed"; message: string };

export const initialBookingFlow: BookingFlow = {
  stage: "restoring", hold: null, order: null, error: null,
};

export function bookingFlowReducer(state: BookingFlow, event: BookingEvent): BookingFlow {
  switch (event.type) {
    case "restore": return { ...initialBookingFlow };
    case "restore-failed": return { ...state, stage: "restore-error", error: event.message };
    case "select": return { ...initialBookingFlow, stage: "selecting", error: event.message ?? null };
    case "expired": return state.stage === "checkout"
      ? { ...initialBookingFlow, stage: "selecting", error: event.message }
      : state;
    case "reserve": return { ...state, stage: "reserving", error: null };
    case "held": return { ...state, stage: "checkout", hold: event.hold, error: null };
    case "pay": return { ...state, stage: "paying", error: null };
    case "payment-failed": return { ...state, stage: "checkout", error: event.message };
    case "paid": return { stage: "confirmed", order: event.order, hold: null, error: null };
    case "release": return { ...state, stage: "releasing" };
    case "release-failed": return {
      ...state, stage: state.hold ? "checkout" : "restore-error", error: event.message,
    };
  }
}

export function isHoldLive(hold: SeatHold, now = Date.now()) {
  return hold.isLive && new Date(hold.expiresAt).getTime() > now;
}

export function isBookingBusy(stage: BookingStage) {
  return ["restoring", "reserving", "paying", "releasing"].includes(stage);
}
