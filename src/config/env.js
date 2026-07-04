const rawApiUrl = import.meta.env.VITE_API_URL?.trim();

if (!rawApiUrl) {
  throw new Error("VITE_API_URL is required. Add it in Vercel Project Settings > Environment Variables.");
}

let parsedApiUrl;
try {
  parsedApiUrl = new URL(rawApiUrl);
} catch {
  throw new Error("VITE_API_URL must be a valid absolute URL.");
}

if (import.meta.env.PROD && parsedApiUrl.protocol !== "https:") {
  throw new Error("VITE_API_URL must use HTTPS in production.");
}

export const API_URL = rawApiUrl.replace(/\/$/, "");
export const API_ORIGIN = parsedApiUrl.origin;
export const REQUEST_TIMEOUT_MS = 20000;
