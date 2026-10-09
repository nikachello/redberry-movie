import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must contain at least 3 characters."),

  email: z.email("Enter a valid email address."),

  mobileNumber: z
    .string()
    .transform((value) => value.replace(/\s/g, ""))
    .pipe(
      z
        .string()
        .regex(
          /^5\d{8}$/,
          "Enter a valid Georgian mobile number (9 digits, starting with 5).",
        ),
    ),

  cardNumber: z
    .string()
    .transform((value) => value.replace(/\s/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\d{16}$/, "Card number must contain exactly 16 digits."),
    ),

  expiry: z.string().refine(
    (value) => {
      const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
      if (!match) return false;

      const month = Number(match[1]);
      const year = 2000 + Number(match[2]);

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      return (
        year > currentYear || (year === currentYear && month >= currentMonth)
      );
    },
    { message: "Enter a valid future expiry date (MM/YY)." },
  ),

  cvv: z.string().regex(/^\d{3}$/, "CVV must contain 3 digits."),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutPayload = z.output<typeof checkoutSchema>;
