import axios from "axios";
import { API_URL, REQUEST_TIMEOUT_MS } from "../config/env";
import { clearAdminToken, getAdminToken } from "../utils/authStorage";
import { toast } from "react-toastify";

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

const pendingRequests = new Map();

const getRequestKey = (config) => {
  return [
    config.method,
    config.url,
    JSON.stringify(config.params || {}),
    JSON.stringify(config.data || {})
  ].join("&");
};

axiosInstance.interceptors.request.use((config) => {
  config.url = normalizeRequestPath(config.url);

  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const requestKey = getRequestKey(config);
  if (pendingRequests.has(requestKey)) {
    const controller = new AbortController();
    config.signal = controller.signal;
    controller.abort("Duplicate request canceled");
  } else {
    config.requestKey = requestKey;
    pendingRequests.set(requestKey, true);
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config && response.config.requestKey) {
      pendingRequests.delete(response.config.requestKey);
    }
    return response;
  },
  (error) => {
    if (error.config && error.config.requestKey) {
      pendingRequests.delete(error.config.requestKey);
    }

    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || "");
    const isLoginRequest = requestUrl.includes("/admin/login");

    if (status === 401 && !isLoginRequest) {
      clearAdminToken();
      window.dispatchEvent(new CustomEvent("admin-session-expired"));
    } else if (error?.response?.data?.message && !isLoginRequest) {
      toast.error(error.response.data.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
