import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = document.cookie.includes("session"); // Check if logged in

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;

