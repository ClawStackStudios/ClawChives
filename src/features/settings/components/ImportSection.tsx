import { useState } from "react";
import { CheckCircle, Upload, FileText, Loader2 } from "lucide-react";
import { importBookmarksFromJson } from "../utils/importExportUtils";

interface ImportSectionProps {
  db: any;
}

export function ImportSection({ db }: ImportSectionProps) {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await importFile.text();
      const result = await importBookmarksFromJson(db, text);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : "Import failed",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-cyan-500/30 dark:border-cyan-500/50 shadow-sm transition-colors">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold leading-none tracking-tight text-cyan-600 dark:text-cyan-400 mb-1.5">Import Bookmarks</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Import bookmarks from JSON files or other bookmark managers
        </p>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select File</label>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              id="import-file"
              type="file"
              accept=".json,.ccbak"
              onChange={handleFileSelect}
              className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-black file:uppercase file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
            />
            <button
              onClick={handleImport}
              disabled={!importFile || isImporting}
              className="inline-flex items-center justify-center gap-3 px-6 py-2 bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-300 text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-600/20 active:scale-95 transition-all"
            >
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isImporting ? "Importing..." : "Import"}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic font-medium">
            Supports official Sovereign Backups (.ccbak) and legacy JSON exports
          </p>
        </div>

        {importResult && (
          <div className={`p-4 rounded-xl border-2 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 ${
            importResult.success 
              ? "bg-green-50 dark:bg-green-900/10 border-green-500/30 text-green-800 dark:text-green-400" 
              : "bg-red-50 dark:bg-red-900/10 border-red-500/30 text-red-800 dark:text-red-400"
          }`}>
            <div className={`p-2 rounded-lg ${importResult.success ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
              {importResult.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm">{importResult.message}</p>
              {importResult.count !== undefined && (
                <p className="text-xs font-medium opacity-80 mt-0.5">{importResult.count} bookmarks imported to the reef</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
