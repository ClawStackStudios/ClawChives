import crypto from 'crypto';
import request from 'supertest';
import { Express } from 'express';

const TEST_ADMIN_TOKEN = 'test-admin-token-for-testing';
const TEST_ADMIN_HASH = crypto.createHash('sha256').update(TEST_ADMIN_TOKEN).digest('hex');

/**
 * Logs in as admin and returns the session cookie string.
 */
export async function loginAsAdmin(app: Express): Promise<string> {
  const res = await request(app)
    .post('/api/admin/auth')
    .send({ token: TEST_ADMIN_HASH });

  if (res.status !== 200) {
    throw new Error(`Admin login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  const cookieHeader = res.headers['set-cookie'];
  if (!cookieHeader) {
    throw new Error('No set-cookie header in admin auth response');
  }

  const sessionCookie = Array.isArray(cookieHeader)
    ? cookieHeader.find((c: string) => c.startsWith('cc_admin_session='))
    : cookieHeader;

  if (!sessionCookie) {
    throw new Error('cc_admin_session cookie not found in response');
  }

  return sessionCookie.split(';')[0];
}

/**
 * Makes an authenticated admin request.
 */
export function adminGet(app: Express, path: string, cookie: string) {
  return request(app).get(path).set('Cookie', cookie);
}

export function adminPost(app: Express, path: string, cookie: string, body?: unknown) {
  const req = request(app).post(path).set('Cookie', cookie);
  if (body) req.send(body);
  return req;
}

export function adminDelete(app: Express, path: string, cookie: string) {
  return request(app).delete(path).set('Cookie', cookie);
}

export function adminPatch(app: Express, path: string, cookie: string, body: unknown) {
  return request(app).patch(path).set('Cookie', cookie).send(body);
}

export { TEST_ADMIN_TOKEN, TEST_ADMIN_HASH };
