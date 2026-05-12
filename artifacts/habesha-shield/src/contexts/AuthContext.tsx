import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, useGetMe, setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refetchUser?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("ethiowave_token"));

  // Register the token getter so customFetch sends Authorization header on every request
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("ethiowave_token"));
    return () => setAuthTokenGetter(null);
  }, []);

  const { data: fetchedUser, isLoading: isFetchingMe, error, refetch } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    } as any,
  });

  useEffect(() => {
    if (error) {
      setToken(null);
      localStorage.removeItem("ethiowave_token");
    }
  }, [error]);

  const login = useCallback((newToken: string, _user: User) => {
    localStorage.setItem("ethiowave_token", newToken);
    setToken(newToken);
    setAuthTokenGetter(() => newToken);
    // Refetch user from server to populate context
    setTimeout(() => refetch(), 50);
  }, [refetch]);

  const logout = useCallback(() => {
    localStorage.removeItem("ethiowave_token");
    setToken(null);
    setAuthTokenGetter(() => null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: fetchedUser ?? null,
        token,
        isAuthenticated: !!token && !!fetchedUser,
        isLoading: isFetchingMe && !!token,
        login,
        logout,
        refetchUser: refetch as any,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
