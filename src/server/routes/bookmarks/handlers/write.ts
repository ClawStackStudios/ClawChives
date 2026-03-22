import { Response } from 'express';
import db from '../../../database/index.js';
import { AuthRequest } from '../../../middleware/auth.js';
import { parseBookmark } from '../../../utils/parsers.js';
import { createAuditLogger } from '../../../utils/auditLogger.js';
import { insertBookmark, BOOKMARK_SELECT } from '../utils.js';

const audit = createAuditLogger(db);

/** POST /api/bookmarks */
export const createBookmark = (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const result = insertBookmark(authReq, req.body);
  if ('error' in result) {
    return res.status(result.status).json({ success: false, error: result.error });
  }
  res.status(201).json({ success: true, data: result.bookmark });
};

/** PUT /api/bookmarks/:id */
export const updateBookmark = (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const row = db.prepare(`${BOOKMARK_SELECT} WHERE b.id = ? AND b.user_uuid = ?`).get(req.params.id, authReq.userUuid) as any;
  if (!row) return res.status(404).json({ success: false, error: 'Bookmark not found' });

  if (req.body.jinaUrl !== undefined && authReq.keyType !== 'human') {
    return res.status(403).json({ success: false, error: 'Agent keys cannot set r.jina.ai conversion. Only human users can manage jinaUrl.' });
  }

  const updated = {
    url:         req.body.url         ?? row.url,
    title:       req.body.title       ?? row.title,
    description: req.body.description ?? row.description,
    favicon:     req.body.favicon     ?? row.favicon,
    tags:        JSON.stringify(req.body.tags ?? JSON.parse(row.tags)),
    folder_id:   req.body.folderId    !== undefined ? req.body.folderId : row.folder_id,
    starred:     req.body.starred     !== undefined ? (req.body.starred ? 1 : 0) : row.starred,
    archived:    req.body.archived    !== undefined ? (req.body.archived ? 1 : 0) : row.archived,
    color:       req.body.color       !== undefined ? req.body.color : row.color,
    updated_at:  new Date().toISOString(),
    id:          req.params.id,
    user_uuid:   authReq.userUuid,
  };

  const doUpdate = db.transaction((updatedData: any, jinaUrl: string | null | undefined) => {
    db.prepare('UPDATE bookmarks SET url=@url, title=@title, description=@description, favicon=@favicon, tags=@tags, folder_id=@folder_id, starred=@starred, archived=@archived, color=@color, updated_at=@updated_at WHERE id=@id AND user_uuid=@user_uuid').run(updatedData);
    if (jinaUrl === null) {
      db.prepare('DELETE FROM jina_conversions WHERE bookmark_id = ? AND user_uuid = ?').run(updatedData.id, updatedData.user_uuid);
    } else if (jinaUrl !== undefined) {
      db.prepare('INSERT INTO jina_conversions (bookmark_id, user_uuid, url, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(bookmark_id) DO UPDATE SET url=excluded.url, created_at=excluded.created_at').run(updatedData.id, updatedData.user_uuid, jinaUrl, new Date().toISOString());
    }
  });

  doUpdate(updated, req.body.jinaUrl);
  audit.log('BOOKMARK_UPDATED', { actor: authReq.userUuid, actor_type: authReq.keyType, action: 'update', outcome: 'success', resource: 'bookmark', details: { bookmark_id: req.params.id } });
  res.json({ success: true, data: parseBookmark(db.prepare(`${BOOKMARK_SELECT} WHERE b.id = ? AND b.user_uuid = ?`).get(req.params.id, authReq.userUuid)) });
};

/** DELETE /api/bookmarks/:id */
export const deleteBookmark = (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const info = db.prepare('DELETE FROM bookmarks WHERE id = ? AND user_uuid = ?').run(req.params.id, authReq.userUuid);
  if (info.changes === 0) return res.status(404).json({ success: false, error: 'Bookmark not found' });
  audit.log('BOOKMARK_DELETED', { actor: authReq.userUuid, actor_type: authReq.keyType, action: 'delete', outcome: 'success', resource: 'bookmark', details: { bookmark_id: req.params.id } });
  res.json({ success: true });
};

/** DELETE /api/bookmarks (purge all) */
export const purgeBookmarks = (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const info = db.prepare('DELETE FROM bookmarks WHERE user_uuid = ?').run(authReq.userUuid);
  audit.log('BOOKMARKS_PURGED', { actor: authReq.userUuid, actor_type: authReq.keyType, action: 'delete', outcome: 'success', resource: 'bookmark', details: { count: info.changes } });
  res.json({ success: true, count: info.changes });
};
