import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { useAlarms } from "../hooks/useAlarms";

const AlarmContext = createContext();

const initialState = {
  alarms: [],
  activeAlarms: [],
  loading: false,
  error: null,
  filter: { severity: null, status: null },
  stats: null,
  history: [],
};

const alarmReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_ALARMS_SUCCESS":
      return {
        ...state,
        alarms: action.payload,
        loading: false,
      };
    case "FETCH_ACTIVE_ALARMS_SUCCESS":
      return {
        ...state,
        activeAlarms: action.payload,
        loading: false,
      };
    case "CREATE_SUCCESS":
      return {
        ...state,
        alarms: [action.payload, ...state.alarms],
        activeAlarms: [action.payload, ...state.activeAlarms],
        loading: false,
      };
    case "UPDATE_SUCCESS":
      return {
        ...state,
        alarms: state.alarms.map((a) =>
          a._id === action.payload._id ? action.payload : a,
        ),
        activeAlarms: state.activeAlarms.map((a) =>
          a._id === action.payload._id ? action.payload : a,
        ),
        loading: false,
      };
    case "ACKNOWLEDGE_SUCCESS":
      return {
        ...state,
        alarms: state.alarms.map((a) =>
          a._id === action.payload._id ? action.payload : a,
        ),
        activeAlarms: state.activeAlarms.map((a) =>
          a._id === action.payload._id ? action.payload : a,
        ),
        loading: false,
      };
    case "RESOLVE_SUCCESS":
      return {
        ...state,
        alarms: state.alarms.map((a) =>
          a._id === action.payload._id ? action.payload : a,
        ),
        activeAlarms: state.activeAlarms.filter(
          (a) => a._id !== action.payload._id,
        ),
        loading: false,
      };
    case "DELETE_SUCCESS":
      return {
        ...state,
        alarms: state.alarms.filter((a) => a._id !== action.payload),
        activeAlarms: state.activeAlarms.filter(
          (a) => a._id !== action.payload,
        ),
        loading: false,
      };
    case "SET_FILTER":
      return { ...state, filter: action.payload };
    case "SET_STATS":
      return { ...state, stats: action.payload };
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    case "FETCH_FAILURE":
      return { ...state, loading: false, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AlarmProvider = ({ children }) => {
  const [state, dispatch] = useReducer(alarmReducer, initialState);
  const alarmsHook = useAlarms({ autoFetch: false });

  const fetchAlarms = useCallback(
    async (params = {}) => {
      dispatch({ type: "FETCH_START" });
      try {
        await alarmsHook.fetchAlarms(params);
        dispatch({
          type: "FETCH_ALARMS_SUCCESS",
          payload: alarmsHook.alarms,
        });
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to fetch alarms",
        });
      }
    },
    [alarmsHook],
  );

  const fetchActiveAlarms = useCallback(
    async (params = {}) => {
      dispatch({ type: "FETCH_START" });
      try {
        await alarmsHook.fetchActiveAlarms(params);
        dispatch({
          type: "FETCH_ACTIVE_ALARMS_SUCCESS",
          payload: alarmsHook.activeAlarms,
        });
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to fetch active alarms",
        });
      }
    },
    [alarmsHook],
  );

  const createAlarm = useCallback(
    async (data) => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await alarmsHook.createAlarm(data);
        dispatch({ type: "CREATE_SUCCESS", payload: response });
        return response;
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to create alarm",
        });
      }
    },
    [alarmsHook],
  );

  const updateAlarm = useCallback(
    async (id, data) => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await alarmsHook.updateAlarm(id, data);
        dispatch({ type: "UPDATE_SUCCESS", payload: response });
        return response;
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to update alarm",
        });
      }
    },
    [alarmsHook],
  );

  const acknowledgeAlarm = useCallback(
    async (id) => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await alarmsHook.acknowledgeAlarm(id);
        dispatch({ type: "ACKNOWLEDGE_SUCCESS", payload: response });
        return response;
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to acknowledge alarm",
        });
      }
    },
    [alarmsHook],
  );

  const resolveAlarm = useCallback(
    async (id) => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await alarmsHook.resolveAlarm(id);
        dispatch({ type: "RESOLVE_SUCCESS", payload: response });
        return response;
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to resolve alarm",
        });
      }
    },
    [alarmsHook],
  );

  const deleteAlarm = useCallback(
    async (id) => {
      dispatch({ type: "FETCH_START" });
      try {
        await alarmsHook.deleteAlarm(id);
        dispatch({ type: "DELETE_SUCCESS", payload: id });
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to delete alarm",
        });
      }
    },
    [alarmsHook],
  );

  const getAlarmStats = useCallback(
    async (params = {}) => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await alarmsHook.getAlarmStats(params);
        dispatch({ type: "SET_STATS", payload: response });
        return response;
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to fetch alarm stats",
        });
      }
    },
    [alarmsHook],
  );

  const getAlarmHistory = useCallback(
    async (params = {}) => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await alarmsHook.getAlarmHistory(params);
        dispatch({ type: "SET_HISTORY", payload: response });
        return response;
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to fetch alarm history",
        });
      }
    },
    [alarmsHook],
  );

  const setFilter = useCallback((filter) => {
    dispatch({ type: "SET_FILTER", payload: filter });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value = {
    ...state,
    fetchAlarms,
    fetchActiveAlarms,
    createAlarm,
    updateAlarm,
    acknowledgeAlarm,
    resolveAlarm,
    deleteAlarm,
    getAlarmStats,
    getAlarmHistory,
    setFilter,
    clearError,
  };

  return (
    <AlarmContext.Provider value={value}>{children}</AlarmContext.Provider>
  );
};

export const useAlarmContext = () => {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error("useAlarmContext must be used within an AlarmProvider");
  }
  return context;
};
