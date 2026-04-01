import apiClient from "./api";

const DEFAULT_SCENARIO = "normal";

export const demandStatusService = {
  getDemandStatus: async (scenario = DEFAULT_SCENARIO) => {
    try {
      const response = await apiClient.get("/demand-status", {
        params: { scenario },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  getAllDemandStatuses: async () => {
    try {
      const response = await apiClient.get("/demand-status/all");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
