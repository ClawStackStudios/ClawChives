import { ExportData, ExportFormatter, ClawChivesExport } from "../types";

export const ClawChivesJSONFormatter: ExportFormatter = {
  id: "json",
  label: "ClawChives JSON",
  extension: "json",
  format: async (data: ExportData): Promise<string> => {
    const exportData: ClawChivesExport = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      branding: {
        name: "ClawChives",
        version: "1.0.0",
        url: "https://clawchives.com",
        tagline: "Your Sovereign Bookmark Library",
      },
      metadata: {
        totalBookmarks: data.bookmarks.length,
        totalFolders: data.folders.length,
        totalSettings: data.settings.length,
        encrypted: false, // Encryption handled by hub
        checksum: btoa(JSON.stringify(data).slice(0, 100)),
      },
      data: {
        bookmarks: data.bookmarks,
        folders: data.folders,
        settings: data.settings,
      },
    };
    return JSON.stringify(exportData, null, 2);
  },
};
