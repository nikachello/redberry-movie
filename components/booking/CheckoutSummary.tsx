import type { MovieDetail } from "@/types/movie";
import type { Session } from "@/types/session";
import type { SeatHold } from "@/types/booking";

type Props = {
  movie: MovieDetail;
  session: Session;
  hold: SeatHold;
  canPay: boolean;
  isPaying: boolean;
  paymentError?: string | null;
};

export default function CheckoutSummary({
  movie,
  session,
  hold,
  canPay,
  isPaying,
  paymentError,
}: Props) {
  const types = new Map<string, number>();

  for (const seat of hold.seats) {
    const name = seat.ticketType.name;

    types.set(name, (types.get(name) ?? 0) + 1);
  }

  return (
    <aside className="flex min-h-full flex-col border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
      <h3 className="mb-3 text-sm font-bold">Summary</h3>

      <div className="rounded-xl bg-[#202235] p-4">
        <p className="text-sm font-bold">{movie.title}</p>

        <p className="mt-2 text-xs text-white/45">
          Hall {session.hall.name} · {session.date} · {session.time}
        </p>

        <div className="my-3 border-t border-white/10" />

        <div className="flex justify-between gap-3 text-xs">
          <span className="text-white/45">Seats</span>

          <span className="text-right font-semibold">
            {hold.seats.map((seat) => seat.code).join(", ")}
          </span>
        </div>

        <div className="mt-3 flex justify-between gap-3 text-xs">
          <span className="text-white/45">Tickets</span>

          <span className="text-right font-semibold">
            {[...types].map(([name, count]) => `${count} × ${name}`).join(", ")}
          </span>
        </div>
      </div>

      <div className="mt-8 lg:mt-auto lg:pt-8">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase">Subtotal</span>

          <span className="text-2xl font-bold">
            ₾ {hold.subtotal.toFixed(2)}
          </span>
        </div>

        <button
          type="submit"
          disabled={!canPay || isPaying}
          className="w-full rounded-full bg-[#f12d17] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d92815] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPaying ? "Processing payment..." : "Pay: Complete order"}
        </button>

        {paymentError && (
          <p role="alert" className="mt-3 text-xs text-red-400">
            {paymentError}
          </p>
        )}
      </div>
    </aside>
  );
}
