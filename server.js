/**
 * ClawChives API Server
 * ─────────────────────────────────────────────────────────────────────────────
 * Simple Express REST API for external agent and human access to bookmarks.
 *
 * Key prefixes:
 *   hu-  Human identity keys   (generated at account setup, used to login)
 *   ag-  Agent keys            (generated in Settings → Agent Permissions)
 *   api- REST API tokens       (generated via POST /api/auth/token)
 *
 * Run:
 *   npm install express cors better-sqlite3
 *   node server.js
 *
 * Authentication:
 *   All /api/* routes (except /api/auth/*) require:
 *   Authorization: Bearer <api-key>
 *
 *   Key types accepted:
 *     api-<32 chars>  — REST API token
 *     ag-<64 chars>   — Agent key (validated against agent_keys table)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(express.json());

// ─── In-memory stores (replace with SQLite / better-sqlite3 in production) ───

/** @type {Map<string, object>}  apiKey → { key, type, owner, createdAt }  */
const apiTokenStore = new Map();

/** @type {Map<string, object>}  id → Bookmark */
const bookmarkStore = new Map();

// ─── Utilities ────────────────────────────────────────────────────────────────

function generateString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.randomBytes(length), (b) => chars[b % chars.length]).join("");
}

function generateApiToken() {
  return `api-${generateString(32)}`;
}

function generateId() {
  return crypto.randomUUID();
}

/** Detect key type from prefix */
function detectKeyType(key) {
  if (key.startsWith("hu-")) return "human";
  if (key.startsWith("ag-")) return "agent";
  if (key.startsWith("api-")) return "api";
  return null;
}

/** Parse and validate the Authorization header */
function extractBearerKey(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.substring(7).trim();
}

// ─── Auth middleware ──────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  const key = extractBearerKey(req);
  if (!key) {
    return res.status(401).json({ success: false, error: "Unauthorized: no Bearer token provided" });
  }

  const keyType = detectKeyType(key);
  if (!keyType) {
    return res.status(401).json({ success: false, error: "Invalid key format. Must be api-, ag-, or hu- prefix" });
  }

  // api- tokens must exist in our store
  if (keyType === "api") {
    if (!apiTokenStore.has(key)) {
      return res.status(401).json({ success: false, error: "Invalid or revoked API token" });
    }
  }

  // ag- and hu- keys are trusted from the client-side stores for this MVP.
  // In production, validate ag- keys against the database.

  req.apiKey = key;
  req.keyType = keyType;
  next();
}

// ─── Auth routes ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/token
 * Generate a new REST API token.
 *
 * Body: { ownerKey: "hu-..." | "ag-..." }
 * Returns: { success, data: { token, type, createdAt } }
 */
app.post("/api/auth/token", (req, res) => {
  const { ownerKey } = req.body;

  if (!ownerKey) {
    return res.status(400).json({ success: false, error: "ownerKey is required (hu- or ag- key)" });
  }

  const ownerType = detectKeyType(ownerKey);
  if (ownerType !== "human" && ownerType !== "agent") {
    return res.status(400).json({ success: false, error: "ownerKey must be a human (hu-) or agent (ag-) key" });
  }

  const token = generateApiToken();
  const record = {
    key: token,
    type: ownerType,
    owner: ownerKey,
    createdAt: new Date().toISOString(),
  };

  apiTokenStore.set(token, record);

  console.log(`[Auth] API token issued for ${ownerType} key: ${token.substring(0, 12)}...`);

  res.status(201).json({
    success: true,
    data: {
      token,
      type: ownerType,
      createdAt: record.createdAt,
    },
  });
});

/**
 * GET /api/auth/validate
 * Check if the current Bearer token is valid.
 */
app.get("/api/auth/validate", requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      valid: true,
      keyType: req.keyType,
    },
  });
});

// ─── Bookmark routes ──────────────────────────────────────────────────────────

/**
 * GET /api/bookmarks
 * List all bookmarks. Supports query params: starred, archived, search, tags.
 */
app.get("/api/bookmarks", requireAuth, (req, res) => {
  let results = Array.from(bookmarkStore.values());

  if (req.query.starred === "true") results = results.filter((b) => b.starred);
  if (req.query.archived === "true") results = results.filter((b) => b.archived);
  if (req.query.folderId) results = results.filter((b) => b.folderId === req.query.folderId);
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    results = results.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.url?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q)
    );
  }
  if (req.query.tags) {
    const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
    results = results.filter((b) => b.tags?.some((t) => tags.includes(t)));
  }

  res.json({ success: true, data: results });
});

/**
 * GET /api/bookmarks/:id
 * Get a single bookmark by ID.
 */
app.get("/api/bookmarks/:id", requireAuth, (req, res) => {
  const bookmark = bookmarkStore.get(req.params.id);
  if (!bookmark) return res.status(404).json({ success: false, error: "Bookmark not found" });
  res.json({ success: true, data: bookmark });
});

/**
 * POST /api/bookmarks
 * Create a new bookmark.
 * Body: { url, title, description?, tags?, folderId?, starred?, archived? }
 */
app.post("/api/bookmarks", requireAuth, (req, res) => {
  const { url, title } = req.body;
  if (!url) return res.status(400).json({ success: false, error: "url is required" });
  if (!title) return res.status(400).json({ success: false, error: "title is required" });

  // Check for duplicate URL
  const existing = Array.from(bookmarkStore.values()).find((b) => b.url === url);
  if (existing) {
    return res.status(409).json({ success: false, error: `A bookmark with URL "${url}" already exists`, existing });
  }

  const now = new Date().toISOString();
  const bookmark = {
    id: generateId(),
    url,
    title,
    description: req.body.description ?? "",
    favicon: req.body.favicon ?? "",
    tags: req.body.tags ?? [],
    folderId: req.body.folderId ?? null,
    starred: req.body.starred ?? false,
    archived: req.body.archived ?? false,
    createdAt: now,
    updatedAt: now,
  };

  bookmarkStore.set(bookmark.id, bookmark);
  console.log(`[Bookmarks] Created: ${bookmark.id} — ${bookmark.title}`);
  res.status(201).json({ success: true, data: bookmark });
});

/**
 * PUT /api/bookmarks/:id
 * Update an existing bookmark (partial update supported).
 */
app.put("/api/bookmarks/:id", requireAuth, (req, res) => {
  const bookmark = bookmarkStore.get(req.params.id);
  if (!bookmark) return res.status(404).json({ success: false, error: "Bookmark not found" });

  const updated = {
    ...bookmark,
    ...req.body,
    id: bookmark.id,       // id is immutable
    createdAt: bookmark.createdAt, // createdAt is immutable
    updatedAt: new Date().toISOString(),
  };

  bookmarkStore.set(bookmark.id, updated);
  console.log(`[Bookmarks] Updated: ${bookmark.id}`);
  res.json({ success: true, data: updated });
});

/**
 * DELETE /api/bookmarks/:id
 * Delete a bookmark.
 */
app.delete("/api/bookmarks/:id", requireAuth, (req, res) => {
  if (!bookmarkStore.has(req.params.id)) {
    return res.status(404).json({ success: false, error: "Bookmark not found" });
  }
  bookmarkStore.delete(req.params.id);
  console.log(`[Bookmarks] Deleted: ${req.params.id}`);
  res.json({ success: true });
});

/**
 * PATCH /api/bookmarks/:id/star
 * Toggle starred status.
 */
app.patch("/api/bookmarks/:id/star", requireAuth, (req, res) => {
  const bookmark = bookmarkStore.get(req.params.id);
  if (!bookmark) return res.status(404).json({ success: false, error: "Bookmark not found" });
  bookmark.starred = !bookmark.starred;
  bookmark.updatedAt = new Date().toISOString();
  res.json({ success: true, data: bookmark });
});

/**
 * PATCH /api/bookmarks/:id/archive
 * Toggle archived status.
 */
app.patch("/api/bookmarks/:id/archive", requireAuth, (req, res) => {
  const bookmark = bookmarkStore.get(req.params.id);
  if (!bookmark) return res.status(404).json({ success: false, error: "Bookmark not found" });
  bookmark.archived = !bookmark.archived;
  bookmark.updatedAt = new Date().toISOString();
  res.json({ success: true, data: bookmark });
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    service: "ClawChives API",
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

// ─── 404 fallback ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🦞 ClawChives API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Issue a token: POST http://localhost:${PORT}/api/auth/token`);
  console.log(`   Key prefixes:  hu- (human)  ag- (agent)  api- (REST token)\n`);
});
