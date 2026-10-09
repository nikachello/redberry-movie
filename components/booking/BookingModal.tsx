"use client";

import { X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Modal from "@/components/ui/Modal";
import { getBookingEligibility } from "@/lib/booking/eligibility";
import { isBookingBusy } from "@/lib/booking/flow";
import { useSeatReservation } from "@/lib/hooks/useSeatReservation";
import { useHoldCountdown } from "@/lib/hooks/useHoldCountdown";
import type { MovieDetail } from "@/types/movie";
import type { Session } from "@/types/session";
import type { User } from "@/types/user";
import SeatSelectionStep from "./SeatSelectionStep";
import CheckoutStep from "./CheckoutStep";
import OrderConfirmation from "./OrderConfirmation";

type Props = { movie: MovieDetail; session: Session; onClose: () => void };

export default function BookingModal(props: Props) {
  const { user } = useAuth();
  if (!user) return null;
  // Switching account/session starts an independent booking lifecycle and form.
  return (
    <BookingFlow
      key={`${user.id}-${props.session.id}`}
      {...props}
      user={user}
    />
  );
}

function BookingFlow({
  movie,
  session,
  onClose,
  user,
}: Props & { user: User }) {
  const reservation = useSeatReservation(user.id, session.id, movie.slug);
  const { stage, hold, order, error } = reservation;
  const eligibility = getBookingEligibility(
    user,
    movie.ageRating?.minAge,
    session.date,
  );
  const { secondsRemaining } = useHoldCountdown(hold?.expiresAt);
  const timer = `${String(Math.floor(secondsRemaining / 60)).padStart(2, "0")}:${String(secondsRemaining % 60).padStart(2, "0")}`;
  const isClosing = stage === "releasing";
  const isCheckout =
    hold !== null && ["checkout", "paying", "releasing"].includes(stage);
  const isBusy = isBookingBusy(stage);
  const dismiss = () => void reservation.close(onClose);

  return (
    <Modal label={`${movie.title} booking`} onDismiss={dismiss}>
      {!order && (
        <header className="flex shrink-0 items-start justify-between gap-4 px-6 pb-5 pt-6 sm:px-8">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold uppercase sm:text-xl">
              {movie.title}
            </h2>
            <p className="mt-1.5 text-xs text-white/50">
              {session.venue.name} · Hall {session.hall.name} · {session.date} ·{" "}
              {session.time} · {session.format.name} · {session.language.code}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {hold && (
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
              disabled={isBusy}
              onClick={dismiss}
              className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <X size={19} />
            </button>
          </div>
        </header>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 sm:px-8">
        {order ? (
          <OrderConfirmation order={order} onClose={dismiss} />
        ) : stage === "restoring" ? (
          <div
            role="status"
            className="flex min-h-[360px] items-center justify-center text-sm text-white/60"
          >
            Checking your existing reservation...
          </div>
        ) : stage === "restore-error" || (isClosing && !hold) ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
            <button
              type="button"
              disabled={isClosing}
              onClick={reservation.retryRestoration}
              className="rounded-full bg-[#f12d17] px-5 py-3 text-sm font-bold"
            >
              Retry restoration
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex h-8 overflow-hidden rounded-full bg-[#202235] text-[11px] font-bold uppercase lg:mr-[305px]">
              {["Seats", "Checkout"].map((label, index) => (
                <div
                  key={label}
                  aria-current={
                    isCheckout === Boolean(index) ? "step" : undefined
                  }
                  className={`flex w-1/2 items-center justify-center rounded-full transition-colors ${isCheckout === Boolean(index) ? "bg-[#f12d17] text-white" : "text-white/60"}`}
                >
                  {label}
                </div>
              ))}
            </div>
            {isCheckout && hold ? (
              <CheckoutStep
                key={hold.holdId}
                movie={movie}
                session={session}
                user={user}
                hold={hold}
                isPaying={stage === "paying"}
                isClosing={isClosing}
                allowed={eligibility.allowed}
                paymentError={error}
                onPay={reservation.pay}
              />
            ) : (
              <SeatSelectionStep
                movie={movie}
                session={session}
                userId={user.id}
                eligibility={eligibility}
                isReserving={stage === "reserving"}
                error={error}
                onReserve={reservation.reserveSeats}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
