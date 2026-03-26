import apiClient from "./api";

export const systemHealthService = {
  /**
   * Latest single health record (backend: GET /system-health/latest)
   */
  getLatestHealth: async () => {
    try {
      const response = await apiClient.get("/system-health/latest");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Current system health — same as latest for dashboard use
   */
  getSystemHealth: async () => {
    return systemHealthService.getLatestHealth();
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
   * All health records (backend has no /history; use list sorted by time)
   */
  getSystemHealthHistory: async (params = {}) => {
    try {
      const response = await apiClient.get("/system-health", { params });
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
   * Logging status from latest health document
   */
  getLoggingStatus: async () => {
    try {
      const latest = await systemHealthService.getLatestHealth();
      return latest ? { logging_status: latest.logging_status } : null;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Dashboard status from latest health document
   */
  getDashboardStatus: async () => {
    try {
      const latest = await systemHealthService.getLatestHealth();
      return latest ? { dashboard_status: latest.dashboard_status } : null;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
