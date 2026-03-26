import { useState, useCallback } from "react";
import { historyService } from "../services";

/**
 * Trend data from backend /api/history/* (see historyController).
 */
const useTrendData = () => {
  const [trends, setTrends] = useState({
    oxygenPurity: [],
    flowRate: [],
    pressure: [],
    storageLevel: [],
    storageLevelMonthly: [],
    demandCoverage: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOxygenPurityTrend = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = await historyService.getOxygenPurityTrend();
      const series = payload?.data || [];
      setTrends((prev) => ({ ...prev, oxygenPurity: series }));
      return series;
    } catch (err) {
      console.error("Error fetching oxygen purity trend:", err);
      setError(err.message || "Failed to fetch oxygen purity trend");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFlowRateTrend = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = await historyService.getFlowRateTrend();
      const series = payload?.data || [];
      setTrends((prev) => ({ ...prev, flowRate: series }));
      return series;
    } catch (err) {
      console.error("Error fetching flow rate trend:", err);
      setError(err.message || "Failed to fetch flow rate trend");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPressureTrend = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = await historyService.getPressureTrend();
      const series = payload?.data || [];
      setTrends((prev) => ({ ...prev, pressure: series }));
      return series;
    } catch (err) {
      console.error("Error fetching pressure trend:", err);
      setError(err.message || "Failed to fetch pressure trend");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStorageLevelMonthly = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = await historyService.getStorageLevelMonthly();
      setTrends((prev) => ({ ...prev, storageLevelMonthly: payload }));
      return payload;
    } catch (err) {
      console.error("Error fetching monthly storage level:", err);
      setError(err.message || "Failed to fetch monthly storage level");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStorageLevelTrend = fetchStorageLevelMonthly;

  const fetchAllTrends = useCallback(async (demandCoverageFallback) => {
    try {
      setLoading(true);
      setError(null);
      const [oxygen, flow, pressure] = await Promise.all([
        historyService.getOxygenPurityTrend(),
        historyService.getFlowRateTrend(),
        historyService.getPressureTrend(),
      ]);

      const o = oxygen?.data || [];
      const f = flow?.data || [];
      const p = pressure?.data || [];

      setTrends({
        oxygenPurity: o,
        flowRate: f,
        pressure: p,
        storageLevel: [],
        storageLevelMonthly: [],
        demandCoverage: [],
      });

      return {
        oxygenPurity: o,
        flowRate: f,
        pressure: p,
        demandCoverage: demandCoverageFallback,
      };
    } catch (err) {
      console.error("Error fetching all trends:", err);
      setError(err.message || "Failed to fetch trends");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trends,
    loading,
    error,
    fetchOxygenPurityTrend,
    fetchFlowRateTrend,
    fetchPressureTrend,
    fetchStorageLevelTrend,
    fetchStorageLevelMonthly,
    fetchDemandCoverageTrend: fetchFlowRateTrend,
    fetchAllTrends,
    setTrends,
    setError,
  };
};

export default useTrendData;
