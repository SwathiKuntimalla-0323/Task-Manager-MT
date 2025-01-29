import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    // If token exists, redirect to home page
    return <Navigate to="/home" replace />;
  }

  return children; // If no token, allow access
};

export default PublicRoute;