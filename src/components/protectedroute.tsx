import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { onUserStateChanged } from "../firebase/authService";

interface ProtectedRouteProps {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [userChecked, setUserChecked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onUserStateChanged((u) => {
      setUser(u);
      setUserChecked(true);
    });
    return () => unsubscribe();
  }, []);

  if (!userChecked) return <div>Checking authentication...</div>;

  // Only redirect if the user is not logged in AND trying to access dashboard
  if (!user && location.pathname !== "/login" && location.pathname !== "/") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
