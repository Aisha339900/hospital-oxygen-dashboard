import apiClient from "./api";

const DEFAULT_SCENARIO = "normal";

export const supplyStatusService = {
  getSupplyStatus: async (scenario = DEFAULT_SCENARIO) => {
    try {
      const response = await apiClient.get("/supply-status", {
        params: { scenario },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  getAllSupplyStatuses: async () => {
    try {
      const response = await apiClient.get("/supply-status/all");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
