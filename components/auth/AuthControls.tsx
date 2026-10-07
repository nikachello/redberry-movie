"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import UserMenu from "@/components/auth/UserMenu";

export default function AuthControls() {
  const { isAuthenticated, isLoading, openLogin, openRegister } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-w-[150px] shrink-0 items-center justify-end">
        <div className="h-10 w-28 animate-pulse rounded-lg bg-white/10" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return (
    <div className="flex shrink-0 items-center gap-4">
      <button
        type="button"
        onClick={openLogin}
        className="cursor-pointer whitespace-nowrap text-sm text-white"
      >
        Log In
      </button>

      <button
        type="button"
        onClick={openRegister}
        className="cursor-pointer whitespace-nowrap rounded-full bg-[#ff321c] px-5 py-2.5 text-xs font-semibold text-white"
      >
        Sign Up
      </button>
    </div>
  );
}
