import HeroSlider from "@/components/home/hero/HeroSlider";
import NowPlaying from "@/components/home/now-playing/NowPlaying";
import RecentlyViewed from "@/components/home/recently-viewed/RecentlyViewed";

import { getFeaturedMovies, getNowPlayingMovies } from "@/lib/api/movies";

export default async function Home() {
  const [featuredMovies, nowPlayingMovies] = await Promise.all([
    getFeaturedMovies(),
    getNowPlayingMovies(),
  ]);

  return (
    <main>
      <HeroSlider movies={featuredMovies} />

      <RecentlyViewed />

      <NowPlaying movies={nowPlayingMovies} />
    </main>
  );
}
