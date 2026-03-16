---
name: Frontend Stability Locks & Hard Constraints
description: Critical frontend invariants that define component architecture and data flow
type: project
---

# 🔐 Frontend Stability Locks & Hard Constraints

## 1. SQLite user_uuid Attachment in ALL Queries

**Invariant:** Every table that stores user data **must** have `user_uuid TEXT NOT NULL` referencing `users.uuid`. Every server-side query that reads or writes user data **must** include `WHERE user_uuid = ?`.

```
bookmarks.user_uuid   → users.uuid
folders.user_uuid     → users.uuid
agent_keys.user_uuid  → users.uuid
settings.user_uuid    → users.uuid
```

Parameterized queries only (`db.prepare(...).run(?, ?)`) — no string interpolation ever.

**Check:** Code review for any `WHERE` clause without `user_uuid`.

---

## 2. REST API Adapter as Sole HTTP Client

**Invariant:** `src/services/database/rest/RestAdapter.ts` is the **sole HTTP client**.

All components talk to it through the `DatabaseProvider` context. Once working and secure, method signatures and the auth pattern must not change.

**Correct:**
```typescript
const { adapter } = useDatabaseAdapter();
const bookmarks = await adapter.getBookmarks();
```

**Wrong:**
```typescript
// Direct fetch from component
const response = await fetch("/api/bookmarks", { headers: { Authorization: `Bearer ${token}` } });
```

**Base URL (do not refactor this line):**
```typescript
// @ts-ignore: Vite replaces import.meta.env.VITE_API_URL at build-time — do NOT refactor this line
const API_BASE = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "http://localhost:4646").replace(/\/$/, "");
```

`import.meta.env.PROD` must appear as an exact literal — TypeScript casting breaks Vite's string replacement and hardcodes `localhost:4646` in the build.

**Auth pattern:**
```typescript
Authorization: Bearer {cc_api_token}   // from sessionStorage
```

**Response contract:**
```typescript
// Success: { data: T }   — adapter returns data, throws on error
// Error:   { error: string }  — adapter throws ApiError(status, message)
```

**Check:** Grep for `fetch(` in component files (should only exist in RestAdapter).

---

## 3. Lobster Key Service as Sole Agent Manager

**Invariant:** `src/services/agents/agentKeyService.ts` is the sole agent key CRUD service.

Lobster keys (`lb-*`) give agents scoped access to the API. Created by humans in Settings → Agent Permissions. Once working and secure, this file's pattern must not change.

**Permission levels (from `src/types/agent.ts` PERMISSION_CONFIGS):**
```
READ   → canRead only
WRITE  → canRead + canWrite
EDIT   → canRead + canWrite + canEdit
MOVE   → canRead + canWrite + canEdit + canMove
FULL   → all permissions
CUSTOM → all false by default (user sets individual booleans)
```

**Key lifecycle:**
```
Created (lb- key shown ONCE) → Active → Used
  → [Expired by date/duration] | [Revoked by human] → Inactive
```

The raw `lb-` key is **shown exactly once** at creation in `AgentKeyGeneratorModal` and never stored or retrievable again from the UI. Agents must save it immediately.

**Expiry types:** `"never" | "30d" | "60d" | "90d" | "custom"` — all resolved to an ISO timestamp server-side. Server enforces expiry on every request.

**Check:** Before merging agent key changes, verify key lifecycle and permission enforcement.

---

## 4. Component Organization by Feature

**Invariant:** Components are organized by feature domain, not type.

```
✅ CORRECT:  components/dashboard/BookmarkCard.tsx
❌ WRONG:    components/cards/BookmarkCard.tsx

✅ CORRECT:  components/settings/AgentPermissions.tsx
❌ WRONG:    components/lists/AgentPermissions.tsx
```

**Rules:**
- Base UI components live in `src/components/ui/` (Shadcn/Radix). Use them; don't create new base components.
- Feature components live in `src/components/{feature}/`.
- Modals use the `LobsterModal.tsx` wrapper for consistent framing.

**Check:** PRs should only add components to feature directories, not scatter across types.

---

## 5. Human-Only UI Gating

**Invariant:** r.jina.ai features are gated to humans only, never shown to agents.

```typescript
const keyType = sessionStorage.getItem("cc_key_type");
if (keyType === "human") {
  /* show r.jina.ai controls: checkbox in BookmarkModal, context menu in BookmarkCard */
}
```

**Important:** `jinaUrl` is returned on all `GET /api/bookmarks` responses — both humans and agents receive them. Only `POST`/`PUT` of `jinaUrl` is restricted to humans (server-side).

**Check:** Any r.jina.ai UI component must check `cc_key_type === "human"` before rendering.

---

## 6. sessionStorage Session Keys (Never Use localStorage)

**Invariant:** API tokens live in `sessionStorage`, NOT `localStorage`.

```
cc_api_token    → Bearer token (NEVER localStorage)
cc_user_uuid    → User UUID
cc_username     → Display username
cc_key_type     → "human" | "agent"
cc_view         → "dashboard" | "settings"
cc_theme        → "light" | "dark" | "auto"
```

**Why:** sessionStorage clears on browser close. localStorage persists and is vulnerable to XSS.

**Logout flow:**
```typescript
// Clear ALL cc_* keys (no leaking stale state)
sessionStorage.removeItem("cc_api_token");
sessionStorage.removeItem("cc_user_uuid");
sessionStorage.removeItem("cc_username");
sessionStorage.removeItem("cc_key_type");
sessionStorage.removeItem("cc_view");
sessionStorage.removeItem("cc_theme");
```

**Check:** Search for `localStorage` in codebase (should not exist for auth).

---

## 7. View State Constraints

**Invariant:** `cc_view` must only ever be `"dashboard"` or `"settings"`.

Never write `"landing"`, `"login"`, or `"setup"` to sessionStorage.

**Why:** Transient auth views (landing/login/setup) should not persist. Only persistent views (dashboard/settings) are stored.

**Correct:**
```typescript
sessionStorage.setItem("cc_view", "dashboard");
```

**Wrong:**
```typescript
sessionStorage.setItem("cc_view", "login");  // Never persist transient views
```

**Check:** PRs that touch view routing should only write "dashboard" or "settings".

---

## 8. Theme Synchronization Pattern

**Invariant:** Theme is client-side state first, server-synchronized second.

Apply theme locally immediately (from `cc_theme` in sessionStorage), then sync to backend asynchronously. **Never wait for backend before rendering.**

```typescript
// On page load:
const storedTheme = sessionStorage.getItem("cc_theme") || "auto";
applyTheme(storedTheme);  // Immediate

// Then sync asynchronously:
syncThemeToBackend(storedTheme).catch(() => {
  // Ignore errors — local state is already applied
});
```

**Why:** Prevents UI flash or stall waiting for network.

**Check:** Theme components should apply locally before any async work.

---

## 9. IDB Store Name Constants

**Invariant:** Always import store names from `src/services/utils/constants.ts`.

```typescript
// ✅ CORRECT
import { STORES } from "@/services/utils/constants";
const bookmarks = await db.getAll(STORES.BOOKMARKS);

// ❌ WRONG
const bookmarks = await db.getAll("bookmarks");  // Hardcoded
```

**Why:** Single source of truth prevents typos and makes refactoring safe.

**Check:** Code review for string literals in IDB queries.

---

## 10. IDB Transactions Always Use executeTransaction()

**Invariant:** All IndexedDB operations must use `executeTransaction()` from `src/services/utils/database.ts`.

```typescript
// ✅ CORRECT
await executeTransaction("readwrite", (txn) => {
  txn.objectStore(STORES.BOOKMARKS).add(bookmark);
});

// ❌ WRONG
const txn = db.transaction("readwrite");
txn.objectStore("bookmarks").add(bookmark);  // Risky, no error handling
```

**Why:** Centralizes transaction handling and error recovery.

**Check:** All IDB mutations must go through `executeTransaction()`.

---

## 11. HTTP Errors Use ApiError Class

**Invariant:** Always throw/use `ApiError` from `src/services/utils/errors.ts`.

```typescript
// ✅ CORRECT
throw new ApiError(401, "Unauthorized");

// ❌ WRONG
throw new Error("401");  // Loses status code
```

**ApiError has `.status` and `.message` properties.**

**Check:** Error handling in RestAdapter and components uses ApiError.

---

## 12. Crypto Functions Never Implemented Inline

**Invariant:** Always use crypto utilities from `src/lib/crypto.ts`.

```typescript
// ✅ CORRECT
import { hashToken, verifyToken, generateHumanKey } from "@/lib/crypto";

// ❌ WRONG
const hash = sha256(key);  // Inline implementation
```

Available functions:
- `generateHumanKey()` → hu-key
- `generateLobsterKey()` → lb-key
- `hashToken(token)` → SHA-256 hex
- `verifyToken(provided, stored)` → constant-time compare

**Check:** Code review for any custom crypto implementations.

---

## 13. cc_key_type Must Be Written Immediately After Token

**Invariant:** `cc_key_type` must be written immediately after `cc_api_token` is stored.

Both `LoginForm.tsx` and `SetupWizard.tsx` must set it during auth flow.

```typescript
// Login/Setup flow:
sessionStorage.setItem("cc_api_token", apiToken);
sessionStorage.setItem("cc_key_type", "human");  // ← Must happen immediately
```

**Why:** r.jina.ai UI components check `cc_key_type` to determine visibility.

**Check:** Auth components should set both token and key_type in same flow.

---

## 14. Bookmark UUID v4 Generation Client-Side

**Invariant:** Bookmark IDs must be UUID v4 generated client-side before `POST /api/bookmarks`.

```typescript
// ✅ CORRECT
import { v4 as uuidv4 } from "uuid";
const id = uuidv4();
await adapter.saveBookmark({ id, url, title, ... });

// ❌ WRONG
await adapter.saveBookmark({ url, title, ... });  // Server generates ID (loses user ownership)
```

**Why:** Ensures optimistic UI updates work correctly (client knows ID before POST).

**Check:** BookmarkModal creates ID before calling saveBookmark().

---

## 15. r.jina.ai Content Visible to All Bookmark Responses

**Invariant:** `jinaUrl` and jina content ARE included in `GET /api/bookmarks` for both humans and agents.

Only `POST`/`PUT` operations on jinaUrl are gated to humans (server-side `requireHuman`).

**Wrong approach:** Filtering jinaUrl from agent responses.

**Correct approach:** Let agents see jina content (they need it for processing), but block them from writing jinaUrl.

**Check:** Bookmark response should include jina fields for all users.

---

**Maintained by CrustAgent©™**

Last Updated: 2026-03-16
