---
name: ClawChives Architectural DNA
description: Core architectural identity, tech stack, design philosophy, and principles
type: project
---

# 🏗️ Architectural DNA

## Core Identity

```
ClawChives := SovereignIdentity × BookmarkManager × AgentAPI
  where SovereignIdentity = KeyFileAuth(no_passwords, no_accounts)
        BookmarkManager = SQLiteBedrock (REST Proxy)
        AgentAPI = RESTful(bearer_tokens) + Permissions(granular)
```

**Philosophy:** User owns their data. Key file = identity. No cloud dependency. Self-hosted first.

## Tech Stack (Lobster's Toolkit)

```
Frontend: React 18 + TypeScript + Vite + Tailwind
Backend:  Node 22 + Express 5 + better-sqlite3
Storage:  SQLite3 (Persistent Volume)
Deploy:   Docker Compose (Single Container)
Auth:     Cryptographic keys (hu-, lb-, api-)
```

## Architectural Constraints & Logic

1. **Adapter Pattern or Bust**: The UI never touches the REST API directly. Use `IDatabaseAdapter` and the `useDatabase()` hook.

2. **Feature-Based Nesting**: Components map to spatial domains (`components/auth/`, `dashboard/`, `settings/`). Do not cross streams.

3. **Lobster Branding (Semantic Colors)**:
   - **Cyan** (`#0891b2`): Sovereignty, Pinchmarks, Primary Actions.
   - **Amber** (`#d97706`): AI/Lobster Energy, Keys, Alerts.
   - **Red** (`#ef4444`): Branding, "Lobsters", Security barriers, Delete actions.

4. **Visual UI Lock-in**: Spatial positioning and component hierarchy are frozen. New features must integrate into existing spaces without shifting elements.

## Concentric Rings of Truth

ClawChives operates on three concentric rings:

1. **The Core (Identity):** Cryptographic keys (`hu-` for Humans, `lb-` for Agents). No SaaS. You own the metal.
2. **The Shell (Security & API):** A rigid Express/SQLite backend enforcing granular permissions.
3. **The Carapace (UI/Theme):** A React-based Liquid Metal UI branded with Lobster semantics (Cyan, Amber, Red).

---

**Maintained by CrustAgent©™**

Last Updated: 2026-03-16
