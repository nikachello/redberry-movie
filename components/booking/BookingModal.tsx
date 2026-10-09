"use client";

import { useCallback, useEffect, useState } from "react";
import { Armchair, CheckCircle2, Clock3, CreditCard, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { MovieDetail } from "@/types/movie";
import type { Seat, Session } from "@/types/session";
import type { SeatHold, SelectedSeat } from "@/types/booking";

import { getSessionSeats } from "@/lib/api/sessions";
import { createSeatHold } from "@/lib/api/bookings";
import { useFilterOptions } from "@/lib/queries/filter-options";
import { useHoldCountdown } from "@/lib/hooks/useHoldCountdown";

import SeatMap from "./SeatMap";
import BookingSummary from "./BookingSummary";

type Props = {
  movie: MovieDetail;
  session: Session;
  onClose: () => void;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export default function BookingModal({ movie, session, onClose }: Props) {
  const queryClient = useQueryClient();

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [seatError, setSeatError] = useState<string | null>(null);

  const [activeHold, setActiveHold] = useState<SeatHold | null>(null);
  const [holdError, setHoldError] = useState<string | null>(null);

  const {
    data: seatMap,
    isPending: isSeatMapLoading,
    isError: isSeatMapError,
    refetch: refetchSeatMap,
  } = useQuery({
    queryKey: ["session-seats", session.id],
    queryFn: () => getSessionSeats(session.id),
    refetchOnMount: "always",
    staleTime: 0,
  });

  const { data: filterOptions, isError: isFilterOptionsError } =
    useFilterOptions();

  const maxSeats = filterOptions?.maxSeatsPerOrder;

  const { secondsRemaining, isExpired } = useHoldCountdown(
    activeHold?.expiresAt,
  );

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isHoldActive = activeHold !== null && !isExpired;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (!activeHold || !isExpired) return;

    setActiveHold(null);
    setSelectedSeats([]);
    setHoldError("Your reservation expired. Please select your seats again.");

    queryClient.invalidateQueries({
      queryKey: ["session-seats", session.id],
    });
  }, [activeHold, isExpired, queryClient, session.id]);

  const removeSelectedSeat = useCallback((seatId: number) => {
    setSelectedSeats((previous) =>
      previous.filter((seat) => seat.seatId !== seatId),
    );

    setSeatError(null);
  }, []);

  const changeTicketType = (seatId: number, ticketTypeSlug: string) => {
    const ticketType = filterOptions?.ticketTypes.find(
      (type) => type.slug === ticketTypeSlug,
    );

    if (!ticketType) return;

    const minimumAge = movie.ageRating?.minAge;

    if (
      ticketType.blockedFromRatingAge != null &&
      minimumAge != null &&
      minimumAge >= ticketType.blockedFromRatingAge
    ) {
      setSeatError(
        `${ticketType.name} tickets are not available for this movie.`,
      );
      return;
    }

    setSelectedSeats((previous) =>
      previous.map((seat) =>
        seat.seatId === seatId ? { ...seat, ticketTypeSlug } : seat,
      ),
    );

    setSeatError(null);
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.state !== "available") return;

    const isSelected = selectedSeats.some((item) => item.seatId === seat.id);

    if (isSelected) {
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

    const newSeat: SelectedSeat = {
      seatId: seat.id,
      code: seat.code,
      ticketTypeSlug: "adult",
    };

    setSelectedSeats((previous) => [...previous, newSeat]);
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

    onSuccess: (hold) => {
      setActiveHold(hold);
      setHoldError(null);
      setSeatError(null);

      queryClient.invalidateQueries({
        queryKey: ["session-seats", session.id],
      });
    },

    onError: (error: Error) => {
      setHoldError(error.message || "Could not reserve your seats.");

      queryClient.invalidateQueries({
        queryKey: ["session-seats", session.id],
      });
    },
  });

  const handleCheckout = () => {
    if (holdMutation.isPending || isHoldActive) return;

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

    setHoldError(null);
    holdMutation.mutate();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="flex max-h-[95dvh] w-full max-w-[1150px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080d20] text-white shadow-2xl"
      >
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ff321c]">
              Book tickets
            </p>

            <h2 id="booking-title" className="text-xl font-bold sm:text-2xl">
              {movie.title}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/50">
              <span>{session.venue.name}</span>
              <span aria-hidden="true">•</span>
              <span>Hall {session.hall.name}</span>
              <span aria-hidden="true">•</span>
              <span>
                {session.date} at {session.time}
              </span>
              <span aria-hidden="true">•</span>
              <span>{session.format.name}</span>
              <span aria-hidden="true">•</span>
              <span>{session.language.code}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking"
            className="shrink-0 cursor-pointer rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff321c]"
          >
            <X size={20} />
          </button>
        </header>

        {/* Booking steps and timer */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-4 sm:gap-6">
            <div
              className={`flex items-center gap-2 ${
                isHoldActive ? "text-white/35" : "text-[#ff321c]"
              }`}
            >
              <Armchair size={17} />
              <span className="text-xs font-bold uppercase">1. Seats</span>
            </div>

            <div className="h-px w-10 bg-white/15 sm:w-14" />

            <div
              className={`flex items-center gap-2 ${
                isHoldActive ? "text-[#ff321c]" : "text-white/35"
              }`}
            >
              <CreditCard size={17} />
              <span className="text-xs font-bold uppercase">2. Checkout</span>
            </div>
          </div>

          {isHoldActive && (
            <div
              role="timer"
              aria-label={`${minutes} minutes and ${seconds} seconds remaining`}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                secondsRemaining <= 60
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-white/10 bg-white/5 text-white"
              }`}
            >
              <Clock3 size={16} />

              <span className="text-xs font-medium">
                Reservation expires in
              </span>

              <span className="text-sm font-bold tabular-nums">
                {formattedTime}
              </span>
            </div>
          )}
        </div>

        {/* Modal body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-7 sm:py-8">
          {isHoldActive && activeHold ? (
            /* Confirmed hold / checkout */
            <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-[#171c30] p-5 sm:p-7">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 size={23} className="text-green-400" />
                </div>

                <div>
                  <h3 className="text-lg font-bold">Seats reserved!</h3>

                  <p className="mt-1 text-xs leading-relaxed text-white/50">
                    Your seats are temporarily reserved. Complete checkout
                    before the timer expires.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#101528] p-4">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">
                  Reservation details
                </p>

                <div className="space-y-4">
                  {activeHold.seats.map((seat) => (
                    <div
                      key={seat.seatId}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <Armchair size={17} className="text-[#ff321c]" />

                        <div>
                          <p className="text-sm font-semibold">
                            Seat {seat.code}
                          </p>

                          <p className="mt-1 text-xs text-white/45">
                            {seat.ticketType.name}
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-semibold tabular-nums">
                        ₾{formatPrice(seat.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-sm text-white/60">Total</span>

                <span className="text-2xl font-bold tabular-nums">
                  ₾{formatPrice(activeHold.subtotal)}
                </span>
              </div>

              <div className="mt-6 rounded-lg border border-[#ff321c]/20 bg-[#ff321c]/5 p-4">
                <div className="flex items-center gap-2 text-[#ff321c]">
                  <Clock3 size={16} />

                  <span className="text-xs font-semibold">
                    Time remaining: {formattedTime}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-white/50">
                  Your reservation will expire automatically when the countdown
                  reaches zero.
                </p>
              </div>

              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-lg bg-[#ff321c] px-5 py-3.5 text-xs font-bold text-white opacity-40"
              >
                Continue to payment
              </button>

              <p className="mt-3 text-center text-[11px] text-white/35">
                Payment integration is coming next.
              </p>
            </div>
          ) : (
            /* Seat selection */
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
              <section
                aria-label="Choose your seats"
                className="min-w-0 rounded-xl border border-white/5 bg-[#101528] p-4 sm:p-6"
              >
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-bold">Select your seats</h3>

                  <span className="text-xs text-white/45">
                    {selectedSeats.length}
                    {maxSeats !== undefined ? ` / ${maxSeats}` : ""} selected
                  </span>
                </div>

                {isSeatMapLoading && !seatMap && (
                  <div
                    role="status"
                    className="flex min-h-[350px] items-center justify-center"
                  >
                    <p className="text-sm text-white/50">
                      Loading available seats...
                    </p>
                  </div>
                )}

                {isSeatMapError && (
                  <div className="flex min-h-[350px] flex-col items-center justify-center gap-4">
                    <p className="text-sm text-red-400">
                      Failed to load the seat map.
                    </p>

                    <button
                      type="button"
                      onClick={() => refetchSeatMap()}
                      className="cursor-pointer rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
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
                    className="mt-5 text-center text-xs text-red-400"
                  >
                    Booking settings could not be loaded. Please try again
                    later.
                  </p>
                )}

                {seatError && (
                  <p
                    role="alert"
                    className="mt-5 text-center text-xs font-medium text-red-400"
                  >
                    {seatError}
                  </p>
                )}
              </section>

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
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
