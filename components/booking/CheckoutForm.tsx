"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Check } from "lucide-react";
import {
  checkoutSchema,
  type CheckoutInput,
  type CheckoutPayload,
} from "@/lib/validation/checkout";

export default function CheckoutForm() {
  const {
    control,
    register,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<CheckoutInput, unknown, CheckoutPayload>();
  const details = useWatch({ control });

  const update = (field: keyof CheckoutInput, value: string) => {
    let formatted = value;

    if (field === "expiry") {
      const digits = value.replace(/\D/g, "").slice(0, 4);

      formatted =
        digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    }

    setValue(field, formatted, { shouldValidate: true, shouldDirty: true });
    clearErrors("root.server");
  };

  const isFieldValid = (name: keyof CheckoutInput) => {
    const schema = checkoutSchema.shape[name];

    return (
      Boolean(details[name]?.trim()) && schema.safeParse(details[name]).success
    );
  };

  const field = (
    label: string,
    name: keyof CheckoutInput,
    placeholder: string,
    props?: {
      autoComplete?: string;
      maxLength?: number;
      inputMode?: "numeric" | "email" | "tel" | "text";
    },
  ) => (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-semibold text-white">
        {label}
      </span>

      <span className="relative block">
        <input
          {...register(name)}
          name={name}
          type={
            name === "cvv" ? "password" : name === "email" ? "email" : "text"
          }
          value={details[name] ?? ""}
          onChange={(event) => update(name, event.target.value)}
          placeholder={placeholder}
          autoComplete={props?.autoComplete}
          maxLength={props?.maxLength}
          inputMode={props?.inputMode}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          className={`h-11 w-full rounded-xl border bg-[#202235] px-4 pr-10 text-sm text-white outline-none placeholder:text-white/35 ${
            errors[name]
              ? "border-red-500 focus:border-red-500"
              : "border-transparent focus:border-[#f12d17]"
          }`}
        />

        {isFieldValid(name) && !errors[name] && (
          <Check
            aria-hidden="true"
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400"
          />
        )}
      </span>

      {errors[name] && (
        <span
          id={`${name}-error`}
          className="mt-1.5 block text-xs text-red-400"
        >
          {errors[name]?.message}
        </span>
      )}
    </label>
  );

  return (
    <div className="space-y-5">
      {field("Full Name", "fullName", "e.g. Meri Sanikidze", {
        autoComplete: "name",
      })}

      <div className="grid gap-4 sm:grid-cols-2">
        {field("Email", "email", "e.g. meri@example.com", {
          autoComplete: "email",
          inputMode: "email",
        })}

        {field("Mobile Number", "mobileNumber", "e.g. 555 123 456", {
          autoComplete: "tel",
          inputMode: "tel",
        })}
      </div>

      <div className="border-t border-white/10 pt-5">
        {field("Card number", "cardNumber", "e.g. 4242 4242 4242 4242", {
          autoComplete: "cc-number",
          inputMode: "numeric",
          maxLength: 23,
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {field("Expiry", "expiry", "e.g. 12/30", {
          autoComplete: "cc-exp",
          maxLength: 5,
        })}

        {field("CVV", "cvv", "e.g. 123", {
          autoComplete: "cc-csc",
          inputMode: "numeric",
          maxLength: 4,
        })}
      </div>
    </div>
  );
}
