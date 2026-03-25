import apiClient from "./api";

export const backupService = {
  /**
   * Get all backups
   */
  getAllBackups: async (params = {}) => {
    try {
      const response = await apiClient.get("/backups", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get backup by ID
   */
  getBackupById: async (id) => {
    try {
      const response = await apiClient.get(`/backups/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create new backup
   */
  createBackup: async (data) => {
    try {
      const response = await apiClient.post("/backups", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update backup
   */
  updateBackup: async (id, data) => {
    try {
      const response = await apiClient.put(`/backups/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete backup
   */
  deleteBackup: async (id) => {
    try {
      const response = await apiClient.delete(`/backups/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Start backup process
   */
  startBackup: async (data) => {
    try {
      const response = await apiClient.post("/backups/start", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Restore from backup
   */
  restoreBackup: async (backupId) => {
    try {
      const response = await apiClient.post(`/backups/${backupId}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get backup status
   */
  getBackupStatus: async () => {
    try {
      const response = await apiClient.get("/backups/status");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
