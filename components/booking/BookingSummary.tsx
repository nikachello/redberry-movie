"use client";

import { Armchair, X } from "lucide-react";
import type { SelectedSeat } from "@/types/booking";
import { TicketType } from "@/types/order";

type Props = {
  selectedSeats: SelectedSeat[];
  ticketTypes: TicketType[];
  basePrice: number;
  maxSeats?: number;
  movieMinimumAge?: number;
  onRemoveSeat: (seatId: number) => void;
  onChangeTicketType: (seatId: number, ticketTypeSlug: string) => void;
  onCheckout: () => void;
  isCheckoutPending: boolean;
  checkoutError: string | null;
  canProceed?: boolean;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(price);
}

export default function BookingSummary({
  selectedSeats,
  ticketTypes,
  basePrice,
  maxSeats,
  movieMinimumAge,
  onRemoveSeat,
  onChangeTicketType,
  onCheckout,
  isCheckoutPending,
  checkoutError,
  canProceed = true,
}: Props) {
  const isTicketTypeAllowed = (type: TicketType) =>
    type.blockedFromRatingAge == null ||
    movieMinimumAge == null ||
    movieMinimumAge < type.blockedFromRatingAge;

  const getTicketType = (slug: string) =>
    ticketTypes.find((type) => type.slug === slug);

  const getTicketPrice = (slug: string) => {
    const type = getTicketType(slug);

    return type ? basePrice * type.priceRatio : 0;
  };

  const hasInvalidSelection = selectedSeats.some((seat) => {
    const type = getTicketType(seat.ticketTypeSlug);

    return !type || !isTicketTypeAllowed(type);
  });

  const total = selectedSeats.reduce(
    (sum, seat) => sum + getTicketPrice(seat.ticketTypeSlug),
    0,
  );

  return (
    <aside className="flex min-h-[350px] flex-col text-white">
      <h3 className="mb-3 text-sm font-bold">
        Your seats · Max {maxSeats ?? "—"}
      </h3>

      {selectedSeats.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
          <Armchair size={25} className="text-white/30" />

          <p className="text-xs text-white/45">No seats selected yet.</p>

          <p className="text-[11px] text-white/30">
            Choose a seat from the map to get started.
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-2.5">
          {selectedSeats.map((seat) => (
            <div key={seat.seatId} className="rounded-xl bg-[#202235] p-3">
              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/50">Seat</span>

                  <span className="font-semibold">{seat.code}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold tabular-nums">
                    ₾{formatPrice(getTicketPrice(seat.ticketTypeSlug))}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemoveSeat(seat.seatId)}
                    aria-label={`Remove seat ${seat.code}`}
                    className="cursor-pointer text-white/40 transition hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div
                className="mt-3 grid grid-cols-3 gap-1.5"
                role="group"
                aria-label={`Ticket type for seat ${seat.code}`}
              >
                {ticketTypes.map((type) => {
                  const allowed = isTicketTypeAllowed(type);

                  const active = seat.ticketTypeSlug === type.slug;

                  const percentage = Math.round(type.priceRatio * 100);

                  return (
                    <button
                      key={type.id}
                      type="button"
                      disabled={!allowed}
                      onClick={() => onChangeTicketType(seat.seatId, type.slug)}
                      aria-pressed={active}
                      title={
                        !allowed
                          ? (type.note ??
                            `Not available for movies rated ${movieMinimumAge}+.`)
                          : (type.note ?? undefined)
                      }
                      className={`min-w-0 rounded-full px-1.5 py-2 text-[10px] font-medium whitespace-nowrap transition-colors ${
                        active
                          ? "bg-[#f12d17] text-white"
                          : "bg-[#2d2f43] text-white/80 hover:bg-[#393b52]"
                      } ${
                        !allowed
                          ? "cursor-not-allowed opacity-35"
                          : "cursor-pointer"
                      }`}
                    >
                      {type.name} {percentage}%
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 pt-2">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase">Subtotal</span>

          <span className="text-2xl font-bold tabular-nums">
            ₾ {formatPrice(total)}
          </span>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          disabled={
            !canProceed ||
            selectedSeats.length === 0 ||
            ticketTypes.length === 0 ||
            hasInvalidSelection ||
            isCheckoutPending ||
            (maxSeats !== undefined && selectedSeats.length > maxSeats)
          }
          className="w-full cursor-pointer rounded-full bg-[#f12d17] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#d92815] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isCheckoutPending ? "Reserving seats..." : "Next: Checkout"}
        </button>

        {hasInvalidSelection && (
          <p role="alert" className="mt-3 text-xs text-red-400">
            One or more selected ticket types are not allowed for this movie.
          </p>
        )}

        {checkoutError && (
          <p role="alert" className="mt-3 text-xs text-red-400">
            {checkoutError}
          </p>
        )}
      </div>
    </aside>
  );
}
