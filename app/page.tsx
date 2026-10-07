import ComingSoon from "@/components/home/coming-soon/ComingSoon";
import HeroSlider from "@/components/home/hero/HeroSlider";
import NowPlaying from "@/components/home/now-playing/NowPlaying";
import RecentlyViewed from "@/components/home/recently-viewed/RecentlyViewed";

import {
  getComingSoonMovies,
  getFeaturedMovies,
  getNowPlayingMovies,
} from "@/lib/api/movies";

export default async function Home() {
  const [featuredMovies, nowPlayingMovies, comingSoonMovies] =
    await Promise.all([
      getFeaturedMovies(),
      getNowPlayingMovies(),
      getComingSoonMovies(),
    ]);

  return (
    <main>
      <HeroSlider movies={featuredMovies} />

      <RecentlyViewed />

      <NowPlaying movies={nowPlayingMovies} />
      <ComingSoon movies={comingSoonMovies} />
    </main>
  );
}
