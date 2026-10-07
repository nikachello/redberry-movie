import { api } from "./client";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from "@/types/user";
import type { ApiResponse } from "@/types/api";

export async function login(input: LoginInput) {
  const response = await api<ApiResponse<AuthResponse>>("/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function register(input: RegisterInput) {
  const formData = new FormData();

  formData.append("username", input.username);
  formData.append("email", input.email);
  formData.append("password", input.password);
  formData.append("password_confirmation", input.passwordConfirmation);

  if (input.avatar) {
    formData.append("avatar", input.avatar);
  }

  const response = await api<ApiResponse<AuthResponse>>("/register", {
    method: "POST",
    body: formData,
  });

  return response.data;
}

export async function getMe() {
  const response = await api<ApiResponse<User>>("/me");

  return response.data;
}

export async function logout() {
  return api<void>("/logout", {
    method: "POST",
  });
}
