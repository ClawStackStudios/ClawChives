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
  format: "json" | "html" | "csv" | "md" | "pdf",
  theme: "light" | "dark" = "dark"
) => {
  const bookmarks = await db.getBookmarks();
  const folders = await db.getFolders();
  const pinnedFolder = folders.find((f: any) => f.name === "Pinned");
  const pinnedFolderId = pinnedFolder?.id;

  let content = "";
  let filename = "";
  let mimeType = "";

  // Statistics calculation
  const totalPinchmarks = bookmarks.length;
  const uniqueTags = new Set<string>();
  let totalStarred = 0;
  let totalPinned = 0;
  let totalArchived = 0;

  bookmarks.forEach((b: any) => {
    if (b.tags && Array.isArray(b.tags)) {
      b.tags.forEach((t: string) => uniqueTags.add(t));
    }
    if (b.starred) totalStarred++;
    if (b.archived) totalArchived++;
    if (pinnedFolderId && b.folderId === pinnedFolderId) totalPinned++;
  });

  const metadata = {
    "Exported By": "ClawChives",
    Date: new Date().toISOString(),
    "Total Pinchmarks": totalPinchmarks,
    "Total Tags": uniqueTags.size,
    "Total Starred": totalStarred,
    "Total Pinned": totalPinned,
    "Total Archived": totalArchived,
  };

  if (format === "json") {
    const payload = {
      _metadata: metadata,
      pinchmarks: bookmarks.map((b: any) => ({
        url: b.url,
        title: b.title,
        description: b.description,
        favicon: b.favicon,
        tags: b.tags,
        folderId: b.folderId,
        starred: b.starred,
        pinned: pinnedFolderId ? b.folderId === pinnedFolderId : false,
        archived: b.archived,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }))
    };
    content = JSON.stringify(payload, null, 2);
    filename = "clawchives_bookmarks.json";
    mimeType = "application/json";
  } else if (format === "md") {
    const yamlLines = [
      "---",
      `Exported By: ${metadata["Exported By"]}`,
      `Date: ${metadata.Date}`,
      `Total Pinchmarks: ${metadata["Total Pinchmarks"]}`,
      `Total Tags: ${metadata["Total Tags"]}`,
      `Total Starred: ${metadata["Total Starred"]}`,
      `Total Pinned: ${metadata["Total Pinned"]}`,
      `Total Archived: ${metadata["Total Archived"]}`,
      "---"
    ];
    
    const entryLines = bookmarks.map((b: any) => {
      const isPinned = pinnedFolderId ? b.folderId === pinnedFolderId : false;
      const statuses = [];
      if (b.starred) statuses.push("Starred");
      if (isPinned) statuses.push("Pinned");
      if (b.archived) statuses.push("Archived");
      
      const statusStr = statuses.length > 0 ? statuses.join(", ") : "None";
      const tagsStr = b.tags && b.tags.length > 0 ? b.tags.join(", ") : "None";
      
      return `## ${b.title || b.url}\n> ${b.url}\n>\n> Tags: ${tagsStr}\n>\n> Status: ${statusStr}\n`;
    });
    
    content = [yamlLines.join("\n"), ...entryLines].join("\n\n");
    filename = "clawchives_bookmarks.md";
    mimeType = "text/markdown";
  } else if (format === "pdf") {
    const htmlEscape = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    
    const entryHtml = bookmarks.map((b: any) => {
      const isPinned = pinnedFolderId ? b.folderId === pinnedFolderId : false;
      const statuses = [];
      if (b.starred) statuses.push("Starred");
      if (isPinned) statuses.push("Pinned");
      if (b.archived) statuses.push("Archived");
      
      const statusStr = statuses.length > 0 ? statuses.join(", ") : "None";
      const tagsStr = b.tags && b.tags.length > 0 ? b.tags.join(", ") : "None";
      
      return `
        <div class="pinchmark">
          <h2>${htmlEscape(b.title || b.url)}</h2>
          <blockquote>
            <p class="url">${htmlEscape(b.url)}</p>
            <p class="meta"><strong>Tags:</strong> ${htmlEscape(tagsStr)}</p>
            <p class="meta"><strong>Status:</strong> ${htmlEscape(statusStr)}</p>
          </blockquote>
        </div>
      `;
    }).join("");

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ClawChives Sovereign Archive</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; color: #334155; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
          .header { border-bottom: 2px solid #06b6d4; padding-bottom: 1.5rem; margin-bottom: 2rem; }
          .header h1 { color: #0891b2; margin: 0 0 1rem 0; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 900; }
          .stats { font-size: 0.875rem; color: #64748b; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
          .stats strong { color: #475569; }
          .pinchmark { margin-bottom: 2.5rem; page-break-inside: avoid; }
          .pinchmark h2 { color: #0f172a; font-size: 1.25rem; margin: 0 0 0.75rem 0; font-weight: 800; }
          blockquote { margin: 0; padding: 1.25rem; background-color: #f8fafc; border-left: 4px solid #06b6d4; border-radius: 0 0.5rem 0.5rem 0; }
          .url { margin: 0 0 1rem 0; color: #0284c7; font-family: ui-monospace, monospace; font-size: 0.875rem; word-break: break-all; }
          .meta { margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #475569; }
          .meta:last-child { margin-bottom: 0; }
          @media print {
            body { padding: 0; max-width: 100%; }
            .pinchmark { page-break-inside: avoid; }
            .stats { border: 1px solid #cbd5e1; background: transparent; }
            blockquote { border-left: 4px solid #06b6d4 !important; background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ClawChives Archive</h1>
          <div class="stats">
            <div><strong>Exported By:</strong> ${htmlEscape(metadata["Exported By"] as string)}</div>
            <div><strong>Date:</strong> ${htmlEscape(metadata.Date as string)}</div>
            <div><strong>Total Pinchmarks:</strong> ${metadata["Total Pinchmarks"]}</div>
            <div><strong>Total Tags:</strong> ${metadata["Total Tags"]}</div>
            <div><strong>Starred:</strong> ${metadata["Total Starred"]}</div>
            <div><strong>Pinned:</strong> ${metadata["Total Pinned"]}</div>
          </div>
        </div>
        ${entryHtml}
        
        <div style="margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #64748b; font-weight: 600;">
          <div>ClawStack Studios©™</div>
          <div style="text-transform: uppercase; letter-spacing: 0.1em; color: #0891b2;">ClawChives Pinchmarks</div>
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([printContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    
    // We return early because the native print dialog handles the "save as PDF" action.
    // The printWindow will handle its own lifecycle.
    return;
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
    
    const entryHtml = bookmarks.map((b: any) => {
      const isPinned = pinnedFolderId ? b.folderId === pinnedFolderId : false;
      const statuses = [];
      if (b.starred) statuses.push("Starred");
      if (isPinned) statuses.push("Pinned");
      if (b.archived) statuses.push("Archived");
      
      const statusStr = statuses.length > 0 ? statuses.join(", ") : "None";
      const tagsStr = b.tags && b.tags.length > 0 ? b.tags.join(", ") : "None";
      
      return `
        <div class="pinchmark">
          <h2>${htmlEscape(b.title || b.url)}</h2>
          <blockquote>
            <p class="url"><a href="${htmlEscape(b.url)}" target="_blank" rel="noopener noreferrer">${htmlEscape(b.url)}</a></p>
            <p class="meta"><strong>Tags:</strong> ${htmlEscape(tagsStr)}</p>
            <p class="meta"><strong>Status:</strong> ${htmlEscape(statusStr)}</p>
          </blockquote>
        </div>
      `;
    }).join("");

    const isDark = theme === "dark";
    const bgBody = isDark ? "#0f172a" : "#ffffff";
    const textBody = isDark ? "#cbd5e1" : "#334155";
    const bgBlockquote = isDark ? "#1e293b" : "#f8fafc";
    const titleColor = isDark ? "#f8fafc" : "#0f172a";
    const urlColor = isDark ? "#38bdf8" : "#0284c7";
    const metaColor = isDark ? "#94a3b8" : "#475569";
    const headerBorder = isDark ? "#0891b2" : "#06b6d4";
    const statsBg = isDark ? "#1e293b" : "#f8fafc";
    const statsBorder = isDark ? "#334155" : "#e2e8f0";

    const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`;

    content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ClawChives Sovereign Archive</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background-color: ${bgBody}; color: ${textBody}; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 2rem; padding-bottom: 6rem; min-height: 100vh; position: relative; }
    .header { border-bottom: 2px solid ${headerBorder}; padding-bottom: 1.5rem; margin-bottom: 2rem; }
    .header h1 { color: ${headerBorder}; margin: 0 0 1rem 0; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 900; }
    .stats { font-size: 0.875rem; color: ${metaColor}; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; background: ${statsBg}; padding: 1rem; border-radius: 0.5rem; border: 1px solid ${statsBorder}; }
    .stats strong { color: ${textBody}; }
    .pinchmark { margin-bottom: 2.5rem; }
    .pinchmark h2 { color: ${titleColor}; font-size: 1.25rem; margin: 0 0 0.75rem 0; font-weight: 800; }
    blockquote { margin: 0; padding: 1.25rem; background-color: ${bgBlockquote}; border-left: 4px solid ${headerBorder}; border-radius: 0 0.5rem 0.5rem 0; }
    .url { margin: 0 0 1rem 0; font-family: ui-monospace, monospace; font-size: 0.875rem; word-break: break-all; }
    .url a { color: ${urlColor}; text-decoration: none; }
    .url a:hover { text-decoration: underline; }
    .meta { margin: 0 0 0.5rem 0; font-size: 0.875rem; color: ${metaColor}; }
    .meta:last-child { margin-bottom: 0; }
    
    /* Footer */
    .footer { 
      position: absolute; bottom: 0; left: 0; right: 0; 
      padding: 1.5rem 2rem; border-top: 1px solid ${statsBorder}; 
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.875rem; color: ${metaColor}; font-weight: 600;
      background-color: ${bgBody};
    }
    .github-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1rem; background-color: ${textBody}; color: ${bgBody};
      border-radius: 0.5rem; text-decoration: none; font-weight: 700;
      transition: opacity 0.2s; position: relative;
    }
    .github-btn:hover { opacity: 0.9; }
    
    /* Tooltip */
    .github-btn::after {
      content: "Star Us!";
      position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
      background: ${headerBorder}; color: #fff; padding: 0.25rem 0.5rem;
      border-radius: 0.25rem; font-size: 0.75rem; opacity: 0;
      pointer-events: none; transition: opacity 0.2s;
      white-space: nowrap; font-weight: 900; text-transform: uppercase;
    }
    .github-btn:hover::after { opacity: 1; }
    
    @media (max-width: 640px) {
      .footer { flex-direction: column; gap: 1rem; text-align: center; position: static; margin-top: 2rem; }
      body { padding-bottom: 2rem; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ClawChives Archive</h1>
    <div class="stats">
      <div><strong>Exported By:</strong> ${htmlEscape(metadata["Exported By"] as string)}</div>
      <div><strong>Date:</strong> ${htmlEscape(metadata.Date as string)}</div>
      <div><strong>Total Pinchmarks:</strong> ${metadata["Total Pinchmarks"]}</div>
      <div><strong>Total Tags:</strong> ${metadata["Total Tags"]}</div>
      <div><strong>Starred:</strong> ${metadata["Total Starred"]}</div>
      <div><strong>Pinned:</strong> ${metadata["Total Pinned"]}</div>
    </div>
  </div>
  
  <div class="entries">
    ${entryHtml}
  </div>
  
  <div class="footer">
    <div>ClawStack Studios©™ 2026</div>
    <div style="text-transform: uppercase; letter-spacing: 0.1em; color: ${headerBorder};">ClawChives Pinchmarks</div>
    <a href="https://github.com/ClawStackStudios/ClawChives" target="_blank" rel="noopener noreferrer" class="github-btn">
      ${githubIcon}
      GitHub
    </a>
  </div>
</body>
</html>`;
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
