import { useState, useEffect, useCallback } from "react";
import { backupService } from "../services";

/**
 * Custom hook for managing backups
 */
export const useBackup = (options = {}) => {
  const [backups, setBackups] = useState([]);
  const [backupStatus, setBackupStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBackups = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await backupService.getAllBackups(params);
      setBackups(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch backups");
      console.error("Error fetching backups:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBackupById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await backupService.getBackupById(id);
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch backup");
      console.error("Error fetching backup:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBackup = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await backupService.createBackup(data);
        setBackups([response, ...backups]);
        return response;
      } catch (err) {
        setError(err.message || "Failed to create backup");
        console.error("Error creating backup:", err);
      } finally {
        setLoading(false);
      }
    },
    [backups],
  );

  const updateBackup = useCallback(
    async (id, data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await backupService.updateBackup(id, data);
        setBackups(backups.map((b) => (b._id === id ? response : b)));
        return response;
      } catch (err) {
        setError(err.message || "Failed to update backup");
        console.error("Error updating backup:", err);
      } finally {
        setLoading(false);
      }
    },
    [backups],
  );

  const deleteBackup = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await backupService.deleteBackup(id);
        setBackups(backups.filter((b) => b._id !== id));
      } catch (err) {
        setError(err.message || "Failed to delete backup");
        console.error("Error deleting backup:", err);
      } finally {
        setLoading(false);
      }
    },
    [backups],
  );

  const startBackup = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await backupService.startBackup(data);
      return response;
    } catch (err) {
      setError(err.message || "Failed to start backup");
      console.error("Error starting backup:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreBackup = useCallback(async (backupId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await backupService.restoreBackup(backupId);
      return response;
    } catch (err) {
      setError(err.message || "Failed to restore backup");
      console.error("Error restoring backup:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBackupStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await backupService.getBackupStatus();
      setBackupStatus(response);
    } catch (err) {
      setError(err.message || "Failed to fetch backup status");
      console.error("Error fetching backup status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchBackups();
      fetchBackupStatus();
    }
  }, [options.autoFetch, fetchBackups, fetchBackupStatus]);

  // Auto-refresh if interval is set
  useEffect(() => {
    if (!options.refreshInterval) return;

    const interval = setInterval(() => {
      fetchBackups();
      fetchBackupStatus();
    }, options.refreshInterval);

    return () => clearInterval(interval);
  }, [options.refreshInterval, fetchBackups, fetchBackupStatus]);

  return {
    backups,
    backupStatus,
    loading,
    error,
    fetchBackups,
    getBackupById,
    createBackup,
    updateBackup,
    deleteBackup,
    startBackup,
    restoreBackup,
    fetchBackupStatus,
  };
};
