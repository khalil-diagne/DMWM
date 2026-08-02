import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";
import React from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="px-5 py-24 text-center text-ink/50">Chargement…</div>;
  return user ? children : <Navigate to="/connexion-admin" replace />;
}
