/**
 * Extract a human-readable detailed error reason from an error object.
 * Checks backend response data, validation error arrays/objects,
 * HTTP status codes, and network error messages.
 */
export const getErrorReason = (error) => {
  if (!error) return "Unknown error occurred";
  if (typeof error === "string") return error;

  // 1. Backend API response data message or error string/array
  const responseData = error.response?.data;
  if (responseData) {
    if (typeof responseData === "string" && responseData.trim()) {
      // If response body is HTML (e.g. 500 / 502 / 504 / 413), summarize HTTP status cleanly
      if (responseData.includes("<html") || responseData.includes("<!DOCTYPE")) {
        const status = error.response?.status;
        const statusText = error.response?.statusText || "Server error";
        if (status === 413) return "Uploaded file size is too large for the server";
        if (status === 504 || status === 502) return "Server or gateway is unavailable (502/504)";
        return `Server returned status ${status || 500} (${statusText})`;
      }
      return responseData.trim();
    }

    if (responseData.message && typeof responseData.message === "string") {
      return responseData.message.trim();
    }

    if (responseData.error && typeof responseData.error === "string") {
      return responseData.error.trim();
    }

    if (Array.isArray(responseData.errors)) {
      const messages = responseData.errors
        .map((e) => (typeof e === "string" ? e : e?.msg || e?.message))
        .filter(Boolean);
      if (messages.length > 0) return messages.join(", ");
    }

    if (typeof responseData.errors === "object" && responseData.errors !== null) {
      const messages = Object.values(responseData.errors)
        .map((e) => (typeof e === "string" ? e : e?.msg || e?.message))
        .filter(Boolean);
      if (messages.length > 0) return messages.join(", ");
    }
  }

  // 2. HTTP status code specific fallbacks if no response data message
  const status = error.response?.status;
  if (status) {
    if (status === 400) return "Bad request - Please check input data";
    if (status === 401) return "Session expired or unauthorized";
    if (status === 403) return "Permission denied";
    if (status === 404) return "Requested resource not found (404)";
    if (status === 409) return "Resource conflict or duplicate entry";
    if (status === 413) return "Uploaded file is too large";
    if (status === 422) return "Validation error in submitted data";
    if (status >= 500) return `Server internal error (${status})`;
  }

  // 3. Axios or Standard Error message
  if (error.message) {
    if (error.message === "Network Error") {
      return "Network connection failed - Please check backend server status";
    }
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return "Request timed out - Server took too long to respond";
    }
    return error.message;
  }

  return "Unknown error occurred";
};

/**
 * Format a complete user-friendly error message combining action context and reason.
 * e.g., formatErrorMessage(error, "Failed to add news") => "Failed to add news: Title is required"
 */
export const formatErrorMessage = (error, fallbackAction = "Operation failed") => {
  const reason = getErrorReason(error);
  if (!reason) return fallbackAction;

  const normalizedAction = fallbackAction.trim();
  const normalizedReason = reason.trim();

  // Avoid duplicating if reason already contains the action text
  if (normalizedReason.toLowerCase().includes(normalizedAction.toLowerCase())) {
    return normalizedReason;
  }

  return `${normalizedAction}: ${normalizedReason}`;
};
