"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { MovieDetail } from "@/types/movie";
import type { Seat, Session } from "@/types/session";
import type { SeatHold, SelectedSeat } from "@/types/booking";
import type { CreateOrderPayload, Order } from "@/types/order";
import type { ApiError } from "@/lib/api/client";
import type { CheckoutDetails } from "./CheckoutForm";

import { getSessionSeats } from "@/lib/api/sessions";
import {
  createSeatHold,
  getSeatHold,
  releaseSeatHold,
} from "@/lib/api/bookings";
import { createOrder } from "@/lib/api/orders";
import { useFilterOptions } from "@/lib/queries/filter-options";
import { useHoldCountdown } from "@/lib/hooks/useHoldCountdown";
import {
  clearHoldId,
  getSavedHoldId,
  saveHoldId,
} from "@/lib/booking/hold-storage";

import { useAuth } from "../auth/AuthProvider";
import SeatMap from "./SeatMap";
import BookingSummary from "./BookingSummary";
import CheckoutForm from "./CheckoutForm";
import CheckoutSummary from "./CheckoutSummary";
import OrderConfirmation from "./OrderConfirmation";
import { checkoutSchema } from "@/lib/validation/checkout";
import { getBookingEligibility } from "@/lib/booking/eligibility";

type Props = {
  movie: MovieDetail;
  session: Session;
  onClose: () => void;
};

type CheckoutFieldErrors = Partial<Record<keyof CheckoutDetails, string>>;

export default function BookingModal({ movie, session, onClose }: Props) {
  const { user } = useAuth();
  const userId = user?.id;

  const eligibility = getBookingEligibility(
    user,
    movie.ageRating?.minAge,
    session.date,
  );

  const queryClient = useQueryClient();

  const closingRef = useRef(false);
  const holdRequestPendingRef = useRef(false);
  const restorationPendingRef = useRef(false);
  const paymentPendingRef = useRef(false);
  const activeHoldRef = useRef<SeatHold | null>(null);
  const savedHoldIdRef = useRef<string | null>(null);
  const paidOrderRef = useRef(false);

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  const [seatError, setSeatError] = useState<string | null>(null);

  const [activeHold, setActiveHold] = useState<SeatHold | null>(null);

  const [holdError, setHoldError] = useState<string | null>(null);

  const [isRestoringHold, setIsRestoringHold] = useState(true);

  const [restoreError, setRestoreError] = useState<string | null>(null);

  const [restoreAttempt, setRestoreAttempt] = useState(0);

  const [isClosing, setIsClosing] = useState(false);

  const [checkoutDetails, setCheckoutDetails] =
    useState<CheckoutDetails | null>(null);

  const [checkoutErrors, setCheckoutErrors] = useState<CheckoutFieldErrors>({});

  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [paidOrder, setPaidOrder] = useState<Order | null>(null);

  const {
    data: seatMap,
    isPending: isSeatMapLoading,
    isError: isSeatMapError,
    refetch: refetchSeatMap,
  } = useQuery({
    queryKey: ["session-seats", session.id],
    queryFn: () => getSessionSeats(session.id),
    enabled: Boolean(userId),
    refetchOnMount: "always",
    staleTime: 0,
  });

  const { data: filterOptions, isError: isFilterOptionsError } =
    useFilterOptions();

  const maxSeats = filterOptions?.maxSeatsPerOrder;

  const { secondsRemaining, isExpired } = useHoldCountdown(
    activeHold?.expiresAt,
  );

  const isHoldActive = activeHold !== null && activeHold.isLive && !isExpired;

  const timer =
    `${String(Math.floor(secondsRemaining / 60)).padStart(2, "0")}:` +
    `${String(secondsRemaining % 60).padStart(2, "0")}`;

  const updateActiveHold = useCallback((hold: SeatHold | null) => {
    activeHoldRef.current = hold;
    setActiveHold(hold);
  }, []);

  const clearSavedHold = useCallback(() => {
    if (userId) {
      clearHoldId(userId, session.id);
    }

    savedHoldIdRef.current = null;
  }, [userId, session.id]);

  const refreshSeatMap = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["session-seats", session.id],
    });
  }, [queryClient, session.id]);

  const resetToSeatSelection = useCallback(
    (message: string) => {
      clearSavedHold();
      updateActiveHold(null);
      setSelectedSeats([]);
      setHoldError(message);
      setPaymentError(null);
      setCheckoutErrors({});
      refreshSeatMap();
    },
    [clearSavedHold, updateActiveHold, refreshSeatMap],
  );

  // Restore an existing hold after a refresh.
  useEffect(() => {
    if (!userId || paidOrderRef.current) {
      restorationPendingRef.current = false;
      setIsRestoringHold(false);
      return;
    }

    const holdId = getSavedHoldId(userId, session.id);

    savedHoldIdRef.current = holdId;

    if (!holdId) {
      restorationPendingRef.current = false;
      setIsRestoringHold(false);
      setRestoreError(null);
      return;
    }

    let cancelled = false;

    restorationPendingRef.current = true;
    setIsRestoringHold(true);
    setRestoreError(null);

    const restore = async () => {
      try {
        const hold = await getSeatHold(holdId);

        if (cancelled) return;

        const notExpired = new Date(hold.expiresAt).getTime() > Date.now();

        if (hold.sessionId === session.id && hold.isLive && notExpired) {
          updateActiveHold(hold);
          setHoldError(null);
        } else {
          clearSavedHold();
          updateActiveHold(null);

          if (!hold.isLive || !notExpired) {
            setHoldError(
              "Your hold time expired. Please re-select your seats.",
            );
          }
        }
      } catch (error) {
        if (cancelled) return;

        const failure = error as ApiError;

        if (failure.status === 403 || failure.status === 404) {
          clearSavedHold();

          setHoldError("Your previous reservation is no longer accessible.");
        } else {
          setRestoreError(
            "We couldn't check your existing reservation. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          restorationPendingRef.current = false;
          setIsRestoringHold(false);
        }
      }
    };

    void restore();

    return () => {
      cancelled = true;
    };
  }, [userId, session.id, restoreAttempt, updateActiveHold, clearSavedHold]);

  // Expire the hold only when payment is not running.
  useEffect(() => {
    if (
      !activeHold ||
      !isExpired ||
      paymentPendingRef.current ||
      paidOrderRef.current
    ) {
      return;
    }

    resetToSeatSelection(
      "Your hold time expired. Please re-select your seats.",
    );
  }, [activeHold, isExpired, resetToSeatSelection]);

  const handleClose = useCallback(async () => {
    if (
      closingRef.current ||
      holdRequestPendingRef.current ||
      restorationPendingRef.current ||
      paymentPendingRef.current
    ) {
      return;
    }

    closingRef.current = true;
    setIsClosing(true);

    try {
      // A paid order has already consumed its hold.
      if (paidOrderRef.current) {
        onClose();
        return;
      }

      const hold = activeHoldRef.current;

      const holdId =
        hold?.holdId ??
        savedHoldIdRef.current ??
        (userId ? getSavedHoldId(userId, session.id) : null);

      if (holdId) {
        const expired =
          hold && new Date(hold.expiresAt).getTime() <= Date.now();

        if (!expired) {
          await releaseSeatHold(holdId);
        }

        clearSavedHold();
        updateActiveHold(null);
        refreshSeatMap();
      }

      onClose();
    } catch {
      setPaymentError("Could not release your reservation. Please try again.");
      setHoldError("Could not release your reservation. Please try again.");

      closingRef.current = false;
      setIsClosing(false);
    }
  }, [
    userId,
    session.id,
    onClose,
    clearSavedHold,
    updateActiveHold,
    refreshSeatMap,
  ]);

  // Escape closes through the same safe release handler.
  useEffect(() => {
    if (!userId) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        void handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", onKeyDown);
    };
  }, [userId, handleClose]);

  const removeSelectedSeat = useCallback((seatId: number) => {
    setSelectedSeats((previous) =>
      previous.filter((seat) => seat.seatId !== seatId),
    );

    setSeatError(null);
  }, []);

  const changeTicketType = (seatId: number, ticketTypeSlug: string) => {
    const type = filterOptions?.ticketTypes.find(
      (item) => item.slug === ticketTypeSlug,
    );

    if (!type) return;

    const minimumAge = movie.ageRating?.minAge;

    if (
      type.blockedFromRatingAge != null &&
      minimumAge != null &&
      minimumAge >= type.blockedFromRatingAge
    ) {
      setSeatError(`${type.name} tickets are not available for this movie.`);
      return;
    }

    setSelectedSeats((previous) =>
      previous.map((seat) =>
        seat.seatId === seatId
          ? {
              ...seat,
              ticketTypeSlug,
            }
          : seat,
      ),
    );

    setSeatError(null);
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.state !== "available") return;

    const alreadySelected = selectedSeats.some(
      (item) => item.seatId === seat.id,
    );

    if (alreadySelected) {
      removeSelectedSeat(seat.id);
      return;
    }

    if (maxSeats === undefined) {
      setSeatError("Seat selection is temporarily unavailable.");
      return;
    }

    if (selectedSeats.length >= maxSeats) {
      setSeatError(`You can select a maximum of ${maxSeats} seats.`);
      return;
    }

    setSelectedSeats((previous) => [
      ...previous,
      {
        seatId: seat.id,
        code: seat.code,
        ticketTypeSlug: "adult",
      },
    ]);

    setSeatError(null);
  };

  const holdMutation = useMutation({
    mutationFn: () =>
      createSeatHold(session.id, {
        seats: selectedSeats.map((seat) => ({
          seatId: seat.seatId,
          ticketType: seat.ticketTypeSlug,
        })),
      }),

    onMutate: () => {
      holdRequestPendingRef.current = true;
    },

    onSuccess: (hold) => {
      updateActiveHold(hold);
      setHoldError(null);
      setSeatError(null);

      if (userId) {
        saveHoldId(userId, session.id, hold.holdId);

        savedHoldIdRef.current = hold.holdId;
      }

      refreshSeatMap();
    },

    onError: (error: ApiError) => {
      if (error.status === 409) {
        const contested = error.contested ?? [];

        if (contested.length) {
          const codes = new Set(contested);

          setSelectedSeats((previous) =>
            previous.filter((seat) => !codes.has(seat.code)),
          );
        }

        setHoldError(
          contested.length
            ? `Seats ${contested.join(", ")} are no longer available. Please select different seats.`
            : "Some selected seats are no longer available. Please review your selection.",
        );
      } else {
        setHoldError(error.message || "Could not reserve your seats.");
      }

      refreshSeatMap();
    },

    onSettled: () => {
      holdRequestPendingRef.current = false;
    },
  });

  const handleCheckout = () => {
    if (
      !userId ||
      isRestoringHold ||
      restoreError ||
      isClosing ||
      holdMutation.isPending ||
      holdRequestPendingRef.current ||
      isHoldActive
    ) {
      return;
    }

    if (!eligibility.allowed) {
      setHoldError(eligibility.reason);
      return;
    }

    if (selectedSeats.length === 0) {
      setHoldError("Please select at least one seat.");
      return;
    }

    if (
      maxSeats === undefined ||
      selectedSeats.length > maxSeats ||
      !filterOptions?.ticketTypes.length
    ) {
      setHoldError("Booking settings are not available.");
      return;
    }

    for (const seat of selectedSeats) {
      const ticketType = filterOptions.ticketTypes.find(
        (type) => type.slug === seat.ticketTypeSlug,
      );

      if (!ticketType) {
        setHoldError(`Seat ${seat.code}: please select a valid ticket type.`);
        return;
      }

      if (
        ticketType.blockedFromRatingAge != null &&
        movie.ageRating?.minAge != null &&
        movie.ageRating.minAge >= ticketType.blockedFromRatingAge
      ) {
        setHoldError(
          `Seat ${seat.code}: ${ticketType.name} tickets are not available for this movie.`,
        );
        return;
      }
    }

    setHoldError(null);
    holdMutation.mutate();
  };

  const profile = user as
    | (typeof user & {
        fullName?: string;
        name?: string;
        email?: string;
        mobileNumber?: string;
        phone?: string;
      })
    | null;

  const initialContact = {
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    mobileNumber: user?.mobileNumber ?? "",
  };

  const effectiveCheckoutDetails: CheckoutDetails = {
    fullName: checkoutDetails?.fullName ?? initialContact.fullName,
    email: checkoutDetails?.email ?? initialContact.email,
    mobileNumber: checkoutDetails?.mobileNumber ?? initialContact.mobileNumber,
    cardNumber: checkoutDetails?.cardNumber ?? "",
    expiry: checkoutDetails?.expiry ?? "",
    cvv: checkoutDetails?.cvv ?? "",
  };

  const orderMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),

    onMutate: () => {
      paymentPendingRef.current = true;
    },

    onSuccess: (order) => {
      paidOrderRef.current = true;
      setPaidOrder(order);

      setPaymentError(null);
      setCheckoutErrors({});

      clearSavedHold();
      updateActiveHold(null);

      refreshSeatMap();
    },

    onError: (error: ApiError) => {
      if (error.status === 422 && error.errors) {
        const fieldErrors: CheckoutFieldErrors = {};

        for (const [field, messages] of Object.entries(error.errors)) {
          if (field in checkoutSchema.shape) {
            fieldErrors[field as keyof CheckoutDetails] = messages[0];
          }
        }

        setCheckoutErrors(fieldErrors);
        setPaymentError(null);
        return;
      }

      if (error.status === 422) {
        resetToSeatSelection(
          "Your hold time expired. Please re-select your seats.",
        );
        return;
      }

      if (error.status === 409) {
        const contested = error.contested ?? [];

        resetToSeatSelection(
          contested.length
            ? `Seats ${contested.join(", ")} are no longer available. Please select different seats.`
            : "Some selected seats are no longer available. Please select again.",
        );

        return;
      }

      if (error.status === 403) {
        setPaymentError("This reservation belongs to another account.");
        return;
      }

      if (error.status === 401) {
        setPaymentError(
          "Your session expired. Please log in again before completing payment.",
        );
        return;
      }

      setPaymentError(error.message || "Payment failed. Please try again.");
    },

    onSettled: () => {
      paymentPendingRef.current = false;
    },
  });

  const handlePayment = () => {
    if (
      !activeHold ||
      !isHoldActive ||
      !userId ||
      !eligibility.allowed ||
      paymentPendingRef.current ||
      orderMutation.isPending ||
      paidOrderRef.current ||
      closingRef.current
    ) {
      return;
    }

    const result = checkoutSchema.safeParse(effectiveCheckoutDetails);

    if (!result.success) {
      const errors: CheckoutFieldErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CheckoutDetails;

        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }

      setCheckoutErrors(errors);
      return;
    }

    setCheckoutErrors({});
    setPaymentError(null);

    paymentPendingRef.current = true;

    orderMutation.mutate({
      ...result.data,
      holdId: activeHold.holdId,
    });
  };

  const handleCheckoutDetailsChange = (details: CheckoutDetails) => {
    setCheckoutDetails(details);

    // Clear field errors when the edited value becomes valid.
    setCheckoutErrors((previous) => {
      const next = { ...previous };

      for (const field of Object.keys(next) as (keyof CheckoutDetails)[]) {
        const schema = checkoutSchema.shape[field];

        if (schema.safeParse(details[field]).success) {
          delete next[field];
        }
      }

      return next;
    });
  };

  const canPay =
    isHoldActive &&
    checkoutSchema.safeParse(effectiveCheckoutDetails).success &&
    !orderMutation.isPending &&
    eligibility.allowed &&
    !isClosing;

  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          void handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="flex max-h-[95dvh] w-full max-w-[1150px] flex-col overflow-hidden rounded-[24px] bg-[#090d1c] text-white shadow-2xl"
      >
        {!paidOrder && (
          <header className="flex shrink-0 items-start justify-between gap-4 px-6 pb-5 pt-6 sm:px-8">
            <div className="min-w-0">
              <h2
                id="booking-title"
                className="text-lg font-extrabold uppercase sm:text-xl"
              >
                {movie.title}
              </h2>

              <p className="mt-1.5 text-xs text-white/50">
                {session.venue.name}
                {" · "}Hall {session.hall.name}
                {" · "}
                {session.date}
                {" · "}
                {session.time}
                {" · "}
                {session.format.name}
                {" · "}
                {session.language.code}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {isHoldActive && (
                <div className="rounded-xl bg-[#202235] px-4 py-2 text-center">
                  <p className="text-[10px] uppercase text-white/55">
                    Seats held
                  </p>

                  <p className="text-sm font-bold tabular-nums">{timer}</p>
                </div>
              )}

              <button
                type="button"
                aria-label="Close booking"
                disabled={isClosing || orderMutation.isPending}
                onClick={() => void handleClose()}
                className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <X size={19} />
              </button>
            </div>
          </header>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 sm:px-8">
          {paidOrder ? (
            <OrderConfirmation order={paidOrder} onClose={onClose} />
          ) : isRestoringHold ? (
            <div
              role="status"
              className="flex min-h-[360px] items-center justify-center text-sm text-white/60"
            >
              Checking your existing reservation...
            </div>
          ) : restoreError ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
              <p role="alert" className="text-sm text-red-400">
                {restoreError}
              </p>

              <button
                type="button"
                onClick={() => setRestoreAttempt((previous) => previous + 1)}
                className="rounded-full bg-[#f12d17] px-5 py-3 text-sm font-bold"
              >
                Retry restoration
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_285px]">
              <div className="min-w-0">
                <div className="mb-6 flex h-8 overflow-hidden rounded-full bg-[#202235] text-[11px] font-bold uppercase">
                  <div
                    className={`flex w-1/2 items-center justify-center rounded-full transition-colors ${
                      isHoldActive ? "text-white/60" : "bg-[#f12d17] text-white"
                    }`}
                  >
                    Seats
                  </div>

                  <div
                    className={`flex w-1/2 items-center justify-center rounded-full transition-colors ${
                      isHoldActive ? "bg-[#f12d17] text-white" : "text-white/60"
                    }`}
                  >
                    Checkout
                  </div>
                </div>

                {isHoldActive && activeHold ? (
                  <CheckoutForm
                    initialContact={initialContact}
                    onChange={handleCheckoutDetailsChange}
                    errors={checkoutErrors}
                  />
                ) : (
                  <section aria-label="Choose your seats">
                    {isSeatMapLoading && !seatMap && (
                      <p
                        role="status"
                        className="py-20 text-center text-sm text-white/50"
                      >
                        Loading available seats...
                      </p>
                    )}

                    {isSeatMapError && (
                      <div className="py-20 text-center">
                        <p className="mb-4 text-sm text-red-400">
                          Failed to load the seat map.
                        </p>

                        <button
                          type="button"
                          onClick={() => void refetchSeatMap()}
                          className="rounded-lg bg-white/10 px-4 py-2 text-sm"
                        >
                          Try again
                        </button>
                      </div>
                    )}

                    {!isSeatMapError && seatMap && (
                      <SeatMap
                        seatMap={seatMap}
                        selectedSeats={selectedSeats}
                        onSeatClick={handleSeatClick}
                      />
                    )}

                    {isFilterOptionsError && !seatError && (
                      <p
                        role="alert"
                        className="mt-4 text-center text-xs text-red-400"
                      >
                        Booking settings could not be loaded.
                      </p>
                    )}

                    {seatError && (
                      <p
                        role="alert"
                        className="mt-4 text-center text-xs text-red-400"
                      >
                        {seatError}
                      </p>
                    )}
                  </section>
                )}
              </div>

              {isHoldActive && activeHold ? (
                <CheckoutSummary
                  movie={movie}
                  session={session}
                  hold={activeHold}
                  onPay={handlePayment}
                  canPay={canPay}
                  isPaying={orderMutation.isPending}
                  paymentError={paymentError}
                />
              ) : (
                <div className="border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                  {!eligibility.allowed && (
                    <p
                      role="alert"
                      className="mb-3 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-400"
                    >
                      {eligibility.reason}
                    </p>
                  )}
                  <BookingSummary
                    selectedSeats={selectedSeats}
                    ticketTypes={filterOptions?.ticketTypes ?? []}
                    basePrice={session.price}
                    maxSeats={maxSeats}
                    movieMinimumAge={movie.ageRating?.minAge}
                    onRemoveSeat={removeSelectedSeat}
                    onChangeTicketType={changeTicketType}
                    onCheckout={handleCheckout}
                    isCheckoutPending={holdMutation.isPending}
                    checkoutError={holdError}
                    canProceed={eligibility.allowed}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
