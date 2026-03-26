import { useState, useEffect, useCallback } from "react";
import { alarmService } from "../services";

/**
 * Custom hook for fetching and managing alarms
 */
export const useAlarms = (options = {}) => {
  const [alarms, setAlarms] = useState([]);
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    severity: null,
    status: null,
  });

  const fetchAlarms = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await alarmService.getAllAlarms(params);
      setAlarms(Array.isArray(response) ? response : response?.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch alarms");
      console.error("Error fetching alarms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveAlarms = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await alarmService.getActiveAlarms(params);
      setActiveAlarms(
        Array.isArray(response) ? response : response?.data || [],
      );
    } catch (err) {
      setError(err.message || "Failed to fetch active alarms");
      console.error("Error fetching active alarms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAlarmById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await alarmService.getAlarmById(id);
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch alarm");
      console.error("Error fetching alarm:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAlarmsBySeverity = useCallback(async (severity) => {
    setLoading(true);
    setError(null);
    try {
      const response = await alarmService.getAlarmsBySeverity(severity);
      return response.data || [];
    } catch (err) {
      setError(err.message || "Failed to fetch alarms by severity");
      console.error("Error fetching alarms by severity:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAlarm = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await alarmService.createAlarm(data);
        setAlarms([response, ...alarms]);
        return response;
      } catch (err) {
        setError(err.message || "Failed to create alarm");
        console.error("Error creating alarm:", err);
      } finally {
        setLoading(false);
      }
    },
    [alarms],
  );

  const updateAlarm = useCallback(
    async (id, data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await alarmService.updateAlarm(id, data);
        setAlarms(alarms.map((a) => (a._id === id ? response : a)));
        return response;
      } catch (err) {
        setError(err.message || "Failed to update alarm");
        console.error("Error updating alarm:", err);
      } finally {
        setLoading(false);
      }
    },
    [alarms],
  );

  const acknowledgeAlarm = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await alarmService.acknowledgeAlarm(id);
        setAlarms(alarms.map((a) => (a._id === id ? response : a)));
        setActiveAlarms(activeAlarms.map((a) => (a._id === id ? response : a)));
        return response;
      } catch (err) {
        setError(err.message || "Failed to acknowledge alarm");
        console.error("Error acknowledging alarm:", err);
      } finally {
        setLoading(false);
      }
    },
    [alarms, activeAlarms],
  );

  const resolveAlarm = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await alarmService.resolveAlarm(id);
        setAlarms(alarms.map((a) => (a._id === id ? response : a)));
        setActiveAlarms(activeAlarms.filter((a) => a._id !== id));
        return response;
      } catch (err) {
        setError(err.message || "Failed to resolve alarm");
        console.error("Error resolving alarm:", err);
      } finally {
        setLoading(false);
      }
    },
    [alarms, activeAlarms],
  );

  const deleteAlarm = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await alarmService.deleteAlarm(id);
        setAlarms(alarms.filter((a) => a._id !== id));
        setActiveAlarms(activeAlarms.filter((a) => a._id !== id));
      } catch (err) {
        setError(err.message || "Failed to delete alarm");
        console.error("Error deleting alarm:", err);
      } finally {
        setLoading(false);
      }
    },
    [alarms, activeAlarms],
  );

  const getAlarmStats = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await alarmService.getAlarmStats(params);
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch alarm stats");
      console.error("Error fetching alarm stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAlarmHistory = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await alarmService.getAlarmHistory(params);
      return response.data || [];
    } catch (err) {
      setError(err.message || "Failed to fetch alarm history");
      console.error("Error fetching alarm history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchAlarms(filter);
      fetchActiveAlarms(filter);
    }
  }, [options.autoFetch, fetchAlarms, fetchActiveAlarms, filter]);

  // Auto-refresh if interval is set
  useEffect(() => {
    if (!options.refreshInterval) return;

    const interval = setInterval(() => {
      fetchAlarms(filter);
      fetchActiveAlarms(filter);
    }, options.refreshInterval);

    return () => clearInterval(interval);
  }, [options.refreshInterval, fetchAlarms, fetchActiveAlarms, filter]);

  return {
    alarms,
    activeAlarms,
    loading,
    error,
    filter,
    setFilter,
    fetchAlarms,
    fetchActiveAlarms,
    getAlarmById,
    getAlarmsBySeverity,
    createAlarm,
    updateAlarm,
    acknowledgeAlarm,
    resolveAlarm,
    deleteAlarm,
    getAlarmStats,
    getAlarmHistory,
  };
};
