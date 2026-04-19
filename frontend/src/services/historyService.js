import apiClient from "./api";

/** Trend and history endpoints (see backend/routes/index.js). */
export const historyService = {
  // Legacy methods for removed charts:
  getOxygenPurityTrend: async () => {
    // const { data } = await apiClient.get("/history/oxygen-purity");
    // return data;
    return { data: [] };
  },

  getFlowRateTrend: async () => {
    // const { data } = await apiClient.get("/history/flow-rate");
    // return data;
    return { data: [] };
  },

  getPressureTrend: async () => {
    // const { data } = await apiClient.get("/history/pressure");
    // return data;
    return { data: [] };
  },

  getStorageLevelMonthly: async () => {
    // const { data } = await apiClient.get("/history/storage-monthly");
    // return data;
    return { lastMonth: [], thisMonth: [] };
  },

  getTrendData: async () => {
    const { data } = await apiClient.get("/history/trend-data");
    return data;
  },
};
