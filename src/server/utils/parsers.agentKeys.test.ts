import { describe, it, expect } from 'vitest';
import { parseAgentKey } from './parsers';

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

  it('should handle missing fields', () => {
    const row = { is_active: 1 };
    const result = parseAgentKey(row);
    expect(result.permissions).toEqual({});
    expect(result.isActive).toBe(true);
  });

  it('should throw on invalid JSON', () => {
    const row = { permissions: 'not valid json', is_active: 1 };
    expect(() => parseAgentKey(row)).toThrow();
  });
});
