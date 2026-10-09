import type { MovieDetail } from "@/types/movie";

type Props = {
  movie: MovieDetail;
};

export default function MovieHero({ movie }: Props) {
  return (
    <section className="relative min-h-[480px] overflow-hidden">
      {/* Backdrop */}
      <img
        src={movie.backdropUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/35" />

      <div className="absolute inset-0 bg-linear-to-r from-[#070b19]/70 via-[#070b19]/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#070b19] to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[480px] max-w-[1440px] items-end gap-8 px-10 pb-10 pt-32">
        {/* Poster */}
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-[245px] shrink-0 rounded-xl object-cover shadow-2xl"
        />

        {/* Information */}
        <div className="max-w-[650px] pb-3">
          <p className="mb-3 text-[11px] font-semibold uppercase text-[#ff321c]">
            {movie.isComingSoon ? "Coming Soon" : "Now Playing"}
          </p>

          <h1 className="text-[38px] font-bold uppercase leading-none">
            {movie.title}
          </h1>

          <p className="mt-4 max-w-[620px] text-[13px] leading-5 text-white/75">
            {movie.synopsis}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {/* Age */}
            <span
              title={movie.ageRating.description}
              className="rounded-md bg-[#ff321c]/15 px-2 py-1 text-[11px] font-semibold text-[#ff321c]"
            >
              {movie.ageRating.code}
            </span>

            {/* Runtime */}
            <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-white/80">
              {movie.runtimeMinutes} Min
            </span>

            {/* Formats */}
            {movie.formats.map((format) => (
              <span
                key={format.id}
                className="rounded-md bg-white/10 px-2 py-1 text-[11px] uppercase text-white/80"
              >
                {format.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
