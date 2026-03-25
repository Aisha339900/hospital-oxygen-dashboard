import apiClient from "./api";

export const authService = {
  /**
   * Login user
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      return { success: true };
    } catch (error) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      throw error.response?.data || error;
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Refresh token
   */
  refreshToken: async () => {
    try {
      const response = await apiClient.post("/auth/refresh-token");
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (email) => {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Confirm password reset
   */
  confirmPasswordReset: async (token, newPassword) => {
    try {
      const response = await apiClient.post("/auth/confirm-reset", {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Change password
   */
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await apiClient.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
