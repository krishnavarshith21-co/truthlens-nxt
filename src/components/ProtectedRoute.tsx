import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen message="Checking authentication..." />;
  return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
