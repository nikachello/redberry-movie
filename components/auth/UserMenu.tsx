"use client";

import { useEffect, useRef, useState } from "react";
import { Check, LogOut, Ticket, UserRound } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { logout } from "@/lib/api/auth";
import { useAuth } from "./AuthProvider";

export default function UserMenu() {
  const { user, clearAuth, openProfile } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const logoutMutation = useMutation({
    mutationFn: logout,

    onSettled: () => {
      setIsOpen(false);
      clearAuth();
    },
  });

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  if (!user) {
    return null;
  }

  const initials = user.username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleOpenProfile() {
    setIsOpen(false);
    openProfile();
  }

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex cursor-pointer items-center gap-3"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="size-10 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#1d2133] text-xs font-semibold text-white">
            {initials}
          </div>
        )}

        <span className="text-sm font-semibold text-white">
          {user.username}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+12px)] w-[320px] overflow-hidden rounded-[20px] bg-[#080d20] shadow-2xl">
          <div className="p-5">
            {/* User */}
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="size-11 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex size-11 items-center justify-center rounded-lg bg-[#1d2133] text-xs font-semibold text-white">
                    {initials}
                  </div>
                )}

                <span
                  className={`absolute -bottom-1 -right-1 size-2 rounded-full ${
                    user.profileComplete ? "bg-green-400" : "bg-orange-500"
                  }`}
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-white">
                  {user.username}
                </p>

                <p className="truncate text-[12px] text-white/50">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Profile status */}
            {user.profileComplete ? (
              <div className="mt-4 flex items-center gap-2 rounded-[10px] bg-green-500/10 px-3 py-3 text-[13px] font-semibold text-green-400">
                Profile Complete
                <Check size={16} strokeWidth={2} />
              </div>
            ) : (
              <div className="mt-4 rounded-[10px] bg-orange-500/10 px-3 py-3">
                <p className="text-[13px] font-semibold text-orange-400">
                  Profile incomplete
                </p>

                <p className="mt-0.5 text-[12px] leading-4 text-white/55">
                  Please complete your profile to enable booking
                </p>
              </div>
            )}

            {/* Menu */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleOpenProfile}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-1 py-3 text-left text-[13px] font-semibold text-white transition-colors hover:text-white/70"
              >
                <UserRound size={17} />
                My Profile
              </button>

              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-1 py-3 text-left text-[13px] font-semibold text-white transition-colors hover:text-white/70"
              >
                <Ticket size={17} />
                My Tickets
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-white/10 px-5 py-3">
            <button
              type="button"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              className="flex w-full cursor-pointer items-center gap-3 py-2 text-left text-[13px] font-semibold text-[#ff321c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut size={17} />

              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
