"use client";

import type { MovieWithSynopsis } from "@/types/movie";
import { ChevronLeft, ChevronRight, Clock3, Ticket } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeroSliderProps = {
  movies: MovieWithSynopsis[];
};

export default function HeroSlider({ movies }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % movies.length);
  };

  const previousSlide = () => {
    setActiveIndex((current) => (current - 1 + movies.length) % movies.length);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    if (movies.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % movies.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [movies.length]);

  if (!movies.length) {
    return null;
  }

  return (
    <section className="relative h-[700px] w-full overflow-hidden bg-black lg:h-screen lg:min-h-[650px]">
      {/* Slides */}
      {movies.map((movie, index) => {
        const active = index === activeIndex;

        return (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
            }`}
          >
            {/* Background */}
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Left gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/50 to-transparent" />

            {/* Bottom gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20" />

            {/* Content */}
            <div className="relative z-20 flex h-full items-center px-5 md:px-10 lg:px-16">
              <div className="mt-8 max-w-[640px] text-white">
                {/* Premiere */}
                <div className="mb-5">
                  <span className="inline-flex rounded-full bg-red-950/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-red-400 backdrop-blur-sm">
                    PREMIERE
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl lg:text-6xl">
                  {movie.title}
                </h1>

                {/* Metadata */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {movie.ageRating.minAge > 0 && (
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-red-400 backdrop-blur-md">
                      {movie.ageRating.minAge}+
                    </span>
                  )}

                  {movie.runtimeMinutes && (
                    <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                      <Clock3 size={13} />
                      {movie.runtimeMinutes} Min
                    </span>
                  )}

                  {movie.formats?.map((format) => (
                    <span
                      key={format.id}
                      className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md"
                    >
                      {format.name}
                    </span>
                  ))}
                </div>

                {/* Synopsis */}
                <p className="mt-5 max-w-[620px] text-sm leading-6 text-white/90 md:text-base">
                  {movie.synopsis}
                </p>

                {/* Buttons */}
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={`/movies/${movie.id}`}
                    className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-600"
                  >
                    <Ticket size={17} />
                    Buy tickets
                  </Link>

                  <Link
                    href={`/movies/${movie.id}`}
                    className="rounded-full bg-white/15 px-7 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/25"
                  >
                    All sessions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {/* Controls */}
      <div className="absolute bottom-8 left-5 right-5 z-30 flex items-center gap-5 md:left-10 md:right-10 lg:bottom-12 lg:left-16 lg:right-16">
        {/* Progress bars */}
        <div className="flex flex-1 items-center gap-2">
          {movies.map((movie, index) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className="group relative h-5 flex-1 cursor-pointer"
            >
              <span
                className={`absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 transition-colors duration-300 ${
                  activeIndex === index
                    ? "bg-red-500"
                    : "bg-white/70 group-hover:bg-white"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Arrows */}
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous slide"
            className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
          >
            <ChevronLeft size={25} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
          >
            <ChevronRight size={25} />
          </button>
        </div>
      </div>
    </section>
  );
}
