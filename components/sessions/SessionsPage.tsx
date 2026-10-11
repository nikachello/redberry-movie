"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

import { useFilterOptions } from "@/lib/queries/filter-options";
import { useSessionsList } from "@/lib/queries/sessions-list";
import { getBookingEligibility } from "@/lib/booking/eligibility";
import { useAuth } from "@/components/auth/AuthProvider";

import BookingModal from "@/components/booking/BookingModal";

import type { Movie, MovieDetail } from "@/types/movie";
import type { Session } from "@/types/session";
import type { SessionsFilters } from "@/types/session-list";

const arrayKeys = ["venues", "formats", "languages", "bands"] as const;

type ArrayKey = (typeof arrayKeys)[number];

function localDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDates() {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);

    date.setHours(12, 0, 0, 0);
    date.setDate(today.getDate() + index);

    return {
      value: localDate(date),
      weekday: new Intl.DateTimeFormat("en-US", {
        weekday: "short",
      }).format(date),
      day: date.getDate(),
    };
  });
}

function getArray(params: URLSearchParams, key: ArrayKey): string[] {
  const values = [...params.getAll(`${key}[]`), ...params.getAll(key)];

  return [
    ...new Set(values.flatMap((value) => value.split(",")).filter(Boolean)),
  ];
}

export default function SessionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { requireAuth, isLoading: isAuthLoading } = useAuth();

  const {
    data: options,
    isPending: optionsLoading,
    isError: optionsError,
  } = useFilterOptions();

  const [selected, setSelected] = useState<{
    movie: Movie;
    session: Session;
  } | null>(null);

  const [bookingError, setBookingError] = useState<string | null>(null);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const dates = useMemo(getDates, []);

  const params = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  const filters: SessionsFilters = {
    date: params.get("date") || dates[0].value,
    venues: getArray(params, "venues"),
    formats: getArray(params, "formats"),
    languages: getArray(params, "languages"),
    bands: getArray(params, "bands"),
    search: params.get("search") || "",
    sort: params.get("sort") || "time_asc",
    page: Math.max(1, Number(params.get("page")) || 1),
  };

  const selectedVenues = filters.venues ?? [];
  const selectedFormats = filters.formats ?? [];
  const selectedLanguages = filters.languages ?? [];
  const selectedBands = filters.bands ?? [];

  const allowedFormats =
    options?.formats.filter(
      (format) =>
        selectedVenues.length === 0 ||
        options.venues.some(
          (venue) =>
            selectedVenues.includes(venue.slug) &&
            venue.formats.some((item) => item.slug === format.slug),
        ),
    ) ?? [];

  const activeCount =
    selectedVenues.length +
    selectedFormats.length +
    selectedLanguages.length +
    selectedBands.length;

  const { data, isPending, isError, refetch } = useSessionsList(filters);

  function navigate(next: URLSearchParams, resetPage = true) {
    if (resetPage) {
      next.delete("page");
    }

    const query = next.toString();

    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }

  function setSingle(key: string, value: string) {
    const next = new URLSearchParams(params);

    next.set(key, value);
    navigate(next);
  }

  function toggleArray(key: ArrayKey, value: string) {
    const next = new URLSearchParams(params);
    const values = new Set(getArray(next, key));

    if (values.has(value)) {
      values.delete(value);
    } else {
      values.add(value);
    }

    next.delete(key);
    next.delete(`${key}[]`);

    for (const item of values) {
      next.append(`${key}[]`, item);
    }

    // Remove formats unavailable at selected venues.
    if (key === "venues" && options) {
      const allowed = new Set(
        options.venues
          .filter((venue) => values.size === 0 || values.has(venue.slug))
          .flatMap((venue) => venue.formats.map((format) => format.slug)),
      );

      const retained = getArray(next, "formats").filter((format) =>
        allowed.has(format),
      );

      next.delete("formats");
      next.delete("formats[]");

      for (const format of retained) {
        next.append("formats[]", format);
      }
    }

    navigate(next);
  }

  function clearFilters() {
    const next = new URLSearchParams(params);

    for (const key of arrayKeys) {
      next.delete(key);
      next.delete(`${key}[]`);
    }

    navigate(next);
  }

  function changePage(page: number) {
    const next = new URLSearchParams(params);

    next.set("page", String(page));
    navigate(next, false);
  }

  function selectSession(movie: Movie, session: Session) {
    if (session.isSoldOut || isAuthLoading) return;

    setBookingError(null);

    requireAuth(
      (authenticatedUser) => {
        const eligibility = getBookingEligibility(
          authenticatedUser,
          movie.ageRating.minAge,
          session.date,
        );

        if (!eligibility.allowed) {
          setBookingError(eligibility.reason);
          return;
        }

        setSelected({ movie, session });
      },
      {
        requireCompleteProfile: true,
      },
    );
  }

  function checkGroup(
    key: ArrayKey,
    items: {
      slug?: string;
      id: number | string;
      name?: string;
      label?: string;
      city?: string;
    }[],
  ) {
    return (
      <div className="space-y-3">
        {items.map((item) => {
          const value = String(item.slug ?? item.id);
          const checked = (filters[key] ?? []).includes(value);

          return (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 text-sm text-white/75"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleArray(key, value)}
                className="size-4 accent-[#f12d17]"
              />

              <span>
                {item.name ?? item.label}
                {item.city && (
                  <span className="ml-1 text-white/40">· {item.city}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  const filterPanel = (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-[#121729] p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <SlidersHorizontal size={18} />
          Filters
        </h2>

        <button
          type="button"
          onClick={clearFilters}
          className="cursor-pointer text-xs font-semibold text-[#ff503c]"
        >
          Clear All Filters
        </button>
      </div>

      {optionsLoading ? (
        <p className="text-sm text-white/50">Loading filters...</p>
      ) : optionsError ? (
        <p className="text-sm text-red-400">Could not load filters.</p>
      ) : options ? (
        <>
          <section className="space-y-3">
            <h3 className="text-sm font-bold">Venue</h3>
            {checkGroup("venues", options.venues)}
          </section>

          <div className="border-t border-white/10" />

          <section className="space-y-3">
            <h3 className="text-sm font-bold">Date</h3>

            <div className="grid grid-cols-7 gap-1">
              {dates.map((date) => (
                <button
                  type="button"
                  key={date.value}
                  onClick={() => setSingle("date", date.value)}
                  className={`cursor-pointer rounded-lg px-1 py-2 text-center text-xs ${
                    filters.date === date.value
                      ? "bg-[#f12d17] text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <span className="block text-[10px]">{date.weekday}</span>

                  <span className="mt-1 block font-bold">{date.day}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="border-t border-white/10" />

          <section className="space-y-3">
            <h3 className="text-sm font-bold">Format</h3>
            {checkGroup("formats", allowedFormats)}
          </section>

          <div className="border-t border-white/10" />

          <section className="space-y-3">
            <h3 className="text-sm font-bold">Language</h3>
            {checkGroup("languages", options.languages)}
          </section>

          <div className="border-t border-white/10" />

          <section className="space-y-3">
            <h3 className="text-sm font-bold">Time of Day</h3>
            {checkGroup("bands", options.timeBands)}
          </section>

          <div className="border-t border-white/10" />

          <p className="text-xs text-white/45">{activeCount} filters active</p>
        </>
      ) : null}
    </div>
  );

  const currentPage = data?.meta.currentPage ?? filters.page ?? 1;

  const lastPage = data?.meta.lastPage ?? 1;

  const pages = Array.from(
    { length: Math.max(0, lastPage) },
    (_, index) => index + 1,
  );

  return (
    <main className="min-h-screen bg-[#090d1c] px-4 pb-10 pt-28 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Movie Sessions
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Find a screening that works for you.
          </p>
        </div>

        {bookingError && (
          <p
            role="alert"
            className="mb-5 rounded-lg bg-red-500/10 p-3 text-sm text-red-400"
          >
            {bookingError}
          </p>
        )}

        <div className="grid items-start gap-7 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Desktop sticky sidebar */}
          <aside className="scrollbar-hide sticky top-6 hidden max-h-[calc(100dvh-3rem)] overflow-y-auto lg:block">
            {filterPanel}
          </aside>

          {/* Results */}
          <section className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white/60">
                {isPending
                  ? "Loading sessions..."
                  : data?.meta.totalSessions
                    ? `Showing ${data.meta.totalSessions} sessions`
                    : "No sessions found"}
              </p>

              <select
                aria-label="Sort sessions"
                value={filters.sort}
                onChange={(event) => setSingle("sort", event.target.value)}
                className="rounded-lg border border-white/10 bg-[#171c30] px-4 py-2.5 text-sm text-white outline-none"
              >
                {(options?.sorts ?? []).map((sort) => (
                  <option key={sort.id} value={sort.id}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Loading */}
            {isPending && (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-44 animate-pulse rounded-2xl bg-white/10"
                  />
                ))}
              </div>
            )}

            {/* Error */}
            {isError && (
              <div className="rounded-xl bg-[#171c30] p-8 text-center">
                <p className="text-red-400">Failed to load sessions.</p>

                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-3 cursor-pointer text-sm underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isPending && !isError && data?.data.length === 0 && (
              <div className="rounded-xl bg-[#171c30] p-10 text-center text-white/60">
                No sessions match your filters.
              </div>
            )}

            {/* Movie groups */}
            {!isPending && !isError && data && (
              <div className="space-y-5">
                {data.data.map(({ movie, sessions }) => (
                  <article
                    key={movie.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#121729] p-4 sm:p-5"
                  >
                    <div className="flex gap-4">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="h-28 w-20 shrink-0 rounded-lg object-cover sm:h-36 sm:w-24"
                      />

                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-bold sm:text-xl">
                          {movie.title}
                        </h2>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/50">
                          <span className="rounded bg-white/10 px-2 py-1">
                            {movie.ageRating.code}
                          </span>

                          <span>{movie.runtimeMinutes} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {sessions.map((session) => (
                        <button
                          key={session.id}
                          type="button"
                          disabled={session.isSoldOut || isAuthLoading}
                          onClick={() => selectSession(movie, session)}
                          className="cursor-pointer rounded-xl border border-white/10 bg-[#1b2134] p-3 text-left transition hover:border-[#f12d17]/60 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-lg font-bold">
                              {session.time}
                            </span>

                            <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-semibold">
                              {session.format.name}
                            </span>
                          </div>

                          <p className="mt-2 truncate text-xs text-white/70">
                            {session.venue.name} · Hall {session.hall.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-white/45">
                            {session.language.name}
                          </p>

                          <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-white">
                              from ₾{session.price}
                            </span>

                            <span
                              className={
                                session.isSoldOut
                                  ? "text-red-400"
                                  : "text-white/50"
                              }
                            >
                              {session.isSoldOut
                                ? "Sold out"
                                : `${session.seatsLeft} seats left`}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isPending && !isError && data && lastPage > 1 && (
              <nav
                aria-label="Sessions pagination"
                className="mt-8 flex flex-wrap items-center justify-center gap-2"
              >
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage <= 1}
                  onClick={() => changePage(currentPage - 1)}
                  className="cursor-pointer rounded-lg bg-white/10 p-2 disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>

                {pages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    aria-current={page === currentPage ? "page" : undefined}
                    onClick={() => changePage(page)}
                    className={`size-9 cursor-pointer rounded-lg text-sm font-semibold ${
                      page === currentPage ? "bg-[#f12d17]" : "bg-white/10"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage >= lastPage}
                  onClick={() => changePage(currentPage + 1)}
                  className="cursor-pointer rounded-lg bg-white/10 p-2 disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>

                <span className="ml-2 text-xs text-white/45">
                  Page {currentPage} of {lastPage}
                </span>
              </nav>
            )}
          </section>
        </div>
      </div>

      {selected && (
        <BookingModal
          movie={selected.movie as MovieDetail}
          session={selected.session}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  );
}
