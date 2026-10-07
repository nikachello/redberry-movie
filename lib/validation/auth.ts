import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(3, "Password must be at least 3 characters."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters."),

    email: z.email("Enter a valid email."),

    password: z.string().min(3, "Password must be at least 3 characters."),

    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
