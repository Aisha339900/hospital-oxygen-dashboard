import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "../hooks/useAuth";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return { ...state, loading: false, error: action.payload };
    case "LOGOUT":
      return { ...initialState };
    case "SET_USER":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const authHook = useAuth();

  // Initialize auth from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");
    if (storedUser && token) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: JSON.parse(storedUser),
          token,
        },
      });
    }
  }, []);

  const login = useCallback(
    async (email, password) => {
      dispatch({ type: "LOGIN_START" });
      try {
        const response = await authHook.login(email, password);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("authToken", response.token);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: response.user,
            token: response.token,
          },
        });
        return response;
      } catch (error) {
        const errorMessage = error.message || "Login failed";
        dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
        throw error;
      }
    },
    [authHook],
  );

  const logout = useCallback(async () => {
    try {
      await authHook.logout();
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      dispatch({ type: "LOGOUT" });
    }
  }, [authHook]);

  const register = useCallback(
    async (userData) => {
      dispatch({ type: "LOGIN_START" });
      try {
        const response = await authHook.register(userData);
        return response;
      } catch (error) {
        const errorMessage = error.message || "Registration failed";
        dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
        throw error;
      }
    },
    [authHook],
  );

  const updateUser = useCallback((userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value = {
    ...state,
    login,
    logout,
    register,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
