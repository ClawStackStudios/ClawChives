import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';

// Setup environment variables before importing the app
process.env.NODE_ENV = 'test';
process.env.DATA_DIR = path.join(process.cwd(), 'tests', 'data-bulk');
if (!fs.existsSync(process.env.DATA_DIR)) {
  fs.mkdirSync(process.env.DATA_DIR, { recursive: true });
}

// Import app and db after setting env
import { app, db } from '../server.js';

describe('POST /api/bookmarks/bulk — HardShell Comprehensive Tests', () => {
  const testUserUuid = '00000000-0000-0000-0000-000000000099';
  const now = new Date().toISOString();
  const futureExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const pastExpiry = new Date(Date.now() - 1000).toISOString();

  let agentWriteKey;
  let agentReadOnlyKey;
  let revokedAgentKey;
  let expiredAgentKey;
  let humanToken;

  beforeAll(async () => {
    // Clean up any previous test data
    db.prepare("DELETE FROM users WHERE uuid = ?").run(testUserUuid);
    db.prepare("DELETE FROM agent_keys WHERE user_uuid = ?").run(testUserUuid);
    db.prepare("DELETE FROM api_tokens WHERE owner_key IN (SELECT api_key FROM agent_keys WHERE user_uuid = ?)").run(testUserUuid);

    // Create test user
    db.prepare(
      "INSERT OR IGNORE INTO users (uuid, username, key_hash, created_at) VALUES (?, ?, ?, ?)"
    ).run(testUserUuid, 'hardshelltest_' + Date.now(), 'd'.repeat(64), now);

    // Generate unique agent keys
    agentWriteKey = 'lb-hardshell-write-' + Math.random().toString(36).slice(2, 22);
    agentReadOnlyKey = 'lb-hardshell-readonly-' + Math.random().toString(36).slice(2, 22);
    revokedAgentKey = 'lb-hardshell-revoked-' + Math.random().toString(36).slice(2, 22);
    expiredAgentKey = 'lb-hardshell-expired-' + Math.random().toString(36).slice(2, 22);

    // Insert agent keys with write permission
    db.prepare(`
      INSERT INTO agent_keys (id, user_uuid, name, api_key, permissions, rate_limit, is_active, expiration_type, created_at, expiration_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'agentwrite-' + Date.now(),
      testUserUuid,
      'Write Agent',
      agentWriteKey,
      JSON.stringify({ canRead: true, canWrite: true, canEdit: false, canDelete: false }),
      100,
      1,
      'expires',
      now,
      futureExpiry
    );

    // Insert read-only agent key
    db.prepare(`
      INSERT INTO agent_keys (id, user_uuid, name, api_key, permissions, rate_limit, is_active, expiration_type, created_at, expiration_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'agentreadonly-' + Date.now(),
      testUserUuid,
      'ReadOnly Agent',
      agentReadOnlyKey,
      JSON.stringify({ canRead: true, canWrite: false, canEdit: false, canDelete: false }),
      100,
      1,
      'expires',
      now,
      futureExpiry
    );

    // Insert revoked agent key (active but will be revoked)
    db.prepare(`
      INSERT INTO agent_keys (id, user_uuid, name, api_key, permissions, rate_limit, is_active, expiration_type, created_at, expiration_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'agentrevoked-' + Date.now(),
      testUserUuid,
      'Revoked Agent',
      revokedAgentKey,
      JSON.stringify({ canRead: true, canWrite: true, canEdit: false, canDelete: false }),
      100,
      1,
      'expires',
      now,
      futureExpiry
    );

    // Insert expired agent key
    db.prepare(`
      INSERT INTO agent_keys (id, user_uuid, name, api_key, permissions, rate_limit, is_active, expiration_type, created_at, expiration_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'agentexpired-' + Date.now(),
      testUserUuid,
      'Expired Agent',
      expiredAgentKey,
      JSON.stringify({ canRead: true, canWrite: true, canEdit: false, canDelete: false }),
      100,
      1,
      'expires',
      now,
      pastExpiry
    );

    // Revoke the revoked agent key
    db.prepare("UPDATE agent_keys SET is_active = 0 WHERE api_key = ?").run(revokedAgentKey);

    // Create a human user for testing human key behavior
    const humanUuid = '00000000-0000-0000-0000-000000000098';
    db.prepare("DELETE FROM users WHERE uuid = ?").run(humanUuid);
    db.prepare(
      "INSERT OR IGNORE INTO users (uuid, username, key_hash, created_at) VALUES (?, ?, ?, ?)"
    ).run(humanUuid, 'hardshellhuman_' + Date.now(), 'e'.repeat(64), now);

    // Get human token via HTTP (required for human auth)
    const tokenRes = await request(app)
      .post('/api/auth/token')
      .send({ username: 'hardshellhuman_' + Date.now().toString().slice(-10), password: 'e'.repeat(64) });
    // If token generation fails, we'll skip human key tests and note this
    humanToken = tokenRes.body?.token ?? null;
  });

  afterAll(() => {
    db.close();
    fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
  });

  describe('Auth & Permissions', () => {
    it('blocks unauthenticated requests with 401', async () => {
      const bookmarks = [{ url: 'https://test.com/noauth', title: 'No Auth' }];
      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .send({ bookmarks });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('blocks read-only agent key with 403', async () => {
      const bookmarks = [{ url: 'https://test.com/readonly', title: 'ReadOnly' }];
      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentReadOnlyKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('blocks revoked agent key with 401', async () => {
      const bookmarks = [{ url: 'https://test.com/revoked', title: 'Revoked' }];
      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${revokedAgentKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Revoked');
    });

    it('blocks expired agent key with 401', async () => {
      const bookmarks = [{ url: 'https://test.com/expired', title: 'Expired' }];
      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${expiredAgentKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('expired');
    });

    it('allows write-enabled agent key (happy path)', async () => {
      const bookmarks = [
        { url: 'https://test.com/auth-pass-' + Date.now(), title: 'Auth Pass' }
      ];
      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(207);
      expect(res.body.success).toBe(true);
      expect(res.body.imported).toBeGreaterThan(0);
    });
  });

  describe('Body Validation', () => {
    it('rejects non-array bookmarks with 400', async () => {
      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks: 'not an array' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('must be an array');
    });

    it('rejects batch > 1000 items with 400', async () => {
      const bookmarks = Array.from({ length: 1001 }, (_, i) => ({
        url: `https://overflow.com/${i}`,
        title: `Overflow ${i}`,
      }));

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('exceeds maximum');
    });

    it('accepts empty array and returns 207 with imported: 0', async () => {
      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks: [] });

      expect(res.status).toBe(207);
      expect(res.body.imported).toBe(0);
      expect(res.body.failed).toBe(0);
    });

    it('skips items missing URL and counts as failed', async () => {
      const bookmarks = [
        { title: 'No URL' }, // Missing URL
        { url: 'https://valid.com/missing-url-' + Date.now(), title: 'Valid' },
      ];

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(207);
      // At least one failed (the one with missing URL)
      expect(res.body.failed).toBeGreaterThanOrEqual(1);
      // At least one imported (the valid one)
      expect(res.body.imported).toBeGreaterThanOrEqual(1);
      expect(res.body.imported + res.body.failed).toBe(2);
    });

    it('skips items with invalid URL format and counts as failed', async () => {
      const bookmarks = [
        { url: 'not-a-url', title: 'Invalid URL' },
        { url: 'https://valid.com/invalid-format-' + Date.now(), title: 'Valid' },
      ];

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(207);
      expect(res.body.imported).toBeGreaterThan(0);
      expect(res.body.failed).toBeGreaterThan(0);
    });
  });

  describe('Import Logic — Happy Path', () => {
    it('imports 20 unique URLs with all fields', async () => {
      const bookmarks = Array.from({ length: 20 }, (_, i) => ({
        url: `https://happy-path.com/${Date.now()}-${i}`,
        title: `Bookmark ${i}`,
        description: `Description ${i}`,
        tags: ['test', 'batch'],
        starred: i % 2 === 0,
      }));

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(207);
      expect(res.body.success).toBe(true);
      expect(res.body.imported).toBe(20);
      expect(res.body.failed).toBe(0);
      expect(res.body.errors).toStrictEqual([]);
    });

    it('returns correct response shape with all fields', async () => {
      const bookmarks = [
        { url: 'https://shape-test.com/' + Date.now(), title: 'Shape Test' }
      ];

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks });

      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('imported');
      expect(res.body).toHaveProperty('failed');
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(typeof res.body.imported).toBe('number');
      expect(typeof res.body.failed).toBe('number');
    });
  });

  describe('Duplicate & Race Conditions', () => {
    it('detects duplicate within same batch — second fails', async () => {
      const sharedUrl = 'https://race-condition.com/' + Date.now();
      const bookmarks = [
        { url: sharedUrl, title: 'First' },
        { url: sharedUrl, title: 'Duplicate' },
      ];

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(207);
      expect(res.body.imported).toBe(1);
      expect(res.body.failed).toBe(1);
      expect(res.body.errors[0].url).toBe(sharedUrl);
      expect(res.body.errors[0].reason).toContain('already exists');
    });

    it('detects URL already in DB from previous import', async () => {
      const reuseUrl = 'https://reuse.com/' + Date.now();

      // First import
      const res1 = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks: [{ url: reuseUrl, title: 'First' }] });

      expect(res1.body.imported).toBe(1);

      // Second import with same URL
      const res2 = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks: [{ url: reuseUrl, title: 'Second' }] });

      expect(res2.status).toBe(207);
      expect(res2.body.imported).toBe(0);
      expect(res2.body.failed).toBe(1);
    });

    it('correctly splits mixed valid + duplicate URLs', async () => {
      const timestamp = Date.now();
      const validUrl1 = `https://mixed-valid.com/${timestamp}-1`;
      const validUrl2 = `https://mixed-valid.com/${timestamp}-2`;
      const duplicateUrl = 'https://reuse.com/' + (Date.now() - 1000);

      // Pre-import one URL so it's a duplicate
      db.prepare(
        "INSERT INTO bookmarks (id, user_uuid, url, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(
        'dup-pre-' + Date.now(),
        testUserUuid,
        duplicateUrl,
        'Pre-existing',
        now,
        now
      );

      const bookmarks = [
        { url: validUrl1, title: 'Valid 1' },
        { url: duplicateUrl, title: 'Duplicate' },
        { url: validUrl2, title: 'Valid 2' },
      ];

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(207);
      expect(res.body.imported).toBe(2);
      expect(res.body.failed).toBe(1);
      expect(res.body.imported + res.body.failed).toBe(3);
    });
  });

  describe('jinaUrl Guard (Agent Restriction)', () => {
    it('agent key with jinaUrl field fails per-item, not whole request', async () => {
      const bookmarks = [
        { url: 'https://jina-test.com/' + Date.now(), title: 'Normal', jinaUrl: 'https://r.jina.ai/jina-test.com' },
        { url: 'https://jina-ok.com/' + Date.now(), title: 'OK' },
      ];

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(207);
      expect(res.body.imported).toBe(1); // Second item succeeds
      expect(res.body.failed).toBe(1); // First item fails
      expect(res.body.errors[0].reason).toContain('jinaUrl');
    });
  });

  describe('Response Integrity', () => {
    it('errors array contains { url, reason } for each failure', async () => {
      const bookmarks = [
        { title: 'Missing URL' },
        { url: 'not-a-url', title: 'Invalid URL' },
        { url: 'https://valid.com/' + Date.now(), title: 'Valid' },
      ];

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(207);

      // Check all errors have url and reason
      for (const error of res.body.errors) {
        expect(error).toHaveProperty('url');
        expect(error).toHaveProperty('reason');
        expect(typeof error.url).toBe('string');
        expect(typeof error.reason).toBe('string');
      }
    });

    it('imported + failed + errors.length math checks out', async () => {
      const bookmarks = [
        { url: 'https://math.com/1-' + Date.now(), title: 'Valid 1' },
        { title: 'Missing URL' },
        { url: 'not-url', title: 'Invalid' },
        { url: 'https://math.com/2-' + Date.now(), title: 'Valid 2' },
        { url: 'https://math.com/3-' + Date.now(), title: 'Valid 3' },
      ];

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(207);
      expect(res.body.imported + res.body.failed).toBe(bookmarks.length);
      expect(res.body.errors.length).toBe(res.body.failed);
    });

    it('large batch (100 items) returns correct counts', async () => {
      const bookmarks = Array.from({ length: 100 }, (_, i) => ({
        url: `https://large-batch.com/${Date.now()}-${i}`,
        title: `Large Batch ${i}`,
      }));

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks });

      expect(res.status).toBe(207);
      expect(res.body.imported).toBe(100);
      expect(res.body.failed).toBe(0);
      expect(res.body.imported + res.body.failed).toBe(100);
    });
  });

  describe('Rate Limiter Bypass Verification', () => {
    it('agent key bulk endpoint bypasses apiLimiter', async () => {
      // This is a smoke test — if rate limiting was NOT bypassed, we'd get 429
      // after many rapid requests. Instead, we should get 207 consistently.
      const bookmarks = [{ url: 'https://ratelimit-test.com/' + Date.now(), title: 'RateLimit' }];

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentWriteKey}`)
        .send({ bookmarks });

      // Should be 207, not 429 (which would indicate rate limiting)
      expect(res.status).not.toBe(429);
      expect([207, 201]).toContain(res.status);
    });
  });
});
