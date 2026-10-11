"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Loader2, X } from "lucide-react";

import { searchMovies } from "@/lib/api/search";

export function Search() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const {
    data: results = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["header-search", debouncedQuery],
    queryFn: () => searchMovies(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    staleTime: 60_000,
  });

  const isDebouncing = query.trim() !== debouncedQuery;
  const loading = isDebouncing || isFetching;
  const visibleResults = query.trim() ? results : [];

  function selectMovie(slug: string) {
    setOpen(false);
    setQuery("");
    setDebouncedQuery("");
    setActiveIndex(-1);

    router.push(`/movies/${slug}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!open || visibleResults.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        current >= visibleResults.length - 1 ? 0 : current + 1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? visibleResults.length - 1 : current - 1,
      );
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectMovie(visibleResults[activeIndex].slug);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-[420px]">
      <div className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-3 text-white">
        <SearchIcon size={19} className="shrink-0 text-white/65" />

        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search films and live events"
          aria-label="Search films and live events"
          aria-expanded={open && query.trim().length > 0}
          aria-controls="header-search-results"
          aria-activedescendant={
            activeIndex >= 0 ? `header-search-result-${activeIndex}` : undefined
          }
          role="combobox"
          aria-autocomplete="list"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/50"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
              setOpen(false);
              setActiveIndex(-1);
            }}
            aria-label="Clear search"
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div
          id="header-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+10px)] z-[100] overflow-hidden rounded-2xl border border-white/10 bg-[#1b2032] p-2 shadow-2xl"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-5 text-sm text-white/60">
              <Loader2 size={17} className="animate-spin" />
              Searching...
            </div>
          ) : isError ? (
            <p className="p-4 text-center text-sm text-red-400">
              Search failed. Please try again.
            </p>
          ) : visibleResults.length === 0 ? (
            <p className="p-4 text-center text-sm text-white/60">
              No matching titles found.
            </p>
          ) : (
            visibleResults.map((movie, index) => (
              <button
                key={movie.id}
                id={`header-search-result-${index}`}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectMovie(movie.slug)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition ${
                  activeIndex === index ? "bg-white/10" : "hover:bg-white/10"
                }`}
              >
                <img
                  src={movie.posterUrl}
                  alt=""
                  className="h-14 w-10 shrink-0 rounded object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {movie.title}
                  </p>

                  <p className="mt-1 text-xs text-white/50">
                    {movie.kind === "event" ? "Live event" : "Film"}
                    {" · "}
                    {movie.ageRating.code}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
