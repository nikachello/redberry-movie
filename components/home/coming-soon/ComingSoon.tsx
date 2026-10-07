import type { Movie } from "@/types/movie";
import Link from "next/link";
import ComingSoonCard from "./ComingSoonCard";

type Props = {
  movies: Movie[];
};

export default function ComingSoon({ movies }: Props) {
  if (!movies.length) return null;

  return (
    <section className="border-b border-white/10 bg-[#070b19] py-8">
      <div className="mb-5 flex items-center justify-between px-5 md:px-8">
        <h2 className="text-lg font-bold uppercase text-white">
          Coming Soon...
        </h2>

        <Link
          href="/movies?comingSoon=true"
          className="text-[10px] font-semibold text-red-500 transition-colors hover:text-red-400"
        >
          See all
        </Link>
      </div>

      <div className="scrollbar-hide flex gap-4 overflow-x-auto px-5 pb-4 md:px-8">
        {movies.map((movie) => (
          <ComingSoonCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
