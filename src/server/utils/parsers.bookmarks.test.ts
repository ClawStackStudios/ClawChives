import { describe, it, expect } from 'vitest';
import { parseBookmark } from './parsers';

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
    expect(() => parseBookmark(row)).toThrow();
  });

  it('should handle non-boolean starred/archived values', () => {
    const row = { starred: 2, archived: 'yes' };
    const result = parseBookmark(row);
    expect(typeof result.starred).toBe('boolean');
    expect(typeof result.archived).toBe('boolean');
    expect(result.starred).toBe(true);
    expect(result.archived).toBe(true);
  });

  it('should handle undefined vs null for optional fields', () => {
    const row = { folder_id: null, jina_url: undefined, starred: 0, archived: 0 };
    const result = parseBookmark(row);
    expect(result.folderId).toBeNull();
    expect(result.jinaUrl).toBeUndefined();
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
    expect(result.folder_id).toBeUndefined();
    expect(result.jina_url).toBeUndefined();
    expect(result.created_at).toBeUndefined();
    expect(result.updated_at).toBeUndefined();
    expect(result.user_uuid).toBeUndefined();
  });
});
