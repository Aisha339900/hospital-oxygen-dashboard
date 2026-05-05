import apiClient from "./api";

export const pressurePurityCapacityService = {
  getCharts: async () => {
    const { data } = await apiClient.get("/pressure-purity-capacity/charts");
    return data;
  },
};

export default pressurePurityCapacityService;