import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { useMeasurements } from "../hooks/useMeasurements";

const MeasurementContext = createContext();

const initialState = {
  measurements: [],
  latestMeasurement: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0 },
  stats: null,
};

const measurementReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        measurements: action.payload,
        loading: false,
      };
    case "FETCH_LATEST_SUCCESS":
      return {
        ...state,
        latestMeasurement: action.payload,
        loading: false,
      };
    case "CREATE_SUCCESS":
      return {
        ...state,
        measurements: [action.payload, ...state.measurements],
        loading: false,
      };
    case "UPDATE_SUCCESS":
      return {
        ...state,
        measurements: state.measurements.map((m) =>
          m._id === action.payload._id ? action.payload : m,
        ),
        loading: false,
      };
    case "DELETE_SUCCESS":
      return {
        ...state,
        measurements: state.measurements.filter(
          (m) => m._id !== action.payload,
        ),
        loading: false,
      };
    case "SET_PAGINATION":
      return { ...state, pagination: action.payload };
    case "SET_STATS":
      return { ...state, stats: action.payload };
    case "FETCH_FAILURE":
      return { ...state, loading: false, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

export const MeasurementProvider = ({ children }) => {
  const [state, dispatch] = useReducer(measurementReducer, initialState);
  const measurementsHook = useMeasurements({ autoFetch: false });

  const fetchMeasurements = useCallback(
    async (params = {}) => {
      dispatch({ type: "FETCH_START" });
      try {
        await measurementsHook.fetchMeasurements(params);
        dispatch({
          type: "FETCH_SUCCESS",
          payload: measurementsHook.measurements,
        });
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to fetch measurements",
        });
      }
    },
    [measurementsHook],
  );

  const getLatestMeasurement = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const response = await measurementsHook.getLatestMeasurement();
      dispatch({ type: "FETCH_LATEST_SUCCESS", payload: response });
      return response;
    } catch (error) {
      dispatch({
        type: "FETCH_FAILURE",
        payload: error.message || "Failed to fetch latest measurement",
      });
    }
  }, [measurementsHook]);

  const createMeasurement = useCallback(
    async (data) => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await measurementsHook.createMeasurement(data);
        dispatch({ type: "CREATE_SUCCESS", payload: response });
        return response;
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to create measurement",
        });
      }
    },
    [measurementsHook],
  );

  const updateMeasurement = useCallback(
    async (id, data) => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await measurementsHook.updateMeasurement(id, data);
        dispatch({ type: "UPDATE_SUCCESS", payload: response });
        return response;
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to update measurement",
        });
      }
    },
    [measurementsHook],
  );

  const deleteMeasurement = useCallback(
    async (id) => {
      dispatch({ type: "FETCH_START" });
      try {
        await measurementsHook.deleteMeasurement(id);
        dispatch({ type: "DELETE_SUCCESS", payload: id });
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to delete measurement",
        });
      }
    },
    [measurementsHook],
  );

  const getMeasurementStats = useCallback(
    async (params = {}) => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await measurementsHook.getMeasurementStats(params);
        dispatch({ type: "SET_STATS", payload: response });
        return response;
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload: error.message || "Failed to fetch stats",
        });
      }
    },
    [measurementsHook],
  );

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value = {
    ...state,
    fetchMeasurements,
    getLatestMeasurement,
    createMeasurement,
    updateMeasurement,
    deleteMeasurement,
    getMeasurementStats,
    clearError,
  };

  return (
    <MeasurementContext.Provider value={value}>
      {children}
    </MeasurementContext.Provider>
  );
};

export const useMeasurementContext = () => {
  const context = useContext(MeasurementContext);
  if (!context) {
    throw new Error(
      "useMeasurementContext must be used within a MeasurementProvider",
    );
  }
  return context;
};
