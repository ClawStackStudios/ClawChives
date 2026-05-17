# 🦞 CRUSTAGENT.md — ClawChives Sovereign Directive

---
Brand: ClawStack Studios©™
Project: ClawChives©™
---

> **The primary intelligence handshake for all future agents.**
> Antigravity, if you are reading this: You are the carapace of this codebase. Retain the core, protect the keys, and keep the puns pinching.
> **Atomic Directive:** Compress knowledge. Think geometrically. Features are domains. Data is sovereign. Security is the shell.

[![Sovereign](https://img.shields.io/badge/Status-Sovereign-red?style=for-the-badge)](#)
[![Phase](https://img.shields.io/badge/Phase-8_Complete-blue?style=for-the-badge)](#)
[![SQLite](https://img.shields.io/badge/Storage-SQLite-amber?style=for-the-badge)](#)
[![Tests](https://img.shields.io/badge/Tests-166_Passing-green?style=for-the-badge)](#)

---

## 🏗️ Architectural DNA

<details>
<summary>📐 Core Identity & Tech Stack</summary>

ClawChives is a **Local-First Sovereign Pinchmarking** engine built on three concentric rings of truth:

1. **The Core (Identity):** Cryptographic keys (`hu-` for Humans, `lb-` for Agents). No SaaS. You own the metal.
2. **The Shell (Security & API):** A rigid Express/SQLite backend enforcing granular permissions.
3. **The Carapace (UI/Theme):** A React-based Liquid Metal UI branded with Lobster semantics (Cyan, Amber, Red).

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS (shadcn/ui components)
- **Backend:** Node 22 + Express 5 + `better-sqlite3`
- **Storage:** Dual SQLite3 (`db.sqlite` for pinchmarks, `audit.sqlite` for segregated logs)
- **Auth:** Asymmetric trust via prefix-based tokens (`hu-`, `lb-`, `api-`) + `ADMIN_TOKEN` control plane.

</details>

<details>
<summary>🎨 Lobster Branding — Semantic Colors (LOCKED)</summary>

> [!CAUTION]
> **Visual Placement is Frozen.** The current layout, spatial positioning, and component hierarchy are locked. New features must integrate into existing spaces without shifting established UI elements.

| Color | Hex | Semantic Use |
|---|---|---|
| **Cyan** | `#0891b2` | Sovereignty, Pinchmarks, Keys, Primary Actions |
| **Amber** | `#d97706` | AI/Lobster Energy, Alerts |
| **Red** | `#ef4444` | Branding, Security barriers, Delete actions |
| **Liquid Metal** | — | Circular View Transition animations on Theme switch |

</details>

<details>
<summary>🗺️ File Map — The Reef</summary>

| File/Directory | Purpose |
|---|---|
| `CRUSTAGENT.md` | This file — primary intelligence handshake |
| `src/CRUSTAGENT.md` | Source-level patterns, stability locks |
| `README.md` | Project overview and user documentation |
| `CONTRIBUTING.md` | Development guidelines and contribution process |
| `ROADMAP.md` | Project vision and future features |
| `SECURITY.md` | Security policy and vulnerability reporting |
| `CRUSTSECURITY.md` | ClawStack©™ standards alignment |
| `.crustagent/vibecheck/truthpack/` | Project truth validation and stability locks |
| `.crustagent/crustaudits/` | Audit reports and validation findings |
| `.crustagent/knowledge/` | Project knowledge base |

**Agent Read Order:**
1. `CRUSTAGENT.md` (this file)
2. `src/CRUSTAGENT.md`
3. `README.md`
4. `.crustagent/vibecheck/truthpack/`
5. `.crustagent/knowledge/`

</details>

---

## 🔐 Auth System & Security Matrix

<details>
<summary>🗝️ Key Hierarchy</summary>

| Key | Prefix | Length | Role |
|---|---|---|---|
| Human Identity | `hu-` | 64 chars (67 total) | Master key. Never sent to server. One-Field Login. |
| Lobster/Agent | `lb-` | 64 chars (67 total) | Delegated API access with granular permissions. |
| Session Token | `api-` | 32 chars (36 total) | Active bearer token. Short-lived. |

**Server never receives `hu-` plaintext.** Only `SHA-256(key)` as a 64-char lowercase hex string is ever sent over the wire.

</details>

<details>
<summary>🛡️ Security Invariants</summary>

- ✅ Constant-time comparison for `key_hash` verification (XOR accumulator)
- ✅ **Modulo Bias Guard** — rejection sampling prevents statistical predictability in key generation
- ✅ User isolation via `user_uuid` in ALL queries (no cross-user leakage possible)
- ✅ `requireHuman` locks settings and key generation to master identity only
- ✅ `requirePermission(action)` geometrically locks CRUD endpoints
- ✅ Parameterized queries only — no string interpolation ever
- ✅ **Relational Jina Storage** — Jina URLs decoupled into `jina_conversions` table
- ✅ **Admin Stability Lock** — SuperAdmin dashboard gated by `ADMIN_TOKEN`, using volatile in-memory sessions and constant-time token validation.
- ✅ **Segregated Auditing** — Security logs and system events isolated in `audit.sqlite` for tamper-resistance and performance.
- ✅ **Epistemic Indexing & WAL** — Load-bearing columns (`user_uuid`, `owner_key`, `key`) fully indexed to eliminate the "Full Table Scan" predator under 100+ user load, optimized with Write-Ahead Logging (WAL) for parallel reads and non-blocking writes.

</details>

<details>
<summary>🔒 Middleware Chain</summary>

```
Request
  └─ corsConfig         # Env-aware: LAN in dev, origin-locked in prod
  └─ helmet             # Security headers
  └─ rateLimiter        # Per-agent, bypassed for lb- keys on bulk endpoints
  └─ requireAuth        # Validates api- token, injects req.agentPermissions
  └─ requirePermission  # Locks CRUD by canRead/Write/Edit/Move/Delete
  └─ requireHuman       # Blocks agent access to settings routes
  └─ requireAdmin       # [Admin Plane Only] Validates volatile admin session
  └─ Route Handler
```

</details>

---

## 📊 Phase Tracking

 <details>
 <summary>✅ Phase 8 — SuperAdmin Control Plane (2026-05-16) COMPLETE</summary>

 > [!IMPORTANT]
 > Phase 8 introduced the isolated SuperAdmin control plane, implementing high-security metadata management and segregated auditing.

 **Sub-Phase 8a — Segregated Infrastructure:**
 - [x] **Dual SQLite**: Created `audit.sqlite` with dedicated schema and retention cleanup logic.
 - [x] **Audit Logger**: Implemented centralized auditing for security events, system lifecycle, and uptime.
 
 **Sub-Phase 8b — Admin Plane & Security:**
 - [x] **requireAdmin Middleware**: Volatile, in-memory session management with 20min sliding TTL.
 - [x] **Gated API**: `/api/admin/*` endpoints for user management, system health, and audit querying.
 - [x] **Security Membrane**: `adminAuthLimiter` (5 attempts/15m) and constant-time token comparison.

 **Sub-Phase 8c — Frontend Integration:**
 - [x] **Segregated Routing**: Integrated `react-router-dom` for the `/admin` URL plane.
 - [x] **Domain Localization**: Adapted PinchPad logic (Pearls → Pinchmarks) and branding for ClawChives.

 </details>

 <details>
 <summary>✅ Phase 7 — Branded Export & UI Parity (2026-05-04) COMPLETE</summary>

 > [!NOTE]
 > Phase 7 finalized the high-fidelity export ecosystem and unified the dashboard UI with the PinchPad design system.

 **Sub-Phase 7a — Sovereign Export Pipeline:**
 - [x] **Format Parity**: Implemented JSON, Markdown, and PDF/HTML exports.
 - [x] **Branded Footers**: Added "ClawStack Studios©™" footers to PDF/HTML outputs.
 - [x] **HTML Modernization**: Theme-aware HTML exports with Light/Dark toggles.
 - [x] **Metadata Enrichment**: Statistics (`Total Pinchmarks`, `Tags`, etc.) included in all formats.

 **Sub-Phase 7b — UI/UX Modernization:**
 - [x] **Global Folder State**: Elevated `FolderEditModal` to Dashboard level for full-screen management.
 - [x] **Sidebar Persistence**: `cc_sidebar_open` state synced to `localStorage`.
 - [x] **Settings Restoration**: Persistent headers and descriptions restored to Settings habitat.
 - [x] **Branding**: Changed browser favicon to the sovereign 🦞 emoji.

 </details>
 <summary>✅ Phase 6 — Full Frontend Refactor (2026-03-22) COMPLETE</summary>

> [!NOTE]
> Phase 6 completed a full micro-service architecture decomposition across all frontend domains. All components are now under the 250-line CrustCode©™ limit.

**Sub-Phase 6a — Dashboard Domain:**
- [x] `DatabaseStatsModal.tsx` → extracted `StatsCards.tsx` + `BookmarkTable.tsx`
- [x] `Sidebar.tsx` → extracted `SidebarNav.tsx` + `FolderList.tsx`

**Sub-Phase 6b — Settings Domain:**
- [x] `AgentPermissions.tsx` → extracted `AgentKeyCard.tsx` + `agentPermissionsUtils.ts`
- [x] `ImportExportSettings.tsx` → extracted `ImportSection.tsx` + `ExportSection.tsx`
- [x] `LobsterImportModal.tsx` → extracted `useLobsterSession.ts` + `ImportSteps.tsx`

**Sub-Phase 6c — Shared Domain:**
- [x] `LobsterModal.tsx` → split into `modals/` directory (`ConfirmModal`, `AlertModal`, `TagBlockedModal`)
- [x] Dead `api.ts` + `api.test.ts` removed
- [x] `exportImport.ts` → modular export system (`export/exportHub.ts` + formatters)
- [x] Encryption logic centralized into `shared/lib/crypto.ts`

</details>

<details>
<summary>✅ Phase 5 — Backend Modularization (2026-03-22) COMPLETE</summary>

- [x] Decomposed monolithic `db.ts` into `src/server/database/` (connection, schema, migrations)
- [x] Refactored `bookmarks.ts` route into `src/server/routes/bookmarks/` with atomic handlers
- [x] All server-side files under 250-line CrustCode©™ limit
- [x] Frontend Feature Slicing: reorganized into `src/features/` + `src/shared/`
- [x] Absolute path migration: centralized aliases, no relative import ambiguity

</details>

<details>
<summary>✅ Phase 4 — Ephemeral Sessions + Badge Counts (2026-03-19) COMPLETE</summary>

- [x] `POST /api/lobster-session/start` — ephemeral `lb-eph-*` keys (15min TTL)
- [x] `POST /api/lobster-session/:id/close` — revoke + return accumulated errors
- [x] `GET /api/bookmarks/stats` — real-time `{ total, starred, archived }` counts
- [x] `useBookmarkStats()` hook — independent React Query, invalidated on every mutation
- [x] 19 comprehensive Lobster session tests added

</details>

<details>
<summary>✅ Phases 1–3 — Foundation, Agent API, Hardening (2026-03-19) COMPLETE</summary>

- [x] SQLite-Only Architecture (dropped IndexedDB)
- [x] One-Field Login via `hu-` key SHA-256 lookup
- [x] Agent System with granular CUSTOM permissions
- [x] Liquid Metal Toggle via View Transitions
- [x] r.jina.ai Reading Mode (human-only conversion)
- [x] POST /api/bookmarks/bulk — 1000 items/batch with HTTP 207 responses
- [x] 131 total tests passing (Unit + Middleware + Integration)

</details>

---

## 🧪 Test Suite

<details>
<summary>🧬 166 Tests — All Passing</summary>

```bash
npm run test                    # All tests
npm run test:lobster-session    # Lobster session tests (19)
npm run test:phase3:full        # Phase 3 gates (109 total)
npm run test:phase4:full        # FULL SUITE (166 tests)
```

**Architecture (Semantic Layers):**
| Layer | Tests | Coverage |
|---|---|---|
| Layer 0 — Unit | 46 | Parsers, crypto, utils, API helpers |
| Layer 1 — Middleware | 31 | Error handling, validation, HTTP codes |
| Layer 2 — Integration | 54 | Security + Bulk Import + Phase 3 + Phase 4 + Build Gates |

</details>

---

## 🚢 Operational Intel

<details>
<summary>⚙️ Run Commands</summary>

```bash
# Development
npm run scuttle:dev-start     # API @4646 + Vite @4545 (localhost only)

# Production
npm run scuttle:prod-start    # Build + API + UI on 0.0.0.0

# Stop / Reset
npm run scuttle:prod-stop     # Kill ports 4545 + 4646
npm run scuttle:reset-dev     # Scuttle dev reef

# Docker (Dev)
docker-compose -f docker-compose.dev.yml up --build

# Utilities
npm run build                 # tsc + vite build
npm run lint                  # TypeScript verification
npm run test                  # Vitest all layers
```

**Ports:** UI on `4545`, API on `4646`.

</details>

<details>
<summary>⚠️ Stability Gotchas</summary>

- **`tsx --watch` Gotcha**: Does NOT support `--ignore` on Node v22. Silent crash risk.
- **`better-sqlite3` Mismatch**: If API fails to start: `npm rebuild better-sqlite3`
- **Port Collision**: If 4646 is busy, `npm run scuttle:prod-stop` before restarting.

</details>

---

## 📚 Knowledge Base

<details>
<summary>📖 .crustagent/knowledge/ Reference</summary>

| File | Topic |
|---|---|
| `ARCHITECTURAL-DNA.md` | Core identity, tech stack, design principles |
| `AUTH-SYSTEM.md` | Key hierarchy, critical fixes, security invariants |
| `LOBSTER-KEY-SYSTEM.md` | Agent keys, permissions, lifecycle, terminology |
| `DATABASE-SCHEMA.md` | SQLite backend, schema, sync strategy |
| `API-SURFACE.md` | All REST endpoints, middleware chain |
| `SECURITY-POSTURE.md` | Current strengths, gaps, OWASP coverage |
| `COMMON-PITFALLS.md` | Known issues, debugging, gotchas |
| `PROJECT-PHASES.md` | Phase tracking, completed work, roadmap |

Other rules in `.crustagent/rules/`:
- `INVARIANTS.md` — 17 critical stability locks (NEVER BREAK THESE)
- `CRITICAL-FILES.md` — Change impact assessment per file

</details>

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
