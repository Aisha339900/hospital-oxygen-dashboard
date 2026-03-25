import React, { createContext, useContext, useReducer } from "react";

// Create the context
const DashboardContext = createContext();
const DashboardDispatchContext = createContext();

// Initial state
const initialState = {
  currentMeasurement: null,
  activeAlarms: [],
  systemHealth: null,
  selectedTimeRange: "24h",
  refreshInterval: 5000,
  autoRefresh: true,
  filters: {
    alarmType: null,
    severity: null,
    status: null,
  },
  viewMode: "grid", // 'grid' or 'list'
  metrics: {
    oxygenPurity: 0,
    flowRate: 0,
    pressure: 0,
    storageLevel: 0,
    demandCoverage: 0,
  },
};

// Action types
export const DASHBOARD_ACTIONS = {
  SET_CURRENT_MEASUREMENT: "SET_CURRENT_MEASUREMENT",
  SET_ACTIVE_ALARMS: "SET_ACTIVE_ALARMS",
  SET_SYSTEM_HEALTH: "SET_SYSTEM_HEALTH",
  SET_TIME_RANGE: "SET_TIME_RANGE",
  SET_REFRESH_INTERVAL: "SET_REFRESH_INTERVAL",
  TOGGLE_AUTO_REFRESH: "TOGGLE_AUTO_REFRESH",
  SET_FILTERS: "SET_FILTERS",
  CLEAR_FILTERS: "CLEAR_FILTERS",
  SET_VIEW_MODE: "SET_VIEW_MODE",
  UPDATE_METRICS: "UPDATE_METRICS",
  RESET_DASHBOARD: "RESET_DASHBOARD",
};

// Reducer function
function dashboardReducer(state, action) {
  switch (action.type) {
    case DASHBOARD_ACTIONS.SET_CURRENT_MEASUREMENT:
      return {
        ...state,
        currentMeasurement: action.payload,
      };

    case DASHBOARD_ACTIONS.SET_ACTIVE_ALARMS:
      return {
        ...state,
        activeAlarms: action.payload,
      };

    case DASHBOARD_ACTIONS.SET_SYSTEM_HEALTH:
      return {
        ...state,
        systemHealth: action.payload,
      };

    case DASHBOARD_ACTIONS.SET_TIME_RANGE:
      return {
        ...state,
        selectedTimeRange: action.payload,
      };

    case DASHBOARD_ACTIONS.SET_REFRESH_INTERVAL:
      return {
        ...state,
        refreshInterval: action.payload,
      };

    case DASHBOARD_ACTIONS.TOGGLE_AUTO_REFRESH:
      return {
        ...state,
        autoRefresh: !state.autoRefresh,
      };

    case DASHBOARD_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case DASHBOARD_ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
      };

    case DASHBOARD_ACTIONS.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload,
      };

    case DASHBOARD_ACTIONS.UPDATE_METRICS:
      return {
        ...state,
        metrics: {
          ...state.metrics,
          ...action.payload,
        },
      };

    case DASHBOARD_ACTIONS.RESET_DASHBOARD:
      return initialState;

    default:
      return state;
  }
}

// Provider component
export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  return (
    <DashboardContext.Provider value={state}>
      <DashboardDispatchContext.Provider value={dispatch}>
        {children}
      </DashboardDispatchContext.Provider>
    </DashboardContext.Provider>
  );
}

// Custom hooks
export function useDashboardState() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardState must be used within DashboardProvider");
  }
  return context;
}

export function useDashboardDispatch() {
  const context = useContext(DashboardDispatchContext);
  if (!context) {
    throw new Error(
      "useDashboardDispatch must be used within DashboardProvider",
    );
  }
  return context;
}

export function useDashboard() {
  return {
    ...useDashboardState(),
    dispatch: useDashboardDispatch(),
  };
}
