import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAppStore } from "@/lib/store";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean; // default = true
}

export const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const token = useAppStore((s) => s.token);
  const user = useAppStore((s) => s.user);
  const location = useLocation();

  const isAuthenticated = !!(token);

  // 🔒 Protected route: must be authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🚫 Public route (login/register): already authenticated → redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // ✅ Otherwise render normally
  return <>{children}</>;
};
