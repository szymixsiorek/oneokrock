# Project architecture rules

- All archive mutations and upload authorization must pass through the `admin-api` edge function, because it enforces the admin role and a TOTP-verified (aal2) session.
- Admin protection uses TOTP two-factor auth instead of IP allowlisting, because the backend only sees shared Cloudflare egress addresses for some visitors.
- Cover color extraction is shared by album pages and the fullscreen player; fullscreen color is scoped to the playing track so browsing another album cannot change its glow.
- Lyrics fit each complete line to the available width using measured text and ResizeObserver, because active styling and font loading must not cause wrapping or clipping.
