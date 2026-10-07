import Link from "next/link";
import { Search } from "../search/Search";
import AuthControls from "@/components/auth/AuthControls";

export default function Navbar() {
  return (
    <header className="absolute left-0 top-0 z-50 w-full">
      <nav className="flex items-center justify-between bg-linear-to-b from-black px-15 pt-7.5 pb-10">
        <div className="flex shrink-0 items-center gap-9 font-bold whitespace-nowrap">
          <Link
            href="/"
            className="text-[20px] font-bold uppercase tracking-wide text-white"
          >
            Kino <span className="text-red">XII</span>
          </Link>

          <Link
            href="/sessions"
            className="text-[12px] font-light uppercase tracking-wide text-white"
          >
            Sessions
          </Link>
        </div>

        <div className="flex items-center gap-8">
          <Search />
          <AuthControls />
        </div>
      </nav>
    </header>
  );
}
