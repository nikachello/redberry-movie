import type { Movie } from "@/types/movie";
import { Bell } from "lucide-react";
import Link from "next/link";

type Props = {
  movie: Movie;
};

export default function ComingSoonCard({ movie }: Props) {
  const releaseDate = new Date(movie.releaseDate);

  const formattedDate = releaseDate
    .toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    })
    .toUpperCase();

  return (
    <article
      className="
        flex
        h-[118px]
        w-[350px]
        shrink-0
        gap-3
        rounded-2xl
        bg-[#1d1f2e]
        p-2.5
        cursor-pointer
      "
    >
      {/* Poster */}
      <Link
        href={`/movies/${movie.slug}`}
        className="h-full w-[100px] shrink-0 overflow-hidden rounded-xl"
      >
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="h-full w-full object-cover"
        />
      </Link>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Release date */}
        <p className="text-[9px] font-bold uppercase leading-none text-red-500">
          In cinemas {formattedDate}
        </p>

        {/* Title */}
        <Link href={`/movies/${movie.slug}`}>
          <h3 className="mt-1.5 truncate text-[15px] font-bold leading-tight text-white">
            {movie.title}
          </h3>
        </Link>

        {/* Genre + runtime */}
        <p className="mt-1 text-[10px] text-white/50">
          {movie.genres[0]?.name}
          {movie.genres.length > 0 && " · "}
          {movie.runtimeMinutes} min
        </p>

        {/* Bottom */}
        <div className="mt-auto flex flex-col items-start gap-1.5">
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-500">
            {movie.ageRating.code}
          </span>

          <button
            type="button"
            className="
              flex
              cursor-pointer
              items-center
              gap-1.5
              rounded-full
              border
              border-white/60
              px-3
              py-1
              text-[9px]
              font-medium
              leading-none
              text-white
              transition-colors
              hover:bg-white/10
            "
          >
            <Bell size={11} />
            Notify Me
          </button>
        </div>
      </div>
    </article>
  );
}
