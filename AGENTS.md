# Project architecture rules

- All archive mutations and upload authorization must pass through the `admin-api` edge function, because it enforces both the admin role and the trusted client IP.