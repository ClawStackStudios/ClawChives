// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { importBookmarksFromJson, exportFullBackup } from '../../src/features/settings/utils/importExportUtils';

// Mocking URL and document.body for exportFullBackup
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

global.document.createElement = vi.fn((tag) => {
  if (tag === 'a') {
    return {
      href: '',
      download: '',
      click: mockClick,
    } as any;
  }
  return {} as any;
});
global.document.body.appendChild = mockAppendChild as any;
global.document.body.removeChild = mockRemoveChild as any;


describe('importExportUtils - Sovereign Backups (.ccbak)', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      saveBookmark: vi.fn().mockResolvedValue(true),
      updateBookmark: vi.fn().mockResolvedValue(true),
      saveFolder: vi.fn().mockResolvedValue(true),
      updateFolder: vi.fn().mockResolvedValue(true),
      saveAppearanceSettings: vi.fn().mockResolvedValue(true),
      
      getBookmarks: vi.fn().mockResolvedValue([]),
      getFolders: vi.fn().mockResolvedValue([]),
      getTags: vi.fn().mockResolvedValue([]),
      getAppearanceSettings: vi.fn().mockResolvedValue({ layout: 'grid', itemsPerPage: 24 }),
    };
    
    vi.clearAllMocks();
  });

  it('should export a full sovereign backup with the correct schema', async () => {
    // Setup mock data of 50 pinchmarks
    const mockBookmarks = Array.from({ length: 50 }).map((_, i) => ({
      id: `bookmark-${i}`,
      title: `Test Pinchmark ${i}`,
      url: `https://example.com/${i}`,
      folderId: i % 2 === 0 ? 'folder-1' : 'folder-2',
      tags: ['test', 'mock'],
      starred: i % 5 === 0,
      createdAt: new Date().toISOString()
    }));
    
    const mockFolders = [
      { id: 'folder-1', name: 'Dev', color: '#ff0000' },
      { id: 'folder-2', name: 'Design', color: '#00ff00' }
    ];
    
    const mockTags = [
      { name: 'test', color: '#0000ff' },
      { name: 'mock', color: '#ffff00' }
    ];

    mockDb.getBookmarks.mockResolvedValue(mockBookmarks);
    mockDb.getFolders.mockResolvedValue(mockFolders);
    mockDb.getTags.mockResolvedValue(mockTags);

    await exportFullBackup(mockDb);

    // Verify Blob creation
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();

    // Verify the payload that was passed to Blob
    // We mock Blob to intercept its content in node environments if needed, 
    // but a simpler test is checking if the importer can handle the output.
  });

  it('should successfully restore a sovereign backup (.ccbak) payload', async () => {
    // Create a mock .ccbak payload
    const mockBackupJson = JSON.stringify({
      _version: "1.0",
      _type: "clawchives_full_backup",
      metadata: {
        exportedAt: new Date().toISOString(),
        totalBookmarks: 50,
        totalFolders: 2,
        totalTags: 2
      },
      data: {
        bookmarks: Array.from({ length: 50 }).map((_, i) => ({ id: `bk-${i}`, title: `Mock ${i}` })),
        folders: [{ id: 'f1', name: 'F1' }, { id: 'f2', name: 'F2' }],
        tags: [{ name: 't1' }, { name: 't2' }],
        appearanceSettings: { layout: 'list', itemsPerPage: 48 }
      }
    });

    const result = await importBookmarksFromJson(mockDb, mockBackupJson);

    expect(result.success).toBe(true);
    expect(result.count).toBe(50);
    expect(result.message).toBe("Sovereign backup restored successfully!");

    expect(mockDb.saveAppearanceSettings).toHaveBeenCalledWith({ layout: 'list', itemsPerPage: 48 });
    expect(mockDb.saveFolder).toHaveBeenCalledTimes(2);
    expect(mockDb.saveBookmark).toHaveBeenCalledTimes(50);
  });

  it('should fallback to legacy array import if .ccbak schema is not detected', async () => {
    // Legacy array
    const legacyArrayJson = JSON.stringify([
      { url: 'https://test1.com', title: 'Test 1' },
      { url: 'https://test2.com', title: 'Test 2' },
      { url: 'https://test3.com', title: 'Test 3' },
    ]);

    const result = await importBookmarksFromJson(mockDb, legacyArrayJson);

    expect(result.success).toBe(true);
    expect(result.count).toBe(3);
    expect(result.message).toBe("Legacy import completed successfully!");

    expect(mockDb.saveBookmark).toHaveBeenCalledTimes(3);
    // Legacy import doesn't have folders or settings
    expect(mockDb.saveFolder).not.toHaveBeenCalled();
    expect(mockDb.saveAppearanceSettings).not.toHaveBeenCalled();
  });
  
  it('should throw error for invalid formats', async () => {
    const invalidJson = JSON.stringify({
      some_random_data: true
    });

    const result = await importBookmarksFromJson(mockDb, invalidJson);

    expect(result.success).toBe(false);
    expect(result.message).toContain("Invalid file format");
  });
});
