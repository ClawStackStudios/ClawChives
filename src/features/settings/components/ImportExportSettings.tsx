import { useState } from "react";
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Upload } from "lucide-react";
import { useDatabaseAdapter } from "@/services/database/DatabaseProvider";
import { ConfirmModal, AlertModal } from '@/shared/ui/LobsterModal';
import { LobsterImportModal } from "./LobsterImportModal";
import { ImportSection } from "./ImportSection";
import { ExportSection } from "./ExportSection";

export function ImportExportSettings() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPurgedAlert, setShowPurgedAlert] = useState(false);
  const [lobsterImportOpen, setLobsterImportOpen] = useState(false);

  const db = useDatabaseAdapter();

  return (
    <div className="space-y-6">
      {/* Lobster Import Section */}
      <Card className="border-2 border-amber-500/30 dark:border-amber-500/50">
        <CardHeader>
          <CardTitle className="text-amber-600 dark:text-amber-400">Lobster Import</CardTitle>
          <CardDescription>
            Bulk import bookmarks via agent key — no rate limits for <span className="font-mono text-xs">lb-</span> Lobster keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setLobsterImportOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
          >
            <Upload className="w-4 h-4 mr-2" />
            Open Lobster Import
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      <ImportSection db={db} />

      {/* Export Section */}
      <ExportSection db={db} />

      {/* Danger Zone */}
      <Card className="border-2 border-red-500/30 dark:border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your data
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 border-red-300 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete All Pinchmarks
            </Button>
        </CardContent>
      </Card>

      {/* Delete All Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          await db.deleteAllBookmarks();
          setShowPurgedAlert(true);
        }}
        title="Purge All Pinchmarks?"
        message="Are you sure you want to delete ALL Pinchmarks? This will remove every single pinch from the reef. This cannot be undone."
        confirmLabel="Purge the Reef 🦞"
        cancelLabel="Keep my Pinchmarks"
        variant="danger"
      />

      {/* Purged Success Alert */}
      <AlertModal
        isOpen={showPurgedAlert}
        onClose={() => setShowPurgedAlert(false)}
        title="Reef Purged 🦞"
        message="All Pinchmarks have been purged from the reef."
        variant="info"
      />

      {/* Lobster Import Modal */}
      <LobsterImportModal
        isOpen={lobsterImportOpen}
        onClose={() => setLobsterImportOpen(false)}
      />
    </div>
  );
}