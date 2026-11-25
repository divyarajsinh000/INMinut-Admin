---
name: admin-api-auth
description: Use for API requests, login, session expiry, role permissions, configuration and security.
---

# API and authentication

- Use `src/api/axiosInstance.js`. It prefixes relative paths with `/api` exactly once and adds Bearer token. Default timeout 20 seconds. Do not use absolute external URLs with this authenticated client.
- `src/config/env.js` requires absolute `VITE_API_URL`, HTTPS in production; exports API_URL, API_ORIGIN, REQUEST_TIMEOUT_MS. Use origin/base URL rather than hardcoded hosts.
- AuthContext: POST `/admin/login` with trimmed lowercase email and password; response `data.data` contains token plus user fields. GET `/admin/me` restores user. `authStorage.js` stores `adminToken` in sessionStorage and migrates/removes legacy localStorage token. 30-minute inactivity logout. Non-login 401 clears token and emits `admin-session-expired`; cancellation is rejected without session handling.
- ProtectedRoute waits for auth loading, redirects unauthenticated to login, and unauthorized reporters to news, others to dashboard.

## Route permissions (App.jsx)
| Roles | Routes |
|---|---|
| Any authenticated | /profile, /news, /news/add, /news/edit/:id |
| super-admin, editor | /dashboard, /analytics, /embeds and add/edit |
| super-admin | /categories and add/edit, /locations, /users and add/edit, /guest-users, /advertisements and add/edit, /settings |

Known existing mismatch: Sidebar shows Advertisements to editors but App.jsx restricts the route to super-admin. Do not silently broaden access; ask or fix navigation only if requested. Frontend guards are not backend authorization. Reporter news actions are additionally restricted in NewsList.

## Requests
Use `formatErrorMessage` from utils/errorMessage where appropriate and preserve existing toast handling. Most endpoints return `res.data.data`, settings uses `res.data.settings`, news pagination varies by endpoint. Inspect actual caller. Use FormData for existing multipart endpoints; preserve field names and JSON serialization of arrays. Never log tokens/passwords or assume backend contracts from route names. Keep DOMPurify sanitization for rich text.
