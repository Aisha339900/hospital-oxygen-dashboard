import apiClient from "./api";

/** Trend and history endpoints (see backend/routes/index.js). */
export const historyService = {
  getOxygenPurityTrend: async () => {
    const { data } = await apiClient.get("/history/oxygen-purity");
    return data;
  },

  getFlowRateTrend: async () => {
    const { data } = await apiClient.get("/history/flow-rate");
    return data;
  },

  getPressureTrend: async () => {
    const { data } = await apiClient.get("/history/pressure");
    return data;
  },

  getStorageLevelMonthly: async () => {
    const { data } = await apiClient.get("/history/storage-monthly");
    return data;
  },

  getTrendData: async () => {
    const { data } = await apiClient.get("/history/trend-data");
    return data;
  },
};
