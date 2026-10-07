"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Check, Upload, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateProfile } from "@/lib/api/profile";
import { useFilterOptions } from "@/lib/queries/filter-options";
import { profileSchema, type ProfileFormData } from "@/lib/validation/profile";
import type { ApiError } from "@/lib/api/client";

import { useAuth } from "./AuthProvider";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfileModal() {
  const { modal, user, closeModal, updateUser } = useAuth();

  const { data: filterOptions } = useFilterOptions();

  const [avatar, setAvatar] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [avatarError, setAvatarError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",

    defaultValues: {
      fullName: "",
      mobileNumber: "",
      dateOfBirth: "",
      preferredVenueId: undefined,
    },
  });

  /*
   * Fill the form whenever the profile modal opens.
   *
   * defaultValues are only used on the initial render,
   * so reset() is necessary when the authenticated user changes.
   */
  useEffect(() => {
    if (modal !== "profile" || !user) {
      return;
    }

    reset({
      fullName: user.fullName ?? "",
      mobileNumber: user.mobileNumber ?? "",
      dateOfBirth: user.dateOfBirth ?? "",
      preferredVenueId: user.preferredVenue?.id ?? undefined,
    });

    setAvatar(null);
    setAvatarPreview(user.avatar);
    setAvatarError(null);
  }, [modal, user, reset]);

  const profileMutation = useMutation({
    mutationFn: updateProfile,

    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      clearAvatarPreview();
    },

    onError: (error: ApiError) => {
      if (!error.errors) {
        return;
      }

      const fieldMap: Record<string, keyof ProfileFormData> = {
        fullName: "fullName",
        mobileNumber: "mobileNumber",
        dateOfBirth: "dateOfBirth",
        preferredVenueId: "preferredVenueId",
      };

      for (const [apiField, messages] of Object.entries(error.errors)) {
        const formField = fieldMap[apiField];

        if (!formField || !messages[0]) {
          continue;
        }

        setError(formField, {
          type: "server",
          message: messages[0],
        });
      }

      if (error.errors.avatar?.[0]) {
        setAvatarError(error.errors.avatar[0]);
      }
    },
  });

  const fullName = watch("fullName");
  const mobileNumber = watch("mobileNumber");
  const dateOfBirth = watch("dateOfBirth");

  const isFullNameValid = !!fullName && !errors.fullName;

  const isMobileValid = !!mobileNumber && !errors.mobileNumber;

  const isDateValid = !!dateOfBirth && !errors.dateOfBirth;

  function clearAvatarPreview() {
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatar(null);
    setAvatarPreview(null);
    setAvatarError(null);
  }

  function handleClose() {
    clearAvatarPreview();
    profileMutation.reset();
    closeModal();
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setAvatarError(null);
    profileMutation.reset();

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

    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function onSubmit(data: ProfileFormData) {
    profileMutation.reset();
    setAvatarError(null);

    profileMutation.mutate({
      fullName: data.fullName,
      mobileNumber: data.mobileNumber.replace(/\s/g, ""),
      dateOfBirth: data.dateOfBirth,
      preferredVenueId: data.preferredVenueId,
      avatar: avatar ?? undefined,
    });
  }

  if (modal !== "profile" || !user) {
    return null;
  }

  const hasChanges = isDirty || !!avatar;

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
        <h2 className="text-[22px] font-bold text-white">My Profile</h2>

        <p className="mt-1 text-[12px] text-white/50">
          Complete your profile to enable booking
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          {/* Avatar */}
          <div>
            <div className="flex items-center gap-3">
              <label className="relative flex size-[52px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[10px] bg-[#1d2133] transition hover:bg-[#252a40]">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Upload
                    size={17}
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
                  Profile picture
                </p>

                <p className="mt-0.5 text-[10px] uppercase text-white/40">
                  JPG, PNG or WEBP · MAX 2MB
                </p>
              </div>
            </div>

            {avatarError && (
              <p className="mt-2 text-[10px] text-red-400">{avatarError}</p>
            )}
          </div>

          {/* Full name */}
          <div className="mt-7">
            <Field
              id="profile-full-name"
              label="Full name"
              placeholder="John Doe"
              autoFocus
              valid={isFullNameValid}
              error={errors.fullName?.message}
              inputProps={register("fullName", {
                onChange: () => {
                  profileMutation.reset();
                },
              })}
            />
          </div>

          {/* Mobile */}
          <div className="mt-5">
            <Field
              id="profile-mobile"
              label="Mobile number"
              type="tel"
              placeholder="599 123 456"
              valid={isMobileValid}
              error={errors.mobileNumber?.message}
              inputProps={register("mobileNumber", {
                onChange: () => {
                  profileMutation.reset();
                },
              })}
            />
          </div>

          {/* Date of birth */}
          <div className="mt-5">
            <Field
              id="profile-date-of-birth"
              label="Date of birth"
              type="date"
              valid={isDateValid}
              error={errors.dateOfBirth?.message}
              inputProps={register("dateOfBirth", {
                onChange: () => {
                  profileMutation.reset();
                },
              })}
            />
          </div>

          {/* Preferred venue */}
          <div className="mt-5">
            <label
              htmlFor="profile-venue"
              className="mb-2 block text-[11px] font-semibold text-white"
            >
              Preferred venue
            </label>

            <select
              id="profile-venue"
              {...register("preferredVenueId", {
                setValueAs: (value) =>
                  value === "" ? undefined : Number(value),
                onChange: () => {
                  profileMutation.reset();
                },
              })}
              className="h-[44px] w-full cursor-pointer rounded-[10px] border border-transparent bg-[#1d2133] px-4 text-[12px] text-white outline-none transition-colors focus:border-white/20"
            >
              <option value="">No preferred venue</option>

              {filterOptions?.venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} — {venue.city}
                </option>
              ))}
            </select>

            {errors.preferredVenueId && (
              <p className="mt-1.5 text-[10px] text-red-400">
                {errors.preferredVenueId.message}
              </p>
            )}
          </div>

          {/* General API error */}
          {profileMutation.error &&
            !(profileMutation.error as ApiError).errors && (
              <p className="mt-3 text-[11px] text-red-400">
                {(profileMutation.error as ApiError).message}
              </p>
            )}

          {/* Save */}
          <button
            type="submit"
            disabled={
              !isValid ||
              !hasChanges ||
              !!avatarError ||
              profileMutation.isPending
            }
            className="mt-8 h-[44px] w-full cursor-pointer rounded-full bg-[#ff321c] text-[12px] font-bold text-white transition-colors hover:bg-[#e92b18] disabled:cursor-not-allowed disabled:bg-[#5a5d6c] disabled:text-white/50"
          >
            {profileMutation.isPending ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  type?: "text" | "tel" | "date";
  valid: boolean;
  autoFocus?: boolean;
  error?: string;
  inputProps: UseFormRegisterReturn;
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
            type === "tel" ? "tel" : type === "text" ? "name" : undefined
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
