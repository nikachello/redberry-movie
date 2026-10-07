import type { MovieWithSynopsis } from "@/types/movie";
import Link from "next/link";
import NowPlayingCard from "./NowPlayingCard";

type Props = {
  movies: MovieWithSynopsis[];
};

export default function NowPlaying({ movies }: Props) {
  if (!movies.length) return null;

  return (
    <section className="border-b border-white/10 bg-[#070b19] py-8">
      <div className="mb-5 flex items-center justify-between px-5 md:px-8">
        <h2 className="text-lg font-bold uppercase text-white">Now Playing</h2>

        <Link
          href="/sessions"
          className="text-[10px] font-semibold text-red-500 transition-colors hover:text-red-400"
        >
          See all
        </Link>
      </div>

      <div
        className="
          scrollbar-hide
          flex
          h-[376px]
          items-start
          gap-4
          overflow-x-auto
          overflow-y-hidden
          px-5
          pb-4
          md:px-8
        "
      >
        {movies.map((movie) => (
          <NowPlayingCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
