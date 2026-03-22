import { AuthRequest } from '../../middleware/auth.js';
import { generateId } from '../../utils/crypto.js';
import dbInstance from '../../database/index.js';
import { createAuditLogger } from '../../utils/auditLogger.js';
import { parseBookmark } from '../../utils/parsers.js';

const db = dbInstance;
const audit = createAuditLogger(db);

export const BOOKMARK_SELECT = `
  SELECT b.*, jc.url as jina_conversion_url
  FROM bookmarks b
  LEFT JOIN jina_conversions jc
    ON b.id = jc.bookmark_id AND b.user_uuid = jc.user_uuid
`;

/** Helper: Insert a single bookmark with duplicate check, jinaUrl guard, and transaction */
export function insertBookmark(
  authReq: AuthRequest,
  input: Record<string, unknown> & { url: string; title: string; jinaUrl?: string | null }
): { bookmark: any } | { error: string; status: number } {
  // Duplicate URL check
  const existing = db.prepare('SELECT id, title FROM bookmarks WHERE url = ? AND user_uuid = ?').get(input.url, authReq.userUuid);
  if (existing) {
    return { error: `A bookmark for "${input.url}" already exists`, status: 409 };
  }

  // 🛡️ jinaUrl human-only field check
  if (input.jinaUrl !== undefined && authReq.keyType !== 'human') {
    return { error: 'Agent keys cannot create bookmarks with r.jina.ai conversion. Only human users can set jinaUrl.', status: 403 };
  }

  const now = new Date().toISOString();
  const bookmark = {
    id:          (input.id as string) ?? generateId(),
    user_uuid:   authReq.userUuid,
    url:         input.url,
    title:       input.title,
    description: (input.description as string) ?? '',
    favicon:     (input.favicon as string) ?? '',
    tags:        JSON.stringify((input.tags as string[]) ?? []),
    folder_id:   (input.folderId as string) ?? null,
    starred:     (input.starred as boolean) ? 1 : 0,
    archived:    (input.archived as boolean) ? 1 : 0,
    color:       (input.color as string) ?? null,
    created_at:  (input.createdAt as string) ?? now,
    updated_at:  now,
  };

  const doCreate = db.transaction((bookmarkData: any, jinaUrl: string | null) => {
    db.prepare('INSERT INTO bookmarks (id,user_uuid,url,title,description,favicon,tags,folder_id,starred,archived,color,created_at,updated_at) VALUES (@id,@user_uuid,@url,@title,@description,@favicon,@tags,@folder_id,@starred,@archived,@color,@created_at,@updated_at)').run(bookmarkData);
    if (jinaUrl) {
      db.prepare('INSERT INTO jina_conversions (bookmark_id, user_uuid, url, created_at) VALUES (?, ?, ?, ?)').run(bookmarkData.id, bookmarkData.user_uuid, jinaUrl, bookmarkData.created_at);
    }
  });

  doCreate(bookmark, (input.jinaUrl as string) ?? null);

  audit.log('BOOKMARK_CREATED', { actor: authReq.userUuid, actor_type: authReq.keyType, action: 'create', outcome: 'success', resource: 'bookmark', details: { bookmark_id: bookmark.id, title: bookmark.title } });

  if (input.jinaUrl && authReq.keyType === 'human') {
    audit.log('bookmark_jina_conversion_set', { actor: authReq.userUuid, actor_type: authReq.keyType, action: 'create', outcome: 'success', resource: 'bookmark', details: { bookmark_id: bookmark.id, jina_url: input.jinaUrl } });
  }

  // Fetch and return the created bookmark
  const created = db.prepare(`${BOOKMARK_SELECT} WHERE b.id = ? AND b.user_uuid = ?`).get(bookmark.id, authReq.userUuid);
  return { bookmark: parseBookmark(created) };
}
