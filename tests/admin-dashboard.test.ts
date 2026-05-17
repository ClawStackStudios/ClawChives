import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'tests', 'data-admin');
process.env.DATA_DIR = DATA_DIR;
process.env.NODE_ENV = 'test';
process.env.ADMIN_TOKEN = 'test-admin-token-for-testing';

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

import { app, db, auditDb } from '../server.js';
import { loginAsAdmin, adminGet, adminDelete, adminPatch, TEST_ADMIN_HASH } from './helpers/admin.js';
import { createTestUser, createTestFolder, createTestBookmark, createTestAgentKey } from './helpers/testFactories.js';

const now = () => new Date().toISOString();
const uniqueKeyHash = () => crypto.randomBytes(32).toString('hex');

describe('SuperAdmin Dashboard', () => {

  afterAll(() => {
    if (fs.existsSync(DATA_DIR)) fs.rmSync(DATA_DIR, { recursive: true, force: true });
  });

  // ─── 1. Authentication ────────────────────────────────────────────────────
  describe('Authentication', () => {
    it('POST /api/admin/auth — succeeds with correct SHA-256 hash', async () => {
      const res = await request(app)
        .post('/api/admin/auth')
        .send({ token: TEST_ADMIN_HASH });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers['set-cookie']).toBeDefined();
      const cookies = res.headers['set-cookie'];
      const hasSession = Array.isArray(cookies)
        ? cookies.some(c => c.startsWith('cc_admin_session='))
        : cookies.includes('cc_admin_session=');
      expect(hasSession).toBe(true);
    });

    it('POST /api/admin/auth — fails with wrong token', async () => {
      const wrongHash = crypto.createHash('sha256').update('wrong-token').digest('hex');
      const res = await request(app)
        .post('/api/admin/auth')
        .send({ token: wrongHash });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/admin/auth — fails with empty body', async () => {
      const res = await request(app)
        .post('/api/admin/auth')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/verify — returns true with valid session', async () => {
      const cookie = await loginAsAdmin(app);
      const res = await adminGet(app, '/api/admin/verify', cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/admin/verify — returns false with no cookie', async () => {
      const res = await request(app).get('/api/admin/verify');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/admin/logout — clears session', async () => {
      const cookie = await loginAsAdmin(app);
      const res = await request(app)
        .post('/api/admin/logout')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/admin/logout — invalidated session fails verify', async () => {
      const cookie = await loginAsAdmin(app);
      await request(app).post('/api/admin/logout').set('Cookie', cookie);
      const verifyRes = await adminGet(app, '/api/admin/verify', cookie);
      expect(verifyRes.body.success).toBe(false);
    });
  });

  // ─── 2. Protected Route Guards ───────────────────────────────────────────
  describe('Protected Route Guards', () => {
    it('GET /api/admin/users — 401 without session', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
    });

    it('GET /api/admin/system — 401 without session', async () => {
      const res = await request(app).get('/api/admin/system');
      expect(res.status).toBe(401);
    });

    it('GET /api/admin/audit — 401 without session', async () => {
      const res = await request(app).get('/api/admin/audit');
      expect(res.status).toBe(401);
    });
  });

  // ─── 3. System Stats — Data Collection Metrics ───────────────────────────
  describe('System Stats (Data Metrics)', () => {
    let cookie: string;

    beforeAll(async () => {
      cookie = await loginAsAdmin(app);
    });

    it('returns correct totalUsers count', async () => {
      const countBefore = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
      createTestUser(db, { username: 'metric_user_' + Date.now(), keyHash: uniqueKeyHash() });

      const res = await adminGet(app, '/api/admin/system', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.totalUsers).toBe(countBefore + 1);
    });

    it('returns correct totalPinchmarks count', async () => {
      const user = createTestUser(db, { username: 'pinch_metric_' + Date.now(), keyHash: uniqueKeyHash() });
      const countBefore = (db.prepare('SELECT COUNT(*) as c FROM bookmarks').get() as any).c;
      createTestBookmark(db, user.uuid, { title: 'Metric Bookmark' });

      const res = await adminGet(app, '/api/admin/system', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.totalPinchmarks).toBe(countBefore + 1);
    });

    it('returns correct totalFolders count', async () => {
      const user = createTestUser(db, { username: 'folder_metric_' + Date.now(), keyHash: uniqueKeyHash() });
      const countBefore = (db.prepare('SELECT COUNT(*) as c FROM folders').get() as any).c;
      createTestFolder(db, user.uuid, { name: 'Metric Folder' });

      const res = await adminGet(app, '/api/admin/system', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.totalFolders).toBe(countBefore + 1);
    });

    it('returns dbSize as a number (reflects actual database files)', async () => {
      const res = await adminGet(app, '/api/admin/system', cookie);
      expect(res.status).toBe(200);
      expect(typeof res.body.data.dbSize).toBe('number');
      expect(res.body.data.dbSize).toBeGreaterThanOrEqual(0);
    });

    it('returns uptime > 0', async () => {
      const res = await adminGet(app, '/api/admin/system', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.uptime).toBeGreaterThan(0);
    });

    it('returns lastAudit timestamp', async () => {
      auditDb.prepare(
        'INSERT INTO audit_logs (timestamp, event_type, action, outcome) VALUES (?, ?, ?, ?)'
      ).run(now(), 'TEST_EVENT', 'test_action', 'success');

      const res = await adminGet(app, '/api/admin/system', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.lastAudit).toBeDefined();
      expect(typeof res.body.data.lastAudit).toBe('string');
    });
  });

  // ─── 4. User Management ──────────────────────────────────────────────────
  describe('User Management', () => {
    let cookie: string;

    beforeAll(async () => {
      cookie = await loginAsAdmin(app);
    });

    it('returns paginated user list with correct fields', async () => {
      const user = createTestUser(db, { username: 'list_user_' + Date.now(), keyHash: uniqueKeyHash() });

      const res = await adminGet(app, '/api/admin/users', cookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThan(0);

      const found = res.body.data.find((u: any) => u.uuid === user.uuid);
      expect(found).toBeDefined();
      expect(found.username).toBe(user.username);
      expect(found).toHaveProperty('pinchmark_count');
      expect(found).toHaveProperty('folder_count');
      expect(found).toHaveProperty('active_keys');
    });

    it('pinchmark_count matches actual bookmarks per user', async () => {
      const user = createTestUser(db, { username: 'count_bm_' + Date.now(), keyHash: uniqueKeyHash() });
      createTestBookmark(db, user.uuid, { title: 'BM1' });
      createTestBookmark(db, user.uuid, { title: 'BM2' });
      createTestBookmark(db, user.uuid, { title: 'BM3' });

      const res = await adminGet(app, '/api/admin/users?limit=50', cookie);
      const found = res.body.data.find((u: any) => u.uuid === user.uuid);
      expect(found.pinchmark_count).toBe(3);
    });

    it('folder_count matches actual folders per user', async () => {
      const user = createTestUser(db, { username: 'count_fd_' + Date.now(), keyHash: uniqueKeyHash() });
      createTestFolder(db, user.uuid, { name: 'FD1' });
      createTestFolder(db, user.uuid, { name: 'FD2' });

      const res = await adminGet(app, '/api/admin/users?limit=50', cookie);
      const found = res.body.data.find((u: any) => u.uuid === user.uuid);
      expect(found.folder_count).toBe(2);
    });

    it('active_keys matches agent_keys with is_active=1', async () => {
      const user = createTestUser(db, { username: 'count_keys_' + Date.now(), keyHash: uniqueKeyHash() });
      createTestAgentKey(db, user.uuid, { isActive: true, name: 'Active Key' });
      createTestAgentKey(db, user.uuid, { isActive: false, name: 'Inactive Key' });

      const res = await adminGet(app, '/api/admin/users?limit=50', cookie);
      const found = res.body.data.find((u: any) => u.uuid === user.uuid);
      expect(found.active_keys).toBe(1);
    });

    it('cascade deletes user + bookmarks + folders + agent_keys + settings', async () => {
      const user = createTestUser(db, { username: 'delete_target_' + Date.now(), keyHash: uniqueKeyHash() });
      createTestBookmark(db, user.uuid, { title: 'To Delete' });
      createTestFolder(db, user.uuid, { name: 'To Delete' });
      createTestAgentKey(db, user.uuid, { name: 'To Delete' });
      db.prepare('INSERT OR IGNORE INTO settings (key, value, user_uuid) VALUES (?, ?, ?)')
        .run('test_key', 'test_val', user.uuid);

      const res = await adminDelete(app, `/api/admin/users/${user.uuid}`, cookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      expect(db.prepare('SELECT * FROM users WHERE uuid = ?').get(user.uuid)).toBeUndefined();
      expect((db.prepare('SELECT COUNT(*) as c FROM bookmarks WHERE user_uuid = ?').get(user.uuid) as any).c).toBe(0);
      expect((db.prepare('SELECT COUNT(*) as c FROM folders WHERE user_uuid = ?').get(user.uuid) as any).c).toBe(0);
      expect((db.prepare('SELECT COUNT(*) as c FROM agent_keys WHERE user_uuid = ?').get(user.uuid) as any).c).toBe(0);
    });

    it('DELETE /api/admin/users/:uuid — returns 404 for non-existent user', async () => {
      const res = await adminDelete(app, `/api/admin/users/${crypto.randomUUID()}`, cookie);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── 5. Audit Logs ────────────────────────────────────────────────────────
  describe('Audit Logs', () => {
    let cookie: string;

    beforeAll(async () => {
      cookie = await loginAsAdmin(app);
      // Clear only non-system audit logs (preserve SYSTEM_START/SHUTDOWN for uptime tests)
      auditDb.prepare("DELETE FROM audit_logs WHERE event_type NOT IN ('SYSTEM_START', 'SYSTEM_SHUTDOWN')").run();
      // Insert test data
      auditDb.prepare(
        'INSERT INTO audit_logs (timestamp, event_type, actor, actor_type, action, outcome, details) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(now(), 'AUTH_LOGIN', 'test-user', 'human', 'login', 'success', '{"ip":"127.0.0.1"}');
      auditDb.prepare(
        'INSERT INTO audit_logs (timestamp, event_type, actor, actor_type, action, outcome, details) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(now(), 'AUTH_LOGIN', 'test-user', 'human', 'login', 'failure', '{"ip":"127.0.0.1"}');
      auditDb.prepare(
        'INSERT INTO audit_logs (timestamp, event_type, actor, actor_type, action, outcome, details) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(now(), 'API_CALL', 'system', 'cpu', 'bulk_import', 'success', null);
    });

    it('returns logs from audit database', async () => {
      const res = await adminGet(app, '/api/admin/audit', cookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(3);
    });

    it('filters by event_type', async () => {
      const res = await adminGet(app, '/api/admin/audit?event_type=AUTH_LOGIN', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.every((l: any) => l.event_type === 'AUTH_LOGIN')).toBe(true);
    });

    it('filters by outcome', async () => {
      const res = await adminGet(app, '/api/admin/audit?outcome=failure', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.every((l: any) => l.outcome === 'failure')).toBe(true);
    });

    it('pagination works with limit and offset', async () => {
      const res = await adminGet(app, '/api/admin/audit?limit=1&offset=0', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination.limit).toBe(1);
      expect(res.body.pagination.offset).toBe(0);
    });
  });

  // ─── 6. Settings ──────────────────────────────────────────────────────────
  describe('Settings', () => {
    let cookie: string;

    beforeAll(async () => {
      cookie = await loginAsAdmin(app);
    });

    it('returns default retention settings', async () => {
      const res = await adminGet(app, '/api/admin/settings', cookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.audit_retention_days).toBeDefined();
      expect(res.body.data.uptime_retention_days).toBeDefined();
    });

    it('updates settings and persists', async () => {
      const res = await adminPatch(app, '/api/admin/settings', cookie, {
        audit_retention_days: '60',
        uptime_retention_days: '15'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const getRes = await adminGet(app, '/api/admin/settings', cookie);
      expect(getRes.body.data.audit_retention_days).toBe('60');
      expect(getRes.body.data.uptime_retention_days).toBe('15');

      // Restore defaults
      await adminPatch(app, '/api/admin/settings', cookie, {
        audit_retention_days: '90',
        uptime_retention_days: '30'
      });
    });

    it('rejects invalid payload', async () => {
      const res = await adminPatch(app, '/api/admin/settings', cookie, 'not-an-object');
      expect(res.status).toBe(400);
    });
  });

  // ─── 7. Uptime History ────────────────────────────────────────────────────
  describe('Uptime History', () => {
    let cookie: string;

    beforeAll(async () => {
      cookie = await loginAsAdmin(app);
    });

    it('returns session data from audit database', async () => {
      const res = await adminGet(app, '/api/admin/uptime', cookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('computes duration for active session', async () => {
      const res = await adminGet(app, '/api/admin/uptime', cookie);
      const activeSession = res.body.data.find((s: any) => s.end === null);
      expect(activeSession).toBeDefined();
      expect(typeof activeSession.duration).toBe('number');
      expect(activeSession.duration).toBeGreaterThanOrEqual(0);
      expect(activeSession.start).toBeDefined();
      expect(activeSession.id).toBeDefined();
    });

    it('detects unclean shutdowns (session with no matching SHUTDOWN)', async () => {
      const sessionId = crypto.randomUUID();
      auditDb.prepare(
        'INSERT INTO audit_logs (timestamp, event_type, actor, actor_type, action, outcome, details) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(
        new Date(Date.now() - 120000).toISOString(),
        'SYSTEM_START', null, null, 'system_start', 'success',
        JSON.stringify({ session_id: sessionId })
      );

      const res = await adminGet(app, '/api/admin/uptime', cookie);
      const crashed = res.body.data.find((s: any) => s.id === sessionId);
      expect(crashed).toBeDefined();
      expect(crashed.end).toBeNull();
    });
  });
});
