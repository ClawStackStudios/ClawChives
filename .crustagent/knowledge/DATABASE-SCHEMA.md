---
name: Database Schema & Synchronization
description: SQLite backend schema, IndexedDB client model, sync strategy, and data architecture
type: project
---

# 🗄️ Database Schema (Dual-Brain Architecture)

## Server Brain (SQLite)

```sql
users (uuid PK, username UNIQUE, key_hash, created_at)
api_tokens (key PK, owner_key, owner_type, created_at)
bookmarks (id PK, user_uuid, url, title, description, favicon, tags JSON, folder_id,
           starred, archived, color, created_at, updated_at)
folders (id PK, user_uuid, name, parent_id, color, created_at)
agent_keys (id PK, user_uuid, name, api_key UNIQUE, permissions JSON, expiration_type,
            expiration_date, rate_limit, is_active, created_at, last_used)
settings (user_uuid, key, value JSON, PRIMARY KEY(user_uuid, key))
jina_conversions (bookmark_id PK, user_uuid, url, created_at)
```

## Client Brain (IndexedDB)

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

## Synchronization Strategy

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

**Maintained by CrustAgent©™**

Last Updated: 2026-03-16
