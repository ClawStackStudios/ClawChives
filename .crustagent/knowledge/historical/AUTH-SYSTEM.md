---
name: Authentication System & Key Hierarchy
description: Detailed auth system architecture, key lifecycle, security invariants, and critical fixes
type: project
---

# 🔐 Auth System & Key Hierarchy

## Key Hierarchy

- **`hu-` (Human Identity - 64 char):** Master key. Never sent to server (only SHA-256 hash). Exists in `clawchives_identity_key.json`. Supports One-Field Login.
- **`lb-` (Lobster/Agent - 64 char):** Delegated API access with granular permissions (`READ`, `WRITE`, `EDIT`, `MOVE`, `DELETE`, `FULL`).
- **`api-` (Session Token - 32 char):** Active bearer token for `Authorization: Bearer <token>` headers. Short-lived context.

## Security Invariants

- ✅ Constant-time comparison for keyHash verification.
- ✅ **Modulo Bias Guard**: Use unbiased character selection (no raw `byte % 62`) for entropy.
- ✅ User isolation via `user_uuid` in ALL queries.
- ✅ `requireHuman` locks settings and key generation to master identity only.
- ✅ `requirePermission(action)` geometrically locks CRUD endpoints.
- ✅ **Relational Jina Storage**: Jina URLs are decoupled into `jina_conversions` table for clean identity separation.
- ✅ **Agent Preference**: Agents prioritize Markdown links (`jinaUrl`) for research.

## Auth Flow Semantics

```typescript
// Registration
Client: generates(hu-key) → hashes(SHA256) → POST /auth/register {uuid, username, keyHash}
Server: stores(uuid, username, keyHash) → 201 Created

// Login
Client: reads(identity.json) → hashes(hu-key) → POST /auth/token {type:"human", uuid, keyHash}
Server: verifies(keyHash, constant_time) → generates(api-token) → stores(api_tokens) → returns(api-token)
Client: sessionStorage.set("cc_api_token", api-token)

// API Request
Client: Authorization: Bearer api-token
Server: requireAuth → validates(api-token) → injects(req.userUuid, req.keyType, req.agentPermissions) → next()
```

---

# 🔧 Critical Auth Fixes (DO NOT REVERT)

## Fix #1: Vite Environment Variable Replacement (2026-03-05)

**Problem:** Vite's build-time string replacement only works with the **exact literal string** `import.meta.env.VITE_API_URL`.

- ❌ **WRONG:** `((import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL)`
  - TypeScript happy, Vite confused → replacement skipped → permanently hardcoded to localhost:4646
- ✅ **CORRECT:** `import.meta.env.VITE_API_URL` with `// @ts-ignore`
  - Vite sees exact string → replaces at build time
  - TypeScript bypassed but intentional

**Affected Files:**
- [App.tsx:62](src/App.tsx#L62) — Auth validation fetch
- [LoginForm.tsx:57](src/components/auth/LoginForm.tsx#L57) — Token exchange
- [RestAdapter.ts:20](src/services/database/rest/RestAdapter.ts#L20) — API base URL

**Why This Matters:**
When deployed to GHCR with a LAN IP in `VITE_API_URL`, Vite was ignoring the env var and defaulting to `localhost:4646`. Result: Browser on 192.168.x.x trying to reach its own 4646 → `net::ERR_CONNECTION_REFUSED`.

**Future-Proofing:** If security hardening adds TypeScript strict mode or environment utilities, DO NOT refactor these three lines. The `// @ts-ignore` is intentional and required for Vite to work correctly.

## Fix #2: Docker Healthcheck Timing (2026-03-05)

**Problem:** API container failing healthcheck during startup because `start_period: 5s` was too aggressive.
- better-sqlite3 native module needs time to compile/initialize
- Table creation and schema migration takes ~8-12 seconds
- Healthcheck was killing container before it finished initializing

**Solution:** Increased timing across both docker-compose.yml and Dockerfile:
```yaml
healthcheck:
  start_period: 15s  # ← Min time before first health check
  timeout: 10s       # ← Max time for health check to respond
  retries: 5         # ← Allow 5 consecutive failures before marking unhealthy
```

**Why This Matters:** On Unraid with volumes, SQLite initialization can take longer. Too-aggressive healthchecks mark the container unhealthy before it's ready, causing startup cascade failures.

## Fix #3: Docker Deployment API URL Configuration (2026-03-07)

**Problem:** When deploying via Docker GHCR, frontend displayed white screen with:
```
net::ERR_CONNECTION_REFUSED on http://localhost:4646/api/auth/register
```

Root causes:
- Dockerfile copied entire directory including stale `dist/` folder with hardcoded localhost
- API URL logic scattered across 5 files with complex ternaries
- GitHub Actions workflow referenced non-existent `Dockerfile.api`

**Solution:** Three-part fix:

1. **Created centralized API config** (`src/config/apiConfig.ts`) with priority-based URL resolution:
   - Priority 1: Explicit override via `VITE_API_URL` env var (custom domains)
   - Priority 2: Production builds use relative paths `""` (Docker, LAN, proxies)
   - Priority 3: Dev fallback to `http://localhost:4646` (separate ports)

2. **Refactored 5 API client files** to use `getApiBaseUrl()`:
   - [src/services/database/rest/RestAdapter.ts:20](src/services/database/rest/RestAdapter.ts#L20)
   - [src/components/auth/SetupWizard.tsx:72](src/components/auth/SetupWizard.tsx#L72)
   - [src/components/auth/LoginForm.tsx:57](src/components/auth/LoginForm.tsx#L57)
   - [src/App.tsx:62](src/App.tsx#L62)
   - [src/services/agents/agentKeyService.ts:14](src/services/agents/agentKeyService.ts#L14)

3. **Fixed Dockerfile** to only copy source files and always rebuild `dist/`:
   ```dockerfile
   # ✅ Copy only source needed for build (exclude dist/)
   COPY index.html vite.config.ts tsconfig.json tsconfig.node.json ./
   COPY src ./src
   COPY public ./public
   RUN npm run build  # ← Fresh build every time, never uses stale dist/
   ```

4. **Fixed GitHub Actions workflow** (single container build):
   ```yaml
   file: ./Dockerfile    # ← Removed reference to non-existent Dockerfile.api
   ```

**Why This Matters:** Single-container architecture serves both UI + API on port 4545. Production builds need relative paths (`/api/*`) not hardcoded localhost. Centralized config ensures all deployment scenarios work:
- **Local dev:** `http://localhost:4646` (separate ports)
- **Docker/LAN:** `""` (relative paths, same-origin)
- **Custom domain:** `https://your-domain.com` (via VITE_API_URL env var)

**Verification:**
```bash
✅ npm run build       — Clean production build (4.88s)
✅ npm test            — All 10 tests pass
✅ dist/ bundle        — NO hardcoded localhost:4646
✅ Dockerfile          — Rebuilds dist/ fresh every time
✅ GitHub Actions      — Fixed workflow, single container
```

**Future-Proofing:** All API URL resolution must go through `getApiBaseUrl()` from `src/config/apiConfig.ts`. Do not hardcode localhost:4646 or custom domains in individual components. This is the single source of truth for API connectivity across all deployment scenarios.

---

**Maintained by CrustAgent©™**

Last Updated: 2026-03-16
