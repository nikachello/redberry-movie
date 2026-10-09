"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import type { Order } from "@/types/order";

type Props = {
  order: Order;
  onClose: () => void;
};

export default function OrderConfirmation({ order, onClose }: Props) {
  const ticketCounts = new Map<string, number>();

  for (const ticket of order.tickets) {
    const name = ticket.ticketType.name;

    ticketCounts.set(name, (ticketCounts.get(name) ?? 0) + 1);
  }

  const ticketSummary = [...ticketCounts]
    .map(([name, count]) => `${count} × ${name}`)
    .join(", ");

  return (
    <div className="flex flex-col items-center px-2 py-8 text-center text-white sm:py-12">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400">
        <Check size={26} strokeWidth={3} />
      </div>

      <h2 className="text-xl font-bold">Booking confirmed!</h2>

      <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/50">
        Your tickets are ready. Your booking has been completed successfully.
      </p>

      <div className="mt-4 rounded-full bg-[#202235] px-5 py-2 text-xs font-semibold">
        ORDER #{order.reference}
      </div>

      <div className="mt-6 w-full max-w-[550px] rounded-xl bg-[#202235] p-5 text-left">
        <div className="flex items-center gap-3">
          {order.session.movie.posterUrl && (
            <Image
              src={order.session.movie.posterUrl}
              alt={order.session.movie.title}
              width={48}
              height={70}
              unoptimized
              className="h-[70px] w-12 shrink-0 rounded-md object-cover"
            />
          )}

          <div className="min-w-0">
            <h3 className="text-sm font-bold uppercase">
              {order.session.movie.title}
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-white/50">
              {order.session.venue.name}
              {" · "}Hall {order.session.hall.name}
              {" · "}
              {order.session.date}
              {" · "}
              {order.session.time}
            </p>
          </div>
        </div>

        <div className="my-4 border-t border-white/10" />

        <div className="space-y-3 text-xs">
          <div className="flex justify-between gap-3">
            <span className="text-white/50">Seats</span>

            <span className="text-right font-semibold">
              {order.tickets.map((ticket) => ticket.seatCode).join(", ")}
            </span>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-white/50">Tickets</span>

            <span className="text-right font-semibold">{ticketSummary}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs font-semibold uppercase text-white/60">
            Total paid
          </span>

          <span className="text-xl font-bold tabular-nums">
            ₾ {order.totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/my-tickets"
          onClick={onClose}
          className="rounded-full bg-[#f12d17] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#d92815]"
        >
          View my tickets
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-[#202235] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#303247]"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
