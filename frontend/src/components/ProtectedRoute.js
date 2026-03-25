import React from "react";
import { useAuthContext } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";

/**
 * ProtectedRoute wraps child content and only renders it when the user
 * is authenticated. If not authenticated, the login page is shown instead.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="loading-screen">
        <span>Loading dashboard…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return children;
}

export default ProtectedRoute;
