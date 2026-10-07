"use client";

import { ChangeEvent, useState } from "react";
import { Check, Upload, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { register as registerUser } from "@/lib/api/auth";
import { setToken } from "@/lib/auth/token";
import type { ApiError } from "@/lib/api/client";
import { registerSchema, type RegisterFormData } from "@/lib/validation/auth";
import { useAuth } from "./AuthProvider";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function RegisterModal() {
  const { modal, closeModal, openLogin, setAuthenticatedUser } = useAuth();

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,

    onSuccess: (data) => {
      setToken(data.token);
      setAuthenticatedUser(data.user);

      reset();
      clearAvatar();
    },
  });

  const username = watch("username");
  const email = watch("email");
  const password = watch("password");
  const passwordConfirmation = watch("passwordConfirmation");

  const apiError = registerMutation.error as ApiError | null;

  const isUsernameValid = !!username && !errors.username;

  const isEmailValid = !!email && !errors.email;

  const isPasswordValid = !!password && !errors.password;

  const isPasswordConfirmationValid =
    !!passwordConfirmation && !errors.passwordConfirmation;

  function clearAvatar() {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatar(null);
    setAvatarPreview(null);
    setAvatarError(null);
  }

  function resetForm() {
    reset();
    clearAvatar();
    registerMutation.reset();
  }

  function handleClose() {
    resetForm();
    closeModal();
  }

  function handleOpenLogin() {
    resetForm();
    openLogin();
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setAvatarError(null);
    registerMutation.reset();

    if (!file) {
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Avatar must be JPG, PNG or WebP.");

      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("Avatar must be smaller than 2MB.");

      event.target.value = "";
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function onSubmit(data: RegisterFormData) {
    registerMutation.reset();

    registerMutation.mutate({
      username: data.username,
      email: data.email,
      password: data.password,
      passwordConfirmation: data.passwordConfirmation,
      avatar: avatar ?? undefined,
    });
  }

  function getApiFieldError(field: string) {
    return apiError?.errors?.[field]?.[0];
  }

  if (modal !== "register") {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4 py-8 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-[500px] rounded-[24px] bg-[#080d20] px-8 py-8 shadow-2xl">
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
        <h2 className="text-[22px] font-bold text-white">Sign up</h2>

        <p className="mt-1 text-[12px] text-white/50">Welcome to Kino XII</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          {/* Avatar */}
          <div>
            <div className="flex items-center gap-3">
              <label className="relative flex size-[44px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[8px] bg-[#1d2133] transition hover:bg-[#252a40]">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Upload
                    size={15}
                    strokeWidth={1.5}
                    className="text-white/40"
                  />
                )}

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>

              <div>
                <p className="text-[13px] font-bold text-white">
                  Upload avatar{" "}
                  <span className="font-normal text-white/70">(optional)</span>
                </p>

                <p className="mt-0.5 text-[10px] uppercase text-white/40">
                  JPG, PNG or WEBP
                </p>
              </div>
            </div>

            {avatarError && (
              <p className="mt-2 text-[10px] text-red-400">{avatarError}</p>
            )}
          </div>

          {/* Username */}
          <div className="mt-7">
            <Field
              id="register-username"
              label="Username"
              placeholder="User"
              autoFocus
              valid={isUsernameValid}
              error={errors.username?.message ?? getApiFieldError("username")}
              inputProps={register("username", {
                onChange: () => {
                  registerMutation.reset();
                },
              })}
            />
          </div>

          {/* Email */}
          <div className="mt-5">
            <Field
              id="register-email"
              label="Email"
              type="email"
              placeholder="example@gmail.com"
              valid={isEmailValid}
              error={errors.email?.message ?? getApiFieldError("email")}
              inputProps={register("email", {
                onChange: () => {
                  registerMutation.reset();
                },
              })}
            />
          </div>

          {/* Passwords */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Field
              id="register-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              valid={isPasswordValid}
              error={errors.password?.message ?? getApiFieldError("password")}
              inputProps={register("password", {
                onChange: () => {
                  registerMutation.reset();
                },
              })}
            />

            <Field
              id="register-confirm-password"
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              valid={isPasswordConfirmationValid}
              error={
                errors.passwordConfirmation?.message ??
                getApiFieldError("password_confirmation")
              }
              inputProps={register("passwordConfirmation", {
                onChange: () => {
                  registerMutation.reset();
                },
              })}
            />
          </div>

          {/* General API error */}
          {apiError?.message && !apiError.errors && (
            <p className="mt-3 text-[11px] text-red-400">{apiError.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || !!avatarError || registerMutation.isPending}
            className="mt-8 h-[44px] w-full cursor-pointer rounded-full bg-[#ff321c] text-[12px] font-bold text-white transition-colors hover:bg-[#e92b18] disabled:cursor-not-allowed disabled:bg-[#5a5d6c] disabled:text-white/50"
          >
            {registerMutation.isPending ? "Creating account..." : "Sign up"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-5 text-center text-[12px] text-white/50">
          Already have an account?{" "}
          <button
            type="button"
            onClick={handleOpenLogin}
            className="cursor-pointer font-bold text-[#ff321c] transition-colors hover:text-red-400"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
  valid: boolean;
  autoFocus?: boolean;
  error?: string;
  inputProps: ReturnType<
    ReturnType<typeof useForm<RegisterFormData>>["register"]
  >;
};

function Field({
  id,
  label,
  placeholder,
  type = "text",
  valid,
  autoFocus,
  error,
  inputProps,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-semibold text-white"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={type}
          autoFocus={autoFocus}
          placeholder={placeholder}
          autoComplete={
            type === "email"
              ? "email"
              : type === "password"
                ? "new-password"
                : "username"
          }
          {...inputProps}
          className={`h-[44px] w-full rounded-[10px] border bg-[#1d2133] px-4 pr-11 text-[12px] text-white outline-none transition-colors placeholder:text-white/40 ${
            error
              ? "border-red-500"
              : "border-transparent focus:border-white/20"
          }`}
        />

        {valid && !error && (
          <Check
            size={16}
            strokeWidth={2.5}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400"
          />
        )}
      </div>

      {error && <p className="mt-1.5 text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
