import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

// Create the context
const NotificationContext = createContext();
const NotificationDispatchContext = createContext();

// Initial state
const initialState = {
  notifications: [],
};

// Action types
export const NOTIFICATION_ACTIONS = {
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
  CLEAR_NOTIFICATIONS: "CLEAR_NOTIFICATIONS",
};

// Reducer function
function notificationReducer(state, action) {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
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

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notif) => notif.id !== action.payload,
        ),
      };

    case NOTIFICATION_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };

    default:
      return state;
  }
}

// Provider component
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = useCallback(
    (message, type = "info", duration = 5000) => {
      const id = Date.now();
      dispatch({
        type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
        payload: { message, type, duration, id },
      });

      if (duration) {
        setTimeout(() => {
          dispatch({
            type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
            payload: id,
          });
        }, duration);
      }

      return id;
    },
    [],
  );

  const removeNotification = useCallback((id) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
      payload: id,
    });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({
      type: NOTIFICATION_ACTIONS.CLEAR_NOTIFICATIONS,
    });
  }, []);

  const value = {
    ...state,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      <NotificationDispatchContext.Provider value={dispatch}>
        {children}
      </NotificationDispatchContext.Provider>
    </NotificationContext.Provider>
  );
}

// Custom hooks
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}

export function useNotificationDispatch() {
  const context = useContext(NotificationDispatchContext);
  if (!context) {
    throw new Error(
      "useNotificationDispatch must be used within NotificationProvider",
    );
  }
  return context;
}
