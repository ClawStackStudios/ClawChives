import { ExportData, ExportFormatter } from "../types";

export const CSVFormatter: ExportFormatter = {
  id: "csv",
  label: "CSV Spreadsheet",
  extension: "csv",
  format: async (data: ExportData): Promise<string> => {
    const headers = ["Title", "URL", "Folder", "Tags", "Date Added"];
    const rows = (data.bookmarks || []).map(b => {
      const folder = data.folders?.find(f => f.id === b.podId)?.name || "";
      const tags = (b.tags || []).join(", ");
      const date = b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "";
      
      // Escape CSV values
      return [
        `"${(b.title || "").replace(/"/g, '""')}"`,
        `"${(b.url || "").replace(/"/g, '""')}"`,
        `"${folder.replace(/"/g, '""')}"`,
        `"${tags.replace(/"/g, '""')}"`,
        `"${date}"`
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  },
};
