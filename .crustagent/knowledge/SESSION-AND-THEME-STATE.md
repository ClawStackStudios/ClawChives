---
name: Session & Theme State Management
description: sessionStorage keys, state persistence, theme handling, and refresh recovery
type: project
---

# 🎨 Session & Theme State Management

## Session State (sessionStorage)

All session state lives in `sessionStorage` under `cc_*` keys.
On tab close, sessionStorage is cleared — **this is intentional (security)**.

```
cc_api_token    → Bearer token for all API requests (api-*)
cc_user_uuid    → User UUID (matches users.uuid in SQLite)
cc_username     → Display username
cc_key_type     → "human" | "agent"  — gates r.jina.ai UI components
cc_view         → "dashboard" | "settings"  — restored on refresh
cc_theme        → "light" | "dark" | "auto"  — restored on refresh
```

## Session State Rules

- **Restore `cc_view` synchronously** in `useState` initializer (before any async work) so there is no flash to the landing page on refresh.
- **Theme handling:** Apply `cc_theme` locally first, then sync from backend — never wait for backend before rendering.
- **Logout must clear ALL `cc_*` keys** (no leaking stale state).
- **`cc_view` constraints:** Must only ever be `"dashboard"` or `"settings"`. Never write `"landing"`, `"login"`, or `"setup"` to `cc_view`.
- **`cc_key_type` immediacy:** Must be written immediately after the token is stored. Both `LoginForm.tsx` and `SetupWizard.tsx` must set it.

## Theme State

```typescript
// Theme is stored as "light" | "dark" | "auto"
// Apply immediately on load (from cc_theme in sessionStorage)
// Then sync to backend asynchronously
// Never wait for backend before rendering UI
```

**Key principle:** Theme is client-side state first, server-synchronized second. The UI never flashes or waits.

## View State

```typescript
// Valid views: "dashboard" | "settings"
// Restored on refresh from cc_view
// Never stored as "landing", "login", or "setup" (these are transient)
```

**Key principle:** Only persistent views (dashboard/settings) are stored. Transient auth views aren't persisted.

---

**Maintained by CrustAgent©™**

Last Updated: 2026-03-16
