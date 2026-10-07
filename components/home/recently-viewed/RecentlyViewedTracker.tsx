"use client";

import { useEffect } from "react";
import type { Movie } from "@/types/movie";
import { addRecentlyViewed } from "@/lib/utils";

type Props = {
  movie: Movie;
};

export default function RecentlyViewedTracker({ movie }: Props) {
  useEffect(() => {
    addRecentlyViewed(movie);
  }, [movie]);

  return null;
}
