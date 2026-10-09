"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { MovieDetail } from "@/types/movie";

import { getMovieSessions } from "@/lib/api/movies";
import { useAuth } from "../auth/AuthProvider";

import MovieDatePicker from "./MovieDatePicker";
import VenueSessions from "./VenueSessions";
import { Session } from "@/types/session";
import BookingModal from "../booking/BookingModal";

type Props = {
  movie: MovieDetail;
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function MovieSessions({ movie }: Props) {
  const { user } = useAuth();

  const isAgeBlocked =
    !!user && user.age !== null && user.age < movie.ageRating.minAge;

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

  const initialDate =
    dateOptions.find((date) => date.available)?.date ??
    dateOptions[0]?.date ??
    "";

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const {
    data: sessionGroups = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["movie-sessions", movie.slug, selectedDate],

    queryFn: () => getMovieSessions(movie.slug, selectedDate),

    enabled: !!selectedDate,
  });

  return (
    <section>
      {/* Heading */}
      <h2 className="text-[18px] font-bold text-white">Sessions</h2>

      {/* Date picker */}
      <div className="mt-5">
        <MovieDatePicker
          dates={dateOptions}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
      </div>

      {/* Age restriction */}
      {isAgeBlocked && (
        <div className="mt-4 rounded-[10px] bg-red-500/10 px-4 py-3">
          <p className="text-[12px] font-semibold text-red-400">
            This film is rated {movie.ageRating.code}. You cannot buy tickets
            for it with this account.
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
              onClick={() => refetch()}
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
                onSelect={setSelectedSession}
              />
            ))}
          </div>
        )}
      </div>
      {selectedSession && (
        <BookingModal
          movie={movie}
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </section>
  );
}
