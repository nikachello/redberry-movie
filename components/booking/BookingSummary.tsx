"use client";

import { Armchair, X } from "lucide-react";

import type { SelectedSeat } from "@/types/booking";

type TicketType = {
  id: number;
  slug: string;
  name: string;
  priceRatio: number;
  note?: string | null;
  blockedFromRatingAge?: number | null;
};

type Props = {
  selectedSeats: SelectedSeat[];
  ticketTypes: TicketType[];
  basePrice: number;
  maxSeats?: number;
  movieMinimumAge?: number;
  onRemoveSeat: (seatId: number) => void;
  onChangeTicketType: (seatId: number, ticketTypeSlug: string) => void;
};

export default function BookingSummary({
  selectedSeats,
  ticketTypes,
  basePrice,
  maxSeats,
  movieMinimumAge,
  onRemoveSeat,
  onChangeTicketType,
}: Props) {
  const isTicketTypeAllowed = (ticketType: TicketType) => {
    if (ticketType.blockedFromRatingAge == null || movieMinimumAge == null) {
      return true;
    }

    return movieMinimumAge < ticketType.blockedFromRatingAge;
  };

  const getTicketPrice = (ticketTypeSlug: string) => {
    const ticketType = ticketTypes.find((type) => type.slug === ticketTypeSlug);

    if (!ticketType) return 0;

    return basePrice * ticketType.priceRatio;
  };

  const total = selectedSeats.reduce(
    (sum, seat) => sum + getTicketPrice(seat.ticketTypeSlug),
    0,
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);

  return (
    <aside className="flex min-h-[420px] flex-col rounded-xl border border-white/5 bg-[#171c30] p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold">Your selection</h3>

        {maxSeats !== undefined && (
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/60">
            {selectedSeats.length}/{maxSeats}
          </span>
        )}
      </div>

      {selectedSeats.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <Armchair size={22} className="text-white/30" />
          </div>

          <p className="text-xs text-white/45">No seats selected yet.</p>

          <p className="max-w-[190px] text-[11px] leading-relaxed text-white/30">
            Choose an available seat from the map to get started.
          </p>
        </div>
      ) : (
        <div className="mt-5 flex-1 space-y-3">
          {selectedSeats.map((seat) => (
            <div
              key={seat.seatId}
              className="rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ff321c]/10">
                    <Armchair size={16} className="text-[#ff321c]" />
                  </div>

                  <span className="text-sm font-semibold">
                    Seat {seat.code}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveSeat(seat.seatId)}
                  aria-label={`Remove seat ${seat.code}`}
                  className="cursor-pointer rounded-md p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <select
                  aria-label={`Ticket type for seat ${seat.code}`}
                  value={seat.ticketTypeSlug}
                  onChange={(event) =>
                    onChangeTicketType(seat.seatId, event.target.value)
                  }
                  className="min-w-0 flex-1 cursor-pointer rounded-md border border-white/10 bg-[#101528] px-3 py-2 text-xs text-white outline-none focus:border-[#ff321c]"
                >
                  {ticketTypes.map((type) => (
                    <option
                      key={type.id}
                      value={type.slug}
                      disabled={!isTicketTypeAllowed(type)}
                    >
                      {type.name}
                    </option>
                  ))}
                </select>

                <span className="shrink-0 text-xs font-bold tabular-nums">
                  ₾{formatPrice(getTicketPrice(seat.ticketTypeSlug))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">Estimated total</span>

          <span className="text-xl font-bold tabular-nums">
            ₾{formatPrice(total)}
          </span>
        </div>

        <button
          type="button"
          disabled
          className="mt-5 w-full cursor-not-allowed rounded-lg bg-[#ff321c] px-5 py-3.5 text-xs font-bold text-white opacity-40"
        >
          Next: Checkout
        </button>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-white/35">
          {selectedSeats.length === 0
            ? "Select your seats to continue."
            : "Seat reservation and checkout are coming next."}
        </p>
      </div>
    </aside>
  );
}
