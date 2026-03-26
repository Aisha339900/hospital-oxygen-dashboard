import { useState, useEffect, useCallback } from "react";
import { systemHealthService } from "../services";

/**
 * Custom hook for fetching and managing system health
 */
export const useSystemHealth = (options = {}) => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]);
  const [loggingStatus, setLoggingStatus] = useState(null);
  const [dashboardStatus, setDashboardStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSystemHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await systemHealthService.getSystemHealth();
      setSystemHealth(response);
    } catch (err) {
      setError(err.message || "Failed to fetch system health");
      console.error("Error fetching system health:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSystemHealthById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await systemHealthService.getSystemHealthById(id);
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch system health");
      console.error("Error fetching system health:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSystemHealthHistory = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await systemHealthService.getSystemHealthHistory(params);
      setHealthHistory(
        Array.isArray(response) ? response : response?.data || [],
      );
    } catch (err) {
      setError(err.message || "Failed to fetch system health history");
      console.error("Error fetching system health history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSystemHealth = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await systemHealthService.createSystemHealth(data);
      setSystemHealth(response);
      return response;
    } catch (err) {
      setError(err.message || "Failed to create system health record");
      console.error("Error creating system health record:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSystemHealth = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await systemHealthService.updateSystemHealth(id, data);
      setSystemHealth(response);
      return response;
    } catch (err) {
      setError(err.message || "Failed to update system health");
      console.error("Error updating system health:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLoggingStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await systemHealthService.getLoggingStatus();
      setLoggingStatus(response);
    } catch (err) {
      setError(err.message || "Failed to fetch logging status");
      console.error("Error fetching logging status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboardStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await systemHealthService.getDashboardStatus();
      setDashboardStatus(response);
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard status");
      console.error("Error fetching dashboard status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchSystemHealth();
      fetchLoggingStatus();
      fetchDashboardStatus();
      if (options.includeHistory) {
        fetchSystemHealthHistory();
      }
    }
  }, [
    options.autoFetch,
    options.includeHistory,
    fetchSystemHealth,
    fetchLoggingStatus,
    fetchDashboardStatus,
    fetchSystemHealthHistory,
  ]);

  // Auto-refresh if interval is set
  useEffect(() => {
    if (!options.refreshInterval) return;

    const interval = setInterval(() => {
      fetchSystemHealth();
      fetchLoggingStatus();
      fetchDashboardStatus();
    }, options.refreshInterval);

    return () => clearInterval(interval);
  }, [
    options.refreshInterval,
    fetchSystemHealth,
    fetchLoggingStatus,
    fetchDashboardStatus,
  ]);

  return {
    systemHealth,
    healthHistory,
    loggingStatus,
    dashboardStatus,
    loading,
    error,
    fetchSystemHealth,
    getSystemHealthById,
    fetchSystemHealthHistory,
    createSystemHealth,
    updateSystemHealth,
    fetchLoggingStatus,
    fetchDashboardStatus,
  };
};
