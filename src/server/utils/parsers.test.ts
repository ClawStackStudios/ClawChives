import { describe, it, expect } from 'vitest';
import { parseBookmark, parseFolder, parseAgentKey } from './parsers';

describe('parsers', () => {
  describe('parseBookmark', () => {
    it('should return null if row is null', () => {
      expect(parseBookmark(null)).toBeNull();
    });

    it('should parse tags and convert fields to camelCase', () => {
      const row = {
        id: 1,
        title: 'Test Bookmark',
        tags: '["tag1", "tag2"]',
        starred: 1,
        archived: 0,
        folder_id: 10,
        jina_url: 'http://jina.url',
        created_at: '2023-01-01',
        updated_at: '2023-01-02',
        user_uuid: 'user-123'
      };

      const result = parseBookmark(row);

      expect(result).toEqual({
        id: 1,
        title: 'Test Bookmark',
        tags: ['tag1', 'tag2'],
        starred: true,
        archived: false,
        folderId: 10,
        jinaUrl: 'http://jina.url',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
        folder_id: undefined,
        jina_url: undefined,
        jina_conversion_url: undefined,
        created_at: undefined,
        updated_at: undefined,
        user_uuid: undefined,
      });
    });

    it('should default tags to empty array if missing', () => {
      const row = { starred: 0, archived: 0 };
      const result = parseBookmark(row);
      expect(result.tags).toEqual([]);
    });

    it('should prioritize jina_conversion_url over jina_url', () => {
      const row = {
        jina_url: 'http://jina.url',
        jina_conversion_url: 'http://jina.conversion.url',
        starred: 0,
        archived: 0
      };
      const result = parseBookmark(row);
      expect(result.jinaUrl).toBe('http://jina.conversion.url');
    });

    it('should use jina_url if jina_conversion_url is missing', () => {
      const row = {
        jina_url: 'http://jina.url',
        starred: 0,
        archived: 0
      };
      const result = parseBookmark(row);
      expect(result.jinaUrl).toBe('http://jina.url');
    });

    it('should throw on invalid JSON in tags field', () => {
      const row = {
        tags: 'not valid json',
        starred: 0,
        archived: 0
      };
      // Parser uses JSON.parse() without try-catch, so it WILL throw
      expect(() => parseBookmark(row)).toThrow();
    });

    it('should handle non-boolean starred/archived values', () => {
      const row = {
        starred: 2,
        archived: 'yes'
      };
      const result = parseBookmark(row);
      // Non-standard values are coerced to boolean via Boolean()
      expect(typeof result.starred).toBe('boolean');
      expect(typeof result.archived).toBe('boolean');
      expect(result.starred).toBe(true); // 2 coerces to true
      expect(result.archived).toBe(true); // 'yes' coerces to true
    });

    it('should handle undefined vs null for optional fields', () => {
      const row = {
        folder_id: null,
        jina_url: undefined,
        starred: 0,
        archived: 0
      };
      const result = parseBookmark(row);
      expect(result.folderId).toBeNull();
      expect(result.jinaUrl).toBeUndefined();
    });

    it('should preserve extra/unexpected fields from row', () => {
      // NOTE: Parser spreads entire row, so unexpected fields ARE included
      const row = {
        id: 1,
        title: 'Test',
        starred: 0,
        archived: 0,
        unexpected_field: 'should appear',
        another_extra: 123
      };
      const result = parseBookmark(row);
      // Extra fields are preserved due to ...row spread
      expect(result.unexpected_field).toBe('should appear');
      expect(result.another_extra).toBe(123);
    });

    it('should set explicit snake_case dupes to undefined', () => {
      const row = {
        id: 1,
        title: 'Test',
        tags: '[]',
        starred: 0,
        archived: 0,
        folder_id: 10,
        jina_url: 'http://test.com',
        created_at: '2023-01-01',
        updated_at: '2023-01-02',
        user_uuid: 'user-123'
      };
      const result = parseBookmark(row);
      // Known snake_case fields are explicitly set to undefined
      expect(result.folder_id).toBeUndefined();
      expect(result.jina_url).toBeUndefined();
      expect(result.created_at).toBeUndefined();
      expect(result.updated_at).toBeUndefined();
      expect(result.user_uuid).toBeUndefined();
    });
  });

  describe('parseFolder', () => {
    it('should return null if row is null', () => {
      expect(parseFolder(null)).toBeNull();
    });

    it('should convert fields to camelCase and remove snake_case dupes', () => {
      const row = {
        id: 1,
        name: 'Test Folder',
        parent_id: 5,
        created_at: '2023-01-01',
        user_uuid: 'user-123'
      };

      const result = parseFolder(row);

      expect(result).toEqual({
        id: 1,
        name: 'Test Folder',
        parentId: 5,
        createdAt: '2023-01-01',
        parent_id: undefined,
        created_at: undefined,
        user_uuid: undefined,
      });
    });

    it('should handle null parent_id', () => {
      const row = {
        id: 1,
        name: 'Root Folder',
        parent_id: null,
        created_at: '2023-01-01'
      };
      const result = parseFolder(row);
      expect(result.parentId).toBeNull();
    });

    it('should handle missing name field', () => {
      const row = {
        id: 1,
        parent_id: 5,
        created_at: '2023-01-01'
      };
      const result = parseFolder(row);
      expect(result.name).toBeUndefined();
    });

    it('should preserve extra/unexpected fields from row', () => {
      const row = {
        id: 1,
        name: 'Test',
        parent_id: null,
        created_at: '2023-01-01',
        user_uuid: 'user-123',
        extra_data: 'preserved'
      };
      const result = parseFolder(row);
      // Extra fields are preserved due to ...row spread
      expect(result.extra_data).toBe('preserved');
    });
  });

  describe('parseAgentKey', () => {
    it('should return null if row is null', () => {
      expect(parseAgentKey(null)).toBeNull();
    });

    it('should parse permissions and convert fields to camelCase', () => {
      const row = {
        id: 1,
        permissions: '{"read": true}',
        is_active: 1,
        expiration_type: 'never',
        expiration_date: null,
        rate_limit: 100,
        created_at: '2023-01-01',
        last_used: '2023-01-05',
        api_key: 'lb-123',
        user_uuid: 'user-123'
      };

      const result = parseAgentKey(row);

      expect(result).toEqual({
        id: 1,
        permissions: { read: true },
        isActive: true,
        expirationType: 'never',
        expirationDate: null,
        rateLimit: 100,
        createdAt: '2023-01-01',
        lastUsed: '2023-01-05',
        apiKey: 'lb-123',
        is_active: undefined,
        expiration_type: undefined,
        expiration_date: undefined,
        rate_limit: undefined,
        created_at: undefined,
        last_used: undefined,
        user_uuid: undefined,
        api_key: undefined,
      });
    });

    it('should default permissions to empty object if missing', () => {
      const row = { is_active: 1 };
      const result = parseAgentKey(row);
      expect(result.permissions).toEqual({});
    });

    it('should throw on invalid JSON in permissions field', () => {
      const row = {
        permissions: 'not valid json',
        is_active: 1
      };
      // Parser uses JSON.parse() without try-catch, so it WILL throw
      expect(() => parseAgentKey(row)).toThrow();
    });

    it('should handle non-numeric is_active field', () => {
      const row = {
        is_active: 'yes',
        permissions: '{}'
      };
      const result = parseAgentKey(row);
      // Non-numeric should still be coerced to boolean
      expect(result.isActive).toBe(true); // 'yes' coerces to true
    });

    it('should handle non-numeric rate_limit field', () => {
      const row = {
        is_active: 1,
        rate_limit: 'unlimited',
        permissions: '{}'
      };
      const result = parseAgentKey(row);
      // rate_limit is passed through as-is
      expect(result.rateLimit).toBe('unlimited');
    });

    it('should handle null permissions as empty object', () => {
      const row = {
        permissions: null,
        is_active: 1
      };
      // null ?? '{}' results in empty object
      const result = parseAgentKey(row);
      expect(result.permissions).toEqual({});
    });

    it('should handle invalid expirationType values', () => {
      const row = {
        is_active: 1,
        expiration_type: 'invalid_type',
        permissions: '{}'
      };
      const result = parseAgentKey(row);
      expect(result.expirationType).toBe('invalid_type');
    });

    it('should preserve extra/unexpected fields from row', () => {
      const row = {
        id: 1,
        permissions: '{}',
        is_active: 1,
        custom_field: 'preserved'
      };
      const result = parseAgentKey(row);
      expect(result.custom_field).toBe('preserved');
    });

    it('should handle missing is_active field', () => {
      const row = {
        id: 1,
        permissions: '{}'
      };
      const result = parseAgentKey(row);
      expect(result.isActive).toBe(false); // Boolean(undefined) = false
    });

    it('should handle undefined vs null for optional fields', () => {
      const row = {
        is_active: 1,
        rate_limit: null,
        expirationDate: undefined,
        permissions: '{}'
      };
      const result = parseAgentKey(row);
      expect(result.rateLimit).toBeNull();
    });
  });
});
