"use client";

import { FormEvent, useState } from "react";
import { Check, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { login } from "@/lib/api/auth";
import { setToken } from "@/lib/auth/token";
import type { ApiError } from "@/lib/api/client";
import { useAuth } from "./AuthProvider";

export default function LoginModal() {
  const { modal, closeModal, openRegister, setAuthenticatedUser } = useAuth();
  ``;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: login,

    onSuccess: (data) => {
      setToken(data.token);
      setAuthenticatedUser(data.user);
    },
  });

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setValidationError(null);
    loginMutation.reset();
    closeModal();
  };

  const handleOpenRegister = () => {
    setEmail("");
    setPassword("");
  };

  if (modal !== "login") {
    return null;
  }

  const isEmailValid =
    email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isPasswordValid = password.length >= 3;

  const isFormValid = isEmailValid && isPasswordValid;

  const apiError = loginMutation.error as ApiError | null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setValidationError(null);

    if (!isEmailValid) {
      setValidationError("Enter a valid email.");
      return;
    }

    if (!isPasswordValid) {
      setValidationError("Password must be at least 3 characters.");
      return;
    }

    loginMutation.mutate({
      email,
      password,
    });
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/65
        px-4
        backdrop-blur-[2px]
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="
          relative
          w-full
          max-w-[440px]
          rounded-[24px]
          bg-[#080d20]
          px-8
          py-8
          shadow-2xl
        "
      >
        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="
            absolute
            right-7
            top-7
            cursor-pointer
            text-white/70
            transition-colors
            hover:text-white
          "
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Header */}
        <div>
          <h2 className="text-[22px] font-bold text-white">Log in</h2>

          <p className="mt-1 text-[12px] text-white/50">
            Welcome back to Kino XII
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-7">
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-[12px] font-semibold text-white"
            >
              Email
            </label>

            <div className="relative">
              <input
                id="login-email"
                type="email"
                value={email}
                autoFocus
                onChange={(event) => {
                  setEmail(event.target.value);
                  setValidationError(null);
                  loginMutation.reset();
                }}
                placeholder="example@gmail.com"
                autoComplete="email"
                className="
                  h-[44px]
                  w-full
                  rounded-[10px]
                  border
                  border-transparent
                  bg-[#1d2133]
                  px-4
                  pr-11
                  text-[12px]
                  text-white
                  outline-none
                  transition-colors
                  placeholder:text-white/40
                  focus:border-white/20
                "
              />

              {isEmailValid && (
                <Check
                  size={16}
                  strokeWidth={2.5}
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-green-400
                  "
                />
              )}
            </div>
          </div>

          {/* Password */}
          <div className="mt-5">
            <label
              htmlFor="login-password"
              className="mb-2 block text-[12px] font-semibold text-white"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setValidationError(null);
                  loginMutation.reset();
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="
                  h-[44px]
                  w-full
                  rounded-[10px]
                  border
                  border-transparent
                  bg-[#1d2133]
                  px-4
                  pr-11
                  text-[12px]
                  text-white
                  outline-none
                  transition-colors
                  placeholder:text-white/40
                  focus:border-white/20
                "
              />

              {isPasswordValid && (
                <Check
                  size={16}
                  strokeWidth={2.5}
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-green-400
                  "
                />
              )}
            </div>
          </div>

          {/* Errors */}
          {(validationError || apiError) && (
            <p className="mt-3 text-[11px] text-red-400">
              {validationError ?? apiError?.message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || loginMutation.isPending}
            className="
              mt-8
              h-[44px]
              w-full
              cursor-pointer
              rounded-full
              bg-[#ff321c]
              text-[12px]
              font-bold
              text-white
              transition-colors
              hover:bg-[#e92b18]
              disabled:cursor-not-allowed
              disabled:bg-[#5a5d6c]
              disabled:text-white/50
            "
          >
            {loginMutation.isPending ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-5 text-center text-[12px] text-white/50">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={openRegister}
            className="
              cursor-pointer
              font-bold
              text-[#ff321c]
              transition-colors
              hover:text-red-400
            "
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
