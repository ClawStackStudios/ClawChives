# 🏗️ System Blueprint: ClawChives

[![Blueprint](https://img.shields.io/badge/Architecture-Blueprint-blue?style=for-the-badge)](#)
[![Separation of Concerns](https://img.shields.io/badge/Pattern-Feature_Separation-purple?style=for-the-badge)](#)

> ASCII Construction Blueprint — the authoritative structural reference for ClawChives. This document covers architecture, patterns, constraints, and implementation details.

---

## 📖 Table of Contents

<details>
<summary>Expand to navigate sections</summary>

- [📂 Complete Directory Structure](#-complete-directory-structure)
- [📊 Data Flow & Architecture](#-data-flow--architecture)
- [🏗️ Architectural Tenets](#-architectural-tenets)
- [🔑 Key System Architecture](#-key-system-architecture)
- [🔐 Hard Constraints & Stability Locks](#-hard-constraints--stability-locks)
- [🎯 Component Patterns](#-component-patterns)
- [🔌 API Routes & Endpoints](#-api-routes--endpoints)
- [Cross-References](#cross-references)

</details>

---

## 📂 Complete Directory Structure

```text
ClawChives/
│
├── 📄 index.html                    # Vite HTML entry point
├── 📄 package.json                  # NPM dependencies & scripts
├── 📄 vite.config.ts                # Vite bundler config
├── 📄 tsconfig.json                 # TypeScript strict rules
├── 📄 .env.example                  # Environment variable reference
│
├── 🐳 Dockerfile                    # Frontend container (Vite dev/build)
├── 🐳 Dockerfile.api                # API server container (Express + SQLite)
├── 🐳 docker-compose.yml            # Orchestration stack (UI + API)
│
├── 🌐 server.ts                     # TypeScript entrypoint (Express REST API)
│
├── src/
│   ├── server/                      # ◀ Backend Source (Modular v3)
│   │   ├── database/                # connection, schema, migrations
│   │   ├── middleware/              # auth, rateLimiter, validate
│   │   ├── routes/                  # auth, folders, agentKeys, settings
│   │   │   └── bookmarks/           # Decomposed handlers (read, write, bulk, toggles)
│   │   ├── utils/                   # auditLogger, crypto, parsers, tokenExpiry
│   │   └── validation/              # Zod schemas
│   │
│   ├── features/                    # ◀ Feature-Sliced UI (Modular v3)
│   │   ├── auth/                    # LoginForm, SetupWizard, useAuth
│   │   ├── dashboard/               # Sidebar, BookmarkGrid, Layout
│   │   ├── settings/                # Profile, Appearance, AgentKeys, Imports
│   │   └── shared/                  # Common domain modules/hooks
│   │
│   ├── shared/                      # ◀ Global UI & Utilities
│   │   ├── ui/                      # shadcn/ui base primitives
│   │   ├── branding/                # Lobster logos, colors, icons
│   │   ├── theme/                   # Liquid Metal reveal logic
│   │   └── lib/                     # api client, crypto, utils
│   │
│   ├── 📄 main.tsx                  # React mount point
│   ├── 📄 App.tsx                   # Root view router
│   └── 📄 index.css                 # Global styles
```

---

## 📊 Data Flow & Architecture

### Request-Response Pipeline

```mermaid
graph LR
    subgraph UI ["UI Layer"]
        A[Components]
    end

    subgraph Logic ["Logic Layer"]
        B[useDatabaseAdapter hook]
        C[DatabaseProvider]
    end

    subgraph Adapters ["Adapter Layer"]
        E[RestAdapter]
    end

    subgraph Storage ["Storage Layer"]
        G["Express/SQLite server"]
    end

    A --> B
    B --> C
    C -->|SQLITE| E
    E -->|HTTP + Bearer| G
    G -->|better-sqlite3| H["db.sqlite"]
```

───

### Auth State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                        │
└─────────────────────────────────────────────────────────────┘

  SETUP (First Run)                 LOGIN (Returning User)
  ─────────────────                 ──────────────────────

  SetupWizard                        LoginForm
      ↓                                  ↓
  Generate hu- token             Upload hu- OR lb- token
      ↓                                  ↓
  Create identity_key.json         POST /api/auth/token
      ↓                                  ↓
  Persist in sessionStorage        Receive api- token (32 chars)
      ↓                                  ↓
  Mount DatabaseProvider        Mount DatabaseProvider
      ↓                                  ↓
  RestAdapter ready              RestAdapter: ALL requests
      ↓                           bearer Authorization: api-*
  Dashboard (authenticated)            ↓
                                 Dashboard (authenticated)
```

───

## 🏗️ Architectural Tenets

<details>
<summary>View Core Principles</summary>

1. **Separation of Concerns** — Components display. Hooks manage state. Services handle data. Adapters abstract storage.
2. **Feature First** — All directories inside `components/` are nested by feature area (auth, dashboard, settings). No flat generic component soup.
3. **No Monoliths** — Files are single-responsibility. A growing file is a signal to refactor.
4. **Adapter Pattern** — The `IDatabaseAdapter` interface decouples the UI from storage.
5. **Auth is Always Client-Side** — Identity key validation always occurs in the browser memory (`sessionStorage`) and `SetupWizard`. The server never holds the raw identity tokens.
6. **One-Field Login** — Users can login using only their `hu-` key. The server performs a secure lookup via the `UNIQUE` `key_hash` index.
7. **Explicit State** — Navigation state and auth state are persisted in `sessionStorage` using namespaced keys (`cc_authenticated`, `cc_view`).
8. **Sovereign Reading** — `r.jina.ai` integration allows human-only conversion of Pinchmarks to LLM-friendly markdown.
9. **Visual UI Lock-in** — The current interface layout is final. All future primitives, modals, and views must adhere to the established spatial hierarchy. No element moves; we only expand within the Shell.

</details>

---

## 🔑 Key System Architecture

### Key Types & Metadata

```mermaid
classDiagram
    class IdentityKey {
        +string username
        +string uuid
        +string token [hu-xxxxxxxx × 64]
    }
    class AgentKey {
        +string id
        +string name
        +string apiKey [lb-xxxxxxxx × 64]
        +Permissions permissions
        +string expirationType
        +boolean isActive
    }
    class ApiToken {
        +string key [api-xxxxxxxx × 32]
        +string ownerKey
        +string ownerType
        +string createdAt
    }

    IdentityKey --> ApiToken : can issue
    AgentKey --> ApiToken : can issue
```

───

### Key Types Reference

| Prefix | Type | Length | Usage |
|---|---|---|---|
| `hu-` | **Human Key** | 64 chars | Your personal identity. Supports **One-Field Login** (key-only). |
| `lb-` | **Lobster/Agent Key** | 64 chars | For your AI Lobsters and automated scripts. Generated in Settings with granular CUSTOM permissions. |
| `api-` | **Session Token** | 32 chars | Short-lived REST API bearer. Issued via `POST /api/auth/token`. |

───

### API Token Lifecycle

**Token Generation Rules:**
- Issued when: user/agent supplies valid `hu-` or `lb-` key to `/api/auth/token`
- Format: `api-` prefix + 32 random hex characters
- Storage: Plain-text in `api_tokens` table with `key_hash` (SHA-256) for lookups
- Validation: Server compares request bearer token to stored `key_hash` via index lookup
- Expiration: Default 24 hours from creation (configurable per environment)
- Revocation: Token becomes invalid immediately when owner key is revoked or disabled

**Token Usage in Requests:**
```
Authorization: Bearer api-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

All API endpoints (except `/api/health` and `/api/auth/token`) require valid bearer token.

───

### Entropy & Generation Rules

**hu- Token Generation** (SetupWizard):
- Source: `crypto.getRandomValues()` in browser (32 bytes entropy)
- Format: `hu-` prefix + hex-encoded 64 characters
- Hashing: SHA-256 → stored as `key_hash` in `users` table
- Storage: Client saves plaintext to `clawchives_identity_key.json` (user responsibility)

**lb- Token Generation** (Settings Agent Key Creator):
- Source: `crypto.getRandomValues()` in browser (32 bytes entropy)
- Format: `lb-` prefix + hex-encoded 64 characters
- Hashing: SHA-256 → stored in `agent_keys` table
- Permissions: Granular scope (read, write, delete per resource type)
- Expiry: Optional auto-expire setting (never, 30d, 90d, 1y)

**api- Token Generation** (Server `/api/auth/token`):
- Source: `crypto.getRandomBytes()` on server (16 bytes entropy = 32 hex chars)
- Format: `api-` prefix + 32 random hex characters
- Hashing: SHA-256 → stored in `api_tokens` table for index lookup
- Lifetime: 24 hours (hardcoded, can be extended per config)

───

## 🔐 Hard Constraints & Stability Locks

### Session State Invariants

```
✓ LOCKED: cc_authenticated (sessionStorage)
  - Immutable after initial setup
  - Boolean flag: user is authenticated (true) or not (false)
  - Cleared ONLY on explicit logout

✓ LOCKED: cc_view (sessionStorage)
  - Tracks current navigation context (dashboard, settings, etc.)
  - Modified only by explicit route changes
  - Never cleared mid-session

✓ LOCKED: User UUID Attachment
  - Every database row includes user_uuid foreign key
  - Prevents data leakage between user contexts
  - Query filters ALWAYS include WHERE user_uuid = :uuid
```

───

### Adapter Pattern Immutability

```
📌 IDatabaseAdapter Interface (CANNOT CHANGE)

interface IDatabaseAdapter {
  // Auth operations
  register(userData: UserData): Promise<User>
  validateToken(token: string): Promise<User | null>
  issueToken(credentials: TokenRequest): Promise<ApiToken>

  // Bookmarks CRUD
  getBookmarks(filters?: FilterOptions): Promise<Bookmark[]>
  createBookmark(data: BookmarkData): Promise<Bookmark>
  updateBookmark(id: string, data: Partial<BookmarkData>): Promise<Bookmark>
  deleteBookmark(id: string): Promise<void>

  // Folders CRUD
  getFolders(): Promise<Folder[]>
  createFolder(data: FolderData): Promise<Folder>
  updateFolder(id: string, data: Partial<FolderData>): Promise<Folder>
  deleteFolder(id: string): Promise<void>

  // Agent Keys CRUD
  getAgentKeys(): Promise<AgentKey[]>
  createAgentKey(data: AgentKeyData): Promise<AgentKey>
  revokeAgentKey(id: string): Promise<void>

  // Settings
  getSetting(key: string): Promise<SettingValue>
  setSetting(key: string, value: any): Promise<void>
}

⚡ Why Immutable:
   - React context and hooks depend on this contract
   - Multiple implementations possible (RestAdapter, MockAdapter, etc.)
   - New storage backends MUST implement this interface
   - Breaking changes = entire app breaks
```

───

### Key System Entropy Requirements

```
✓ hu- tokens MUST use browser crypto.getRandomValues()
  └─ Min 32 bytes entropy (256 bits)
  └─ Hex-encoded output (64 visible chars)

✓ lb- tokens MUST use browser crypto.getRandomValues()
  └─ Min 32 bytes entropy (256 bits)
  └─ Hex-encoded output (64 visible chars)

✓ api- tokens MUST use server crypto.getRandomBytes()
  └─ Min 16 bytes entropy (128 bits)
  └─ Hex-encoded output (32 visible chars)

✓ All tokens MUST be hashed with SHA-256 before storage
  └─ Plain-text never persisted
  └─ Comparison always via hash

✓ Token file downloads (identity_key.json)
  └─ Browser-only, never server-side downloads
  └─ User responsible for secure backup
```

───

### User Isolation Rules

```
📌 CRITICAL: Every row in every table includes user_uuid

user_uuid attachment guarantees:
  ✓ Users cannot see other users' bookmarks
  ✓ Users cannot modify other users' folders
  ✓ Agents can only access bookmarks scoped to creator
  ✓ Settings are per-user (theme, layout, etc.)

Query Pattern (LOCKED):
  SELECT * FROM bookmarks
  WHERE user_uuid = :uuid AND [other filters]

  ⛔ FORBIDDEN:
  SELECT * FROM bookmarks
  (missing user_uuid filter = SQL bug)
```

───

## 🎯 Component Patterns

### Feature-Based Nesting Rules

All components reside in `src/components/` organized by **feature area**, not by component type.

```
✓ CORRECT (Feature-First):
  components/
  ├── auth/           # All auth-related components
  │   ├── LoginForm.tsx
  │   ├── SetupWizard.tsx
  │   └── index.ts
  ├── dashboard/      # All dashboard components
  │   ├── Dashboard.tsx
  │   ├── BookmarkGrid.tsx
  │   ├── BookmarkModal.tsx
  │   ├── Sidebar.tsx
  │   └── index.ts

✗ WRONG (Type-Based Monolith):
  components/
  ├── forms/
  │   ├── LoginForm.tsx
  │   ├── BookmarkForm.tsx
  │   └── SettingsForm.tsx
  ├── modals/
  │   ├── BookmarkModal.tsx
  │   └── SettingsModal.tsx
  └── grids/
      └── BookmarkGrid.tsx
```

**Why This Matters:**
- Feature discovery: "I need to modify auth" → go to `components/auth/`
- Reduced merge conflicts: Team members work in separate feature directories
- Scalability: New features are new directories, not scattered files

───

### Modal Architecture Pattern

All modals follow a consistent pattern:

```typescript
// Pattern: [Feature]Modal.tsx
// Location: components/[feature]/[Feature]Modal.tsx

interface [Feature]ModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: [FeatureData]) => Promise<void>
  initialData?: Partial<[FeatureData]>
}

export function [Feature]Modal({
  isOpen,
  onClose,
  onSave,
  initialData
}: [Feature]ModalProps) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave?.(data)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          {/* Modal form fields */}
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Key Rules:**
- Modals are ALWAYS controlled components (open state managed by parent)
- onClose handler ALWAYS fired when user dismisses
- onSave handler ALWAYS async and error-aware
- initialData for edit operations (undefined for create)

───

### State Management Patterns

**Session State (Browser Memory):**
```typescript
// sessionStorage keys MUST be prefixed with 'cc_'
sessionStorage.setItem('cc_authenticated', JSON.stringify(true))
sessionStorage.setItem('cc_view', 'dashboard')
```

**Context State (React):**
```typescript
// DatabaseProvider wraps entire app
// useDatabase() hook accesses IDatabaseAdapter
const db = useDatabase()
const bookmarks = await db.getBookmarks()
```

**Component State (useState):**
```typescript
// Local component state for UI-only values
const [isModalOpen, setIsModalOpen] = useState(false)
const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
```

**Fetched Data (Service Layer):**
```typescript
// Services interact with DatabaseAdapter
// Components call services, never call adapter directly
const bookmarks = await BookmarkService.getAll()
```

───

### React Context & Hook Patterns

**Context Creation Pattern:**
```typescript
// services/database/DatabaseProvider.tsx

interface DatabaseContextType {
  adapter: IDatabaseAdapter
}

const DatabaseContext = createContext<DatabaseContextType | null>(null)

export function DatabaseProvider({ children }) {
  const adapter = new RestAdapter()
  return (
    <DatabaseContext.Provider value={{ adapter }}>
      {children}
    </DatabaseContext.Provider>
  )
}

// Hook Pattern
export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (!context) throw new Error('useDatabase outside DatabaseProvider')
  return context.adapter
}
```

**Hook Usage Pattern:**
```typescript
function BookmarkGrid() {
  const db = useDatabase()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    db.getBookmarks().then(setBookmarks)
  }, [db])

  return <div>{/* render bookmarks */}</div>
}
```

───

## 🔌 API Routes & Endpoints

All endpoints live in `src/server/routes/`.

### Health & Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | ✗ Public | Health check + record counts |
| `POST` | `/api/auth/register` | ✗ Public | Register a new identity (hu- token + metadata) |
| `POST` | `/api/auth/token` | ✗ Public | Issue `api-` token from `hu-` or `lb-` key |
| `GET` | `/api/auth/validate` | ✓ Bearer | Validate current Bearer token |

───

### Bookmarks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/bookmarks` | ✓ Bearer | List all pinchmarks (filterable by folder, starred, archived) |
| `POST` | `/api/bookmarks` | ✓ Bearer | Create pinchmark |
| `GET` | `/api/bookmarks/:id` | ✓ Bearer | Get single pinchmark |
| `PUT` | `/api/bookmarks/:id` | ✓ Bearer | Update pinchmark (title, URL, folder, notes) |
| `DELETE` | `/api/bookmarks/:id` | ✓ Bearer | Delete pinchmark |
| `PATCH` | `/api/bookmarks/:id/star` | ✓ Bearer | Toggle star |
| `PATCH` | `/api/bookmarks/:id/archive` | ✓ Bearer | Toggle archive |

───

### Folders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/folders` | ✓ Bearer | List all folders |
| `POST` | `/api/folders` | ✓ Bearer | Create folder |
| `PUT` | `/api/folders/:id` | ✓ Bearer | Update folder (name, color, icon) |
| `DELETE` | `/api/folders/:id` | ✓ Bearer | Delete folder (moves contents to root) |

───

### Agent Keys

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/agent-keys` | ✓ Bearer | List agent Lobster keys |
| `POST` | `/api/agent-keys` | ✓ Bearer | Create agent Lobster key (name, permissions, expiry) |
| `PATCH` | `/api/agent-keys/:id/revoke` | ✓ Bearer | Revoke agent key (immediate, cannot reactivate) |
| `DELETE` | `/api/agent-keys/:id` | ✓ Bearer | Delete agent key (remove from database) |

───

### Settings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/settings/:key` | ✓ Bearer | Get setting (theme, itemsPerPage, displayName, etc.) |
| `PUT` | `/api/settings/:key` | ✓ Bearer | Update setting |

───

## Cross-References

**For contribution rules & development workflow:**
→ See [CONTRIBUTING.md](./CONTRIBUTING.md)

**For security model, vulnerability reporting, and ClawKeys©™ protocol:**
→ See [SECURITY.md](./SECURITY.md)

**For ClawStack©™ standards alignment and code patterns:**
→ See [CRUSTSECURITY.md](./CRUSTSECURITY.md)

**For project roadmap and future development:**
→ See [ROADMAP.md](./ROADMAP.md)

**For quick-start instructions and environment setup:**
→ See [README.md](./README.md)

---

<div align="center">

```
    Built with 🦞 by ClawStack Studios©™
    Maintained by CrustAgent©™
```

</div>
