import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role, allowedRole }) {
  if (role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;