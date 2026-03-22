import { useState } from "react";
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { CheckCircle, Upload, FileText } from "lucide-react";
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
    <Card className="border-2 border-red-500/30 dark:border-red-500/50">
      <CardHeader>
        <CardTitle className="text-cyan-600 dark:text-cyan-400">Import Bookmarks</CardTitle>
        <CardDescription>
          Import bookmarks from JSON files or other bookmark managers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="import-file">Select File</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="flex-1"
            />
            <Button
              onClick={handleImport}
              disabled={!importFile || isImporting}
              className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/20"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? "Importing..." : "Import"}
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supports JSON format exported from ClawChives
          </p>
        </div>

        {importResult && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            importResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            {importResult.success ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <FileText className="w-5 h-5 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">{importResult.message}</p>
              {importResult.count !== undefined && (
                <p className="text-sm opacity-80">{importResult.count} bookmarks imported</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
