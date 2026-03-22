import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Database, FileSpreadsheet, FileText } from "lucide-react";
import { exportBookmarks } from "../utils/importExportUtils";

interface ExportSectionProps {
  db: any;
}

export function ExportSection({ db }: ExportSectionProps) {
  const handleExport = (format: "json" | "html" | "csv") => {
    exportBookmarks(db, format);
  };

  return (
    <Card className="border-2 border-red-500/30 dark:border-red-500/50">
      <CardHeader>
        <CardTitle className="text-cyan-600 dark:text-cyan-400">Export Bookmarks</CardTitle>
        <CardDescription>
          Download your bookmarks in various formats for backup or migration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => handleExport("json")}
            className="h-auto flex-col gap-3 py-6 hover:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 dark:bg-cyan-950/30"
          >
            <Database className="w-8 h-8 text-cyan-600" />
            <div className="text-left">
              <div className="font-medium">JSON</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Full backup with metadata</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport("html")}
            className="h-auto flex-col gap-3 py-6 hover:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 dark:bg-cyan-950/30"
          >
            <FileText className="w-8 h-8 text-cyan-600" />
            <div className="text-left">
              <div className="font-medium">HTML</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Netscape bookmark format</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            className="h-auto flex-col gap-3 py-6 hover:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 dark:bg-cyan-950/30"
          >
            <FileSpreadsheet className="w-8 h-8 text-cyan-600" />
            <div className="text-left">
              <div className="font-medium">CSV</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Spreadsheet compatible</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
