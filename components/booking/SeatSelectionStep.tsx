"use client";

import { useState } from "react";
import { useFilterOptions } from "@/lib/queries/filter-options";
import { useSessionSeats } from "@/lib/queries/bookings";
import {
  isTicketTypeAllowed,
  validateSelection,
} from "@/lib/booking/selection";
import type { SelectedSeat } from "@/types/booking";
import type { Seat, Session } from "@/types/session";
import type { MovieDetail } from "@/types/movie";
import SeatMap from "./SeatMap";
import BookingSummary from "./BookingSummary";

type Props = {
  movie: MovieDetail;
  session: Session;
  userId: number;
  eligibility: { allowed: boolean; reason: string | null };
  isReserving: boolean;
  error: string | null;
  onReserve: (seats: SelectedSeat[]) => Promise<string[]>;
};

export default function SeatSelectionStep({
  movie,
  session,
  userId,
  eligibility,
  isReserving,
  error,
  onReserve,
}: Props) {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [seatError, setSeatError] = useState<string | null>(null);
  const {
    data: seatMap,
    isPending,
    isError,
    refetch,
  } = useSessionSeats(session.id, userId);
  const { data: options, isError: isOptionsError } = useFilterOptions();
  const ticketTypes = options?.ticketTypes ?? [];
  const maxSeats = options?.maxSeatsPerOrder;
  const minimumAge = movie.ageRating?.minAge;

  const removeSeat = (seatId: number) => {
    if (isReserving) return;
    setSelectedSeats((seats) => seats.filter((seat) => seat.seatId !== seatId));
    setSeatError(null);
  };
  const selectSeat = (seat: Seat) => {
    if (isReserving || seat.state !== "available") return;
    if (selectedSeats.some((selected) => selected.seatId === seat.id)) {
      removeSeat(seat.id);
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
    const defaultType =
      ticketTypes.find(
        (type) =>
          type.slug === "adult" && isTicketTypeAllowed(type, minimumAge),
      ) ?? ticketTypes.find((type) => isTicketTypeAllowed(type, minimumAge));
    if (!defaultType) {
      setSeatError("No ticket types are available for this movie.");
      return;
    }
    setSelectedSeats((seats) => [
      ...seats,
      { seatId: seat.id, code: seat.code, ticketTypeSlug: defaultType.slug },
    ]);
    setSeatError(null);
  };
  const changeTicketType = (seatId: number, slug: string) => {
    if (isReserving) return;
    const type = ticketTypes.find((item) => item.slug === slug);
    if (!type) return;
    if (!isTicketTypeAllowed(type, minimumAge)) {
      setSeatError(`${type.name} tickets are not available for this movie.`);
      return;
    }
    setSelectedSeats((seats) =>
      seats.map((seat) =>
        seat.seatId === seatId ? { ...seat, ticketTypeSlug: slug } : seat,
      ),
    );
    setSeatError(null);
  };
  const checkout = async () => {
    if (isReserving || !eligibility.allowed) return;
    const validationError = validateSelection(
      selectedSeats,
      ticketTypes,
      maxSeats,
      minimumAge,
    );
    if (validationError) {
      setSeatError(validationError);
      return;
    }
    setSeatError(null);
    const contested = new Set(await onReserve(selectedSeats));
    if (contested.size)
      setSelectedSeats((seats) =>
        seats.filter((seat) => !contested.has(seat.code)),
      );
  };

  return (
    <fieldset
      disabled={isReserving}
      className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_285px]"
    >
      <section aria-label="Choose your seats" className="min-w-0">
        {isPending && !seatMap && (
          <p role="status" className="py-20 text-center text-sm text-white/50">
            Loading available seats...
          </p>
        )}
        {isError && (
          <div className="py-20 text-center">
            <p role="alert" className="mb-4 text-sm text-red-400">
              Failed to load the seat map.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm"
            >
              Try again
            </button>
          </div>
        )}
        {!isError && seatMap && (
          <SeatMap
            seatMap={seatMap}
            selectedSeats={selectedSeats}
            onSeatClick={selectSeat}
          />
        )}
        {isOptionsError && !seatError && (
          <p role="alert" className="mt-4 text-center text-xs text-red-400">
            Booking settings could not be loaded.
          </p>
        )}
        {seatError && (
          <p role="alert" className="mt-4 text-center text-xs text-red-400">
            {seatError}
          </p>
        )}
      </section>
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
          ticketTypes={ticketTypes}
          basePrice={session.price}
          maxSeats={maxSeats}
          movieMinimumAge={minimumAge}
          onRemoveSeat={removeSeat}
          onChangeTicketType={changeTicketType}
          onCheckout={() => void checkout()}
          isCheckoutPending={isReserving}
          checkoutError={error}
          canProceed={eligibility.allowed && maxSeats !== undefined && !isError}
        />
      </div>
    </fieldset>
  );
}
