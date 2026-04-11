import axios from "axios";

const PREDICTIVE_API_BASE_URL =
  process.env.REACT_APP_PREDICTIVE_API_URL || "http://localhost:8000";

const predictiveApiClient = axios.create({
  baseURL: PREDICTIVE_API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const predictiveAnalyticsService = {
  getOxygenPurityForecast: async (days = 7) => {
    const { data } = await predictiveApiClient.get(
      `/api/oxygen-purity/forecast?days=${days}`,
    );
    return data;
  },
};
