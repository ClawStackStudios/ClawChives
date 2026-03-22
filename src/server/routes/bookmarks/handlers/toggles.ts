import { Response } from 'express';
import db from '../../../database/index.js';
import { AuthRequest } from '../../../middleware/auth.js';
import { createAuditLogger } from '../../../utils/auditLogger.js';
import { parseBookmark } from '../../../utils/parsers.js';
import { BOOKMARK_SELECT } from '../utils.js';

const audit = createAuditLogger(db);

/** PATCH /api/bookmarks/:id/star */
export const toggleStar = (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const row = db.prepare('SELECT starred FROM bookmarks WHERE id = ? AND user_uuid = ?').get(req.params.id, authReq.userUuid) as any;
  if (!row) return res.status(404).json({ success: false, error: 'Bookmark not found' });
  
  const newStarred = row.starred ? 0 : 1;
  db.prepare('UPDATE bookmarks SET starred = ?, updated_at = ? WHERE id = ? AND user_uuid = ?').run(newStarred, new Date().toISOString(), req.params.id, authReq.userUuid);
  
  const result = parseBookmark(db.prepare(`${BOOKMARK_SELECT} WHERE b.id = ? AND b.user_uuid = ?`).get(req.params.id, authReq.userUuid));
  audit.log('BOOKMARK_STARRED', { actor: authReq.userUuid, actor_type: authReq.keyType, action: 'update', outcome: 'success', resource: 'bookmark', details: { bookmark_id: req.params.id, starred: !!newStarred } });
  res.json({ success: true, data: result });
};

/** PATCH /api/bookmarks/:id/archive */
export const toggleArchive = (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const row = db.prepare('SELECT archived FROM bookmarks WHERE id = ? AND user_uuid = ?').get(req.params.id, authReq.userUuid) as any;
  if (!row) return res.status(404).json({ success: false, error: 'Bookmark not found' });
  
  const newArchived = row.archived ? 0 : 1;
  db.prepare('UPDATE bookmarks SET archived = ?, updated_at = ? WHERE id = ? AND user_uuid = ?').run(newArchived, new Date().toISOString(), req.params.id, authReq.userUuid);
  
  const result = parseBookmark(db.prepare(`${BOOKMARK_SELECT} WHERE b.id = ? AND b.user_uuid = ?`).get(req.params.id, authReq.userUuid));
  audit.log('BOOKMARK_ARCHIVED', { actor: authReq.userUuid, actor_type: authReq.keyType, action: 'update', outcome: 'success', resource: 'bookmark', details: { bookmark_id: req.params.id, archived: !!newArchived } });
  res.json({ success: true, data: result });
};
