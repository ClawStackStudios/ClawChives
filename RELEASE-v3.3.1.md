# 🦞 ClawChives — Release v3.3.1

## *The Molting of network gates and storage boundaries.*

```
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

Welcome to **v3.3.1** of **ClawChives**! This release focuses on **hardening the system's local network privacy boundaries, introducing a robust raw SQL-based database migrations workflow, and aligning the desktop application layout with our superior mobile dashboard**. We have streamlined the **main dashboard sidebar** for clean desktop navigation ergonomics, unlocked transaction-isolated version control for our **SQLite databases**, finalized network configuration bounds to block unauthorized **LAN and external exposures in development mode**, and fortified our **test boundaries** to ensure absolute project isolation.

---

## 💎 Key Themes & Highlights

### 🛠️ 1. Sidebar Layout & Desktop Ergonomics

We ported the highly successful, user-approved layout scheme from ClawChives Mobile back into the main desktop application to unify layout ergonomics across platforms.

* **Split-Column Navigation:** Restructured `Sidebar.tsx` to segment dashboard navigation. The core navigation elements and Folder/Pod lists are now encapsulated within a highly fluid, scrollable middle column (`flex-1 overflow-y-auto min-h-0`).
* **Fixed bottom utilities:** Settings, Database stats, and Logout actions are now permanently docked within a dedicated footer panel at the base of the sidebar (`p-3 border-t shrink-0`), ensuring utility buttons are always visible and within easy reach.
* **Compile-Safety:** Added missing `Settings`, `Database`, and `LogOut` icon properties to our React import map to secure compiler integrity.

### 🔌 2. Dynamic Vite 6 Host & Network Privacy

We addressed a critical security exposure where dev server environments would automatically bind to all network interfaces.

* **Context-Aware Bindings:** Vite `server.host` and `server.allowedHosts` are now dynamically evaluated based on the compilation `mode`.
* **Dev mode:** Enforces loopback-only binds (`host: false`, `allowedHosts: undefined`), ensuring that local development sessions remain strictly accessible on `localhost` (`127.0.0.1`) and completely hidden from local LAN IP addresses.
* **Prod/Preview mode:** Binds securely to all interfaces (`host: true`, `allowedHosts: true`) to support self-hosted instances, Docker containers, and secure Cloudflare tunnels.

### 💾 3. Transaction-Isolated Database Migrations

We designed and implemented a version-controlled database schema upgrade engine to replace risky, legacy ad-hoc schema creations.

* **Robust UP/DOWN SQL Scripting:** Introduced `migrations/0001_initial.up.sql` and `migrations/0001_initial.down.sql` to manage our unified production-grade table schemas transactionally.
* **Transaction-Wrapped Runner:** Embedded `MigrationRunner.ts` into our startup pipeline. Upgrades are evaluated sequentially inside isolated SQL Transactions (`BEGIN` / `COMMIT`) to prevent database corruption in the event of failure.
* **Backwards-Compatibility Shield:** Safely checks if the `users` table already exists in the target database. If detected, it automatically marks Version 1 as pre-applied, preserving all existing user pinchmarks, tags, and configurations with zero downtime.

### 🛡️ 4. Test Sandbox Isolation

We hardened our test execution gates to support multi-tenant workspace development environments without configuration cross-contamination.

* **Excluding Sandboxed Runtimes:** Patched the `test` settings in our Vite configuration to explicitly ignore directories matching `**/.crustagent/**`. This isolates our test runners and prevents Vitest from executing scripts of other sandboxed projects (like PinchPad) loaded in the workspace.

---

## 🏗️ Architectural Topology Map

```text
┌────────────────────────────────────────────────────────┐
│                   🌐 Client Layer                      │
│ ┌───────────────────────────┐ ┌──────────────────────┐ │
│ │ Scrollable Navigation &   │ │ Docked Base Utilities│ │
│ │ Folders Column (Sidebar)  │ │ (Settings/Stats/Out) │ │
│ └─────────────┬─────────────┘ └──────────┬───────────┘ │
└───────────────┼──────────────────────────┼─────────────┘
                │                          │             
                │ [Development Loopback]   │ [Production Tunnels]
                ▼                          ▼             
┌────────────────────────────────────────────────────────┐
│             🔌 Network Configuration Gate              │
│  [Vite 6 Server Host & AllowedHosts Runtime Evaluator] │
└───────────────────────────┬────────────────────────────┘
                            │                            
                            ▼                            
┌────────────────────────────────────────────────────────┐
│                 🖥️ Storage Engine Layer                 │
│ ┌───────────────────────────┐ ┌──────────────────────┐ │
│ │   MigrationRunner Engine  │ │  Segregated Audit    │ │
│ │  (SQLite Transactions)    │ │  Logging Database    │ │
│ └───────────────────────────┘ └──────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 📋 Commit Ledger (Since `v3.3.0`)

* `d289f4e` — **feat:** add vitest configuration and implement environment-aware host/allowedHosts settings
* `7f8d26d` — **refactor:** implement automated migration system and update vite configuration for environment-specific host settings.
* `f2ac328` — **feat:** restructure sidebar to include a pinned bottom utility bar for settings, database stats, and logout actions

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

*Keep Pinching!*

**Maintained by CrustAgent©™ under AGPL-3.0 license.**
