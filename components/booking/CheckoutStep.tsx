"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  checkoutSchema,
  type CheckoutInput,
  type CheckoutPayload,
} from "@/lib/validation/checkout";
import type { ApiError } from "@/lib/api/client";
import type { MovieDetail } from "@/types/movie";
import type { Session } from "@/types/session";
import type { SeatHold } from "@/types/booking";
import type { User } from "@/types/user";
import CheckoutForm from "./CheckoutForm";
import CheckoutSummary from "./CheckoutSummary";

type Props = {
  movie: MovieDetail;
  session: Session;
  user: User;
  hold: SeatHold;
  isPaying: boolean;
  isClosing: boolean;
  allowed: boolean;
  paymentError: string | null;
  onPay: (details: CheckoutPayload) => Promise<ApiError | null>;
};

export default function CheckoutStep({
  movie,
  session,
  user,
  hold,
  isPaying,
  isClosing,
  allowed,
  paymentError,
  onPay,
}: Props) {
  const form = useForm<CheckoutInput, unknown, CheckoutPayload>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      fullName: user.fullName ?? "",
      email: user.email,
      mobileNumber: user.mobileNumber ?? "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    },
  });
  const submit = form.handleSubmit(async (details) => {
    if (!allowed || isPaying || isClosing) return;
    const error = await onPay(details);
    if (error?.status !== 422 || !error.errors) return;
    let hasFieldError = false;
    for (const [field, messages] of Object.entries(error.errors)) {
      if (Object.hasOwn(checkoutSchema.shape, field) && messages[0]) {
        form.setError(field as keyof CheckoutInput, {
          type: "server",
          message: messages[0],
        });
        hasFieldError = true;
      }
    }
    if (!hasFieldError)
      form.setError("root.server", { message: error.message });
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={submit}
        className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_285px]"
      >
        <fieldset disabled={isPaying || isClosing} className="min-w-0">
          <CheckoutForm />
          {form.formState.errors.root?.server && (
            <p role="alert" className="mt-3 text-xs text-red-400">
              {form.formState.errors.root.server.message}
            </p>
          )}
        </fieldset>
        <CheckoutSummary
          movie={movie}
          session={session}
          hold={hold}
          canPay={
            form.formState.isValid &&
            allowed &&
            !isClosing &&
            !form.formState.isSubmitting
          }
          isPaying={isPaying}
          paymentError={paymentError}
        />
      </form>
    </FormProvider>
  );
}
