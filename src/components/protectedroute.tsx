import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase/config"; // make sure the path matches your firebase config
import { useAuthState } from "react-firebase-hooks/auth";

interface Props {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>; // optional loading state
  if (!user) return <Navigate to="/login" />; // redirect if not logged in

  return children; // allow access if user is logged in
};

export default ProtectedRoute;
