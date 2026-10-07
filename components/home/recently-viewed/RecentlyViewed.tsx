"use client";

import { useEffect, useState } from "react";
import type { Movie } from "@/types/movie";
import Link from "next/link";
import { getRecentlyViewed } from "@/lib/utils";
import Image from "next/image";

export default function RecentlyViewed() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    setMovies(getRecentlyViewed());
  }, []);

  if (!movies.length) {
    return null;
  }

  return (
    <section className="bg-[#070b19] px-5 py-8 md:px-10 lg:px-16">
      <h2 className="mb-6 text-xl font-bold uppercase text-white">
        Recently Viewed
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.slug}`}
            className="w-[150px] shrink-0"
          >
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              className="aspect-[2/3] w-full rounded-xl object-cover"
            />

            <h3 className="mt-2 truncate text-sm font-semibold text-white">
              {movie.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
