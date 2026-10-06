import { Search as SearchIcon } from "lucide-react";

export function Search() {
  return (
    <div className="flex h-11 w-full items-center gap-2 rounded-full bg-white/10 px-4 text-white backdrop-blur-md transition focus-within:bg-white/15">
      <SearchIcon size={15} className="shrink-0 text-white/80" />

      <input
        type="text"
        placeholder="Search films and live events"
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/80"
      />
    </div>
  );
}
