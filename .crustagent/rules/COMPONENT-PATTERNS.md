---
name: Component Patterns & Development Practices
description: Reusable component patterns, utility rules, type locations, and dev workflow
type: project
---

# 🎨 Component Patterns & Development Practices

## Component Organization

- **Base UI components** live in `src/components/ui/` (Shadcn/Radix). Use them; don't create new base components.
- **Feature components** live in `src/components/{feature}/` (auth, dashboard, settings).
- **Modals** use the `LobsterModal.tsx` wrapper for consistent framing.

## API Call Pattern

All API calls must go through `RestAdapter` via `useDatabaseAdapter()` hook.

```typescript
// ✅ CORRECT
const { adapter } = useDatabaseAdapter();
const bookmarks = await adapter.getBookmarks();

// ❌ WRONG
const response = await fetch("/api/bookmarks", {
  headers: { Authorization: `Bearer ${token}` }
});
```

This ensures:
- Centralized auth header injection
- Consistent error handling (ApiError)
- Single source for API base URL

## Human-Only UI Gating

r.jina.ai features are gated by checking `cc_key_type` from sessionStorage.

```typescript
const keyType = sessionStorage.getItem("cc_key_type");
if (keyType === "human") {
  /* show r.jina.ai controls */
}
```

**Components affected:**
- `BookmarkModal.tsx` — r.jina.ai checkbox
- `BookmarkCard.tsx` — r.jina.ai context menu item

## r.jina.ai Content Handling

```typescript
// Data returned from GET /api/bookmarks includes jinaUrl:
interface Bookmark {
  id: string;
  url: string;
  title: string;
  jinaUrl?: string;        // Both humans and agents receive this
  // ...
}

// Only humans can POST/PUT jinaUrl
// Agents can READ jinaUrl but cannot write it
```

**Key principle:** Agents need jina content for research/processing. Block only write operations.

---

## Type Locations

| Type | File |
|------|------|
| `Bookmark`, `Folder`, `User`, `AppearanceSettings`, `ProfileSettings`, `AgentKey` | `src/services/types/index.ts` |
| `AgentKey`, `AgentPermission`, `PermissionLevel`, `PERMISSION_CONFIGS` | `src/types/agent.ts` |
| `View` (`"landing" \| "login" \| "setup" \| "dashboard" \| "settings"`) | `src/App.tsx` |
| `IdentityData` (identity JSON shape) | `src/lib/crypto.ts` |

---

## Utility Rules

- **IDB store names:** always import from `src/services/utils/constants.ts` (`STORES.BOOKMARKS`, etc.) — never hardcode strings.
- **IDB transactions:** always use `executeTransaction()` from `src/services/utils/database.ts`.
- **HTTP errors:** always throw/use `ApiError` from `src/services/utils/errors.ts` (has `.status` and `.message`).
- **Crypto:** always use `hashToken()` / `verifyToken()` / `generateHumanKey()` etc. from `src/lib/crypto.ts`. Never implement hashing or key generation inline.

---

## Dev Workflow

```bash
npm start          # Vite dev (port 4545) + API server (port 4646) — use this
npm run dev        # Vite only — API will be unreachable, use npm start instead
npm run build      # tsc + vite build (production)
npm run start:api  # API server only (port 4646)
```

**Production Docker:** Both UI and API run on port 4545 from a single container.
The Vite build uses `import.meta.env.PROD = true` → `API_BASE = ""` (same-origin).

---

**Maintained by CrustAgent©™**

Last Updated: 2026-03-16
