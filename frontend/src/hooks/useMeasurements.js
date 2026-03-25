import { useState, useEffect, useCallback } from "react";
import { measurementService } from "../services";

/**
 * Custom hook for fetching and managing measurements
 */
export const useMeasurements = (options = {}) => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchMeasurements = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const response = await measurementService.getAllMeasurements({
          page: pagination.page,
          limit: pagination.limit,
          ...params,
        });
        setMeasurements(response.data || []);
        setPagination({
          ...pagination,
          total: response.total || 0,
        });
      } catch (err) {
        setError(err.message || "Failed to fetch measurements");
        console.error("Error fetching measurements:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination],
  );

  const getLatestMeasurement = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await measurementService.getLatestMeasurement();
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch latest measurement");
      console.error("Error fetching latest measurement:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getMeasurementById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await measurementService.getMeasurementById(id);
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch measurement");
      console.error("Error fetching measurement:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getMeasurementsByTimeRange = useCallback(async (startTime, endTime) => {
    setLoading(true);
    setError(null);
    try {
      const response = await measurementService.getMeasurementsByTimeRange(
        startTime,
        endTime,
      );
      setMeasurements(response.data || []);
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch measurements by time range");
      console.error("Error fetching measurements by time range:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMeasurement = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await measurementService.createMeasurement(data);
        setMeasurements([response, ...measurements]);
        return response;
      } catch (err) {
        setError(err.message || "Failed to create measurement");
        console.error("Error creating measurement:", err);
      } finally {
        setLoading(false);
      }
    },
    [measurements],
  );

  const updateMeasurement = useCallback(
    async (id, data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await measurementService.updateMeasurement(id, data);
        setMeasurements(measurements.map((m) => (m._id === id ? response : m)));
        return response;
      } catch (err) {
        setError(err.message || "Failed to update measurement");
        console.error("Error updating measurement:", err);
      } finally {
        setLoading(false);
      }
    },
    [measurements],
  );

  const deleteMeasurement = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await measurementService.deleteMeasurement(id);
        setMeasurements(measurements.filter((m) => m._id !== id));
      } catch (err) {
        setError(err.message || "Failed to delete measurement");
        console.error("Error deleting measurement:", err);
      } finally {
        setLoading(false);
      }
    },
    [measurements],
  );

  const getMeasurementStats = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await measurementService.getMeasurementStats(params);
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch measurement stats");
      console.error("Error fetching measurement stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchMeasurements();
    }
  }, [options.autoFetch, fetchMeasurements]);

  // Auto-refresh if interval is set
  useEffect(() => {
    if (!options.refreshInterval) return;

    const interval = setInterval(() => {
      fetchMeasurements();
    }, options.refreshInterval);

    return () => clearInterval(interval);
  }, [options.refreshInterval, fetchMeasurements]);

  return {
    measurements,
    loading,
    error,
    pagination,
    setPagination,
    fetchMeasurements,
    getLatestMeasurement,
    getMeasurementById,
    getMeasurementsByTimeRange,
    createMeasurement,
    updateMeasurement,
    deleteMeasurement,
    getMeasurementStats,
  };
};
