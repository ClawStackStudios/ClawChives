import Database from 'better-sqlite3-multiple-ciphers';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DATA_DIR: use env var or fall back to ./data in project root
const DATA_DIR = process.env.DATA_DIR ?? path.join(__dirname, '..', '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.sqlite');

fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── Database Encryption (SQLCipher / ShellCryption™) ──────────────────────────
const encryptionKey = process.env.DB_ENCRYPTION_KEY;

// Validate encryption key at startup
if (encryptionKey) {
  if (!/^[a-zA-Z0-9+/=]+$/.test(encryptionKey)) {
    throw new Error('[DB] DB_ENCRYPTION_KEY must be base64-encoded (alphanumeric, +, /, = only).');
  }
}

function encryptExistingDatabase(dbPath: string, key: string) {
  const resolvedDbPath = path.resolve(dbPath);
  const tempPath = resolvedDbPath + '.tmp';

  try {
    const plain = new Database(resolvedDbPath);
    plain.exec(`
      ATTACH DATABASE '${tempPath}' AS encrypted KEY '${key}';
      SELECT sqlcipher_export('encrypted');
      DETACH DATABASE encrypted;
    `);
    plain.close();
    fs.renameSync(tempPath, resolvedDbPath);
    console.log('[DB] ✅ Database encrypted successfully.');
  } catch (e) {
    try { fs.unlinkSync(tempPath); } catch {}
    throw e;
  }
}

export function openDatabase(): Database.Database {
  const db = new Database(DB_PATH);

  if (encryptionKey) {
    db.pragma(`key = '${encryptionKey}'`);
    try {
      db.prepare('SELECT count(*) FROM sqlite_master').get();
    } catch (e: any) {
      if (e.message.includes('not a database') || e.message.includes('is not a database')) {
        console.log('[DB] Detected unencrypted database — migrating to encrypted...');
        db.close();
        encryptExistingDatabase(DB_PATH, encryptionKey);
        const encrypted = new Database(DB_PATH);
        encrypted.pragma(`key = '${encryptionKey}'`);
        return encrypted;
      }
      throw e;
    }
  } else {
    console.warn('[DB] ⚠️ DB_ENCRYPTION_KEY not set — database is unencrypted at rest.');
  }

  return db;
}

export const dbInstance = openDatabase();
dbInstance.pragma('journal_mode = WAL');
dbInstance.pragma('foreign_keys = ON');

export default dbInstance;
