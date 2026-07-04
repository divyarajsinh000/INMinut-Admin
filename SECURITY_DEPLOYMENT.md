# Admin panel security deployment checklist

## Vercel
1. Project > Settings > Environment Variables. Add `VITE_API_URL=https://api.inminut.com` for Production, Preview, and Development as required.
2. Never add server secrets to a `VITE_*` variable; Vite includes these values in the browser bundle.
3. Project > Settings > Security: enable Git Fork Protection and Attack Challenge Mode when available for your plan.
4. Deploy and verify the response headers in the browser Network tab.
5. Keep the production branch protected and require pull-request review.

## Backend requirements (must be enforced server-side)
- Allow CORS only from the exact admin origin.
- Rate-limit `/admin/login`; lock or delay repeated failures.
- Require strong passwords and add MFA for super-admin accounts.
- Authorize every admin endpoint by role on the server; frontend route guards are not security controls.
- Prefer Secure, HttpOnly, SameSite cookies over JavaScript-readable bearer tokens.
- Use short access-token expiry, refresh-token rotation/revocation, and server-side logout.
- Validate upload MIME type, extension, size, dimensions, and filename; store uploads outside the app server.
- Sanitize rich text again on the server before saving or returning it.
- Write immutable audit logs for login, failed login, create/update/delete, role changes, and password changes.

## AWS EC2
- Security group inbound: 22 only from your current public IP; 80/443 from the internet only if Caddy serves the API. Do not expose Node/Docker/database ports publicly.
- Bind application and database containers to localhost/private Docker networks.
- Use SSH keys, disable SSH password login and root login, update packages, enable unattended security updates, and configure a firewall.
- Keep secrets only in the EC2 environment or a secrets manager, never in Git or the frontend.
- Rotate any secret ever committed to Git; deleting it from the current file is not enough.
- Back up the database and test restore. Enable CloudWatch/host alerts for disk, CPU, auth failures, and service downtime.
