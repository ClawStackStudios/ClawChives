import { generateUUID } from '@/shared/lib/crypto';

/**
 * Validates and imports bookmarks from a JSON array.
 */
export const importBookmarksFromJson = async (
  db: any,
  jsonText: string
): Promise<{ success: boolean; message: string; count?: number }> => {
  try {
    const data = JSON.parse(jsonText);

    if (!Array.isArray(data)) {
      throw new Error("Invalid file format: Expected an array of bookmarks.");
    }

    let count = 0;
    for (const bookmark of data) {
      await db.saveBookmark({
        url: bookmark.url,
        title: bookmark.title || bookmark.url,
        description: bookmark.description || "",
        favicon: bookmark.favicon || "",
        tags: bookmark.tags || [],
        folderId: bookmark.folderId,
        starred: bookmark.starred || false,
        archived: bookmark.archived || false,
        createdAt: bookmark.createdAt || new Date().toISOString(),
        id: generateUUID(),
        updatedAt: new Date().toISOString(),
      });
      count++;
    }

    return {
      success: true,
      message: "Import completed successfully!",
      count,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Import failed",
    };
  }
};

/**
 * Generates and downloads a file of the specified format.
 */
export const exportBookmarks = async (
  db: any,
  format: "json" | "html" | "csv"
) => {
  const bookmarks = await db.getBookmarks();

  let content = "";
  let filename = "";
  let mimeType = "";

  if (format === "json") {
    content = JSON.stringify(bookmarks, null, 2);
    filename = "clawchives_bookmarks.json";
    mimeType = "application/json";
  } else if (format === "csv") {
    const csvEscape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const headers = ["Title", "URL", "Description", "Tags", "Starred", "Archived", "Created"];
    const rows = bookmarks.map((b: any) => [
      csvEscape(b.title),
      csvEscape(b.url),
      csvEscape(b.description),
      csvEscape(b.tags.join(", ")),
      b.starred,
      b.archived,
      b.createdAt,
    ]);
    content = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    filename = "clawchives_bookmarks.csv";
    mimeType = "text/csv";
  } else if (format === "html") {
    const htmlEscape = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    content = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${bookmarks.map((b: any) => `  <DT><A HREF="${htmlEscape(b.url)}" ADD_DATE="${new Date(b.createdAt || "").getTime() / 1000}">${htmlEscape(b.title)}</A>`).join("\n")}
</DL><p>`;
    filename = "clawchives_bookmarks.html";
    mimeType = "text/html";
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
