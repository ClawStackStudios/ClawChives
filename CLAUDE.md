# 🦞 CLAUDE.md — ClawChives Project Brain

> **Lobsterized knowledge base for AI agents working on ClawChives**
>
> Semantic compression: Maximum signal, minimal noise. Update this as the project evolves.

---

## 🏗️ Architectural DNA

### Core Identity
```
ClawChives := SovereignIdentity × BookmarkManager × AgentAPI
  where SovereignIdentity = KeyFileAuth(no_passwords, no_accounts)
        BookmarkManager = LocalFirst(IndexedDB) + ServerSync(SQLite)
        AgentAPI = RESTful(bearer_tokens) + Permissions(granular)
```

**Philosophy:** User owns their data. Key file = identity. No cloud dependency. Self-hosted first.

### Tech Stack (Lobster's Toolkit)
```
Frontend: React 18 + TypeScript + Vite + Tailwind
Backend:  Node 20 + Express 5 + better-sqlite3
Storage:  IndexedDB (client) + SQLite3 (server)
Deploy:   Docker Compose (UI + API containers)
Auth:     Cryptographic keys (hu-, lb-, api-)
```

---

## 🔐 Authentication System (The Claw Grip)

### Key Hierarchy
```
┌─────────────────────────────────────────────────────────┐
│  hu-[64chars]     Human Identity (root credential)     │
│        ↓                                                 │
│  SHA-256(hu-)     Hashed for server verification        │
│        ↓                                                 │
│  api-[32chars]    Session token (short-lived)           │
│                                                          │
│  lb-[64chars]     Lobster Agent Key (delegated access)  │
│        ↓                                                 │
│  api-[32chars]    Agent session token                   │
└─────────────────────────────────────────────────────────┘
```

### Auth Flow Semantics
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

### Security Invariants
- ✅ `hu-` keys **NEVER** sent to server (only SHA-256 hash)
- ✅ `api-` tokens in sessionStorage (cleared on tab close)
- ✅ `lb-` keys stored server-side (plaintext with planned encryption-at-rest)
- ✅ Constant-time comparison for keyHash verification (timing attack prevention)
- ✅ User isolation via `user_uuid` in ALL queries

---

## 🦞 Lobster Key System (lb- keys)

### Lobster := Agent with Claws (Permissions)

```typescript
interface LobsterKey {
  id: uuid
  user_uuid: uuid                    // Owner
  name: string                       // "GitHub Sync Lobster"
  api_key: string                    // lb-[64chars]
  permissions: {
    level: "READ" | "WRITE" | "EDIT" | "MOVE" | "DELETE" | "FULL"
    canRead: boolean
    canWrite: boolean
    canEdit: boolean
    canMove: boolean
    canDelete: boolean
  }
  expiration_type: "never" | "date" | "duration"
  expiration_date?: ISO8601
  rate_limit?: number                // Requests per minute
  is_active: boolean
  last_used?: ISO8601
}
```

### Permission Enforcement (Server-Side)
```
HTTP Method → Permission Mapping:
  GET     → READ
  POST    → WRITE
  PUT     → EDIT
  PATCH   → EDIT
  DELETE  → DELETE

Route Guards:
  requireAuth()         → Validates token exists
  requireHuman()        → Rejects lb- keys (config routes only)
  requirePermission(p)  → Checks agentPermissions[p] === true
```

### Lobster Lifecycle
```
Created → Active → Used → [Expired | Revoked] → Inactive
          ↓
          rate_limit enforced (planned: security-audit-implementation/02)
          permissions enforced (planned: security-audit-implementation/08)
```

---

## 🗄️ Database Schema (Dual-Brain Architecture)

### Client Brain (IndexedDB)
```typescript
ObjectStores = {
  BOOKMARKS:           { keyPath: "id", indices: ["url", "folderId", "starred", "tags"] }
  FOLDERS:             { keyPath: "id", indices: ["parentId"] }
  TAGS:                { keyPath: "id", indices: ["name:unique"] }
  AGENT_KEYS:          { keyPath: "id", indices: ["apiKey:unique", "isActive"] }
  APPEARANCE_SETTINGS: { keyPath: "id" }
  PROFILE_SETTINGS:    { keyPath: "id" }
  USER:                { keyPath: "uuid" }
}
```

### Server Brain (SQLite)
```sql
users (uuid PK, username UNIQUE, key_hash, created_at)
api_tokens (key PK, owner_key, owner_type, created_at)
bookmarks (id PK, user_uuid, url, title, description, favicon, tags JSON, folder_id, starred, archived, color, created_at, updated_at)
  UNIQUE(user_uuid, url)  -- No duplicate URLs per user
folders (id PK, user_uuid, name, parent_id, color, created_at)
agent_keys (id PK, user_uuid, name, api_key UNIQUE, permissions JSON, expiration_type, expiration_date, rate_limit, is_active, created_at, last_used)
settings (user_uuid, key, value JSON, PRIMARY KEY(user_uuid, key))
```

### Synchronization Strategy
```
Client-First:
  - User actions write to IndexedDB immediately (optimistic UI)
  - REST API call syncs to server
  - On success: mark synced
  - On failure: keep in IndexedDB, retry later (planned: offline queue)

Server-First (planned):
  - Server mutation triggers WebSocket event
  - Client receives event, updates IndexedDB
  - Multi-device sync via server as source of truth
```

---

## 🎨 Theme System (Dark Mode + Lobster Aesthetic)

### Color Palette
```css
/* Lobster Red Accent */
--lobster-red: #FF3B30
--lobster-red-hover: #FF5E54

/* Dark Mode (Current) */
--background: 220 13% 9%        /* Deep ocean */
--foreground: 0 0% 98%          /* Shell white */
--card: 220 13% 11%
--card-foreground: 0 0% 98%
--primary: 199 89% 48%          /* Cyan claw */
--primary-foreground: 0 0% 98%
--accent: 199 89% 48%

/* Light Mode (Planned) */
--background-light: 0 0% 100%
--foreground-light: 220 13% 9%
```

### UI Patterns
```
Shadcn/ui components + Tailwind utilities
Radix UI primitives for accessibility
Lucide icons (consistent icon language)
```

### Lobster Iconography
```
🦞 → Agent Keys, Permissions (the lobster)
🪝 → Hooks, Integrations
🗂️ → Folders (claws organize)
⭐ → Starred bookmarks
📦 → Archives
🎨 → Theme settings
```

---

## 🔒 Security Posture (Current + Planned)

### ✅ Current Strengths
```
[IMPLEMENTED]
- Parameterized SQL queries (100% coverage, zero injection vectors)
- User isolation via user_uuid filtering
- Constant-time token comparison
- Key hashing (SHA-256 client-side)
- CORS configuration (via CORS_ORIGIN env var)
- WAL journal mode + foreign keys
- Session-only token storage

[DOCUMENTED]
- Security policy (SECURITY.md)
- Key file warnings
- Self-hosted hardening checklist
```

### ⚠️ Known Gaps (Being Addressed)
```
[security-audit-implementation/ IN PROGRESS]
- Missing: Helmet.js security headers        → Component 01
- Missing: Rate limiting enforcement         → Component 02
- Weak: CORS defaults to allow-all          → Component 03
- Missing: Input validation (Zod schemas)    → Component 04
- Leaky: Error messages expose DB details    → Component 05
- Missing: Audit logging                     → Component 06
- Missing: Token expiration (30/60/90/custom)→ Component 07
- Unenforced: Server-side permissions        → Component 08
- Missing: HTTPS redirect middleware         → Component 09
- Missing: Database migrations               → Component 10
```

### 🎯 Target Security Level
```
OWASP Top 10 (2021) Coverage:
  ✅ A03 Injection           → Parameterized queries
  🔄 A01 Access Control      → Permission enforcement (component 08)
  🔄 A02 Crypto Failures     → Token expiry + HTTPS (components 07, 09)
  🔄 A04 Insecure Design     → Rate limiting (component 02)
  🔄 A05 Misconfiguration    → Helmet + CORS (components 01, 03)
  ✅ A06 Vulnerable Components → Dependency updates (Dependabot)
  🔄 A07 Auth Failures       → Rate limiting + audit logs (02, 06)
  ❌ A08 Integrity Failures  → (Not applicable: no file uploads)
  🔄 A09 Logging Failures    → Audit logging (component 06)
  ❌ A10 SSRF                → (Not applicable: no URL fetching)
```

---

## 🛣️ API Surface (RESTful Claw Endpoints)

### Authentication
```
POST /api/auth/register  → Create user (uuid, username, keyHash)
POST /api/auth/token     → Issue api- token (human or lobster)
```

### Bookmarks
```
GET    /api/bookmarks              → List (filter: starred, archived, folderId, search)
POST   /api/bookmarks              → Create (url, title, description, tags, folder_id)
GET    /api/bookmarks/:id          → Read single
PUT    /api/bookmarks/:id          → Update
DELETE /api/bookmarks/:id          → Delete
PATCH  /api/bookmarks/:id/star     → Toggle starred
PATCH  /api/bookmarks/:id/archive  → Toggle archived
```

### Folders
```
GET    /api/folders      → List all
POST   /api/folders      → Create (name, parent_id, color)
PUT    /api/folders/:id  → Update
DELETE /api/folders/:id  → Delete (cascades to children)
```

### Lobster Keys (Agent Management)
```
GET    /api/agent-keys       → List all [requireHuman]
POST   /api/agent-keys       → Create new lobster [requireHuman]
GET    /api/agent-keys/:id   → Read single [requireHuman]
PUT    /api/agent-keys/:id   → Update permissions [requireHuman]
DELETE /api/agent-keys/:id   → Revoke lobster [requireHuman]
```

### Settings
```
GET /api/settings/:key  → Get setting (appearance, profile)
PUT /api/settings/:key  → Update setting [requireHuman]
```

### Middleware Chain
```
Request → express.json() → helmet() → cors() → apiLimiter → requireAuth → requirePermission → route handler
```

---

## 📁 File Structure (Separation of Concerns by Feature)

```
ClawChives/
├── server.js                        # Express API (SQLite backend)
├── vite.config.ts                   # Frontend build config
├── docker-compose.yml               # Deployment orchestration
├── Dockerfile / Dockerfile.api      # Container definitions
│
├── src/
│   ├── App.tsx                      # Root component
│   ├── lib/
│   │   └── crypto.ts                # SHA-256, key generation, constant-time compare
│   ├── components/                  # UI components (feature-organized)
│   │   ├── auth/                    # SetupWizard, LoginForm
│   │   ├── dashboard/               # Dashboard, BookmarkModal, BookmarkCard
│   │   ├── settings/                # Settings, AgentKeyManager, ImportExportSettings
│   │   └── ui/                      # Shadcn components (button, input, dropdown)
│   ├── services/                    # Business logic (feature-organized)
│   │   ├── agents/                  # agentKeyService, agentPermissions
│   │   ├── auth/                    # setupService, loginService
│   │   ├── bookmarks/               # bookmarkService, bookmarkQueries
│   │   ├── database/                # schema, connection, adapter, rest/RestAdapter
│   │   ├── folders/                 # folderService, folderQueries
│   │   ├── settings/                # settingsService
│   │   ├── users/                   # userService, userQueries
│   │   ├── types/                   # TypeScript interfaces
│   │   └── utils/                   # constants, database helpers, errors
│   └── hooks/                       # React hooks
│       └── useAuth.ts               # Auth context provider
│
├── security-audit-implementation/   # 🔒 Security hardening skill files
│   ├── SKILL.md                     # Master implementation guide
│   └── 01-10/                       # 10 security components (README + code)
│
└── docs/
    ├── SECURITY.md                  # Security policy
    ├── ROADMAP.md                   # Feature roadmap
    └── BLUEPRINT.md                 # (Planned) ASCII architecture diagrams
```

---

## 🚀 Development Workflow

### Local Dev
```bash
# Terminal 1: API server
npm run start:api  # node server.js on port 4242

# Terminal 2: Vite dev server
npm run dev        # localhost:5173 with HMR

# Combined (concurrently)
npm start          # Both servers in one terminal
```

### Docker Dev
```bash
docker-compose up --build
# UI:  http://localhost:8080
# API: http://localhost:4242
```

### Production Build
```bash
npm run build                   # Vite → dist/
docker-compose -f docker-compose.yml up -d
```

---

## 🐛 Common Pitfalls & Gotchas

### 1. CORS Hell
```
Problem: Frontend can't reach API
Solution: Set CORS_ORIGIN in docker-compose.yml
  environment:
    - CORS_ORIGIN=http://localhost:5173,http://localhost:8080
```

### 2. IndexedDB Version Conflicts
```
Problem: "VersionError: Database version conflict"
Solution: Close all browser tabs with ClawChives open, clear IndexedDB in dev tools
```

### 3. Agent Key Not Found
```
Problem: lb- key works in Postman but not in app
Solution: Check is_active=1 and expiration_date hasn't passed
```

### 4. SessionStorage Lost on Refresh
```
Problem: User logged out after F5
Current: Expected behavior (sessionStorage clears on navigation)
Planned: Persist api- token with expiry, or use refresh tokens
```

### 5. Docker Volume Permissions
```
Problem: SQLite file not writable in container
Solution: chown -R node:node /app/data in Dockerfile
```

---

## 🎯 Current Phase & Next Steps

### ✅ Phase 1 Complete: Foundation
- Multi-user auth system (hu-, lb-, api- keys)
- CRUD operations (bookmarks, folders)
- Agent key management UI
- Dark mode theme
- Docker deployment

### 🔄 Phase 2 In Progress: Security Hardening
```
[security-audit-implementation/]
├── Planning: Complete (skill files created)
├── Review: In progress (audit by other agents)
└── Implementation: Pending (start with components 01-04)
```

### 🎯 Phase 2 Priorities (Next 2 Weeks)
1. **Helmet.js** (01) - Add security headers
2. **Rate Limiting** (02) - Prevent brute-force
3. **CORS Hardening** (03) - Deny-by-default
4. **Input Validation** (04) - Zod schemas

### 📍 Phase 3 Planned: Polish & PWA
- Offline-first (service workers)
- Sync conflict resolution
- Bulk operations (select multiple bookmarks)
- Keyboard shortcuts
- Search improvements (fuzzy, full-text)
- Import/export (HTML, JSON, CSV)

---

## 🧠 Semantic Compression (Agent Memory Optimization)

### Key Patterns to Remember
```
AuthPattern := KeyFile → Hash → Token → Session
LobsterPattern := Create → Assign(Permissions) → Use → Revoke
DataPattern := Client(IndexedDB) ⇄ Server(SQLite)
SecurityPattern := Defense_in_Depth(Headers + RateLimit + Validation + Audit + Permissions)
ThemePattern := Lobster(Red) + Ocean(Dark) + Shell(Light)
```

### Critical Files (Change These = High Impact)
```
server.js              → All backend logic (560 lines, monolithic)
src/lib/crypto.ts      → Core auth primitives (SHA-256, constant-time)
src/services/database/rest/RestAdapter.ts → API client wrapper
SECURITY.md            → Security policy (update with each hardening)
docker-compose.yml     → Deployment config (env vars, volumes)
```

### Invariants (NEVER BREAK THESE)
```
1. user_uuid filtering in ALL queries (no cross-user data leakage)
2. Parameterized SQL (no string concatenation in queries)
3. hu- keys never sent plaintext to server
4. Constant-time comparison for auth tokens
5. sessionStorage for api- tokens (never localStorage)
```

---

## 🔄 Deployment Configurations

### LAN Deployment (Default)
```yaml
environment:
  NODE_ENV: production
  CORS_ORIGIN: http://192.168.1.100:8080
  ENFORCE_HTTPS: false
  TOKEN_TTL_DEFAULT: 30
```

### Public Self-Hosted (Reverse Proxy)
```yaml
environment:
  NODE_ENV: production
  CORS_ORIGIN: https://bookmarks.yourdomain.com
  ENFORCE_HTTPS: true
  TRUST_PROXY: true
  TOKEN_TTL_DEFAULT: 30
```

### Dev (Local)
```yaml
environment:
  NODE_ENV: development
  CORS_ORIGIN: http://localhost:5173
  ENFORCE_HTTPS: false
```

---

## 📚 External Dependencies (Lobster's Pantry)

### Runtime
```json
{
  "express": "5.2.1",           // API framework
  "better-sqlite3": "12.6.2",    // SQLite driver
  "cors": "2.8.6",               // CORS middleware
  "react": "18.2.0",             // UI framework
  "lucide-react": "0.344.0",     // Icons
  "tailwindcss": "3.4.4"         // CSS utility classes
}
```

### Dev Tools
```json
{
  "vite": "5.2.0",               // Build tool + dev server
  "typescript": "5.2.2",         // Type safety
  "concurrently": "9.2.1"        // Run API + UI together
}
```

### Planned Additions (Security Hardening)
```json
{
  "helmet": "^8.0.0",            // Security headers
  "express-rate-limit": "^7.0.0", // Rate limiting
  "zod": "^3.23.0"               // Input validation
}
```

---

## 🦞 Lobsterization Guide (Terminology)

```
Agent → Lobster
Agent Key → Lobster Key (lb- prefix)
Agent API → Lobster API
Agent Permissions → Lobster Claws / Claw Permissions
Permission Level → Claw Strength
Full Access → Full Claws 🦞💪
Rate Limit → Claw Speed Limit
Revoke → Declawed / Lobster Retired
```

**Why Lobsters?**
- Lobsters have claws (permissions)
- Lobsters are resilient (self-hosted, offline-first)
- Lobsters molt (version upgrades)
- Lobsters are cool 🦞

---

## 🔮 Future Vision (Roadmap Glimpse)

### Near-Term (Q2 2026)
- ✅ Security hardening (10 components)
- 🔄 PWA support (service workers)
- 🔄 Multi-device sync (WebSockets)
- 🔄 Bulk operations

### Mid-Term (Q3-Q4 2026)
- Browser extension (capture bookmarks)
- Mobile app (React Native or Tauri)
- AI-powered tagging (local LLM)
- Federated sync (ActivityPub?)

### Long-Term (2027+)
- ClawChives marketplace (community themes, plugins)
- Lobster swarm (multi-agent coordination)
- Blockchain identity (sovereign identity on-chain?)

---

## 🧪 Testing Strategy

### Current State
```
Manual testing: ✅ Heavy use during dev
Unit tests: ❌ None yet
Integration tests: ❌ None yet
E2E tests: ❌ None yet
```

### Planned (Post-Security Hardening)
```
tests/
├── security/          # Rate limiting, validation, permissions
├── unit/              # Service layer functions
├── integration/       # API endpoint tests (supertest)
└── e2e/               # Playwright (user flows)
```

---

## 🆘 Emergency Contacts

```
Primary Maintainer: Lucas
AI Co-Pilot: Claude Sonnet 4.5
Repository: (TBD - GitHub?)
Issues: (TBD - GitHub Issues?)
Docs: SECURITY.md, ROADMAP.md, this file
```

---

## 📝 Update Log (This File)

```
2026-03-05: Initial CLAUDE.md creation
            - Semantic compression of project knowledge
            - Auth system documented
            - Security posture mapped
            - Lobsterization terminology established
            - Ready for agent handoffs
```

---

## 🔚 Final Notes

**This file is alive.** Update it as the project evolves. When you (future agent) read this, ClawChives may have evolved beyond this snapshot. Check the git log, read recent commits, and UPDATE THIS FILE.

**Lobster Wisdom:** "A lobster never looks back at its old shell." Keep molting, keep improving.

🦞 **Stay Clawed, Stay Sovereign** 🦞
