# src/CRUSTAGENT.md — Frontend Implementation Reference

**Code-specific reference for the `src/` directory.**

For high-level architecture, deployment, and backend patterns, see root `CRUSTAGENT.md`.
All agents should read: **(1) Root CRUSTAGENT.md → (2) This file → (3) .crustagent/knowledge/ → (4) .crustagent/rules/**

---

## 📚 Frontend Knowledge Base Access

### Quick Reference
- **File Map & Directory Structure:** `.crustagent/knowledge/FRONTEND-FILE-MAP.md`
- **Key System & Entropy:** `.crustagent/knowledge/FRONTEND-KEY-SYSTEM.md`
- **Session & Theme State:** `.crustagent/knowledge/SESSION-AND-THEME-STATE.md`
- **Pinchmark System:** `.crustagent/knowledge/PINCHMARK-PIN-FOLDER-SYSTEM.md`

### Stability Locks & Rules
- **Frontend Invariants (15 hard constraints):** `.crustagent/rules/FRONTEND-INVARIANTS.md`
- **Component Patterns & Dev Workflow:** `.crustagent/rules/COMPONENT-PATTERNS.md`

### Critical Stability Locks (Summary)

**DO NOT REFACTOR:**
1. RestAdapter base URL line: `import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "http://localhost:4646")`
   - Vite's build-time string replacement requires exact literal
2. sessionStorage for tokens: `cc_api_token`, `cc_user_uuid`, `cc_key_type` (NEVER localStorage)
3. View state persistence: only `"dashboard"` and `"settings"` (NOT landing/login/setup)
4. Lobster key lifecycle: shown ONCE at creation, never retrievable again
5. IDB user_uuid filtering: ALL queries must include `user_uuid` (no cross-user data)

---

## ⚡ Critical Files (Stability Locks)

### RestAdapter — Sole HTTP Client
**File:** `src/services/database/rest/RestAdapter.ts`
- All API calls must go through this
- Auth pattern: `Authorization: Bearer {cc_api_token}`
- Method signatures must not change

### Lobster Key Service — Sole Agent Manager
**File:** `src/services/agents/agentKeyService.ts`
- Only place that creates/revokes agent keys
- Permission levels: READ, WRITE, EDIT, MOVE, FULL, CUSTOM
- Expiry types: never, 30d, 60d, 90d, custom

---

## 🎯 Type Locations

| Type | Location |
|------|----------|
| `Bookmark`, `Folder`, `User`, `AppearanceSettings`, `ProfileSettings`, `AgentKey` | `src/services/types/index.ts` |
| `AgentKey`, `AgentPermission`, `PermissionLevel`, `PERMISSION_CONFIGS` | `src/types/agent.ts` |
| `View` (landing, login, setup, dashboard, settings) | `src/App.tsx` |
| `IdentityData` (identity JSON) | `src/lib/crypto.ts` |

---

## 🔧 Dev Workflow

```bash
npm start          # Vite dev @ 4545 + API @ 4646 (use this)
npm run dev        # Vite only (API unreachable)
npm run build      # tsc + vite build (production)
npm run start:api  # API only @ 4646
```

---

**Maintained by CrustAgent©™**

For detailed knowledge, consult `.crustagent/knowledge/` and `.crustagent/rules/` directories.

---

