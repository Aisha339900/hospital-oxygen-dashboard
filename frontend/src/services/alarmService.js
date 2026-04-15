import apiClient from "./api";

export const alarmService = {
  /**
   * Get all alarms
   */
  getAllAlarms: async (params = {}) => {
    try {
      const response = await apiClient.get("/alarms", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get alarm by ID
   */
  getAlarmById: async (id) => {
    try {
      const response = await apiClient.get(`/alarms/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get active alarms
   */
  getActiveAlarms: async (params = {}) => {
    try {
      const response = await apiClient.get("/alarms/active", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Sync rule-engine alarms from dashboard evaluation payload (same inputs as UI).
   */
  syncDashboardAlarms: async (body) => {
    try {
      const response = await apiClient.post("/alarms/sync-dashboard", body);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get alarms by severity
   */
  getAlarmsBySeverity: async (severity) => {
    try {
      const response = await apiClient.get(`/alarms/severity/${severity}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create new alarm
   */
  createAlarm: async (data) => {
    try {
      const response = await apiClient.post("/alarms", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update alarm (backend: PUT /alarms/:id with { status })
   */
  updateAlarm: async (id, data) => {
    try {
      const response = await apiClient.put(`/alarms/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Acknowledge alarm
   */
  acknowledgeAlarm: async (id) => {
    return alarmService.updateAlarm(id, { status: "acknowledged" });
  },

  /**
   * Resolve alarm
   */
  resolveAlarm: async (id) => {
    return alarmService.updateAlarm(id, { status: "resolved" });
  },

  /**
   * Delete alarm
   */
  deleteAlarm: async (id) => {
    try {
      const response = await apiClient.delete(`/alarms/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get alarm statistics
   */
  getAlarmStats: async (params = {}) => {
    try {
      const response = await apiClient.get("/alarms/stats", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get alarm history
   */
  getAlarmHistory: async (params = {}) => {
    try {
      const response = await apiClient.get("/alarms/history", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
