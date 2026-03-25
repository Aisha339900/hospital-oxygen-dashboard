import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { useSystemHealth } from "../hooks/useSystemHealth";

const SystemHealthContext = createContext();

const initialState = {
  systemHealth: null,
  healthHistory: [],
  loggingStatus: null,
  dashboardStatus: null,
  loading: false,
  error: null,
};

const systemHealthReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_HEALTH_SUCCESS":
      return {
        ...state,
        systemHealth: action.payload,
        loading: false,
      };
    case "FETCH_HEALTH_HISTORY_SUCCESS":
      return {
        ...state,
        healthHistory: action.payload,
        loading: false,
      };
    case "FETCH_LOGGING_STATUS_SUCCESS":
      return {
        ...state,
        loggingStatus: action.payload,
        loading: false,
      };
    case "FETCH_DASHBOARD_STATUS_SUCCESS":
      return {
        ...state,
        dashboardStatus: action.payload,
        loading: false,
      };
    case "CREATE_SUCCESS":
      return {
        ...state,
        systemHealth: action.payload,
        loading: false,
      };
    case "UPDATE_SUCCESS":
      return {
        ...state,
        systemHealth: action.payload,
        loading: false,
      };
    case "FETCH_FAILURE":
      return { ...state, loading: false, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

export const SystemHealthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(systemHealthReducer, initialState);
  const systemHealthHook = useSystemHealth({ autoFetch: false });

  const fetchSystemHealth = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      await systemHealthHook.fetchSystemHealth();
      dispatch({
        type: "FETCH_HEALTH_SUCCESS",
        payload: systemHealthHook.systemHealth,
      });
    } catch (error) {
      dispatch({
        type: "FETCH_FAILURE",
        payload: error.message || "Failed to fetch system health",
      });
    }
  }, [systemHealthHook]);

  const fetchSystemHealthHistory = useCallback(
    async (params = {}) => {
      dispatch({ type: "FETCH_START" });
      try {
        await systemHealthHook.fetchSystemHealthHistory(params);
        dispatch({
          type: "FETCH_HEALTH_HISTORY_SUCCESS",
          payload: systemHealthHook.healthHistory,
        });
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to fetch system health history",
        });
      }
    },
    [systemHealthHook],
  );

  const fetchLoggingStatus = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      await systemHealthHook.fetchLoggingStatus();
      dispatch({
        type: "FETCH_LOGGING_STATUS_SUCCESS",
        payload: systemHealthHook.loggingStatus,
      });
    } catch (error) {
      dispatch({
        type: "FETCH_FAILURE",
        payload: error.message || "Failed to fetch logging status",
      });
    }
  }, [systemHealthHook]);

  const fetchDashboardStatus = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      await systemHealthHook.fetchDashboardStatus();
      dispatch({
        type: "FETCH_DASHBOARD_STATUS_SUCCESS",
        payload: systemHealthHook.dashboardStatus,
      });
    } catch (error) {
      dispatch({
        type: "FETCH_FAILURE",
        payload: error.message || "Failed to fetch dashboard status",
      });
    }
  }, [systemHealthHook]);

  const createSystemHealth = useCallback(
    async (data) => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await systemHealthHook.createSystemHealth(data);
        dispatch({ type: "CREATE_SUCCESS", payload: response });
        return response;
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to create system health record",
        });
      }
    },
    [systemHealthHook],
  );

  const updateSystemHealth = useCallback(
    async (id, data) => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await systemHealthHook.updateSystemHealth(id, data);
        dispatch({ type: "UPDATE_SUCCESS", payload: response });
        return response;
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to update system health",
        });
      }
    },
    [systemHealthHook],
  );

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value = {
    ...state,
    fetchSystemHealth,
    fetchSystemHealthHistory,
    fetchLoggingStatus,
    fetchDashboardStatus,
    createSystemHealth,
    updateSystemHealth,
    clearError,
  };

  return (
    <SystemHealthContext.Provider value={value}>
      {children}
    </SystemHealthContext.Provider>
  );
};

export const useSystemHealthContext = () => {
  const context = useContext(SystemHealthContext);
  if (!context) {
    throw new Error(
      "useSystemHealthContext must be used within a SystemHealthProvider",
    );
  }
  return context;
};
