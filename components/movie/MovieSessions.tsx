"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { MovieDetail } from "@/types/movie";
import type { Session } from "@/types/session";

import { getMovieSessions } from "@/lib/api/movies";
import { getBookingEligibility } from "@/lib/booking/eligibility";

import { useAuth } from "../auth/AuthProvider";

import MovieDatePicker from "./MovieDatePicker";
import VenueSessions from "./VenueSessions";
import BookingModal from "../booking/BookingModal";

type Props = {
  movie: MovieDetail;
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function MovieSessions({ movie }: Props) {
  const { requireAuth, isLoading: isAuthLoading } = useAuth();

  const [bookingError, setBookingError] = useState<string | null>(null);

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Generate the next seven days.
  const dateOptions = useMemo(() => {
    const availableDates = new Set(movie.availableDates);

    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);

      date.setHours(12, 0, 0, 0);
      date.setDate(today.getDate() + index);

      const value = formatDate(date);

      return {
        date: value,

        day: new Intl.DateTimeFormat("en-US", {
          weekday: "short",
        }).format(date),

        dayNumber: String(date.getDate()),

        available: availableDates.has(value),
      };
    });
  }, [movie.availableDates]);

  // Select the first available date.
  const initialDate =
    dateOptions.find((date) => date.available)?.date ??
    dateOptions[0]?.date ??
    "";

  const [selectedDate, setSelectedDate] = useState(initialDate);

  // Fetch sessions for the selected date.
  const {
    data: sessionGroups = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["movie-sessions", movie.slug, selectedDate],

    queryFn: () => getMovieSessions(movie.slug, selectedDate),

    enabled: Boolean(selectedDate),
  });

  // Authenticate, complete profile, and verify age
  // before opening the booking modal.
  const handleSessionSelect = (session: Session) => {
    if (isAuthLoading) return;

    setBookingError(null);

    requireAuth(
      (authenticatedUser) => {
        const eligibility = getBookingEligibility(
          authenticatedUser,
          movie.ageRating?.minAge,
          session.date,
        );

        if (!eligibility.allowed) {
          setBookingError(eligibility.reason);
          return;
        }

        setSelectedSession(session);
      },
      {
        requireCompleteProfile: true,
      },
    );
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setBookingError(null);
  };

  const handleBookingClose = () => {
    setSelectedSession(null);
  };

  return (
    <section>
      {/* Heading */}
      <h2 className="text-[18px] font-bold text-white">Sessions</h2>

      {/* Date picker */}
      <div className="mt-5">
        <MovieDatePicker
          dates={dateOptions}
          selectedDate={selectedDate}
          onSelect={handleDateSelect}
        />
      </div>

      {/* Booking eligibility error */}
      {bookingError && (
        <div
          role="alert"
          className="mt-4 rounded-[10px] border border-red-500/20 bg-red-500/10 px-4 py-3"
        >
          <p className="text-[12px] font-semibold text-red-400">
            {bookingError}
          </p>
        </div>
      )}

      {/* Sessions */}
      <div className="mt-7">
        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            <div className="h-5 w-32 animate-pulse rounded bg-white/10" />

            <div className="h-24 w-full max-w-[500px] animate-pulse rounded-[14px] bg-white/10" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div>
            <p className="text-[13px] text-red-400">Failed to load sessions.</p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 cursor-pointer text-[12px] font-semibold text-white underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* No sessions */}
        {!isLoading && !isError && sessionGroups.length === 0 && (
          <div className="rounded-[14px] bg-[#171c30] px-5 py-6">
            <p className="text-[13px] font-semibold text-white">
              No sessions available
            </p>

            <p className="mt-1 text-[11px] text-white/50">
              There are no sessions for this movie on the selected date.
            </p>
          </div>
        )}

        {/* Sessions grouped by venue */}
        {!isLoading && !isError && sessionGroups.length > 0 && (
          <div className="space-y-7">
            {sessionGroups.map((group) => (
              <VenueSessions
                key={group.venue.id}
                group={group}
                movie={movie}
                onSelect={handleSessionSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking modal */}
      {selectedSession && (
        <BookingModal
          movie={movie}
          session={selectedSession}
          onClose={handleBookingClose}
        />
      )}
    </section>
  );
}
