"use client";

import { Armchair } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { getBookingEligibility } from "@/lib/booking/eligibility";
import type { MovieDetail } from "@/types/movie";
import type { Session } from "@/types/session";

type Props = {
  session: Session;
  movie: MovieDetail;
  onSelect: (session: Session) => void;
};

export default function SessionCard({ session, movie, onSelect }: Props) {
  const { user } = useAuth();

  const eligibility = getBookingEligibility(user, movie.ageRating?.minAge, session.date);
  // Incomplete profiles remain clickable so the parent can open the profile flow.
  const isAgeBlocked = !!user?.profileComplete && !!user.dateOfBirth && !eligibility.allowed;

  const isDisabled = session.isSoldOut || isAgeBlocked;

  function handleClick() {
    if (isDisabled) {
      return;
    }

    onSelect(session);
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
      title={
        isAgeBlocked
          ? `This film is rated ${movie.ageRating.code}. You cannot buy tickets for it with this account.`
          : session.isSoldOut
            ? "This session is sold out."
            : undefined
      }
      className={`
        min-w-[120px]
        rounded-[10px]
        bg-[#080d20]
        px-4 py-3
        text-left
        transition
        ${
          isDisabled
            ? "cursor-not-allowed opacity-40"
            : "cursor-pointer hover:bg-[#11182d]"
        }
      `}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[16px] font-bold text-white">{session.time}</span>

        <span className="text-[12px] font-bold text-[#ff321c]">
          ₾{session.price}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-white/60">
          {session.language.code}
        </span>

        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white/60">
          {session.format.name}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1 text-[9px] text-white/45">
        <Armchair size={11} />

        {session.isSoldOut ? "Sold out" : `${session.seatsLeft} left`}
      </div>
    </button>
  );
}
