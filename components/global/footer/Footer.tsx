import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070b19]">
      <div className="flex min-h-[60px] items-center justify-between px-5 md:px-8">
        <Link href="/" className="text-xs font-bold text-white">
          KINO <span className="text-red-500">XII</span>
        </Link>

        <p className="text-[10px] text-white/40">
          © 2026 Kino XII. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
