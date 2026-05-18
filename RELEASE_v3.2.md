# 📦 Clawchives — Release v3.2
## *The Sovereign Agent & Admin Dashboard Release*

```text
       ┌────────────────────────────────────────┐
       │                                        │
       │                   Clawchives                   │
       │                                        │
       └────────────────────────────────────────┘
```

---

## 🚀 The Core Summary

Welcome to **v3.2** of **Clawchives**! This release introduces powerful new administrative controls and robust, sovereign agent capabilities. It features a complete **SuperAdmin Dashboard** with custom layout settings, cascading user deletions, folder-level stats, and deep database security hardened via **The Tidewater Block** (which gates agent queries per-user and enforces granular permission lists). Additionally, this release implements page-based pagination for high-volume agent crawls and a timing-safe SHA-256 pre-hashed handshake for secure and performant API interactions.

---

## 💎 Key Themes & Highlights

### 🛠️ 1. Features & Capabilities
*Context: Newly introduced features, functional tools, or capabilities.*
*   **Feat:** add `generate_release_notes.py` script for automated release note generation.
*   **Fix:** **admin**: delete all user-related records on deletion (cascading deletes) and add extensive admin test coverage.
*   **Feat:** add folder stats to SuperAdmin dashboard and refactor admin route imports.
*   **Feat:** add SuperAdmin panel configuration and Phase 8 documentation.

### 🔌 2. Infrastructure & API Changes
*Context: Changes to API structure, connection gateways, or networking configurations.*
*   **API Prefix Enforcement**: Refactored the core SKILL guides and configuration references to strictly specify the `/api/` prefix for all operational routes.

### 🎨 3. UI, UX & Design system alignment
*Context: Polish, responsive layout adaptations, or components aligned to the design guides.*
*   **SuperAdmin UI Grid**: Integrated visual metrics, including folder-level distribution counts, database storage status, and user administrative tables.

### 🛡️ 4. Security, Hygiene & Environment Hardening
*Context: Security vulnerabilities patched, changes to tracking exclusions, or dependency upgrades.*
*   **The Tidewater Block**: Restricts all query contexts at the middleware layer using the token owner's direct `user_uuid`, locking down cross-user data isolation.
*   **Pre-Hashed Agent Authentication**: Replaced plaintext transmission keys with timing-safe SHA-256 `keyHash` recognition under `/api/auth/token`, blocking timing side-channel attacks on lookup.
*   **Granular Permission Checks**: Added active gating matrices verifying `canRead`, `canWrite`, `canEdit`, and `canDelete` permissions per agent.

### 👾 5. Performance, Refactoring & Miscellaneous
*Context: Optimization cycles, code cleaning, and background tooling configurations.*
*   **Jina Index Correction**: Reconfigured migrations to correct the unique constraint on `jina_conversions` to `(user_uuid, url)`, allowing distinct multi-user duplicates.
*   **Page-based Pagination**: Enabled robust `page` and `limit` query controls inside `/api/bookmarks` scaling maximum limit bounds safely to `10000`.

---

## 🏗️ Architectural Topology Map

```text
┌─────────────────────────────────────────────────────────┐
│              🌐 [Layer A: Client / Frontend]            │
│  ┌───────────────────────┐   ┌───────────────────────┐  │
│  │   SuperAdmin Panel    │   │  Sovereign Agents     │  │
│  │   [Folder Stats &     │   │  [Timing-safe Login & │  │
│  │    User Admin UI]     │   │   Pre-hashed Handshake│  │
│  └───────────┬───────────┘   └───────────┬───────────┘  │
└──────────────┼───────────────────────────┼──────────────┘
               │                           │             
               │ [Secure JSON RPC / REST]  │             
               ▼                           ▼             
┌─────────────────────────────────────────────────────────┐
│        🔌 [Layer B: Middleware / API Gateways]           │
│  ┌───────────────────────────────────────────────────┐  │
│  │   Tidewater Block (Cross-User Data Isolation)      │  │
│  │   Granular Permission Verification                │  │
│  │   Page-based Pagination (Offset-based limit 10k)  │  │
│  └───────────────────────┬───────────────────────────┘  │
└──────────────────────────┼──────────────────────────────┘
                           │                            
                           ▼                            
┌─────────────────────────────────────────────────────────┐
│              🖥️ [Layer C: Backend / SQLite]              │
│  - Cascade Deletion Cascade triggers                    │
│  - Corrected Unique Jina Conversion Index (user, url)  │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Commit Ledger (Since `v3.1.1`)

*   `a368587` — **uncategorized:** Merge pull request #47 from ClawStackStudios/feat/admin-panel-64732982
*   `1a7353c` — **uncategorized:** Merge branch 'main' into feat/admin-panel-64732982
*   `fb4b9f4` — **uncategorized:** Merge pull request #49 from ClawStackStudios/fix/lobster-key-permissions-382947224
*   `a7eee56` — **feat:** secure pre-hashed agent key handshake, robust pagination & Tidewater isolation block
*   `cf66df3` — **docs:** align README.md with actual API routes and key system specs
*   `1cfb50c` — **docs:** update SKILL.md to strictly specify the /api/ prefix for all endpoints
*   `28ec1e6` — **uncategorized:** Merge branch 'main' into feat/admin-panel-64732982
*   `aaa5989` — **uncategorized:** Merge pull request #48 from ClawStackStudios/fix/fix-lobster-key-404-issues-4763294367
*   `19b09a2` — **feat:** secure pre-hashed agent key authentication in /api/auth/token
*   `c5645ed` — **chore:** remove .nvmrc file
*   `f1be8f8` — **feat:** add generate_release_notes.py script for automated release note generation
*   `b913fcb` — **fix:** delete all user-related records and add admin tests
*   `ef278b4` — **feat:** add folder stats to admin dashboard and refactor admin route imports
*   `e3ff9a8` — **feat:** add SuperAdmin panel configuration and Phase 8 documentation

---

## ⚡ Deployment & Upgrade Instructions

### Using Local Dev Mode
Simply pull the latest release and run the developer startup script:
```bash
git pull origin main
npm install
npm run dev
```

### Using Containerized Environments (Self-Hosted / Production)
If you are running the service via container orchestration, pull the updated tag and rebuild:
```bash
docker compose pull
docker compose up -d --build
```

---

*Stay locked, stay sovereign, stay rigid.*  
**Maintained by CrustAgent©™ under AGPL-3.0 license.**
