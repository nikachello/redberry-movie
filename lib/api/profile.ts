import { api } from "./client";

import type { ApiResponse } from "@/types/api";
import type { UpdateProfileInput, User } from "@/types/user";

export async function updateProfile(input: UpdateProfileInput) {
  const formData = new FormData();

  formData.append("fullName", input.fullName);
  formData.append("mobileNumber", input.mobileNumber);
  formData.append("dateOfBirth", input.dateOfBirth);

  if (input.preferredVenueId !== undefined) {
    formData.append("preferredVenueId", String(input.preferredVenueId));
  }

  if (input.avatar) {
    formData.append("avatar", input.avatar);
  }

  const response = await api<ApiResponse<User>>("/profile", {
    method: "PUT",
    body: formData,
  });

  return response.data;
}
