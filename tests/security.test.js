import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Setup environment variables before importing the app
process.env.NODE_ENV = 'test';
process.env.DATA_DIR = path.join(process.cwd(), 'tests', 'data');
if (!fs.existsSync(process.env.DATA_DIR)) {
  fs.mkdirSync(process.env.DATA_DIR, { recursive: true });
}

// Import app and db after setting env
import { app, db, generateString } from '../server.js';

describe('Security Fixes: Key Generation & Agent Authorization Bypass', () => {



  describe('Key Generation (OWASP)', () => {
    it('generates strings of correct length without modulo bias', () => {
      const length = 64;
      const key = generateString(length);
      expect(key).toHaveLength(length);
      // Ensure only valid chars
      expect(/^[A-Za-z0-9]+$/.test(key)).toBe(true);

      const key2 = generateString(length);
      expect(key).not.toBe(key2); // Extremely unlikely to collide
    });
  });

  describe('Authorization Bypass for Revoked Agents', () => {
    let humanApiToken;
    let agentApiKey;
    let agentToken;
    let agentId;

    beforeAll(async () => {
      // 1. Create a human user & token directly in DB to bypass rate limits and auth hurdles easily
      const humanUuid = '00000000-0000-0000-0000-000000000000';
      const keyHash = 'a'.repeat(64);
      db.prepare("DELETE FROM users WHERE username = 'testhuman'").run();
      db.prepare("INSERT OR IGNORE INTO users (uuid, username, key_hash, created_at) VALUES (?, ?, ?, ?)").run(
        humanUuid, 'testhuman', keyHash, new Date().toISOString()
      );

      const resHuman = await request(app)
        .post('/api/auth/token')
        .send({ type: 'human', uuid: humanUuid, keyHash });

      if (resHuman.status !== 201 || !resHuman.body.data) {
        console.error('Failed to get human token:', { status: resHuman.status, body: resHuman.body });
        throw new Error(`Failed to authenticate human: ${resHuman.status} ${JSON.stringify(resHuman.body)}`);
      }
      humanApiToken = resHuman.body.data.token;

      // 2. Create an Agent via API as the human
      // remove old agent if it exists (from aborted test runs)
      db.prepare("DELETE FROM agent_keys WHERE name = 'Test Agent' AND user_uuid = ?").run(humanUuid);

      const resAgent = await request(app)
        .post('/api/agent-keys')
        .set('Authorization', `Bearer ${humanApiToken}`)
        .send({
          name: 'Test Agent',
          permissions: { canRead: true, canWrite: true }
        });

      expect(resAgent.status).toBe(201);
      agentApiKey = resAgent.body.data.apiKey;
      agentId = resAgent.body.data.id;

      // 3. Issue an api- token for the newly created Agent
      const resAgentToken = await request(app)
        .post('/api/auth/token')
        .send({ type: 'agent', ownerKey: agentApiKey });

      expect(resAgentToken.status).toBe(201);
      agentToken = resAgentToken.body.data.token;
    });

    it('allows an active agent to authenticate and access the API', async () => {
      const res = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.keyType).toBe('agent');
    });

    it('rejects an agent whose key has been revoked', async () => {
      // Revoke the agent key
      const revokeRes = await request(app)
        .patch(`/api/agent-keys/${agentId}/revoke`)
        .set('Authorization', `Bearer ${humanApiToken}`);

      expect(revokeRes.status).toBe(200);

      // Attempt to access API using the previously generated api- token
      const res = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Lobster Key Revoked, Are you art of this reef?");
    });
  });

  describe('Pre-Hashed Agent Authentication', () => {
    let agentApiKey;
    let agentKeyHash;

    beforeAll(async () => {
      const humanUuid = '00000000-0000-0000-0000-000000000123';
      
      // Clean up previous runs
      db.prepare("DELETE FROM users WHERE uuid = ?").run(humanUuid);
      db.prepare("DELETE FROM agent_keys WHERE user_uuid = ?").run(humanUuid);

      // Create human user
      db.prepare("INSERT OR IGNORE INTO users (uuid, username, key_hash, created_at) VALUES (?, ?, ?, ?)").run(
        humanUuid, 'hashhuman', 'x'.repeat(64), new Date().toISOString()
      );

      // Directly insert an agent key into the database to bypass authLimiter
      agentApiKey = 'lb-test-' + Math.random().toString(36).slice(2, 20);
      const agentId = 'agent-' + Date.now();
      db.prepare(`
        INSERT INTO agent_keys (id, user_uuid, name, api_key, permissions, is_active, expiration_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        agentId, humanUuid, 'Hashed Agent Test',
        agentApiKey,
        JSON.stringify({ canRead: true, canWrite: false }),
        1, 'never', new Date().toISOString()
      );

      agentKeyHash = crypto.createHash('sha256').update(agentApiKey).digest('hex');
    });

    it('allows active agent to authenticate using pre-hashed keyHash and receive api- token', async () => {
      const res = await request(app)
        .post('/api/auth/token')
        .send({ type: 'agent', keyHash: agentKeyHash });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.token.startsWith('api-')).toBe(true);

      // Verify the generated session token actually works and grants agent access
      const validateRes = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${res.body.data.token}`);

      expect(validateRes.status).toBe(200);
      expect(validateRes.body.success).toBe(true);
      expect(validateRes.body.data.keyType).toBe('agent');
    });

    it('rejects authentication with invalid keyHash (401)', async () => {
      const invalidHash = 'f'.repeat(64);
      const res = await request(app)
        .post('/api/auth/token')
        .send({ type: 'agent', keyHash: invalidHash });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid or revoked agent key');
    });
  });

  describe('Agent Isolation and Permission Gating (The Tidewater Block)', () => {
    let userAToken, userBToken;
    let agentAOnlyReadToken, agentAWriteToken;
    const userAUuid = 'a32439c0-6d4b-4f5d-8b8b-bb8c5c76db20';
    const userBUuid = 'b54848d2-432d-4c3e-8c34-dcd7b9b1d9c3';
    const bookmarkBId = 'bookmark-b-id-99999';

    beforeAll(async () => {
      // 1. Clean up potential old values
      db.prepare("DELETE FROM users WHERE uuid IN (?, ?) OR username IN ('usera', 'userb')").run(userAUuid, userBUuid);
      db.prepare("DELETE FROM agent_keys WHERE id IN ('agent-read-id', 'agent-write-id') OR user_uuid IN (?, ?)").run(userAUuid, userBUuid);
      db.prepare("DELETE FROM bookmarks WHERE id = ? OR user_uuid IN (?, ?)").run(bookmarkBId, userAUuid, userBUuid);

      const keyHashA = crypto.randomBytes(32).toString('hex');
      const keyHashB = crypto.randomBytes(32).toString('hex');

      // 2. Create User A & User B
      db.prepare("INSERT INTO users (uuid, username, key_hash, created_at) VALUES (?, ?, ?, ?)").run(
        userAUuid, 'usera', keyHashA, new Date().toISOString()
      );
      db.prepare("INSERT INTO users (uuid, username, key_hash, created_at) VALUES (?, ?, ?, ?)").run(
        userBUuid, 'userb', keyHashB, new Date().toISOString()
      );

      // Create api tokens for their human sessions
      const resHumanA = await request(app).post('/api/auth/token').send({ type: 'human', uuid: userAUuid, keyHash: keyHashA });
      const resHumanB = await request(app).post('/api/auth/token').send({ type: 'human', uuid: userBUuid, keyHash: keyHashB });
      userAToken = resHumanA.body.data.token;
      userBToken = resHumanB.body.data.token;

      // 3. Create Agent keys for User A
      // Agent 1: canRead: true, canWrite: false
      const agent1ApiKey = 'lb-ag-read-' + Math.random().toString(36).slice(2, 20);
      db.prepare(`
        INSERT INTO agent_keys (id, user_uuid, name, api_key, permissions, is_active, expiration_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run('agent-read-id', userAUuid, 'Agent Read Only', agent1ApiKey, JSON.stringify({ canRead: true }), 1, 'never', new Date().toISOString());

      const resToken1 = await request(app).post('/api/auth/token').send({ type: 'agent', keyHash: crypto.createHash('sha256').update(agent1ApiKey).digest('hex') });
      agentAOnlyReadToken = resToken1.body.data.token;

      // Agent 2: canRead: true, canWrite: true, canEdit: true, canDelete: true
      const agent2ApiKey = 'lb-ag-write-' + Math.random().toString(36).slice(2, 20);
      db.prepare(`
        INSERT INTO agent_keys (id, user_uuid, name, api_key, permissions, is_active, expiration_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run('agent-write-id', userAUuid, 'Agent Full CRUD', agent2ApiKey, JSON.stringify({ canRead: true, canWrite: true, canEdit: true, canDelete: true }), 1, 'never', new Date().toISOString());

      const resToken2 = await request(app).post('/api/auth/token').send({ type: 'agent', keyHash: crypto.createHash('sha256').update(agent2ApiKey).digest('hex') });
      agentAWriteToken = resToken2.body.data.token;

      // 4. Create User B's bookmark
      db.prepare(`
        INSERT INTO bookmarks (id, user_uuid, url, title, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(bookmarkBId, userBUuid, 'https://userb-bookmark.com', 'User B Bookmark', new Date().toISOString(), new Date().toISOString());
    });

    it('denies human setting & key generation routes to agents (requireHuman protection)', async () => {
      // settings GET
      const resSettings = await request(app)
        .get('/api/settings/any-key')
        .set('Authorization', `Bearer ${agentAWriteToken}`);
      expect(resSettings.status).toBe(403);
      expect(resSettings.body.error).toContain('requires Human identity');

      // agent keys GET
      const resKeys = await request(app)
        .get('/api/agent-keys')
        .set('Authorization', `Bearer ${agentAWriteToken}`);
      expect(resKeys.status).toBe(403);
      expect(resKeys.body.error).toContain('requires Human identity');
    });

    it('enforces granular permission gating for bookmarks', async () => {
      // 1. Agent A (read only) tries to write a bookmark -> should fail with 403
      const resWrite = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${agentAOnlyReadToken}`)
        .send({ url: 'https://new-agent-bookmark.com', title: 'Agent Bookmark' });
      expect(resWrite.status).toBe(403);
      expect(resWrite.body.error).toContain('lacks the required');

      // 2. Agent A (full CRUD) tries to write a bookmark -> should succeed with 201
      const resWriteOk = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${agentAWriteToken}`)
        .send({ url: 'https://new-agent-bookmark.com', title: 'Agent Bookmark' });
      expect(resWriteOk.status).toBe(201);
      const newBmId = resWriteOk.body.data.id;

      // 3. Agent A (read only) tries to edit bookmark -> should fail 403
      const resEdit = await request(app)
        .put(`/api/bookmarks/${newBmId}`)
        .set('Authorization', `Bearer ${agentAOnlyReadToken}`)
        .send({ title: 'Modified by Agent A ReadOnly' });
      expect(resEdit.status).toBe(403);
      expect(resEdit.body.error).toContain('lacks the required');

      // 4. Agent A (full CRUD) tries to delete bookmark -> should succeed
      const resDelete = await request(app)
        .delete(`/api/bookmarks/${newBmId}`)
        .set('Authorization', `Bearer ${agentAWriteToken}`);
      expect(resDelete.status).toBe(200);
    });

    it('enforces strict Tidewater Block (cross-user data isolation)', async () => {
      // 1. Agent A (full CRUD) tries to retrieve User B's bookmark -> should return 404
      const resGetById = await request(app)
        .get(`/api/bookmarks/${bookmarkBId}`)
        .set('Authorization', `Bearer ${agentAWriteToken}`);
      expect(resGetById.status).toBe(404);

      // 2. Agent A (full CRUD) tries to list bookmarks -> should not include User B's bookmark
      const resList = await request(app)
        .get('/api/bookmarks')
        .set('Authorization', `Bearer ${agentAWriteToken}`);
      expect(resList.status).toBe(200);
      const urls = resList.body.data.map(b => b.url);
      expect(urls).not.toContain('https://userb-bookmark.com');

      // 3. Agent A (full CRUD) tries to update User B's bookmark -> should fail with 404
      const resUpdate = await request(app)
        .put(`/api/bookmarks/${bookmarkBId}`)
        .set('Authorization', `Bearer ${agentAWriteToken}`)
        .send({ title: 'Hacked by Agent A' });
      expect(resUpdate.status).toBe(404);

      // Verify bookmark B title was NOT changed
      const bmB = db.prepare('SELECT title FROM bookmarks WHERE id = ?').get(bookmarkBId);
      expect(bmB.title).toBe('User B Bookmark');

      // 4. Agent A (full CRUD) tries to delete User B's bookmark -> should fail with 404
      const resDelete = await request(app)
        .delete(`/api/bookmarks/${bookmarkBId}`)
        .set('Authorization', `Bearer ${agentAWriteToken}`);
      expect(resDelete.status).toBe(404);

      // Verify bookmark B still exists
      const bmBExists = db.prepare('SELECT COUNT(*) as count FROM bookmarks WHERE id = ?').get(bookmarkBId);
      expect(bmBExists.count).toBe(1);
    });
  });

});
