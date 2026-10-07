import { Venue } from "./session";

export type User = {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  fullName: string | null;
  mobileNumber: string | null;
  dateOfBirth: string | null;
  age: number | null;
  preferredVenue: Venue | null;
  profileComplete: boolean;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  avatar?: File;
};

export type UpdateProfileInput = {
  fullName: string;
  mobileNumber: string;
  dateOfBirth: string;
  preferredVenueId?: number;
  avatar?: File;
};
