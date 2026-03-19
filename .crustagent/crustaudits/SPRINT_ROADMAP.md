# Sprint Roadmap — Release 3 Stability Push

**Goal:** Stabilize mass import flows, optimize large library loads, and harden bulk transfer error handling before Release 3 cut.

**Context:** Agent-driven bulk imports are hitting rate limits at ~76 links. Current UI stalls when loading 690+ bookmarks. Need to balance security (rate limits for web UI) with operational efficiency (trusted Lobster key imports).

---

## 📋 Sprint Tasks

### Phase 1: Bulk Import Infrastructure ✅ COMPLETE (2026-03-19)

#### Task 1.1 — Lobster Import Modal (UI Placeholder) ✅
- **File:** `src/components/settings/LobsterImportModal.tsx` (NEW)
- **Status:** COMPLETE
- **What:** Create modal in Settings → Import category with "Lobster Import" option
- **Content:** Placeholder text explaining bulk import flow from agents via ClawKey
- **Result:** Modal renders with amber theme, can open/close from Settings, explains the process clearly

#### Task 1.2 — Bypass Rate Limit for Lobster Imports ✅
- **File:** `src/server/middleware/rateLimiter.ts`
- **Status:** COMPLETE
- **What:** Detect Lobster key auth context and skip rate limiting for `/api/bookmarks/bulk` endpoint
- **Result:** Lobster keys (`lb-*`) bypass `apiLimiter`; web UI rate limit still enforced at 100 req/min

#### Task 1.3 — Bulk Import Endpoint ✅
- **File:** `src/server/routes/bookmarks.ts`
- **Status:** COMPLETE
- **What:** Create `POST /api/bookmarks/bulk` endpoint accepting up to 1000 bookmarks per batch
- **Result:** HTTP 207 Multi-Status response with per-item error reporting, UNIQUE constraint duplicate detection, jinaUrl agent guard
- **Tests:** 20 comprehensive tests covering auth, validation, duplicates, race conditions, response integrity

#### Task 1.4 — Infrastructure Bug Fixes ✅
- **Files:** `tests/helpers/testFactories.ts`, `tests/helpers/testDb.ts`
- **Status:** COMPLETE
- **Fixes:**
  - Added missing `expiration_type` field to `createTestAgentKey`
  - Corrected `resetTestDatabase` to delete from `api_tokens` (not `tokens`)

#### Task 1.5 — Comprehensive Test Suite ✅
- **File:** `tests/bulk-import.test.js`
- **Status:** COMPLETE (20 tests, all passing)
- **Coverage:** Auth & Permissions (5), Body Validation (5), Happy Path (2), Duplicates & Race (3), jinaUrl Guard (1), Response Integrity (3), Rate Limiter (1)

#### Task 1.6 — Truthpack & Documentation Alignment ✅
- **Files:** All `.crustagent/vibecheck/truthpack/*.json` + CRUSTAGENT.md files
- **Status:** COMPLETE
- **Updates:** Routes, contracts, stability-locks, test-suite documentation; CRUSTAGENT.md Phase 1 completion markers

---

### Phase 2: Large Library Optimization ✅ COMPLETE (2026-03-19)

#### Task 2.1 — Async Pagination for Folder Counts ✅
- **File:** `src/components/dashboard/Sidebar.tsx`
- **Status:** COMPLETE
- **What:** Cache folder counts in `useMemo`, recalculate only when folders or bookmarks change
- **Logic:** Precompute all counts once, provide stable `folderBookmarkCount` getter via `useCallback`
- **Result:** Sidebar renders instantly; folder count badges update only when relevant bookmarks change

#### Task 2.2 — Backend Count Endpoint ✅
- **File:** `src/server/routes/bookmarks.ts`
- **Status:** COMPLETE
- **What:** Created `GET /api/bookmarks/folder-counts` endpoint returning `{ folderId: count }` map
- **Logic:** Single `GROUP BY folder_id` query for all folder counts in one request
- **Result:** Endpoint integrated; ready for frontend to fetch counts asynchronously

#### Task 2.3 — Infinite Scroll Sentinel Optimization ✅
- **File:** `src/components/dashboard/BookmarkGrid.tsx`
- **Status:** COMPLETE
- **What:** Verified sentinel div positioned outside virtualized container
- **Logic:** Sentinel is sibling of scroll container; intersection observer fires only on scroll
- **Result:** No console warnings; infinite scroll functions smoothly at 690+ bookmarks

---

### Phase 3: HardShell Test Coverage (High Priority)

#### Task 3.1 — Mass Import Test Suite (1k URLs)
- **File:** `tests/integration.test.js` (add new suite)
- **What:** Test importing 1000 URLs via bulk endpoint in batches
- **Scenarios:**
  - 1000 valid URLs import successfully
  - 500 valid + 500 duplicates → success count = 500, duplicates rejected
  - 1000 URLs with mixed invalid formats → detailed error report returned
  - Lobster key bypasses rate limit, web key hits it at 76
- **Est:** 60 min
- **Acceptance:** All 4 scenarios passing, error handling is clear and actionable

#### Task 3.2 — Large Library Load Test (1k+ Bookmarks)
- **File:** `tests/performance.test.js` (add new suite)
- **What:** Measure load time and DOM node count with 1000+ bookmarks
- **Scenarios:**
  - Load 1000 bookmarks: initial render < 500ms, constant ~20 DOM nodes (virtualized)
  - Folder count calculation: < 100ms for all 5 folders
  - Infinite scroll sentinel fires correctly without stalling
- **Est:** 45 min
- **Acceptance:** All performance targets met, no memory leaks detected

#### Task 3.3 — Error Recovery Test
- **File:** `tests/error-paths.test.js` (add new suite)
- **What:** Test graceful degradation when bulk import partially fails
- **Scenarios:**
  - Network timeout mid-import: client shows "X of 1000 imported, Y failed"
  - DB constraint violation: duplicate URLs are skipped with reason logged
  - Auth token expires: retry with new token succeeds
- **Est:** 45 min
- **Acceptance:** All 3 scenarios handled cleanly, no orphaned data

---

## 🎯 Execution Order

**Day 1 (Now):**
1. Task 1.1 — Lobster Import Modal UI (30 min)
2. Task 2.1 — Async Folder Counts (30 min)
3. Task 1.2 — Rate Limit Bypass Logic (20 min)

**Day 2:**
4. Task 1.3 — Bulk Import Endpoint (45 min)
5. Task 2.2 — Backend Count Endpoint (20 min)
6. Task 2.3 — Sentinel Optimization (15 min)

**Day 3 (Testing):**
7. Task 3.1 — Mass Import Tests (60 min)
8. Task 3.2 — Large Library Performance Tests (45 min)
9. Task 3.3 — Error Recovery Tests (45 min)

---

## 🚢 Release 3 Gate

**Must have before cutting release:**
- ✅ Bulk import working (1.3)
- ✅ Folder counts load fast (2.1 + 2.2 + 2.3)
- ⏳ All 3 test suites passing (3.1 + 3.2 + 3.3) — Phase 3 queued
- ✅ No regressions from Phase 1 & 2 changes

**Nice to have:**
- Settings modal fully designed (can stub for now)

---

## 📊 Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| Sidebar render time (690 bookmarks) | ~1-2s | < 300ms |
| Bulk import (76 links) | Rate limited after 76 | No limit with Lobster key |
| Bulk import (1000 links) | Not tested | All imported, < 5s with error report |
| Virtualized DOM nodes | ~15-20 | ~15-20 (constant) |
| Test coverage | 73 tests | 73 + 10 new bulk/perf tests |

---

*Maintained by CrustAgent©™*
