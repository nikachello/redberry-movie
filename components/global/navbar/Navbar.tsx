import Link from "next/link";
import { Search } from "../search/Search";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="absolute left-0 top-0 z-50 w-full">
      <nav className="flex justify-between items-center bg-linear-to-b from-black px-15 pt-7.5 pb-10">
        <div className="flex items-center gap-9 font-bold text-nowrap">
          <Link
            href="/"
            className="font-bold text-[20px] text-white uppercase tracking-wide"
          >
            Kino <span className="text-red">XII</span>
          </Link>
          <Link
            href="/sessions"
            className="font-light text-[12px] text-white uppercase tracking-wide"
          >
            Sessions
          </Link>
        </div>
        <div className="flex items-center gap-8">
          <Search />
          <div className="flex gap-3">
            <Button className="px-4 py-2 bg-red text-white rounded-full font-bold">
              Sign up
            </Button>
            <Button className="px-4 py-2 bg-white text-black rounded-full font-bold">
              Log in
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
