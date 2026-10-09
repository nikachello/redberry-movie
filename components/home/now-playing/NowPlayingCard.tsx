import type { MovieWithSynopsis } from "@/types/movie";
import Link from "next/link";

type Props = {
  movie: MovieWithSynopsis;
};

export default function NowPlayingCard({ movie }: Props) {
  return (
    <article
      className="
        group
        flex
        h-[360px]
        w-[194px]
        shrink-0
        flex-col
        overflow-hidden
        rounded-2xl
        bg-[#1d1f2e]
        p-2.5
        transition-[width]
        duration-300
        ease-out
        hover:w-[334px]
      "
    >
      {/* Image */}
      <Link
        href={`/movies/${movie.slug}`}
        className="
          relative
          block
          h-[224px]
          w-full
          shrink-0
          overflow-hidden
          rounded-xl
          transition-[height]
          duration-300
          ease-out
          group-hover:h-[145px]
        "
      >
        {/* Poster */}
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            opacity-100
            transition-opacity
            duration-300
            group-hover:opacity-0
          "
        />

        {/* Backdrop */}
        <img
          src={movie.backdropUrl}
          alt=""
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        />
      </Link>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col pt-2">
        <Link href={`/movies/${movie.slug}`}>
          <h3 className="truncate text-sm font-bold text-white">
            {movie.title}
          </h3>
        </Link>

        <p className="mt-1 truncate text-[10px] text-white/50">
          {movie.genres[0]?.name}
          {movie.genres.length > 0 && " · "}
          {movie.runtimeMinutes} min
        </p>

        <div className="mt-2">
          <span className="inline-flex rounded-full bg-red-500/10 px-2 py-1 text-[9px] font-bold text-red-500">
            {movie.ageRating.code}
          </span>
        </div>

        {/* Synopsis */}
        <p
          className="
            mt-2
            hidden
            line-clamp-5
            text-[10px]
            leading-[13px]
            text-white/50
            group-hover:block
          "
        >
          {movie.synopsis}
        </p>

        {/* Bottom */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="shrink-0 whitespace-nowrap text-[10px] font-semibold text-white">
            From ₾ {movie.fromPrice}
          </span>

          <Link
            href={`/movies/${movie.slug}`}
            className="
              shrink-0
              whitespace-nowrap
              rounded-full
              bg-[#ff2d1b]
              px-5
              py-2
              text-[10px]
              font-bold
              text-white
              transition-colors
              hover:bg-red-600
            "
          >
            Buy Ticket
          </Link>
        </div>
      </div>
    </article>
  );
}
