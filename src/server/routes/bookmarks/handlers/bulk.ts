import { Response } from 'express';
import db from '../../../database/index.js';
import { AuthRequest } from '../../../middleware/auth.js';
import { createAuditLogger } from '../../../utils/auditLogger.js';
import { BookmarkSchemas } from '../../../validation/schemas.js';
import { insertBookmark } from '../utils.js';

const audit = createAuditLogger(db);

/** POST /api/bookmarks/bulk */
export const bulkImport = (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const { bookmarks } = req.body;

  if (!Array.isArray(bookmarks)) return res.status(400).json({ success: false, error: 'body.bookmarks must be an array' });
  if (bookmarks.length > 1000) return res.status(400).json({ success: false, error: 'Batch size exceeds maximum of 1000 items' });

  let imported = 0;
  const errors: { url: string; reason: string }[] = [];

  for (const item of bookmarks) {
    const parsed = BookmarkSchemas.create.safeParse(item);
    if (!parsed.success) {
      errors.push({ url: (item as any)?.url ?? '(unknown)', reason: parsed.error.issues[0]?.message ?? 'Invalid format' });
      continue;
    }
    const result = insertBookmark(authReq, parsed.data);
    if ('error' in result) errors.push({ url: parsed.data.url, reason: result.error });
    else imported++;
  }

  const sessionId = req.headers['x-session-id'] as string | undefined;
  if (sessionId && errors.length > 0) {
    try {
      const session = db.prepare('SELECT id, errors_json, error_count FROM import_sessions WHERE id = ? AND user_uuid = ? AND closed_at IS NULL').get(sessionId, authReq.userUuid) as any;
      if (session) {
        const updated = [...JSON.parse(session.errors_json || '[]'), ...errors];
        db.prepare('UPDATE import_sessions SET errors_json = ?, error_count = ? WHERE id = ?').run(JSON.stringify(updated), session.error_count + errors.length, sessionId);
      }
    } catch {}
  }

  audit.log('BOOKMARKS_BULK_IMPORTED', { actor: authReq.userUuid, actor_type: authReq.keyType, action: 'create', outcome: 'success', resource: 'bookmark', details: { imported, failed: errors.length, total: bookmarks.length, sessionId: sessionId ?? null } });
  res.status(207).json({ success: true, imported, failed: errors.length, errors });
};
