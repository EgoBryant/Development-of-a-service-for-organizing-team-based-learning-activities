import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../types/auth";
import { loginRequest, registerRequest } from "../lib/api";
import {
  clearStoredAuth,
  readStoredAuth,
  storeAuth,
} from "../lib/auth-storage";

type AuthContextValue = {
  auth: AuthResponse | null;
  isAuthenticated: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [auth, setAuth] = useState<AuthResponse | null>(() => readStoredAuth());

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      isAuthenticated: Boolean(auth?.token),
      async signIn(payload) {
        const response = await loginRequest(payload);
        storeAuth(response);
        setAuth(response);
      },
      async signUp(payload) {
        const response = await registerRequest(payload);
        storeAuth(response);
        setAuth(response);
      },
      signOut() {
        clearStoredAuth();
        setAuth(null);
      },
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
