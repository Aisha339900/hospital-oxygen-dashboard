import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

// Create the context
const AppContext = createContext();
const AppDispatchContext = createContext();

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  theme: "light",
  sidebarOpen: true,
  notifications: [],
  alerts: [],
  loading: false,
  error: null,
};

// Action types
export const ACTIONS = {
  // User actions
  SET_USER: "SET_USER",
  LOGOUT_USER: "LOGOUT_USER",
  SET_AUTHENTICATED: "SET_AUTHENTICATED",

  // UI actions
  SET_THEME: "SET_THEME",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  SET_SIDEBAR_OPEN: "SET_SIDEBAR_OPEN",

  // Notification actions
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
  CLEAR_NOTIFICATIONS: "CLEAR_NOTIFICATIONS",

  // Alert actions
  ADD_ALERT: "ADD_ALERT",
  REMOVE_ALERT: "REMOVE_ALERT",
  CLEAR_ALERTS: "CLEAR_ALERTS",

  // Loading and error
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    // User actions
    case ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };

    case ACTIONS.LOGOUT_USER:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };

    case ACTIONS.SET_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload,
      };

    // UI actions
    case ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };

    case ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case ACTIONS.SET_SIDEBAR_OPEN:
      return {
        ...state,
        sidebarOpen: action.payload,
      };

    // Notification actions
    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            ...action.payload,
          },
        ],
      };

    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notif) => notif.id !== action.payload,
        ),
      };

    case ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };

    // Alert actions
    case ACTIONS.ADD_ALERT:
      return {
        ...state,
        alerts: [
          ...state.alerts,
          {
            id: Date.now(),
            ...action.payload,
          },
        ],
      };

    case ACTIONS.REMOVE_ALERT:
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      };

    case ACTIONS.CLEAR_ALERTS:
      return {
        ...state,
        alerts: [],
      };

    // Loading and error
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}

// Custom hooks to use the context
export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within AppProvider");
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (!context) {
    throw new Error("useAppDispatch must be used within AppProvider");
  }
  return context;
}

export function useApp() {
  return {
    ...useAppState(),
    dispatch: useAppDispatch(),
  };
}
