import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs, { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

// @ts-ignore — plain JS module, no type declarations
import { getCorsConfig } from './src/config/corsConfig.js';
import { apiLimiter, createAgentKeyRateLimiter } from './src/server/middleware/rateLimiter.js';
import { errorHandler } from './src/server/middleware/errorHandler.js';
import { httpsRedirect } from './src/server/middleware/httpsRedirect.js';
import { purgeExpiredTokens } from './src/server/database/index.js';
import { scheduleTokenCleanup } from './src/server/utils/tokenExpiry.js';
import { generateId, generateString } from './src/server/utils/crypto.js';
import db, { audit, auditDb } from './src/server/database/index.js';

import authRoutes         from './src/server/routes/auth.js';
import bookmarkRoutes     from './src/server/routes/bookmarks/index.js';
import folderRoutes       from './src/server/routes/folders.js';
import agentKeyRoutes     from './src/server/routes/agentKeys.js';
import settingsRoutes     from './src/server/routes/settings.js';
import lobsterSessionRoutes from './src/server/routes/lobsterSession.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PORT = parseInt(process.env.PORT ?? '4646', 10);
const isProduction = process.env.NODE_ENV === 'production';

// ─── Export for tests ────────────────────────────────────────────────────────
export { db, audit, auditDb, generateId, generateString };
export const app = express();

const SESSION_ID = crypto.randomUUID();

// ─── Startup tasks ───────────────────────────────────────────────────────────
purgeExpiredTokens();
scheduleTokenCleanup(db);

async function performCleanup() {
  try {
    const auditRetentionRow = db.prepare("SELECT value FROM system_settings WHERE key = 'audit_retention_days'").get() as any;
    const uptimeRetentionRow = db.prepare("SELECT value FROM system_settings WHERE key = 'uptime_retention_days'").get() as any;
    
    const auditDays = auditRetentionRow ? parseInt(auditRetentionRow.value, 10) : 90;
    const uptimeDays = uptimeRetentionRow ? parseInt(uptimeRetentionRow.value, 10) : 30;

    audit.cleanup(auditDays, uptimeDays);
  } catch (err) {
    console.error('[Cleanup] Error:', err);
  }
}

performCleanup(); // Run immediately on startup
setInterval(performCleanup, 24 * 60 * 60 * 1000); // Daily cleanup

// ─── Trust proxy ─────────────────────────────────────────────────────────────
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(httpsRedirect);

app.use(helmet({
  strictTransportSecurity: process.env.ENFORCE_HTTPS === 'true' ? undefined : false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc:    ["'self'"],
      scriptSrc:     ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc:      ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:       ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:        ["'self'", 'data:', 'https:'],
      connectSrc:    ["'self'", 'wss:', 'ws:', 'https://r.jina.ai', 'https://api.microlink.io'],
      frameAncestors: isProduction ? ["'self'"] : ["'self'", "*"],
      upgradeInsecureRequests: process.env.ENFORCE_HTTPS === 'true' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy:   false,
  originAgentCluster:        false,
  frameguard: isProduction ? { action: 'sameorigin' } : false,
}));

app.use(cors(getCorsConfig()));
app.use(express.json());
app.use(cookieParser());
app.use('/api', apiLimiter);

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Agent rate limiter (applied after requireAuth populates req.keyType)
const agentRateLimiter = createAgentKeyRateLimiter();
app.use('/api', agentRateLimiter);

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const counts = {
    bookmarks: (db.prepare('SELECT COUNT(*) as c FROM bookmarks').get() as any).c,
    folders:   (db.prepare('SELECT COUNT(*) as c FROM folders').get() as any).c,
    agentKeys: (db.prepare("SELECT COUNT(*) as c FROM agent_keys WHERE is_active = 1").get() as any).c,
  };
  const pkgPath = path.join(process.cwd(), 'package.json');
  const pkgVersion = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version : 'unknown';

  res.json({
    success: true, service: 'ClawChives API', version: pkgVersion,
    mode: 'sqlite', uptime: process.uptime(), counts,
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',              authRoutes);
app.use('/api/bookmarks',         bookmarkRoutes);
app.use('/api/folders',           folderRoutes);
app.use('/api/agent-keys',        agentKeyRoutes);
app.use('/api/settings',          settingsRoutes);
app.use('/api/lobster-session',   lobsterSessionRoutes);

// ─── Admin Routes (Conditional) ──────────────────────────────────────────────
if (process.env.ADMIN_TOKEN) {
  const { default: adminRoutes } = await import('./src/server/routes/admin.js');
  const { adminApiLimiter, adminAuthLimiter } = await import('./src/server/middleware/rateLimiter.js');
  app.use('/api/admin/auth', adminAuthLimiter);
  app.use('/api/admin', adminApiLimiter, adminRoutes);
  console.log('   Admin: ENABLED (ADMIN_TOKEN is set)');
}
// Skill doc: public, no auth — registered before static files and SPA catch-all (LNN pattern)
app.get(['/skill.md', '/SKILL.md'], (_req, res) => {
  const paths = [
    path.join(__dirname, 'skills/clawchives/SKILL.md'),
    path.join(process.cwd(), 'skills/clawchives/SKILL.md'),
  ];
  const found = paths.find(p => existsSync(p));
  if (!found) return res.status(404).send('Skill document not found.');
  res.sendFile(found);
});

// ─── Static Files (Production) ────────────────────────────────────────────────
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath, {
  maxAge: '1y',  // Default cache header for hashed assets
  immutable: true, // Tells browsers hashed assets never change
  setHeaders(res, filePath) {
    if (filePath.endsWith('index.html')) {
      // Bypass cache for index.html — always fetch fresh on new releases
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      // Hashed assets (JS/CSS chunks) can be cached indefinitely
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));

// SPA catch-all: serve index.html for any non-API, non-asset route
// ⚠️ Do NOT change this regex — it prevents CSS/JS from being served as index.html
app.get(/^(?!\/api\/)(?!\/assets\/)(?!\/skill\.md)(?!\/SKILL\.md).*/, (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── 404 + Error Handler ─────────────────────────────────────────────────────
app.use('/api', (_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const HOST = process.env.HOST ?? (isProduction ? '0.0.0.0' : '127.0.0.1');

const server = app.listen(PORT, HOST, () => {
  audit.log('SYSTEM_START', { action: 'system_start', outcome: 'success', details: { session_id: SESSION_ID } });
  console.log(`\n🦞 ClawChives v2 API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
function handleShutdown(signal: string) {
  console.log(`\n[${signal}] Shutting down gracefully...`);
  audit.log('SYSTEM_SHUTDOWN', { action: 'system_shutdown', outcome: 'success', details: { session_id: SESSION_ID, reason: signal } });
  server.close(() => {
    console.log('HTTP server closed.');
    db.close();
    auditDb.close();
    console.log('Database connections closed.');
    process.exit(0);
  });

  // Force close if taking too long
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
