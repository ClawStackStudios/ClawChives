import { describe, it, expect, beforeAll, afterAll } from 'vitest';
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

  afterAll(() => {
    if (fs.existsSync(DATA_DIR)) {
      fs.rmSync(DATA_DIR, { recursive: true, force: true });
    }
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

      const orig = db.prepare('SELECT title FROM bookmarks WHERE url = ?').get('https://ex.com/dup') as any;
      expect(orig.title).toBe('Original');
    });
  });
});
