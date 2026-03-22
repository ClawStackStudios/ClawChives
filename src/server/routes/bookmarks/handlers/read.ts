import { Response } from 'express';
import db from '../../../database/index.js';
import { AuthRequest } from '../../../middleware/auth.js';
import { parseBookmark } from '../../../utils/parsers.js';
import { BOOKMARK_SELECT } from '../utils.js';

/** GET /api/bookmarks */
export const getBookmarks = (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  let sql = `${BOOKMARK_SELECT} WHERE b.user_uuid = ?`;
  const params: unknown[] = [authReq.userUuid];

  if (req.query.starred === 'true')   { sql += ' AND b.starred = 1'; }
  if (req.query.archived === 'true')  { sql += ' AND b.archived = 1'; }
  if (req.query.folderId)             { sql += ' AND b.folder_id = ?'; params.push(req.query.folderId); }
  if (req.query.search) {
    const q = `%${req.query.search}%`;
    sql += ' AND (b.title LIKE ? OR b.url LIKE ? OR b.description LIKE ?)';
    params.push(q, q, q);
  }
  sql += ' ORDER BY b.created_at DESC';

  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 1000);
  const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows.map(parseBookmark) });
};

/** GET /api/bookmarks/folder-counts */
export const getFolderCounts = (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const rows = db.prepare(`
    SELECT folder_id, COUNT(*) as count
    FROM bookmarks
    WHERE user_uuid = ?
    GROUP BY folder_id
  `).all(authReq.userUuid) as Array<{ folder_id: string | null; count: number }>;

  const counts: Record<string, number> = {};
  rows.forEach(row => {
    if (row.folder_id) counts[row.folder_id] = row.count;
  });

  res.json({ success: true, data: counts });
};

/** GET /api/bookmarks/tags */
export const getTags = (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const rows = db.prepare(`
    SELECT DISTINCT json_each.value as tag
    FROM bookmarks, json_each(tags)
    WHERE user_uuid = ?
    ORDER BY tag ASC
  `).all(authReq.userUuid) as Array<{ tag: string }>;

  res.json({ success: true, data: rows.map(r => r.tag) });
};

/** GET /api/bookmarks/stats */
export const getStats = (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const row = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN starred = 1 THEN 1 ELSE 0 END) AS starred,
      SUM(CASE WHEN archived = 1 THEN 1 ELSE 0 END) AS archived
    FROM bookmarks
    WHERE user_uuid = ?
  `).get(authReq.userUuid) as { total: number; starred: number; archived: number };

  res.json({ success: true, data: { total: row.total, starred: row.starred, archived: row.archived } });
};

/** GET /api/bookmarks/:id */
export const getBookmarkById = (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const row = db.prepare(`${BOOKMARK_SELECT} WHERE b.id = ? AND b.user_uuid = ?`).get(req.params.id, authReq.userUuid);
  if (!row) return res.status(404).json({ success: false, error: 'Bookmark not found' });
  res.json({ success: true, data: parseBookmark(row) });
};
