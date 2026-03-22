import dbInstance from './connection.js';
import { initializeSchema } from './schema.js';
import { runMigrations } from './migrations.js';

// Initialize and migrate on load
initializeSchema(dbInstance);
runMigrations(dbInstance);

/** Purge expired tokens utility */
export function purgeExpiredTokens(): number {
  const result = dbInstance.prepare(
    `DELETE FROM api_tokens WHERE datetime(expires_at) <= datetime('now')`
  ).run();
  if (result.changes > 0) console.log(`[DB] Purged ${result.changes} expired token(s)`);
  return result.changes;
}

export default dbInstance;
export { dbInstance as db };
