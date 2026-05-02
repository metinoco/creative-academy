import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth, AppRole } from "@/context/AuthContext";

interface Props {
  children: ReactNode;
  requireRole?: AppRole;
}

const ProtectedRoute = ({ children, requireRole }: Props) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="font-display text-2xl font-black animate-pulse">Cargando…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireRole && role !== requireRole) {
    return <Navigate to={role === "admin" ? "/admin" : "/alumno"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
