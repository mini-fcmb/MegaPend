import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onUserStateChanged } from "../firebase/authService";

interface ProtectedRouteProps {
  children: JSX.Element;
  role: "teacher" | "student";
}

export default function ProtectedRoute({
  children,
  role,
}: ProtectedRouteProps) {
  const [userChecked, setUserChecked] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onUserStateChanged((u) => {
      setUser(u);
      setUserChecked(true);
    });
    return () => unsubscribe();
  }, []);

  if (!userChecked) return <div>Checking authentication...</div>;

  if (!user) return <Navigate to="/login" replace />;

  // Ensure user has correct role
  const storedRole = localStorage.getItem("role");
  if (storedRole !== role) return <Navigate to="/login" replace />;

  return children;
}
