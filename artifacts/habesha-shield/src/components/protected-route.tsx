import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Redirect } from "wouter";

export function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode, adminOnly?: boolean }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center h-full">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Redirect to="/login" />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}
