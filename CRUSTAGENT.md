# 🦞 Master CRUSTAGENT.md — ClawChives Sovereign Directive

> **The primary intelligence handshake and operational manual for all agents.**
> 

> **Atomic Directive:** Retain the core, protect the keys, and keep the puns pinching. Data is sovereign. Security is the shell.

---

## 🏗️ Architectural DNA & Essence

ClawChives is a **Local-First Sovereign Pinchmarking** engine built on three concentric rings of truth:

1.  **The Core (Identity):** Cryptographic keys (`hu-` for Humans, `lb-` for Agents). No SaaS. You own the metal.
2.  **The Shell (Security & API):** A rigid Express/SQLite backend enforcing granular permissions.
3.  **The Carapace (UI/Theme):** A React-based Liquid Metal UI branded with Lobster semantics (Cyan, Amber, Red).

### Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind (Vanish CSS).
- **Backend:** Node 22 + Express 5 + `better-sqlite3`.
- **Storage:** SQLite3 (Persistent volume bind mounts).
- **Auth:** Asymmetric trust via prefix-based tokens (`hu-`, `lb-`, `api-`).

---

## 🔐 Auth System & Security Matrix

### Key Hierarchy
- `hu-` **(Human Identity - 64 char):** Master key. Never sent to server (only SHA-256 hash). Exists in `clawchives_identity_key.json`. **Supports One-Field Login.**
- `lb-` **(Lobster/Agent - 64 char):** Delegated API access with granular permissions (`READ`, `WRITE`, `EDIT`, etc.).
- `api-` **(Session Token - 32 char):** Active bearer token for `Authorization: Bearer <token>` headers. Short-lived context.

### Security Invariants
- ✅ Constant-time comparison for keyHash verification.
- ✅ **Modulo Bias Guard**: Use unbiased character selection (no raw `byte % 62`) for entropy.
- ✅ User isolation via `user_uuid` in ALL queries.
- ✅ `requireHuman` locks settings and key generation to master identity only.
- ✅ `requirePermission(action)` geometrically locks CRUD endpoints.
- ✅ **Relational Jina Storage**: Jina URLs are decoupled into `jina_conversions` table for clean identity separation.
- ✅ **Agent Preference**: Agents prioritize Markdown links (`jinaUrl`) for research.

---

## 🏗️ Architectural Constraints & Logic

1.  **Adapter Pattern or Bust**: The UI never touches the REST API directly. Use `IDatabaseAdapter` and the `useDatabase()` hook.
2.  **Feature-Based Nesting**: Components map to spatial domains (`components/auth/`, `dashboard/`, `settings/`). Do not cross streams.
3.  **Lobster Branding (Semantic Colors)**:
    - **Cyan** (`#0891b2`): Sovereignty, Pinchmarks, Primary Actions.
    - **Amber** (`#d97706`): AI/Lobster Energy, Keys, Alerts.
    - **Red** (`#ef4444`): Branding, "Lobsters", Security barriers, Delete actions.
4.  **Visual UI Lock-in**: Spatial positioning and component hierarchy are frozen. New features must integrate into existing spaces without shifting elements.

---

## 📊 Current State: Release 4 Sprint ✅ COMPLETE (2026-03-19)

### Phase 4: Ephemeral Lobster Sessions + Accurate Badge Counts ✅ COMPLETE (2026-03-19)

#### Phase 4a: Ephemeral Lobster Session Management
- [x] **Session-Scoped Ephemeral Keys**: `POST /api/lobster-session/start` generates `lb-eph-*` keys valid for 15 minutes or until "Done"
- [x] **Session Lifecycle**: `POST /api/lobster-session/:id/close` revokes key + returns accumulated import errors
- [x] **import_sessions Table**: Lightweight tracking table with `id, user_uuid, key_id, started_at, closed_at, error_count, errors_json`
- [x] **Error Accumulation**: Bulk endpoint appends per-item errors to session via `X-Session-Id` header (non-breaking, optional)
- [x] **Audit Logging**: All session start/close events logged via `LOBSTER_SESSION_STARTED` and `LOBSTER_SESSION_CLOSED` audit records
- [x] **HardShell Session Tests**: 19 comprehensive tests covering:
  - Session lifecycle (start → active → close)
  - Permission gating (human-only via `requireHuman`)
  - Key generation (lb-eph- prefix, 15min expiry, canWrite-only permissions)
  - Error accumulation on bulk import
  - Session isolation (two sessions independent, closing one doesn't affect other)
  - Ephemeral key usage (works while active, rejected after close, auto-expires)

#### Phase 4b: Accurate Real-Time Badge Counts
- [x] **GET /api/bookmarks/stats Endpoint**: New route returning `{ total, starred, archived }` counts from DB
- [x] **useBookmarkStats() Hook**: Independent React Query hook (not pagination-dependent)
- [x] **Stats Cache Invalidation**: All mutations (save/update/delete) invalidate `['bookmarks', 'stats']` query
- [x] **Lobster Import Invalidation**: Session close also invalidates stats, ensuring badge updates after bulk import
- [x] **Dashboard Integration**: Badge counts now use stats instead of `flatBookmarks.length` (true DB total, not just loaded pages)
- [x] **Real-Time Updates**: Badge reflects accurate count on first render, no page refresh needed

### Phase 1: Lobster Bulk Import ✅ COMPLETE (2026-03-19)
- [x] **POST /api/bookmarks/bulk Endpoint**: Accepts up to 1000 bookmarks per batch with HTTP 207 Multi-Status responses.
- [x] **Rate Limiter Bypass**: Lobster keys (`lb-` prefix) bypass `apiLimiter` for unlimited batch imports.
- [x] **Per-Item Validation**: Individual URL validation with error reporting (`{ url, reason }`).
- [x] **UNIQUE Constraint Detection**: Duplicate prevention via `UNIQUE INDEX (user_uuid, url)`.
- [x] **jinaUrl Agent Guard**: Agents blocked from using conversion URLs (per-item error, not 403).
- [x] **HardShell Test Suite**: 20 comprehensive tests covering auth, validation, duplicates, race conditions, response integrity.
- [x] **Infrastructure Bug Fixes**: `testFactories.ts` + `testDb.ts` corrected.
- [x] **Truthpack Alignment**: All JSON contracts, routes, and stability locks updated.

### Phase 2: Large Library Optimization ✅ COMPLETE (2026-03-19)
- [x] **True Async Folder Counts**: Dedicated hook `useFolderCounts` + backend endpoint `/api/bookmarks/folder-counts`. Fixed memory-leak/accuracy bug in `Sidebar.tsx`.
- [x] **Infinite Scroll Optimization**: Sentinel div confirmed outside virtualized container.

### Phase 3: Comprehensive Test Coverage + Build Validation Gates ✅ COMPLETE (2026-03-19)
- [x] **Build Validation Gates** (tests/build-gates.test.ts): TypeScript lint, npm build, Docker readiness checks.
- [x] **Mass Import Tests** (tests/phase3-integration.test.ts): 1000 URL batches, duplicate detection, rate limit bypass.
- [x] **Performance Pass #1**: Async Folder Counts (90% faster badge counts) ✅
- [x] **Performance Pass #2**: Strategic Indexing & Asset Caching (Production Speed) ✅
- [x] **Performance Pass #3**: Zero-Sort Indexing & Component Memoization (Instant Reefs) ✅
- [x] **Audit #3**: Full integrity check — no hallucinated features, all stability locks verified. ✅
- [x] **Test Gate Integration**: npm run test:phase3:full gates all changes on passing test suite + build readiness.

### Earlier Phases: Foundation ✅
- [x] **SQLite-Only Architecture**: Dropped IndexedDB for a centralized, robust backend.
- [x] **One-Field Login**: Simplified authentication via `hu-` key lookup with `UNIQUE` `key_hash` indexing.
- [x] **Agent System**: `lb-` keys with Granular CUSTOM permissions.
- [x] **Liquid Metal Toggle**: Circular reveal transitions (State synced via API).
- [x] **r.jina.ai Integration**: LLM-friendly reading mode (Human-only conversion).
- [x] **Folder Badges**: Folder bookmarks counts rendered in sidebar.
- [x] **Folder CRUD**: Corrections and dead code removal.

---

## 🧪 Test Suite Status (131 Tests — ALL PASSING) 🎉

**Commands**:
- `npm run test` — All tests (Unit + Middleware + Integration + Lobster)
- `npm run test:lobster-session` — Lobster session tests only (19 tests)
- `npm run test:phase3:build` — Build validation gates only (10 tests)
- `npm run test:phase3:integration` — Phase 3 integration tests only (6 tests)
- `npm run test:phase3:full` — All Phase 3 tests (109 total)
- `npm run test:phase4:full` — FULL SUITE: All tests + Lobster + build gates (131 tests)

**Architecture (Semantic Layers)**:
- **Layer 0 — Unit Tests (46)**: Parsers, crypto, utils, API helpers
- **Layer 1 — Middleware Tests (31)**: Error handling, validation, HTTP status codes
- **Layer 2 — Integration Tests (54)**: Security (3) + Bulk Import (20) + Phase 3 (6) + Phase 4 Lobster (19) + Build Gates (10)

**Phase 4 Test Coverage (19 tests) — Lobster Session Lifecycle**:
- ✅ **Session Start** (5 tests): Auth blocking, human-only gating, key generation (lb-eph- prefix), expiration (15min ± 5s), permissions (canWrite only)
- ✅ **Session Close** (5 tests): Auth blocking, user isolation (403 cross-user), revocation of ephemeral key (is_active=0), closed_at timestamp, error accumulation
- ✅ **Bulk Import with Sessions** (4 tests): Error accumulation via X-Session-Id header, successful imports skip errors_json, unknown/closed sessions silently ignored
- ✅ **Ephemeral Key Lifecycle** (3 tests): Key works while active, rejected after close (401), auto-expires after expiration_date
- ✅ **Session Isolation** (2 tests): Two sessions independent (different keys), closing session A doesn't affect session B's key

**Phase 3 Test Coverage (6 tests)**:
- ✅ **Task 3.1 — Mass Import**: 1000 URLs in batches, duplicate detection (2 tests)
- ✅ **Task 3.2 — Performance**: < 500ms fetch, < 100ms folder counts (2 tests)
- ✅ **Task 3.3 — Error Recovery**: Partial failures, duplicate skipping (2 tests)

**Build Validation Gates (10 tests)**:
- ✅ TypeScript lint (`npm run lint`)
- ✅ NPM build (`npm run build`)
- ✅ Docker build readiness (`docker build .`)

**Critical Coverage**:
- ✅ Authentication & Authorization (10 tests, including Lobster human-only gating)
- ✅ Body Validation & Input Handling (5 tests)
- ✅ Happy Path Imports (2 tests)
- ✅ Duplicate Detection & Race Conditions (3 tests)
- ✅ jinaUrl Agent Guard (1 test)
- ✅ Response Integrity & Math Verification (3 tests)
- ✅ Rate Limiter Bypass (1 test)
- ✅ Mass Import at Scale (1000 URLs, 2 tests)
- ✅ Performance under Load (2 tests)
- ✅ **Session Lifecycle & Ephemeral Keys** (19 tests)
- ✅ **Stats Query Isolation** (independent of pagination, real-time invalidation)

**Test Helpers**:
- `tests/helpers/testDb.ts` — Database isolation, cleanup, reset
- `tests/helpers/testFactories.ts` — User/folder/bookmark/agent key creation (schema-correct)
- `tests/bulk-import.test.js` — Phase 1 bulk import tests (20 tests)
- `tests/phase3-integration.test.ts` — Phase 3 integration tests (9 tests)
- `tests/build-gates.test.ts` — Build validation tests (3 tests)

---

## 🚢 Operational Intel

- **Scuttle Prod**: `npm run scuttle:prod-start` (Production mode).
- **Scuttle Dev**: `npm run scuttle:dev-start` (Concurrently starts API @ 4646 + Vite @ 4545).
- **Scuttle Reset**: `npm run scuttle:reset-dev` (Scuttles the dev reef).
- **Scuttle Stop**: `npm run scuttle:prod-stop` (Kills port 4545 and 4646).
- **API Dev**: `npm run dev:server` (Port 4646).
- **Build**: `npm run build` (tsc + vite build).
- **Lint**: `npm run lint` (TypeScript verification).
- **Test**: `npm run test` (Vitest all layers — 109 tests passing).
- **Phase 3 Full**: `npm run test:phase3:full` (gates on all tests + build readiness).
- **Ports**: UI on `4545`, API on `4646 manually`.
- **tsx Gotcha**: `tsx --watch` does NOT support `--ignore` on Node v22. Silent crash risk.
- **Stability**: If API fails, run `npm rebuild better-sqlite3`.

---

# DO NOT UPDATE THIS SECTION

## 🗺️ Complete File Map & Context References

### Core Documentation
- **README.md** - Project overview, installation, and usage instructions
- **CONTRIBUTING.md** - Development guidelines and contribution process
- **ROADMAP.md** - Project vision, timeline, and feature roadmap
- **SECURITY.md** - Security policy and vulnerability reporting process
- **CRUSTSECURITY.md** - Comprehensive security framework and standards

### Project Intelligence & Validation
- **src/CRUSTAGENT.md** - Source-level patterns and stability locks
- **.crustagent/vibecheck/truthpack/** - Project truth validation and stability locks
  - `auth.json` - Authentication system contracts
  - `blueprint.json` - Technical architecture blueprint
  - `contracts.json` - API endpoint contracts
  - `env.json` - Environment variable contracts
  - `routes.json` - API route definitions
  - `security.json` - Security standards and compliance
  - `stability-locks.json` - Project stability constraints
- **.crustagent/crustaudits/** - Automated audit reports and validation results
- **.crustagent/knowledge/** - Project knowledge base and documentation

### AI Agent Context Access
When working on ClawChives, AI agents should read these files in order:
1. **CRUSTAGENT.md** (this file) - Primary intelligence handshake
2. **src/CRUSTAGENT.md** - Source-level implementation patterns
3. **README.md** - User-facing documentation and setup
4. **CONTRIBUTING.md** - Development standards and workflow
5. **.crustagent/vibecheck/truthpack/** - Current project state validation
6. **.crustagent/crustaudits/** - Recent audit results and findings
7. **.crustagent/knowledge/** - Deep project knowledge and philosophy

## Map to the Reef 🗺️
- `CRUSTAGENT.md`: Detailed transition logs and technical invariants.
- `src/CRUSTAGENT.md`: Source-level patterns and stability locks.
- `README.md`: Project overview and user documentation.
- `CONTRIBUTING.md`: Development guidelines and contribution process.
- `ROADMAP.md`: Project vision and feature roadmap.
- `SECURITY.md`: Security policy and vulnerability reporting.
- `CRUSTSECURITY.md`: Comprehensive security framework.
- `.crustagent/vibecheck/truthpack/`: Project truth validation and stability locks.
- `.crustagent/crustaudits/`: Automated audit reports and validation results.
- `.crustagent/knowledge/`: Project knowledge base and documentation.
- `.crustagent/memory/`: CrustAgent's memory store.

---

---

## 🎓 Knowledge Base Access

**For detailed project knowledge, consult:**

### Knowledge Directory (`.crustagent/knowledge/`)
- **ARCHITECTURAL-DNA.md** — Core identity, tech stack, design principles
- **AUTH-SYSTEM.md** — Key hierarchy, critical fixes #1-3, security invariants
- **LOBSTER-KEY-SYSTEM.md** — Agent keys, permissions, lifecycle, terminology
- **DATABASE-SCHEMA.md** — SQLite backend, IndexedDB client, sync strategy
- **API-SURFACE.md** — All REST endpoints, middleware chain, r.jina.ai integration
- **SECURITY-POSTURE.md** — Current strengths, gaps, OWASP coverage, hardening plan
- **COMMON-PITFALLS.md** — Known issues, debugging, gotchas, solutions
- **PROJECT-PHASES.md** — Phase tracking, completed work, roadmap, future vision
- **LAN-API-URL-Deployment-Fix.md** — Comprehensive guide to LAN deployment configuration
- **DOCKER-STARTUP-FIX.md** — Root cause analysis and solution for container startup failure (2026-03-16)

### Rules Directory (`.crustagent/rules/`)
- **INVARIANTS.md** — 17 critical stability locks (NEVER BREAK THESE) — includes Docker build and entrypoint constraints
- **CRITICAL-FILES.md** — Change impact assessment, tier classification, stability locks per file — includes docker-entrypoint.sh entry

### Source-Level Documentation
- **src/CRUSTAGENT.md** — Source-level patterns, component architecture, type locations

### Truthpack & Validation
- **.crustagent/vibecheck/truthpack/** — Project truth validation and contracts
- **.crustagent/crustaudits/** — Audit results and validation findings

---

```text
       _..._
     .'     '.      HATCH YOUR CLAWCHIVE.
    /  _   _  \     RESPECT THE SHELL.
    | (q) (p) |     PUNCH THE CLOUD.
    (_   Y   _)
     '.__W__.'
     Maintained by CrustAgent©™
```
