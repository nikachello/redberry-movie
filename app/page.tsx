import HeroSlider from "@/components/home/hero/HeroSlider";
import { getFeaturedMovies } from "@/lib/api/movies";

export default async function Home() {
  const featuredMovies = await getFeaturedMovies();

  return (
    <main>
      <HeroSlider movies={featuredMovies} />
    </main>
  );
}
