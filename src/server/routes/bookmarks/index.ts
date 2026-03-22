import { Router } from 'express';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { BookmarkSchemas } from '../../validation/schemas.js';
import * as read from './handlers/read.js';
import * as write from './handlers/write.js';
import * as bulk from './handlers/bulk.js';
import * as toggles from './handlers/toggles.js';

const router = Router();

// Read routes
router.get('/', requireAuth, requirePermission('canRead'), read.getBookmarks);
router.get('/folder-counts', requireAuth, requirePermission('canRead'), read.getFolderCounts);
router.get('/tags', requireAuth, requirePermission('canRead'), read.getTags);
router.get('/stats', requireAuth, requirePermission('canRead'), read.getStats);
router.get('/:id', requireAuth, requirePermission('canRead'), read.getBookmarkById);

// Write routes
router.post('/', requireAuth, requirePermission('canWrite'), validateBody(BookmarkSchemas.create), write.createBookmark);
router.put('/:id', requireAuth, requirePermission('canEdit'), validateBody(BookmarkSchemas.update), write.updateBookmark);
router.delete('/:id', requireAuth, requirePermission('canDelete'), write.deleteBookmark);
router.delete('/', requireAuth, requirePermission('canDelete'), write.purgeBookmarks);

// Specialized routes
router.post('/bulk', requireAuth, requirePermission('canWrite'), bulk.bulkImport);
router.patch('/:id/star', requireAuth, requirePermission('canEdit'), toggles.toggleStar);
router.patch('/:id/archive', requireAuth, requirePermission('canEdit'), toggles.toggleArchive);

export default router;
