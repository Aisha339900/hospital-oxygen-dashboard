import axios from "axios";

// Use /api with CRA dev proxy (package.json "proxy"), backend on port 5050.
// Override with REACT_APP_API_URL for production or custom ports.
// If the env URL is the server root (e.g. http://localhost:5050), append /api
// so requests hit Express where routes are mounted.
function resolveApiBaseUrl() {
  const raw = (process.env.REACT_APP_API_URL || "").trim();
  if (!raw) {
    return "/api";
  }
  if (/^https?:\/\//i.test(raw)) {
    const trimmed = raw.replace(/\/$/, "");
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
}

const API_BASE_URL = resolveApiBaseUrl();

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("oxygen.auth.v1");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
