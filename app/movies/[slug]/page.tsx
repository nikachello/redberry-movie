import { notFound } from "next/navigation";

import { getMovie } from "@/lib/api/movies";
import MovieHero from "@/components/movie/MovieHero";
import MovieDetails from "@/components/movie/MovieDetails";
import MovieSessions from "@/components/movie/MovieSessions";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function MoviePage({ params }: Props) {
  const { slug } = await params;

  let movie;

  try {
    movie = await getMovie(slug);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#070b19] text-white">
      <MovieHero movie={movie} />

      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_300px] gap-16 px-10 py-8">
        <MovieSessions movie={movie} />

        <MovieDetails movie={movie} />
      </div>
    </div>
  );
}
