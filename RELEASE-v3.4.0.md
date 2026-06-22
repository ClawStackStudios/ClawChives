---

# 🦞 ClawChives — Release v3.4.0

## *Sovereign Backup & Testing Integrity*

```text
  ██████╗██╗      █████╗ ██╗    ██╗ ██████╗██╗  ██╗██╗██╗   ██╗███████╗███████╗
 ██╔════╝██║     ██╔══██╗██║    ██║██╔════╝██║  ██║██║██║   ██║██╔════╝██╔════╝
 ██║     ██║     ███████║██║ █╗ ██║██║     ███████║██║██║   ██║█████╗  ███████╗
 ██║     ██║     ██╔══██║██║███╗██║██║     ██╔══██║██║╚██╗ ██╔╝██╔══╝  ╚════██║
 ╚██████╗███████╗██║  ██║╚███╔███╔╝╚██████╗██║  ██║██║ ╚████╔╝ ███████╗███████║
  ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝╚══════╝
                          ~ **ClawStack Mobile Studios©™** ~ 
```

---

## 🚀 The Core Summary

Welcome to **v3.4.0** of **ClawChives**! This release focuses on **delivering true sovereign data control and fortifying our test architecture**. We have unleashed the **`.ccbak` backup schema**, ensuring you can export and import entire ClawChive habitats in a single, secure compressed file. Simultaneously, we overhauled our test-suite infrastructure to provide fully dynamic, environment-isolated test databases, entirely eradicating concurrent test suite lock-outs. Oh, and we threw in an "All" view for the true data-hoarders.

---

## 💎 Key Themes & Highlights

### 🛠️ 1. Sovereign Backup Pipeline

A fully-featured ecosystem for securing your data locally without compromises.

* **.ccbak Export / Import:** Added full habitat backup logic through `jszip` compression, merging user tags, user sessions, and pinchmarks into a unified payload format.
* **Habitat Safety Lock:** Calibrated the import logic to strictly require an "empty habitat" to prevent destructive overwriting, keeping user data safe from accidental collision.

### 🔌 2. Data Interface Refinements

Refining the user-facing data pagination layers to empower high-density viewing.

* **Expanded View Limits:** The Items Per Page settings now natively support a "96" boundary alongside a brand-new "All" mode for users who demand their entire collection on a single infinite canvas.
* **Layout Mode Syncing:** Hooked up the appearance settings so layout toggles are flawlessly synchronized between the global header and the system modal.

### 🛡️ 3. Test Database Integrity & Architecture (Phase 10)

Fortified our internal development architecture, unlocking massively parallel testing without SQLite collisions.

* **Hoisted Isolation Variables:** Migrated server static imports to dynamic ESM hoisting, allocating a unique localized `DATA_DIR` directory for every executing test suite.
* **Time Tolerance Adjustments:** Raised integration testing `bulk-import` and SQLite batch-commit transaction limits up to 90 seconds, correctly mirroring low-performance deployment environments.

### 👾 4. Boundary Formalization (ClawChives Mobile)

Locking down cross-application APIs and theme invariants.

* **Mobile API Boundary:** Formalized `BOUNDARY.md` connecting to `.agents/STATE.md` establishing the exact state interface for the forthcoming Android mobile application.

---

## 🏗️ Architectural Topology Map

```text
┌───────────────────────────────────────────────┐
│              🌐 Client / Frontend             │
│  ┌──────────────────┐   ┌──────────────────┐  │
│  │ SettingsPanel    │   │  ExportModal     │  │
│  │ Items Per Page   │   │  .ccbak gen      │  │
│  └────────┬─────────┘   └────────┬─────────┘  │
└───────────┼──────────────────────┼────────────┘
            │                      │             
            │     .ccbak File      │             
            ▼                      ▼             
┌───────────────────────────────────────────────┐
│     🔌 Middleware / API Routing               │
│        /api/bookmarks/export/ccbak            │
│        /api/bookmarks/import/ccbak            │
└───────────────────┬───────────────────────────┘
                    │                            
                    ▼                            
┌───────────────────────────────────────────────┐
│             🖥️ Backend / Database             │
│        Isolated SQLite Contexts (Tests)       │
│        JSZip Compression & Decryption         │
└───────────────────────────────────────────────┘

```

---

## 📋 Commit Ledger (Since `v3.3.1`)

* `208e601` — **chore(release):** bump version to 3.4.0
* `94600ac` — **chore(tests):** Implement dynamic test database isolation and increase timeouts (Phase 10)
* `ea41c43` — **docs:** formalize mobile api boundary and theme invariants
* `2df6dca` — **feat(settings):** add 96 and 'all' options to items per page
* `4e77c79` — **feat(backup):** implement full sovereign database export/import via .ccbak schema
* `a0d9044` — **fix(ui):** synchronize layout modes between header toggle and settings page
* `8a58ea5` — **feat(ui):** hook up appearance settings and remove masonry option

---

## ⚡ Deployment & Upgrade Instructions

### Using Local Dev Mode

Simply pull the latest release and run the developer startup script:

```bash
git pull origin main
npm install  
npm run scuttle:dev-start
```

### Using Containerized Environments (Self-Hosted / Production)

If you are running the service via container orchestration, pull the updated tag and rebuild:

```bash
docker compose pull
docker compose up -d --build
```

---

*The Code That Molts*

**Maintained by CrustAgent©™ under MIT license.**
