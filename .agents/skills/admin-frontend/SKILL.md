---
name: admin-frontend
description: Use for INMinut admin architecture, navigation, responsive UI and shared components.
---

# Frontend architecture

- `main.jsx` wraps App in AuthProvider and StrictMode. App wraps BrowserRouter in SettingsProvider and mounts ToastContainer.
- Public routes: `/login`, `/policy`, `/about`; `/` redirects to `/dashboard`. See App.jsx for protected routes.
- `AdminLayout.jsx` provides Sidebar, Navbar and content container; use it for admin screens. Sidebar is fixed, w-72, desktop breakpoint lg, with mobile overlay. Navbar search navigates to `/news?search=...` and loads analytics summary for notifications.
- Existing design: light slate/white translucent cards, rounded corners, gradient page background, dark sidebar, react-icons/fi. Use Tailwind v3 utilities and responsive breakpoints; do not assume v4 syntax.
- Shared controls: ToggleSwitch, QuillEditor, ImageCropModal, MediaPreview, MediaSlider. Inspect props before use. `getFullMediaUrl` is exported from MediaPreview.
- SettingsContext provides appLogo, appIcon, settings and reloadSettings; favicon is refreshed on icon changes. Sidebar falls back to `/logo-dark.png`.

## Workflow
Read route, sidebar, page and relevant shared component. Preserve route guards when adding navigation. Keep accessible labels, keyboard interaction, mobile overflow, loading/empty/error states and existing toast behavior. Avoid duplicating shared layout. Check `src/index.css`, `tailwind.config.js` and `App.css` before global styling changes.
