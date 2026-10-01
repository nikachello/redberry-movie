"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchProps {
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

export function Search({
  placeholder = "Search films and live events",
  className,
  defaultValue = "",
}: SearchProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="
          pointer-events-none
          absolute left-4 top-1/2
          size-4
          -translate-y-1/2
          text-white
        "
      />

      <Input
        type="text"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(e.target.value)
        }
        placeholder={placeholder}
        className="
          h-[52px]
          rounded-full
          border border-white/15
          bg-white/10
          pl-11
          pr-12
          text-base
          text-white
          placeholder:text-white/30

          focus-visible:border-white/20
          focus-visible:ring-0
          focus-visible:ring-offset-0
        "
      />

      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="
            absolute right-3 top-1/2
            flex size-8
            -translate-y-1/2
            items-center justify-center
            rounded-full
            bg-white/10
            text-white
            transition-colors
            hover:bg-white/20
          "
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
