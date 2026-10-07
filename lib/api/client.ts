import { getToken } from "@/lib/auth/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("API_URL is not defined");
}

export type ApiError = {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
};

export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw {
      status: response.status,
      message: error?.message ?? "Something went wrong.",
      errors: error?.errors,
    } satisfies ApiError;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
