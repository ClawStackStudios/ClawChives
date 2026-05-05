---
name: Common Pitfalls & Gotchas
description: Documented issues, debugging approaches, and how to avoid common mistakes
type: project
---

# 📝 Common Pitfalls & Gotchas

## 1. CORS Hell

```
Problem: Frontend can't reach API (net::ERR_CONNECTION_REFUSED or CORS error)
Solution: Set CORS_ORIGIN in docker-compose.yml to match UI origin
  LAN:     CORS_ORIGIN=http://192.168.1.5:8080
  Reverse: CORS_ORIGIN=https://bookmarks.yourdomain.com
  Dev:     CORS_ORIGIN=http://localhost:5173

DO NOT use wildcard (*) in production!
```

## 2. Vite Env Replacement Not Working

```
Problem: Browser tries to connect to localhost:4646 instead of LAN IP
Symptom: net::ERR_CONNECTION_REFUSED when testing on different machine
Root Cause: Type-casting prevents Vite from seeing the exact string

✅ CORRECT: Use exact string import.meta.env.VITE_API_URL with // @ts-ignore
❌ WRONG: Type-cast with as unknown breaks Vite's replacement

Files to Check: App.tsx:62, LoginForm.tsx:57, RestAdapter.ts:20
```

## 3. Docker Healthcheck Failures

```
Problem: "dependency failed to start: container clawchives-api is unhealthy"
Root Cause: start_period too short for SQLite initialization
Solution: Ensure healthcheck has start_period >= 15s

Check these timing values in docker-compose.yml and Dockerfile:
  start_period: 15s   # Grace period for SQLite init
  timeout: 10s        # Max time for health check
  retries: 5          # Failures before unhealthy
```

## 4. Security Updates Breaking Auth (CRITICAL)

```
⚠️ COMMON DURING SECURITY HARDENING:

Before Merging Security Changes:
  ✅ Test /api/auth/register with SetupWizard
  ✅ Test /api/auth/token with LoginForm
  ✅ Test POST http://192.168.1.5:4646/api/auth/token with Postman
  ✅ Verify browser console has no import.meta.env.VITE_API_URL related errors
  ✅ Check docker-compose logs for server startup errors

Red Flags:
  - "failed to fetch" in LoginForm.tsx:58
  - :4646/api/auth/token shows ERR_CONNECTION_REFUSED
  - API container marked unhealthy
  - Vite not injecting CORS_ORIGIN into HTML/JS
```

## 5. IndexedDB Version Conflicts

```
Problem: "VersionError: Database version conflict"
Solution: Close all browser tabs with ClawChives open, clear IndexedDB in dev tools
```

## 6. Agent Key Not Found

```
Problem: lb- key works in Postman but not in app
Solution: Check is_active=1 and expiration_date hasn't passed
```

## 7. SessionStorage Lost on Refresh

```
Problem: User logged out after F5
Current: Expected behavior (sessionStorage clears on navigation)
Planned: Persist api- token with expiry, or use refresh tokens
```

## 8. Docker Volume Permissions

```
Problem: SQLite file not writable in container
Solution: chown -R node:node /app/data in Dockerfile
```

## 9. tsx Watch Silent Crash (Node v22 Gotcha)

```
Problem: npm run dev:server starts but silently crashes after first change
Reason: tsx --watch does NOT support --ignore flag on Node v22
Solution: Use NODE_OPTIONS or separate process without watch for development
```

## 10. better-sqlite3 Rebuild Issues

```
Problem: API won't start with native module errors
Solution: npm rebuild better-sqlite3
Reason: Native module compiled for different Node version or platform
```

---

**Maintained by CrustAgent©™**

Last Updated: 2026-03-16
