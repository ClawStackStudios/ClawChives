import { describe, it, expect } from 'vitest';
import { parseFolder } from './parsers';

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
    const row = { id: 1, name: 'Root Folder', parent_id: null, created_at: '2023-01-01' };
    const result = parseFolder(row);
    expect(result.parentId).toBeNull();
  });

  it('should preserve extra fields', () => {
    const row = { id: 1, name: 'Test', parent_id: null, created_at: '2023-01-01', extra: 'data' };
    const result = parseFolder(row);
    expect(result.extra).toBe('data');
  });
});
