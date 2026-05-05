---
name: API Surface & Endpoints
description: Complete REST API endpoint documentation, middleware chain, and endpoint security
type: project
---

# 🛣️ API Surface (RESTful Claw Endpoints)

## Authentication

```
POST /api/auth/register  → Create user (uuid, username, keyHash)
POST /api/auth/token     → Issue api- token (human or lobster)
```

## Bookmarks

```
GET    /api/bookmarks              → List (filter: starred, archived, folderId, search)
POST   /api/bookmarks              → Create (url, title, description, tags, folder_id, jinaUrl)
GET    /api/bookmarks/:id          → Read single
PUT    /api/bookmarks/:id          → Update (url, title, description, tags, folder_id, jinaUrl)
DELETE /api/bookmarks/:id          → Delete
PATCH  /api/bookmarks/:id/star     → Toggle starred
PATCH  /api/bookmarks/:id/archive  → Toggle archived
```

## r.jina.ai Integration (Content Processing Proxy)

```
POST   /api/proxy/r.jina           → Process URL via r.jina.ai [human only]
GET    /api/proxy/r.jina/status    → Check r.jina proxy status
GET    /api/proxy/r.jina/test      → Test r.jina connectivity
POST   /api/proxy/r.jina/config    → Update user r.jina config [human only]
GET    /api/proxy/r.jina/config    → Get user r.jina config [human only]
DELETE /api/proxy/r.jina/cache     → Clear cached r.jina content [human only]
```

### r.jina.ai Overview:
- **Service:** Converts any webpage to clean markdown/JSON via `https://r.jina.ai/{url}`
- **Purpose:** Extract article text from bookmark URLs (human users only)
- **UI Integration:** Checkbox in BookmarkModal ("Convert to r.jina.ai")
- **Security:** Agent keys (lb-*) cannot see or use r.jina features
- **SSRF Protection:** Backend validates wrapped URL is not private IP (localhost, 127.0.0.1, 10.x, 172.16-31.x, 192.168.x, fe80::, fc::, 169.254.x)
- **Frontend:** keyType stored in sessionStorage, gated UI components by `userKeyType === 'human'`

## Folders

```
GET    /api/folders      → List all
POST   /api/folders      → Create (name, parent_id, color)
PUT    /api/folders/:id  → Update
DELETE /api/folders/:id  → Delete (cascades to children)
```

## Lobster Keys (Agent Management)

```
GET    /api/agent-keys       → List all [requireHuman]
POST   /api/agent-keys       → Create new lobster [requireHuman]
GET    /api/agent-keys/:id   → Read single [requireHuman]
PUT    /api/agent-keys/:id   → Update permissions [requireHuman]
DELETE /api/agent-keys/:id   → Revoke lobster [requireHuman]
```

## Settings

```
GET /api/settings/:key  → Get setting (appearance, profile)
PUT /api/settings/:key  → Update setting [requireHuman]
```

## Middleware Chain

```
Request → express.json() → helmet() → cors() → apiLimiter → requireAuth → requirePermission → route handler
```

---

**Maintained by CrustAgent©™**

Last Updated: 2026-03-16
