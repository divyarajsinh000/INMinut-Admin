---
name: admin-lists
description: Use for news lists, dashboard, analytics, pagination, filters, sorting, drag reorder and visibility toggles.
---

# Lists and analytics

`NewsList.jsx` owns page, limit (initial 10), totalPages, totalNewsCount, title/admin/date filters and sortBy (initial manual). Navbar search is URL based. Read existing query synchronization before changes.
- Common params: search, adminId, date when present; includeInactive: true, page, limit. Manual list GET `/news` uses `res.data.pagination`; analytics sorting GET `/news/analytics/summary` uses `res.data.data?.pagination`. Keep separate parsing paths. Reporter forces manual sort and skips analytics totals request.
- Admin options GET `/admins` (different from `/admin` used for user management; do not normalize blindly).
- DELETE `/news/:id`; PATCH `/news/:id/toggle-pin`, `/news/:id/toggle-active`; PATCH `/news/reorder` with orderedIds. Reporters cannot delete, pin, toggle active or reorder in this screen. Drag reorder only in manual sort. Preserve pending states and existing refresh/error behavior.
- `Analytics.jsx` GET `/news/analytics/dashboard` with period, status, breaking, pinned, search, limit. Navbar uses same endpoint with limit 3. Dashboard loads `/news`, `/categories?includeHidden=true`, `/guest-users`, `/guest-users/stats`.

When changing filters, verify page reset and totals, no-result states, role differences, URL navigation and stale request behavior. Do not replace server pagination with local filtering of a single page. Preserve server ordering and avoid assuming global reorder semantics beyond the current caller.
