import { useState } from "react";
import { Upload, Archive, Package } from "lucide-react";
import { useDatabaseAdapter } from "@/services/database/DatabaseProvider";
import { ConfirmModal, AlertModal } from '@/shared/ui/LobsterModal';
import { LobsterImportModal } from "./LobsterImportModal";
import { ImportSection } from "./ImportSection";
import { ExportModal } from "@/features/dashboard/components/modals/ExportModal";

export function ImportExportSettings() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPurgedAlert, setShowPurgedAlert] = useState(false);
  const [lobsterImportOpen, setLobsterImportOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const db = useDatabaseAdapter();

  return (
    <div className="space-y-6">
      {/* Lobster Import Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-cyan-500/30 dark:border-cyan-500/50 shadow-sm transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold leading-none tracking-tight text-cyan-600 dark:text-cyan-400 mb-1.5">Lobster Import</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bulk import bookmarks via agent key — no rate limits for <span className="font-mono text-xs">lb-</span> Lobster keys
          </p>
        </div>
        <div className="p-6">
          <button
            onClick={() => setLobsterImportOpen(true)}
            className="inline-flex items-center justify-center gap-3 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            Open Lobster Import
          </button>
        </div>
      </div>

      {/* Import Section */}
      <ImportSection db={db} />

      {/* Export Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-cyan-500/5 to-transparent">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl border border-cyan-200 dark:border-cyan-800/50">
              <Archive className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1 uppercase tracking-tight">Export Your Habitat</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Package your collection of Pinchmarks into a hardened archive. Support for MD, Styled HTML, and JSON with automated asset handling.
              </p>
            </div>
          </div>
          <button
            onClick={() => setExportModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-black uppercase tracking-widest rounded-xl shadow-xl shadow-cyan-600/30 transition-all active:scale-95"
          >
            <Package className="w-5 h-5" />
            Hatch Exports
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-red-500/30 dark:border-red-500/50 shadow-sm transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold leading-none tracking-tight text-red-600 dark:text-red-400 mb-1.5">Danger Zone</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Irreversible actions that affect your data</p>
        </div>
        <div className="p-6">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-2.5 border-2 border-red-500/50 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all"
          >
            Delete All Pinchmarks
          </button>
        </div>
      </div>

      {/* Modals */}
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

      <AlertModal
        isOpen={showPurgedAlert}
        onClose={() => setShowPurgedAlert(false)}
        title="Reef Purged 🦞"
        message="All Pinchmarks have been purged from the reef."
        variant="info"
      />

      <LobsterImportModal
        isOpen={lobsterImportOpen}
        onClose={() => setLobsterImportOpen(false)}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
}