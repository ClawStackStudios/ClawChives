---
name: Frontend File Map & Directory Structure
description: Complete src/ directory organization, file responsibilities, and component hierarchy
type: project
---

# 📁 Frontend File Map & Directory Structure

## Directory Organization

```
src/
├── App.tsx                        # Root: auth state machine, view routing, session restore
├── main.tsx                       # Vite entry point
│
├── lib/
│   ├── crypto.ts                  # Key generation, SHA-256, constant-time compare, identity file
│   ├── crypto.test.ts             # Unit tests for crypto primitives
│   ├── api.ts                     # Low-level fetch helpers
│   ├── exportImport.ts            # Bookmark import/export logic
│   └── utils.ts                   # General utilities
│
├── hooks/
│   └── useAuth.ts                 # Auth context provider and hook
│
├── types/
│   ├── index.ts                   # Re-exports from services/types
│   └── agent.ts                   # AgentKey, AgentPermission, PermissionLevel, PERMISSION_CONFIGS
│
├── components/
│   ├── theme-provider.tsx         # Theme context: light/dark/auto + clip-path transitions
│   ├── landing/LandingPage.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx          # Identity file upload → token exchange → session
│   │   └── SetupWizard.tsx        # Key generation → register → token → session
│   ├── dashboard/
│   │   ├── Dashboard.tsx          # Shell: loads bookmarks + folders
│   │   ├── BookmarkCard.tsx       # Single card; r.jina.ai menu gated to humans
│   │   ├── BookmarkModal.tsx      # Create/edit; jinaUrl checkbox gated to humans
│   │   ├── Sidebar.tsx            # Folder tree + filter nav
│   │   ├── FolderModal.tsx        # Create folder
│   │   └── ...                    # BookmarkGrid, SearchBar, TagsView, etc.
│   └── settings/
│       ├── AgentPermissions.tsx   # List + revoke lobster keys
│       ├── AgentKeyGeneratorModal.tsx  # Create lobster key; shows lb- key ONCE
│       ├── AppearanceSettings.tsx # Theme + layout settings
│       ├── ImportExportSettings.tsx   # JSON/CSV/HTML export with safe escaping
│       └── ...                    # ProfileSettings, DatabaseReset, etc.
│
└── services/
    ├── database/
    │   ├── rest/RestAdapter.ts    # SOLE HTTP client — stability lock (see below)
    │   ├── schema.ts              # IndexedDB schema (all stores + indices)
    │   ├── connection.ts          # IDB open/upgrade
    │   ├── adapter.ts             # IDatabaseAdapter interface
    │   └── DatabaseProvider.tsx   # React context that provides the adapter
    ├── agents/
    │   ├── agentKeyService.ts     # Lobster key CRUD — stability lock (see below)
    │   └── agentPermissions.ts    # Client-side permission helpers
    ├── auth/
    │   ├── setupService.ts        # New-user account creation (IDB)
    │   └── loginService.ts        # Auth helpers
    ├── bookmarks/
    │   ├── bookmarkService.ts     # IDB CRUD for bookmarks
    │   ├── bookmarkSearch.ts      # Search + filter logic
    │   └── bookmarkTags.ts        # Tag management
    ├── folders/
    │   ├── folderService.ts       # IDB CRUD for folders
    │   └── folderHierarchy.ts     # Nested folder helpers
    ├── settings/
    │   ├── appearanceService.ts   # Theme/layout read+write (IDB)
    │   └── profileService.ts      # Profile read+write (IDB)
    ├── types/index.ts             # Bookmark, Folder, User, AppearanceSettings, ProfileSettings, AgentKey
    └── utils/
        ├── constants.ts           # STORES enum — always import store names from here
        ├── database.ts            # executeTransaction() — always use for IDB ops
        └── errors.ts              # ApiError class — use for all HTTP errors
```

---

**Maintained by CrustAgent©™**

Last Updated: 2026-03-16
