import { getMe } from "@/lib/api/auth";
import { getToken } from "@/lib/auth/token";
import { useQuery } from "@tanstack/react-query";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    enabled: !!getToken(),
    retry: false,
  });
}
