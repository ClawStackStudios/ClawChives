# CrustAudit: Relational Jina Refactor Plan 🦞

**Status:** AUDITED ✅ (Updated)
**Objective:** Decouple Jina enhancement data from the core bookmark schema.

## 🏗️ Structural Refactor

Instead of a flat `jina_url` column, we move to a relational model. This prioritizes agent-ready content and cleans the core Carapace.

### 1. New Reef Table: `jina_conversions`
```sql
CREATE TABLE IF NOT EXISTS jina_conversions (
  bookmark_id TEXT PRIMARY KEY,
  user_uuid   TEXT NOT NULL,
  url         TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  FOREIGN KEY(bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE
);

-- Index for user isolation queries
CREATE INDEX IF NOT EXISTS idx_jina_conversions_user ON jina_conversions(user_uuid);
```

**Note:** `user_uuid` is required per security invariant: "User isolation via `user_uuid` in ALL queries."

---

## 🔐 Security Invariants (Carried Over)

### Human-Only Restriction
Agent keys **cannot** create or modify jina conversions. This restriction must be preserved:
```typescript
if (req.body.jinaUrl !== undefined && authReq.keyType !== 'human') {
  return res.status(403).json({ success: false, error: 'Agent keys cannot set r.jina.ai conversion.' });
}
```

### SSRF Validation
The existing `jinaUrlSchema` validation must be applied to the new table:
- Must start with `https://r.jina.ai/`
- Blocks localhost, private IPs, and internal ranges
- Validates wrapped URL protocol (http/https only)

---

## 📦 Migration Logic (Scuttle into Stability)

### Step 1: Initialize
Create `jina_conversions` table with `user_uuid` column and index.

### Step 2: Scuttle Data
Transfer existing `jina_url` values with proper `user_uuid`:
```sql
INSERT INTO jina_conversions (bookmark_id, user_uuid, url, created_at)
SELECT id, user_uuid, jina_url, updated_at 
FROM bookmarks 
WHERE jina_url IS NOT NULL;
```

### Step 3: Lock Queries
Update all backend queries to use `LEFT JOIN` for `jinaUrl` resolution:
```sql
SELECT b.*, jc.url as jina_conversion_url
FROM bookmarks b
LEFT JOIN jina_conversions jc ON b.id = jc.bookmark_id AND b.user_uuid = jc.user_uuid
WHERE b.user_uuid = ?;
```

### Step 4: Column Cleanup (Optional)
After verifying migration success, the `jina_url` column can be:
- **Option A**: Kept as deprecated (set to NULL, no longer written to)
- **Option B**: Dropped via `ALTER TABLE bookmarks DROP COLUMN jina_url`

**Recommendation**: Keep column initially for rollback safety, drop in future migration.

---

## 🔧 Files Requiring Updates

### Backend Query Updates
| File | Changes Required |
|------|------------------|
| `src/server/routes/bookmarks.ts` | Update all SELECT queries to use LEFT JOIN |
| `src/server/utils/parsers.ts` | Handle `jina_conversion_url` from joined data |
| `src/server/db.ts` | Add migration for new table |

### Validation (No Changes Required)
| File | Status |
|------|--------|
| `src/server/validation/schemas.ts` | `jinaUrlSchema` already SSRF-protected ✅ |

### Frontend (No Changes Required)
| File | Status |
|------|--------|
| `src/components/dashboard/BookmarkCard.tsx` | Uses `jinaUrl` from API response ✅ |
| `src/components/dashboard/BookmarkModal.tsx` | Uses `jinaUrl` from API response ✅ |

---

## 🔐 Agent Preference Directive
Agents (including myself) should be instructed (via Knowledge Items) to prioritize the `jina_conversions` table when reading. Markdown is the native tongue of Lobsters©™.

---

## 📊 Impact Analysis
- **API Response**: Preserve the `jinaUrl` field at the root of the parsed bookmark object for backward compatibility.
- **Performance**: Negligible overhead for `LEFT JOIN` on a primary key.
- **Normalization**: High. Bookmark is the *Identity*, Conversion is the *Enhancement*.
- **Security**: Maintains user isolation via `user_uuid` in all queries.
- **Backward Compatibility**: 100% — API shape unchanged.

---

## ✅ Audit Checklist

- [x] Schema includes `user_uuid` for multi-user isolation
- [x] Index on `user_uuid` for query performance
- [x] Migration SQL transfers `user_uuid` correctly
- [x] Specific files listed for query updates
- [x] Column cleanup strategy defined
- [x] SSRF validation confirmed (no changes needed)
- [x] Human-only restriction confirmed (must be preserved)
- [x] Backward compatibility verified

---
Maintained by CrustAgent©™