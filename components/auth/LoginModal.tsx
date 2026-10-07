"use client";

import { Check, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { login } from "@/lib/api/auth";
import { setToken } from "@/lib/auth/token";
import type { ApiError } from "@/lib/api/client";
import { loginSchema, type LoginFormData } from "@/lib/validation/auth";
import { useAuth } from "./AuthProvider";

export default function LoginModal() {
  const { modal, closeModal, openRegister, setAuthenticatedUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,

    onSuccess: (data) => {
      setToken(data.token);
      setAuthenticatedUser(data.user);
      reset();
    },
  });

  const email = watch("email");
  const password = watch("password");

  const isEmailValid = !!email && !errors.email;

  const isPasswordValid = !!password && !errors.password;

  const apiError = loginMutation.error as ApiError | null;

  function handleClose() {
    reset();
    loginMutation.reset();
    closeModal();
  }

  function handleOpenRegister() {
    reset();
    loginMutation.reset();
    openRegister();
  }

  function onSubmit(data: LoginFormData) {
    loginMutation.reset();

    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  }

  return modal === "login" ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-[440px] rounded-[24px] bg-[#080d20] px-8 py-8 shadow-2xl">
        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-7 top-7 cursor-pointer text-white/70 transition-colors hover:text-white"
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
        <form onSubmit={handleSubmit(onSubmit)} className="mt-7">
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
                autoFocus
                placeholder="example@gmail.com"
                autoComplete="email"
                {...register("email", {
                  onChange: () => {
                    loginMutation.reset();
                  },
                })}
                className={`h-[44px] w-full rounded-[10px] border bg-[#1d2133] px-4 pr-11 text-[12px] text-white outline-none transition-colors placeholder:text-white/40 ${
                  errors.email
                    ? "border-red-500"
                    : "border-transparent focus:border-white/20"
                }`}
              />

              {isEmailValid && (
                <Check
                  size={16}
                  strokeWidth={2.5}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400"
                />
              )}
            </div>

            {errors.email && (
              <p className="mt-1.5 text-[10px] text-red-400">
                {errors.email.message}
              </p>
            )}
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
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password", {
                  onChange: () => {
                    loginMutation.reset();
                  },
                })}
                className={`h-[44px] w-full rounded-[10px] border bg-[#1d2133] px-4 pr-11 text-[12px] text-white outline-none transition-colors placeholder:text-white/40 ${
                  errors.password
                    ? "border-red-500"
                    : "border-transparent focus:border-white/20"
                }`}
              />

              {isPasswordValid && (
                <Check
                  size={16}
                  strokeWidth={2.5}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400"
                />
              )}
            </div>

            {errors.password && (
              <p className="mt-1.5 text-[10px] text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* API error */}
          {apiError && (
            <p className="mt-3 text-[11px] text-red-400">{apiError.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || loginMutation.isPending}
            className="mt-8 h-[44px] w-full cursor-pointer rounded-full bg-[#ff321c] text-[12px] font-bold text-white transition-colors hover:bg-[#e92b18] disabled:cursor-not-allowed disabled:bg-[#5a5d6c] disabled:text-white/50"
          >
            {loginMutation.isPending ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-5 text-center text-[12px] text-white/50">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={handleOpenRegister}
            className="cursor-pointer font-bold text-[#ff321c] transition-colors hover:text-red-400"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  ) : null;
}
