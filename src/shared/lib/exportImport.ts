import { processExport, downloadExport, getAvailableFormats } from "./export/exportHub";
import { decryptData } from "./crypto";
import { ClawChivesExport } from "./export/types";

export * from "./export/types";

export async function exportToClawChivesJSON(
  bookmarks: any[],
  folders: any[],
  settings: any[],
  password?: string
): Promise<Blob> {
  const result = await processExport("json", { bookmarks, folders, settings }, password);
  return result.blob;
}

export async function importFromClawChivesJSON(
  file: File,
  password?: string
): Promise<ClawChivesExport> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (parsed.metadata?.encrypted && parsed.encryptedData) {
    if (!password) {
      throw new Error("This export is password protected. Please provide a password.");
    }
    try {
      const decrypted = await decryptData(parsed.encryptedData, password);
      const decryptedData = JSON.parse(decrypted);
      return {
        ...parsed,
        data: decryptedData.data,
        encryptedData: undefined,
      };
    } catch (e) {
      throw new Error("Invalid password or corrupted file.");
    }
  }

  return parsed;
}

export async function exportToBackup(
  bookmarks: any[],
  folders: any[],
  settings: any[],
  password?: string
): Promise<Blob> {
  return exportToClawChivesJSON(bookmarks, folders, settings, password);
}

export async function importFromBackup(file: File, password?: string): Promise<ClawChivesExport> {
  return await importFromClawChivesJSON(file, password);
}

// Helper to bridge to the new hub
export { processExport, downloadExport, getAvailableFormats };