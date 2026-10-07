import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),

  mobileNumber: z
    .string()
    .trim()
    .min(1, "Mobile number is required.")
    .refine((value) => /^5\d{8}$/.test(value.replace(/\s/g, "")), {
      message: "Mobile number must be 9 digits and start with 5.",
    }),

  dateOfBirth: z.string().min(1, "Date of birth is required."),

  preferredVenueId: z.number().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
