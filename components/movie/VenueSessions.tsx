"use client";

import { useMemo } from "react";

import type { MovieDetail } from "@/types/movie";
import type { MovieSessionsGroup, Session } from "@/types/session";

import SessionCard from "./SessionCard";

type Props = {
  group: MovieSessionsGroup;
  movie: MovieDetail;
  onSelect: (session: Session) => void;
};

type HallGroup = {
  hallId: number;
  hallName: string;
  sessions: Session[];
};

export default function VenueSessions({ group, movie, onSelect }: Props) {
  const halls = useMemo(() => {
    const map = new Map<number, HallGroup>();

    for (const session of group.sessions) {
      const existing = map.get(session.hall.id);

      if (existing) {
        existing.sessions.push(session);
        continue;
      }

      map.set(session.hall.id, {
        hallId: session.hall.id,
        hallName: session.hall.name,
        sessions: [session],
      });
    }

    return Array.from(map.values());
  }, [group.sessions]);

  return (
    <div>
      <h3 className="text-[13px] font-semibold text-white">
        {group.venue.name}
      </h3>

      <div className="mt-3 flex flex-wrap gap-3">
        {halls.map((hall) => (
          <div key={hall.hallId} className="rounded-[14px] bg-[#171c30] p-3">
            <p className="mb-2 px-1 text-[10px] font-semibold text-white/60">
              Hall {hall.hallName}
            </p>

            <div className="flex flex-wrap gap-2">
              {hall.sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  movie={movie}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
