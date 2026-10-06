# Project architecture rules

- All archive mutations and upload authorization must pass through the `admin-api` edge function, because it enforces the admin role and a TOTP-verified (aal2) session.
- Admin protection uses TOTP two-factor auth instead of IP allowlisting, because the backend only sees shared Cloudflare egress addresses for some visitors.
