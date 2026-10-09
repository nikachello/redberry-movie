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

type ProtectedAction = (user: User) => void;

type RequireAuthOptions = {
  requireCompleteProfile?: boolean;
};

type PendingAction = {
  action: ProtectedAction;
  requireCompleteProfile: boolean;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  modal: AuthModal;
  openLogin: () => void;
  openRegister: () => void;
  openProfile: () => void;
  closeModal: () => void;

  requireAuth: (action: ProtectedAction, options?: RequireAuthOptions) => void;

  setAuthenticatedUser: (user: User) => void;
  updateUser: (user: User) => void;
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

  const pendingActionRef = useRef<PendingAction | null>(null);

  useEffect(() => {
    setTokenState(getToken());
    setIsInitialized(true);
  }, []);

  // scroll lock roca modali giaa
  useEffect(() => {
    if (!modal) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modal]);

  // davabrunot logged in useris info app bootisas
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

  //  movtxovot users autorizacia garkveuli mokmedebebebis shesrulebisas
  function requireAuth(
    action: ProtectedAction,
    options: RequireAuthOptions = {},
  ) {
    const requireCompleteProfile = options.requireCompleteProfile ?? false;

    // shevinaxot shesasrulebeli action
    if (!user) {
      pendingActionRef.current = {
        action,
        requireCompleteProfile,
      };

      setModal("login");

      return;
    }

    if (requireCompleteProfile && !user.profileComplete) {
      pendingActionRef.current = {
        action,
        requireCompleteProfile: true,
      };

      setModal("profile");

      return;
    }

    action(user);
  }

  function setAuthenticatedUser(authenticatedUser: User) {
    setTokenState(getToken());

    queryClient.setQueryData(authKeys.me, authenticatedUser);

    const pendingAction = pendingActionRef.current;

    if (!pendingAction) {
      setModal(null);
      return;
    }

    if (
      pendingAction.requireCompleteProfile &&
      !authenticatedUser.profileComplete
    ) {
      setModal("profile");
      return;
    }

    pendingActionRef.current = null;

    setModal(null);

    pendingAction.action(authenticatedUser);
  }

  function updateUser(updatedUser: User) {
    queryClient.setQueryData(authKeys.me, updatedUser);

    const pendingAction = pendingActionRef.current;

    if (!pendingAction) {
      setModal(null);
      return;
    }

    if (pendingAction.requireCompleteProfile && !updatedUser.profileComplete) {
      return;
    }

    pendingActionRef.current = null;

    setModal(null);

    pendingAction.action(updatedUser);
  }

  function clearAuth() {
    removeToken();

    setTokenState(null);

    queryClient.setQueryData(authKeys.me, null);

    pendingActionRef.current = null;

    setModal(null);
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
        updateUser,
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
