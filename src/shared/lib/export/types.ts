export interface ExportData {
  bookmarks: any[];
  folders: any[];
  settings: any[];
}

export interface ExportResult {
  blob: Blob;
  filename: string;
}

export interface ExportFormatter {
  id: string;
  label: string;
  extension: string;
  format: (data: ExportData) => Promise<string>;
}

export interface ClawChivesExport {
  version: string;
  exportedAt: string;
  branding: {
    name: string;
    version: string;
    url: string;
    tagline: string;
  };
  metadata: {
    totalBookmarks: number;
    totalFolders: number;
    totalSettings: number;
    encrypted: boolean;
    checksum: string;
  };
  data: {
    bookmarks: any[];
    folders: any[];
    settings: any[];
  };
  encryptedData?: string;
}
