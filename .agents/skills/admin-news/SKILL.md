---
name: admin-news
description: Use for adding, editing, publishing, previewing news, rich text, media and push notifications.
---

# News workflow

Read `src/pages/AddNews.jsx`, `EditNews.jsx`, `NewsList.jsx` together when changing a news field. Add POST `/news`; edit GET and PUT `/news/:id`. Category options GET `/categories?includeHidden=true`; city options GET `/locations/cities`.

## Multipart contract
Both forms send title, titleLink, titleColor, titleFontSize, description, descriptionFontSize, category (legacy single ID), categories (JSON array), hashtags (JSON array), isBreaking, breakingText, breakingBgColor, breakingTextColor, isBreakingBlink, isActive, hideReporter, publishedDate, cities (JSON array), sendNotification. Keep legacy category fallback to first categories entry. Combine local published date/time and serialize ISO. New files use repeated `media` fields. Add can use `defaultNewsImageUrl` from settings; edit sends `mediaToKeep` JSON IDs for retained existing media. Do not accidentally remove existing media when saving unrelated changes.

## Safety and UI
- sendNotification defaults false on both add and edit. Preserve opt-in; add handles notification skipped (Firebase not configured) and sent counts. Do not test against live notification recipients.
- Use QuillEditor and `sanitizeRichText` for HTML preview. Never replace sanitized rendering with raw HTML. Keep allowed tags/URI policy in utils/sanitizeHtml.js.
- Preserve file selection, crop, preview, existing/new media distinction and validation; inspect current media limits and type rules before editing. Use MediaPreview/MediaSlider and getFullMediaUrl.
- Keep reporter visibility independent of authenticated user permissions; preserve hideReporter and preview logic.
- Check add/edit parity, retained media, empty/default image, dates, category/city selection, notification off/on and error states.
