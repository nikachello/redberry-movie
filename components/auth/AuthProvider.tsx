"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getMe } from "@/lib/api/auth";
import { getToken, removeToken } from "@/lib/auth/token";
import type { ApiError } from "@/lib/api/client";
import type { User } from "@/types/user";

type AuthModal = "login" | "register" | "profile" | null;

type ProtectedAction = () => void;

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  modal: AuthModal;
  openLogin: () => void;
  openRegister: () => void;
  openProfile: () => void;
  closeModal: () => void;

  requireAuth: (action: ProtectedAction) => void;

  setAuthenticatedUser: (user: User) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<AuthModal>(null);

  const [token, setTokenState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const pendingActionRef = useRef<ProtectedAction | null>(null);

  useEffect(() => {
    setTokenState(getToken());
    setIsInitialized(true);
  }, []);

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: authKeys.me,

    queryFn: async () => {
      try {
        return await getMe();
      } catch (error) {
        const apiError = error as ApiError;

        if (apiError.status === 401) {
          removeToken();
          setTokenState(null);

          return null;
        }

        throw error;
      }
    },

    enabled: isInitialized && !!token,
    retry: false,
  });

  function requireAuth(action: ProtectedAction) {
    if (user) {
      action();
      return;
    }

    pendingActionRef.current = action;
    setModal("login");
  }

  function setAuthenticatedUser(authenticatedUser: User) {
    setTokenState(getToken());

    queryClient.setQueryData(authKeys.me, authenticatedUser);

    setModal(null);

    const pendingAction = pendingActionRef.current;

    pendingActionRef.current = null;

    if (pendingAction) {
      pendingAction();
    }
  }

  function clearAuth() {
    removeToken();

    setTokenState(null);

    queryClient.setQueryData(authKeys.me, null);

    pendingActionRef.current = null;
  }

  function closeModal() {
    setModal(null);

    pendingActionRef.current = null;
  }

  const isLoading = !isInitialized || (!!token && isUserLoading);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!user,
        isLoading,

        modal,
        openLogin: () => setModal("login"),
        openRegister: () => setModal("register"),
        openProfile: () => setModal("profile"),
        closeModal,

        requireAuth,

        setAuthenticatedUser,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
