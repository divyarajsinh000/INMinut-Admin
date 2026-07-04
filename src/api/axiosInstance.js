import axios from "axios";
import { API_URL, REQUEST_TIMEOUT_MS } from "../config/env";
import { clearAdminToken, getAdminToken } from "../utils/authStorage";

const API_ROUTE_PREFIX = "/api";

const normalizeRequestPath = (url) => {
  if (!url || /^https?:\/\//i.test(url)) return url;

  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;

  // All backend routes, including /admin/login, are mounted under /api.
  // Avoid adding the prefix twice when a caller already includes it.
  if (
    normalizedUrl === API_ROUTE_PREFIX ||
    normalizedUrl.startsWith(`${API_ROUTE_PREFIX}/`)
  ) {
    return normalizedUrl;
  }

  return `${API_ROUTE_PREFIX}${normalizedUrl}`;
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  config.url = normalizeRequestPath(config.url);

  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || "");
    const isLoginRequest = requestUrl.includes("/admin/login");

    if (status === 401 && !isLoginRequest) {
      clearAdminToken();
      window.dispatchEvent(new CustomEvent("admin-session-expired"));
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
