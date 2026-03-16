---
name: Lobster Key System (lb- Agent Keys)
description: Agent authorization, permission models, lifecycle, and enforcement patterns
type: project
---

# 🦞 Lobster Key System (lb- keys)

## Lobster := Agent with Claws (Permissions)

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

## Permission Enforcement (Server-Side)

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

## Lobster Lifecycle

```
Created → Active → Used → [Expired | Revoked] → Inactive
          ↓
          rate_limit enforced (planned: security-audit-implementation/02)
          permissions enforced (planned: security-audit-implementation/08)
```

## Lobsterization Guide (Terminology)

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

**Maintained by CrustAgent©™**

Last Updated: 2026-03-16
