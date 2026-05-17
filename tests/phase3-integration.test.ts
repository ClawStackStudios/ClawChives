import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'tests', 'data-phase3');
process.env.DATA_DIR = DATA_DIR;
process.env.NODE_ENV = 'test';

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

import { app, db } from '../server.js';

describe('Phase 3a — Mass Import & Large Library Tests', () => {
  const testUserUuid = '00000000-0000-0000-0000-000000000333';
  const now = new Date().toISOString();
  let agentKey: string;

  beforeAll(async () => {
    db.prepare('DELETE FROM users WHERE uuid = ?').run(testUserUuid);
    db.prepare('DELETE FROM agent_keys WHERE user_uuid = ?').run(testUserUuid);
    db.prepare('DELETE FROM bookmarks WHERE user_uuid = ?').run(testUserUuid);
    db.prepare('DELETE FROM folders WHERE user_uuid = ?').run(testUserUuid);

    db.prepare(
      'INSERT OR IGNORE INTO users (uuid, username, key_hash, created_at) VALUES (?, ?, ?, ?)'
    ).run(testUserUuid, 'phase3test' + Date.now(), 'x'.repeat(64), now);

    agentKey = 'lb-phase3-' + Math.random().toString(36).slice(2, 20);
    const keyId = 'phase3-' + Date.now();

    db.prepare(`
      INSERT INTO agent_keys (id, user_uuid, name, api_key, permissions, rate_limit, is_active, expiration_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      keyId, testUserUuid, 'Phase3Agent',
      agentKey,
      JSON.stringify({ canRead: true, canWrite: true, canEdit: false, canDelete: false }),
      1000, 1, 'never', now
    );
  });



  describe('Task 3.1 — Mass Import (1000 URLs)', () => {
    it('should import 1000 URLs in 10 batches of 100', async () => {
      db.prepare('DELETE FROM bookmarks WHERE user_uuid = ?').run(testUserUuid);
      let total = 0;

      for (let b = 0; b < 10; b++) {
        const bookmarks = Array.from({ length: 100 }, (_, i) => ({
          url: `https://test.com/b${b}-i${i}-${Date.now()}`,
          title: `B${b}I${i}`,
        }));

        const res = await request(app)
          .post('/api/bookmarks/bulk')
          .set('Authorization', `Bearer ${agentKey}`)
          .send({ bookmarks });

        expect(res.status).toBe(207);
        expect(res.body.imported).toBe(100);
        total += res.body.imported;
      }

      expect(total).toBe(1000);
    });

    it('should detect and reject duplicates (500 new + 500 dup)', async () => {
      db.prepare('DELETE FROM bookmarks WHERE user_uuid = ?').run(testUserUuid);

      const batch1 = Array.from({ length: 500 }, (_, i) => ({
        url: `https://duptest.com/${i}-${Date.now()}`,
        title: `T${i}`,
      }));

      const res1 = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentKey}`)
        .send({ bookmarks: batch1 });
      expect(res1.body.imported).toBe(500);

      const batch2 = [
        ...batch1,
        ...Array.from({ length: 500 }, (_, i) => ({
          url: `https://duptest.com/new${i}-${Date.now()}`,
          title: `N${i}`,
        })),
      ];

      const res2 = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentKey}`)
        .send({ bookmarks: batch2 });

      expect(res2.body.imported).toBe(500);
      expect(res2.body.failed).toBe(500);
    });
  });

  describe('Task 3.2 — Performance (1000 bookmarks)', () => {
    it('should fetch 1000 bookmarks in < 500ms', async () => {
      db.prepare('DELETE FROM bookmarks WHERE user_uuid = ?').run(testUserUuid);

      const insertBatch = db.transaction((items: any[]) => {
        for (const item of items) {
          db.prepare(`
            INSERT INTO bookmarks (id, user_uuid, url, title, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(item.id, testUserUuid, item.url, item.title, now, now);
        }
      });

      const items = Array.from({ length: 1000 }, (_, i) => ({
        id: `p${i}`,
        url: `https://perf.com/${i}`,
        title: `P${i}`,
      }));
      insertBatch(items);

      const start = performance.now();
      const res = await request(app)
        .get('/api/bookmarks')
        .set('Authorization', `Bearer ${agentKey}`)
        .query({ limit: 50, offset: 0 });
      const elapsed = performance.now() - start;

      expect(res.status).toBe(200);
      expect(elapsed).toBeLessThan(500);
    });

    it('should get folder counts in < 100ms', async () => {
      db.prepare('DELETE FROM folders WHERE user_uuid = ?').run(testUserUuid);
      db.prepare('DELETE FROM bookmarks WHERE user_uuid = ?').run(testUserUuid);

      const f1 = 'f1-' + Date.now();
      const f2 = 'f2-' + Date.now();

      db.prepare(
        'INSERT INTO folders (id, user_uuid, name, color, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(f1, testUserUuid, 'F1', '#06b6d4', now);
      db.prepare(
        'INSERT INTO folders (id, user_uuid, name, color, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(f2, testUserUuid, 'F2', '#06b6d4', now);

      const insertBatch = db.transaction((fid: string, count: number) => {
        for (let i = 0; i < count; i++) {
          db.prepare(`
            INSERT INTO bookmarks (id, user_uuid, url, title, folder_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(`b${fid}${i}`, testUserUuid, `https://f.com/${fid}/${i}`, `B${i}`, fid, now, now);
        }
      });

      insertBatch(f1, 500);
      insertBatch(f2, 500);

      const start = performance.now();
      const res = await request(app)
        .get('/api/bookmarks/folder-counts')
        .set('Authorization', `Bearer ${agentKey}`);
      const elapsed = performance.now() - start;

      expect(res.status).toBe(200);
      expect(res.body.data[f1]).toBe(500);
      expect(res.body.data[f2]).toBe(500);
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe('Task 3.3 — Error Recovery', () => {
    it('should handle partial failures gracefully', async () => {
      db.prepare('DELETE FROM bookmarks WHERE user_uuid = ?').run(testUserUuid);

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentKey}`)
        .send({
          bookmarks: [
            { url: 'https://ok.com/1', title: 'OK1' },
            { url: 'https://ok.com/2', title: 'OK2' },
            { url: 'bad-url', title: 'Bad' },
            { url: 'https://ok.com/3', title: 'OK3' },
            { title: 'NoURL' },
          ],
        });

      expect(res.status).toBe(207);
      expect(res.body.imported).toBe(3);
      expect(res.body.failed).toBe(2);
    });

    it('should skip duplicates without data corruption', async () => {
      db.prepare('DELETE FROM bookmarks WHERE user_uuid = ?').run(testUserUuid);

      db.prepare(`
        INSERT INTO bookmarks (id, user_uuid, url, title, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('bm1', testUserUuid, 'https://ex.com/dup', 'Original', now, now);

      const res = await request(app)
        .post('/api/bookmarks/bulk')
        .set('Authorization', `Bearer ${agentKey}`)
        .send({
          bookmarks: [
            { url: 'https://ex.com/dup', title: 'Different' },
            { url: 'https://ex.com/new', title: 'New' },
          ],
        });

      expect(res.body.imported).toBe(1);
      expect(res.body.failed).toBe(1);

    });
  });

  describe('Task 3.4 — Pagination & Limit Enforcement Options', () => {
    it('should support page-based pagination and calculate offset correctly', async () => {
      db.prepare('DELETE FROM bookmarks WHERE user_uuid = ?').run(testUserUuid);

      // Insert 15 bookmarks
      const insertBatch = db.transaction((items: any[]) => {
        for (const item of items) {
          db.prepare(`
            INSERT INTO bookmarks (id, user_uuid, url, title, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(item.id, testUserUuid, item.url, item.title, item.created_at, item.created_at);
        }
      });

      const baseTime = Date.now();
      const items = Array.from({ length: 15 }, (_, i) => ({
        id: `pagi-${i}`,
        url: `https://pagi.com/${i}`,
        title: `Pagi ${i}`,
        created_at: new Date(baseTime + i * 1000).toISOString(),
      }));
      insertBatch(items);

      // page=1&limit=5 should return first 5 (latest created)
      const resPage1 = await request(app)
        .get('/api/bookmarks')
        .set('Authorization', `Bearer ${agentKey}`)
        .query({ page: 1, limit: 5 });

      expect(resPage1.status).toBe(200);
      expect(resPage1.body.data).toHaveLength(5);
      expect(resPage1.body.data[0].id).toBe('pagi-14'); // latest created
      expect(resPage1.body.data[4].id).toBe('pagi-10');

      // page=2&limit=5 should return next 5
      const resPage2 = await request(app)
        .get('/api/bookmarks')
        .set('Authorization', `Bearer ${agentKey}`)
        .query({ page: 2, limit: 5 });

      expect(resPage2.status).toBe(200);
      expect(resPage2.body.data).toHaveLength(5);
      expect(resPage2.body.data[0].id).toBe('pagi-9');
      expect(resPage2.body.data[4].id).toBe('pagi-5');

      // Check offset fallback compatibility
      const resOffset5 = await request(app)
        .get('/api/bookmarks')
        .set('Authorization', `Bearer ${agentKey}`)
        .query({ offset: 5, limit: 5 });

      expect(resOffset5.status).toBe(200);
      expect(resOffset5.body.data).toHaveLength(5);
      expect(resOffset5.body.data[0].id).toBe('pagi-9');
      expect(resOffset5.body.data[4].id).toBe('pagi-5');
    });

    it('should support large limits up to 10000', async () => {
      const res = await request(app)
        .get('/api/bookmarks')
        .set('Authorization', `Bearer ${agentKey}`)
        .query({ limit: 2000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
