"use client";

import type { SelectedSeat } from "@/types/booking";
import type { Seat, SeatMap as SeatMapType } from "@/types/session";

type Props = {
  seatMap: SeatMapType;
  selectedSeats: SelectedSeat[];
  onSeatClick: (seat: Seat) => void;
};

export default function SeatMap({
  seatMap,
  selectedSeats,
  onSeatClick,
}: Props) {
  const selectedSeatIds = new Set(selectedSeats.map((seat) => seat.seatId));

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="mx-auto w-max min-w-full">
        <div className="mx-auto mb-10 w-full max-w-[500px]">
          <div className="h-2 rounded-t-[50%] bg-white/35 shadow-[0_0_20px_rgba(255,255,255,0.12)]" />

          <p className="mt-3 text-center text-[10px] font-semibold tracking-[0.3em] text-white/40">
            SCREEN
          </p>
        </div>

        <div className="space-y-8">
          {seatMap.sections.map((section, sectionIndex) => (
            <div
              key={`${section.name}-${sectionIndex}`}
              className="flex flex-col items-center gap-3"
            >
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/40">
                {section.name}
              </p>

              {section.rows.map((row, rowIndex) => (
                <div
                  key={`${sectionIndex}-${row.label}-${rowIndex}`}
                  className="flex items-center gap-3"
                >
                  <span className="w-5 shrink-0 text-center text-xs font-bold text-white/50">
                    {row.label}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {row.seats.map((seat) => {
                      const isSelected = selectedSeatIds.has(seat.id);

                      const isAvailable = seat.state === "available";

                      const seatStyle = isSelected
                        ? "cursor-pointer bg-[#ff321c] text-white hover:bg-[#e52d19]"
                        : isAvailable
                          ? "cursor-pointer bg-[#343b50] text-white hover:bg-[#ff321c]"
                          : seat.state === "sold"
                            ? "cursor-not-allowed bg-white/10 text-white/20"
                            : seat.isMine
                              ? "cursor-not-allowed bg-[#ff321c]/40 text-white"
                              : "cursor-not-allowed bg-yellow-600/30 text-yellow-200/60";

                      return (
                        <div
                          key={seat.id}
                          className="flex items-center gap-1.5"
                        >
                          {seat.state === "unavailable" ? (
                            <div
                              aria-hidden="true"
                              className="h-8 w-8 shrink-0"
                            />
                          ) : (
                            <button
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => onSeatClick(seat)}
                              aria-label={`Seat ${seat.code}, ${
                                isSelected
                                  ? "selected"
                                  : seat.state === "available"
                                    ? "available"
                                    : seat.state === "sold"
                                      ? "sold"
                                      : seat.isMine
                                        ? "held by you"
                                        : "held"
                              }`}
                              aria-pressed={
                                isAvailable ? isSelected : undefined
                              }
                              title={`Seat ${seat.code}`}
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${seatStyle}`}
                            >
                              {seat.label}
                            </button>
                          )}

                          {seat.aisleAfter && (
                            <div aria-hidden="true" className="w-5 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <span className="w-5 shrink-0 text-center text-xs font-bold text-white/50">
                    {row.label}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-3 border-t border-white/10 pt-6">
          {[
            {
              label: "Available",
              color: "bg-[#343b50]",
            },
            {
              label: "Selected",
              color: "bg-[#ff321c]",
            },
            {
              label: "Sold",
              color: "bg-white/10",
            },
            {
              label: "Held",
              color: "bg-yellow-600/30",
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-sm ${item.color}`} />

              <span className="text-[10px] text-white/50">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
