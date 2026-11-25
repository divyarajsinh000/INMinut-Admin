---
name: admin-management
description: Use for categories, locations, advertisements, embeds, admin and guest users, profile and app settings.
---

# Management modules

All paths below are relative to shared Axios client (adds /api). Inspect paired screens before editing.

| Module / files in src/pages | Existing API calls |
|---|---|
| CategoryList, AddCategory, EditCategory | GET /categories?includeHidden=true; POST /categories; PUT/DELETE /categories/:id; PUT /categories/reorder |
| Locations | GET /locations/{countries,states,cities}?all=true; POST same collections; DELETE collection/:id; PUT collection/reorder |
| Users, AddUser, EditUser | GET /admin; POST /admin/register; GET/PUT/DELETE /admin/:id |
| GuestUsers | GET /guest-users; DELETE /guest-users/:id; PATCH /guest-users/:userId/devices/:encodedDeviceIdentifier/notifications; PATCH /guest-users/notifications/bulk |
| AdvertisementList, AddAdvertisement, EditAdvertisement | GET /advertisements?sort=recent; POST /advertisements; GET/PUT/DELETE /advertisements/:id; PATCH /advertisements/:id/toggle |
| EmbedList, AddEmbed, EditEmbed | GET /embeds?sort=recent; POST /embeds; GET/PUT/DELETE /embeds/:id; PATCH /embeds/:id/toggle |
| Profile | PUT /admin/profile/update |
| Settings | GET/PUT /settings |

## Field contracts
- Categories: name, backgroundColor, textColor, isHighlighted, isVisible. Reorder sends orderedIds. Edit currently loads list and finds `_id`.
- Locations: country name/code; state name/country; city name/country/state. Reorder sends orderedIds. Preserve parent relationships.
- Ads multipart: name, label, redirectUrl, cities/categories JSON arrays, positionAfterNews, numeric height, isEnabled, bannerImage (edit only when new file chosen).
- Embeds: title, embedCode, height, positionAfterNews, isEnabled, categories. Preserve current rendering security; do not inject arbitrary HTML into admin DOM.
- Guest notification toggles send `{ enabled }`; device identifier is URL encoded. Bulk affects multiple users: do not trigger live in tests.
- Profile multipart: name, email, optional currentPassword/password/profileImage; update AuthContext user from response. Never log passwords.
- Settings multipart images: appLogo, appIcon, defaultNewsImage, defaultShareImage. Response uses `res.data.settings`; inspect SettingsContext reload behavior and image crop handling.

Preserve permissions from App.jsx, `_id` identifiers, existing confirmation dialogs, loading states and toast behavior. Backend implementation is not included; endpoint semantics beyond frontend calls must be verified separately.
