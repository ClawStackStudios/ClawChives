import { ExportData, ExportFormatter } from "../types";

export const NetscapeHTMLFormatter: ExportFormatter = {
  id: "html",
  label: "Netscape HTML (Browser Bookmarks)",
  extension: "html",
  format: async (data: ExportData): Promise<string> => {
    const date = Math.floor(Date.now() / 1000);
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

    // Group bookmarks by folder if possible, otherwise flat
    const folders = data.folders || [];
    const bookmarks = data.bookmarks || [];

    // Map bookmarks to folders
    const folderMap = new Map<string, any[]>();
    const rootBookmarks: any[] = [];

    bookmarks.forEach(b => {
      if (b.podId) {
        if (!folderMap.has(b.podId)) folderMap.set(b.podId, []);
        folderMap.get(b.podId)?.push(b);
      } else {
        rootBookmarks.push(b);
      }
    });

    // Write folders
    folders.forEach(f => {
      const folderBookmarks = folderMap.get(f.id) || [];
      html += `    <DT><H3 ADD_DATE="${date}" LAST_MODIFIED="${date}">${f.name}</H3>\n    <DL><p>\n`;
      folderBookmarks.forEach(b => {
        html += `        <DT><A HREF="${b.url}" ADD_DATE="${date}">${b.title || b.url}</A>\n`;
      });
      html += `    </DL><p>\n`;
    });

    // Write root bookmarks
    rootBookmarks.forEach(b => {
      html += `    <DT><A HREF="${b.url}" ADD_DATE="${date}">${b.title || b.url}</A>\n`;
    });

    html += `</DL><p>`;
    return html;
  },
};
