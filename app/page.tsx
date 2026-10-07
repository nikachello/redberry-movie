import HeroSlider from "@/components/home/hero/HeroSlider";
import RecentlyViewed from "@/components/home/recently-viewed/RecentlyViewed";
import { getFeaturedMovies } from "@/lib/api/movies";

export default async function Home() {
  const featuredMovies = await getFeaturedMovies();

  return (
    <main>
      <HeroSlider movies={featuredMovies} />
      <RecentlyViewed />
    </main>
  );
}
