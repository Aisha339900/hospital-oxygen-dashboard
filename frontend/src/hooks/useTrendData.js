import { useState, useEffect, useCallback } from "react";
import * as api from "../services/api";

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

  const fetchOxygenPurityTrend = useCallback(async (days = 14) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getOxygenPurityTrend(days);
      setTrends((prev) => ({ ...prev, oxygenPurity: response.data }));
      return response.data;
    } catch (err) {
      console.error("Error fetching oxygen purity trend:", err);
      setError(err.message || "Failed to fetch oxygen purity trend");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFlowRateTrend = useCallback(async (days = 14) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getFlowRateTrend(days);
      setTrends((prev) => ({ ...prev, flowRate: response.data }));
      return response.data;
    } catch (err) {
      console.error("Error fetching flow rate trend:", err);
      setError(err.message || "Failed to fetch flow rate trend");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPressureTrend = useCallback(async (days = 14) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getPressureTrend(days);
      setTrends((prev) => ({ ...prev, pressure: response.data }));
      return response.data;
    } catch (err) {
      console.error("Error fetching pressure trend:", err);
      setError(err.message || "Failed to fetch pressure trend");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStorageLevelTrend = useCallback(async (days = 14) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getStorageLevelTrend(days);
      setTrends((prev) => ({ ...prev, storageLevel: response.data }));
      return response.data;
    } catch (err) {
      console.error("Error fetching storage level trend:", err);
      setError(err.message || "Failed to fetch storage level trend");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStorageLevelMonthly = useCallback(async (months = 6) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getStorageLevelMonthly(months);
      setTrends((prev) => ({ ...prev, storageLevelMonthly: response.data }));
      return response.data;
    } catch (err) {
      console.error("Error fetching monthly storage level:", err);
      setError(err.message || "Failed to fetch monthly storage level");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDemandCoverageTrend = useCallback(async (days = 14) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDemandCoverageTrend(days);
      setTrends((prev) => ({ ...prev, demandCoverage: response.data }));
      return response.data;
    } catch (err) {
      console.error("Error fetching demand coverage trend:", err);
      setError(err.message || "Failed to fetch demand coverage trend");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllTrends = useCallback(async (days = 14) => {
    try {
      setLoading(true);
      setError(null);
      const [oxygen, flow, pressure, storage, demand] = await Promise.all([
        api.getOxygenPurityTrend(days),
        api.getFlowRateTrend(days),
        api.getPressureTrend(days),
        api.getStorageLevelTrend(days),
        api.getDemandCoverageTrend(days),
      ]);

      setTrends({
        oxygenPurity: oxygen.data,
        flowRate: flow.data,
        pressure: pressure.data,
        storageLevel: storage.data,
        storageLevelMonthly: [],
        demandCoverage: demand.data,
      });

      return {
        oxygenPurity: oxygen.data,
        flowRate: flow.data,
        pressure: pressure.data,
        storageLevel: storage.data,
        demandCoverage: demand.data,
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
    fetchDemandCoverageTrend,
    fetchAllTrends,
    setTrends,
    setError,
  };
};

export default useTrendData;
