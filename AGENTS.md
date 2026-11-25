# INMinut Admin — AI coding instructions

This repository is the INMinut news administration web frontend (package name `brekingapp-admin`), not the mobile app or backend. Use JavaScript/JSX, React 19, Vite 8, React Router 7, Tailwind CSS 3.4, Axios and React Context. Do not introduce TypeScript, Redux, Tailwind v4 or new dependencies without approval.

## Start here
- `src/main.jsx` mounts AuthProvider; `src/App.jsx` defines routes and SettingsProvider.
- `src/pages/` contains feature screens; `src/components/` contains shared UI; `src/api/axiosInstance.js` is the HTTP client.
- Read the relevant skill below before editing. These are repository-local agent skills, not runtime features.

| Task | Skill |
|---|---|
| Routes, architecture, shared UI | `.agents/skills/admin-frontend/SKILL.md` |
| Login, session, roles, HTTP | `.agents/skills/admin-api-auth/SKILL.md` |
| News, publishing, media, notifications | `.agents/skills/admin-news/SKILL.md` |
| Lists, analytics, filters, ordering | `.agents/skills/admin-lists/SKILL.md` |
| Categories, locations, users, ads, embeds, settings | `.agents/skills/admin-management/SKILL.md` |

## Working rules
1. Read the current target file and its paired add/edit/list files. Source code wins over these notes if they diverge.
2. Preserve existing API methods, field names, response shapes, permissions and behavior unless the task explicitly changes them. Never invent backend endpoints.
3. Keep changes minimal. Reuse existing components, error handling and loading states. Check mobile and desktop layouts.
4. Do not read or expose real `.env` values, tokens, private user data or git history unnecessarily. Use `.env.example` for configuration guidance. VITE_* values are public in the browser.
5. Never send real notifications, delete live data or call production APIs just to test a change.
6. Run `npm run lint` and `npm run build` (or `npm run check`) when dependencies and safe configuration are available. Report failures honestly; no test script is declared. Verify relevant role and empty/error/loading states manually when possible.
7. Return changed files only when asked; explain assumptions, backend dependencies and unverified behavior. Update these skills when a verified contract changes.
