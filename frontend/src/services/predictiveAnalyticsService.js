import axios from "axios";

const PREDICTIVE_API_BASE_URL =
  process.env.REACT_APP_PREDICTIVE_API_URL || "http://localhost:8000";

const predictiveApiClient = axios.create({
  baseURL: PREDICTIVE_API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

const FORECAST_CACHE_TTL_MS = 5 * 60 * 1000;
const forecastCacheByDays = new Map();

function readCachedForecast(days) {
  const entry = forecastCacheByDays.get(days);
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.cachedAt > FORECAST_CACHE_TTL_MS) {
    forecastCacheByDays.delete(days);
    return null;
  }
  return entry.payload;
}

function writeCachedForecast(days, payload) {
  forecastCacheByDays.set(days, {
    cachedAt: Date.now(),
    payload,
  });
}

export const predictiveAnalyticsService = {
  getOxygenPurityForecast: async (days = 7) => {
    const cached = readCachedForecast(days);
    if (cached) {
      return cached;
    }

    const { data } = await predictiveApiClient.get(
      `/api/oxygen-purity/forecast?days=${days}`,
    );
    writeCachedForecast(days, data);
    return data;
  },
};
