import assert from "node:assert/strict";
import test from "node:test";
import {
  bookingFlowReducer as transition,
  initialBookingFlow,
  isBookingBusy,
  isHoldLive,
} from "../lib/booking/flow.ts";
import { isTicketTypeAllowed, validateSelection } from "../lib/booking/selection.ts";
import { getBookingEligibility } from "../lib/booking/eligibility.ts";
import { saveHoldId, getSavedHoldId, clearHoldId } from "../lib/booking/hold-storage.ts";
import { checkoutSchema } from "../lib/validation/checkout.ts";

const hold = {
  holdId: "hold-1", sessionId: 1, isLive: true,
  expiresAt: "2030-01-01T12:00:00Z", seats: [], subtotal: 10,
};
const checkout = () => transition(initialBookingFlow, { type: "held", hold });
const ticketTypes = [
  { slug: "adult", name: "Adult", blockedFromRatingAge: null },
  { slug: "child", name: "Child", blockedFromRatingAge: 16 },
];
const selection = [{ seatId: 1, code: "A1", ticketTypeSlug: "adult" }];

test("expiry during payment retains checkout until the server responds", () => {
  const paying = transition(checkout(), { type: "pay" });
  const expired = transition(paying, { type: "expired", message: "Expired" });
  assert.equal(expired.stage, "paying");
  assert.equal(expired.hold, hold);
  const paid = transition(expired, { type: "paid", order: { reference: "ORDER-1" } });
  assert.equal(paid.stage, "confirmed");
  assert.equal(paid.hold, null);
  assert.equal(paid.order.reference, "ORDER-1");
});

test("failed payment after expiry returns to selection and discards the old hold", () => {
  const failed = transition(transition(checkout(), { type: "pay" }), {
    type: "payment-failed", message: null,
  });
  const expired = transition(failed, { type: "expired", message: "Expired" });
  assert.equal(expired.stage, "selecting");
  assert.equal(expired.hold, null);
  assert.equal(expired.error, "Expired");
});

test("release failure preserves the live hold so closing can be retried", () => {
  const releasing = transition(checkout(), { type: "release" });
  assert.equal(isBookingBusy(releasing.stage), true);
  const failed = transition(releasing, { type: "release-failed", message: "Try again" });
  assert.equal(failed.stage, "checkout");
  assert.equal(failed.hold, hold);
  assert.equal(isBookingBusy(failed.stage), false);
});

test("pending restoration, reservation, payment and release block dismissal", () => {
  for (const stage of ["restoring", "reserving", "paying", "releasing"]) {
    assert.equal(isBookingBusy(stage), true);
  }
  for (const stage of ["selecting", "checkout", "restore-error", "confirmed"]) {
    assert.equal(isBookingBusy(stage), false);
  }
});

test("restoration failure allows retry without carrying a previous error", () => {
  const failed = transition(initialBookingFlow, { type: "restore-failed", message: "Offline" });
  const retry = transition(failed, { type: "restore" });
  assert.equal(retry.stage, "restoring");
  assert.equal(retry.error, null);
});

test("hold validity checks the server flag and exact expiry boundary", () => {
  const expiry = Date.parse(hold.expiresAt);
  assert.equal(isHoldLive(hold, expiry - 1), true);
  assert.equal(isHoldLive(hold, expiry), false);
  assert.equal(isHoldLive({ ...hold, isLive: false }, expiry - 1), false);
  assert.equal(isHoldLive({ ...hold, expiresAt: "invalid" }, expiry - 1), false);
});

test("ticket restrictions use the same rating boundary as selection validation", () => {
  const childSeat = [{ ...selection[0], ticketTypeSlug: "child" }];
  assert.equal(isTicketTypeAllowed(ticketTypes[1], 15), true);
  assert.equal(isTicketTypeAllowed(ticketTypes[1], 16), false);
  assert.equal(validateSelection(childSeat, ticketTypes, 6, 15), null);
  assert.match(validateSelection(childSeat, ticketTypes, 6, 16), /not available/);
  assert.equal(validateSelection(selection, ticketTypes, 6, 18), null);
});

test("selection rejects missing settings, unknown ticket types and excessive seats", () => {
  assert.match(validateSelection([], ticketTypes, 6), /at least one/);
  assert.match(validateSelection(selection, ticketTypes), /settings/);
  assert.match(validateSelection(selection, [], 6), /settings/);
  assert.match(validateSelection(selection, ticketTypes, 0), /maximum/);
  assert.match(validateSelection([{ ...selection[0], ticketTypeSlug: "unknown" }], ticketTypes, 6), /valid ticket type/);
});

test("eligibility uses the birthday on the screening date", () => {
  const user = { profileComplete: true, dateOfBirth: "2010-10-10" };
  assert.equal(getBookingEligibility(user, 16, "2026-10-09").allowed, false);
  assert.equal(getBookingEligibility(user, 16, "2026-10-10").allowed, true);
});

test("hold storage isolates accounts and sessions and tolerates unavailable storage", () => {
  const values = new Map();
  globalThis.localStorage = {
    setItem: (key, value) => values.set(key, value),
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
  };
  try {
    saveHoldId(1, 10, "first");
    saveHoldId(2, 10, "second");
    assert.equal(getSavedHoldId(1, 10), "first");
    assert.equal(getSavedHoldId(2, 10), "second");
    assert.equal(getSavedHoldId(1, 11), null);
    clearHoldId(1, 10);
    assert.equal(getSavedHoldId(1, 10), null);
    assert.equal(getSavedHoldId(2, 10), "second");
    globalThis.localStorage = {
      setItem() { throw new Error("Storage unavailable"); },
      getItem() { throw new Error("Storage unavailable"); },
      removeItem() { throw new Error("Storage unavailable"); },
    };
    assert.doesNotThrow(() => saveHoldId(1, 10, "live-hold"));
    assert.equal(getSavedHoldId(1, 10), null);
    assert.doesNotThrow(() => clearHoldId(1, 10));
  } finally {
    delete globalThis.localStorage;
  }
});

test("checkout validates and normalizes the values submitted to payment", () => {
  const details = {
    fullName: "  Test Customer  ", email: "test@example.com", mobileNumber: "555 123 456",
    cardNumber: "4242 4242 4242 4242", expiry: "12/99", cvv: "123",
  };
  const result = checkoutSchema.parse(details);
  assert.equal(result.fullName, "Test Customer");
  assert.equal(result.mobileNumber, "555123456");
  assert.equal(result.cardNumber, "4242424242424242");
  assert.equal(checkoutSchema.safeParse({ ...details, cardNumber: "", cvv: "" }).success, false);
});
