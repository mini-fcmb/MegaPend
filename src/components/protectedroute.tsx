// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

interface ProtectedRouteProps {
  children: JSX.Element; // the component to render if logged in
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
