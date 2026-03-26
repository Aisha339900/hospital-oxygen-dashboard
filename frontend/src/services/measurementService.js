import apiClient from "./api";

export const measurementService = {
  /**
   * Get all measurements
   */
  getAllMeasurements: async (params = {}) => {
    try {
      const response = await apiClient.get("/measurements", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get measurement by ID
   */
  getMeasurementById: async (id) => {
    try {
      const response = await apiClient.get(`/measurements/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Latest system measurement (backend: GET /measurements/current)
   */
  getCurrentMeasurements: async () => {
    try {
      const response = await apiClient.get("/measurements/current");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get latest measurement (alias for current)
   */
  getLatestMeasurement: async () => {
    return measurementService.getCurrentMeasurements();
  },

  /**
   * Get measurements by date range (backend: GET /measurements/range?startDate=&endDate=)
   */
  getMeasurementsByTimeRange: async (startTime, endTime) => {
    try {
      const response = await apiClient.get("/measurements/range", {
        params: {
          startDate: startTime,
          endDate: endTime,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create new measurement
   */
  createMeasurement: async (data) => {
    try {
      const response = await apiClient.post("/measurements", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update measurement
   */
  updateMeasurement: async (id, data) => {
    try {
      const response = await apiClient.put(`/measurements/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete measurement
   */
  deleteMeasurement: async (id) => {
    try {
      const response = await apiClient.delete(`/measurements/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get measurement statistics
   */
  getMeasurementStats: async (params = {}) => {
    try {
      const response = await apiClient.get("/measurements/stats", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
