---
name: Pinchmark + Pin Folder System
description: Bookmark terminology, pin folder architecture, and required schema design
type: project
---

# 🦞 Pinchmark + Pin Folder System

## Terminology

**"Pinchmark"** is the lobster-themed term for a bookmark. The codebase uses `bookmark` in variable/function names; `pinchmark` is the product concept.

**Every pinchmark must:**
- Have a `user_uuid` field tied to its owner (server enforces `WHERE user_uuid = ?`)
- Have an `id` that is a UUID v4 generated client-side before `POST`

## Pin Folder System

A pinchmark can be **pinned** (`pinned: boolean` on the `Bookmark` type, default `false`).
Pinned pinchmarks live in a special **Pin Folder**.

### Pin Folder Rules

```
Pin Folder constraints:
  - System folder, identified by isPinFolder: true on the Folder record
  - Created automatically when the first pinchmark is pinned
  - Only one Pin Folder per user (enforced in both IDB and SQLite)
  - Cannot be manually renamed, recolored, or moved by the user
  - MUST auto-delete itself when it contains zero pinchmarks
  - Deleting the last pinchmark from it triggers folder deletion
  - Unpin = remove from Pin Folder + set pinned: false on the bookmark
```

### Required Schema Additions

When implementing pin system, add these fields:

**Frontend (IndexedDB):**
- `Bookmark`: add `pinned: boolean` field
- `Folder`: add `isPinFolder: boolean` field
- IDB `bookmarks` store: index on `"pinned"`
- IDB `folders` store: index on `"isPinFolder"`

**Backend (SQLite):**
- SQLite `bookmarks` table: `pinned INTEGER DEFAULT 0`
- SQLite `folders` table: `is_pin_folder INTEGER DEFAULT 0`

### Pin Folder Lifecycle

```
No pinned bookmarks → User pins first bookmark
                    ↓
            Pin Folder created (system folder, hidden from manual editing)
                    ↓
            User pins more bookmarks → all go to Pin Folder
                    ↓
            User unpins all bookmarks → Pin Folder auto-deletes
```

---

**Maintained by CrustAgent©™**

Last Updated: 2026-03-16
