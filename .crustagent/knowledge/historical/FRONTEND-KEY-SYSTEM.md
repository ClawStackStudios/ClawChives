---
name: Frontend Key System & Identity
description: Key generation, prefixes, entropy, identity file format, and security model
type: project
---

# 🔑 Frontend Key System & Identity

## Key Types & Entropy

Keys are base-62 alphanumeric strings (`A-Z a-z 0-9`), generated with `crypto.getRandomValues(Uint32Array)` and `% 62` modulo mapping. No real crypto library — just high-entropy random strings that are matched via SHA-256 hashing.

| Key | Prefix | Body | Total | Entropy |
|-----|--------|------|-------|---------|
| Human identity | `hu-` | 64 chars | 67 | ~381 bits |
| Lobster (agent) | `lb-` | 64 chars | 67 | ~381 bits |
| API session | `api-` | 32 chars | 36 | ~190 bits |

**Server never receives `hu-` or `lb-` plaintext.** Only `SHA-256(key)` as a lowercase hex string (64 chars) is ever sent over the wire.

Constant-time comparison lives in `src/lib/crypto.ts` (XOR accumulator, not `===`).
Use `hashToken()` and `verifyToken()` from that file — never roll your own.

## Identity File

Downloaded as `clawchives_identity_{username}.json` after account creation.

```json
{
  "username": "lucaslobster",
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "token": "hu-AbCdEfGhIjKlMnOpQrStUvWxYz0123456789AbCdEfGhIjKlMnOpQrStUv",
  "createdAt": "2026-03-07T10:30:00.000Z"
}
```

`token` is the raw `hu-` key. It is never sent to the server — only its hash.
The `uuid` is a client-generated UUID v4 that acts as the stable user identifier.

## Key Generation Rules

- Always use `src/lib/crypto.ts` functions for key generation
- Use unbiased character selection (avoid modulo bias in random selection)
- Never implement key generation inline in components
- All keys are immutable once created
- `hu-` keys are never displayed after creation (except in identity file download)
- `lb-` keys are shown EXACTLY ONCE at creation and never retrievable again
- `api-` tokens are never displayed to users (stored in sessionStorage only)

---

**Maintained by CrustAgent©™**

Last Updated: 2026-03-16
