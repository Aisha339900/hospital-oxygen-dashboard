import { useState, useEffect, useCallback } from "react";
import { authService } from "../services";

/**
 * Custom hook for authentication
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.message || "Login failed");
      console.error("Error logging in:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      setError(err.message || "Registration failed");
      console.error("Error registering:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      setError(err.message || "Logout failed");
      console.error("Error logging out:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.getCurrentUser();
      setUser(response);
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch current user");
      console.error("Error fetching current user:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.refreshToken();
      return response;
    } catch (err) {
      setError(err.message || "Token refresh failed");
      setIsAuthenticated(false);
      setUser(null);
      console.error("Error refreshing token:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.resetPassword(email);
      return response;
    } catch (err) {
      setError(err.message || "Password reset failed");
      console.error("Error resetting password:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmPasswordReset = useCallback(async (token, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.confirmPasswordReset(
        token,
        newPassword,
      );
      return response;
    } catch (err) {
      setError(err.message || "Password reset confirmation failed");
      console.error("Error confirming password reset:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.changePassword(
        oldPassword,
        newPassword,
      );
      return response;
    } catch (err) {
      setError(err.message || "Password change failed");
      console.error("Error changing password:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    getCurrentUser,
    refreshToken,
    resetPassword,
    confirmPasswordReset,
    changePassword,
  };
};
