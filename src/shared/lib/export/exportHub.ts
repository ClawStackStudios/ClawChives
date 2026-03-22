import { ExportData, ExportFormatter, ExportResult } from "./types";
import { ClawChivesJSONFormatter } from "./formatters/ClawChivesJSON";
import { NetscapeHTMLFormatter } from "./formatters/NetscapeHTML";
import { CSVFormatter } from "./formatters/CSVFormatter";
import { encryptData } from "../crypto";

const formatters: ExportFormatter[] = [
  ClawChivesJSONFormatter,
  NetscapeHTMLFormatter,
  CSVFormatter,
];

export function getAvailableFormats() {
  return formatters.map(f => ({ id: f.id, label: f.label }));
}

export async function processExport(
  formatId: string,
  data: ExportData,
  password?: string
): Promise<ExportResult> {
  const formatter = formatters.find(f => f.id === formatId);
  if (!formatter) {
    throw new Error(`Unsupported export format: ${formatId}`);
  }

  let content = await formatter.format(data);
  let finalExtension = formatter.extension;

  // Encryption is only supported for JSON format in this version
  if (password && formatId === "json") {
    content = await encryptData(content, password);
    // Wrap the encrypted content back into a JSON-like structure or just raw blob?
    // According to original logic, it wraps it in a ClawChivesExport with encryptedData
    // We'll let the JSON formatter handle the base structure, then we encrypt its output.
    // Wait, the original logic encrypted the WHOLE json string.
    
    const exportData = JSON.parse(content);
    const protectedExport = {
      ...exportData,
      metadata: {
        ...exportData.metadata,
        encrypted: true,
      },
      data: null,
      encryptedData: content,
    };
    content = JSON.stringify(protectedExport, null, 2);
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `clawchives_export_${timestamp}.${finalExtension}`;

  return {
    blob: new Blob([content], { type: getMimeType(finalExtension) }),
    filename,
  };
}

function getMimeType(extension: string): string {
  switch (extension) {
    case "json": return "application/json";
    case "html": return "text/html";
    case "csv": return "text/csv";
    default: return "application/octet-stream";
  }
}

export function downloadExport(result: ExportResult) {
  const url = URL.createObjectURL(result.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
