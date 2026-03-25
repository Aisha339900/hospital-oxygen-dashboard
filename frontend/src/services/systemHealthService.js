import apiClient from "./api";

export const systemHealthService = {
  /**
   * Get current system health
   */
  getSystemHealth: async () => {
    try {
      const response = await apiClient.get("/system-health");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get system health by ID
   */
  getSystemHealthById: async (id) => {
    try {
      const response = await apiClient.get(`/system-health/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get system health history
   */
  getSystemHealthHistory: async (params = {}) => {
    try {
      const response = await apiClient.get("/system-health/history", {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create system health record
   */
  createSystemHealth: async (data) => {
    try {
      const response = await apiClient.post("/system-health", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update system health
   */
  updateSystemHealth: async (id, data) => {
    try {
      const response = await apiClient.put(`/system-health/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get logging status
   */
  getLoggingStatus: async () => {
    try {
      const response = await apiClient.get("/system-health/logging-status");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get dashboard status
   */
  getDashboardStatus: async () => {
    try {
      const response = await apiClient.get("/system-health/dashboard-status");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
