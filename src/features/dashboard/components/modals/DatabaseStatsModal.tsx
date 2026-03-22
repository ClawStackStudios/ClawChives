import { useState, useEffect } from "react";
import { Button } from '@/shared/ui/button';
import { X, Database } from "lucide-react";
import { useDatabaseAdapter } from "@/services/database/DatabaseProvider";
import { ConfirmModal, AlertModal } from '@/shared/ui/LobsterModal';
import { StatsCards, type DatabaseStats } from "./StatsCards";
import { BookmarkTable } from "./BookmarkTable";

interface DatabaseStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DatabaseStatsModal({ isOpen, onClose }: DatabaseStatsModalProps) {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allBookmarks, setAllBookmarks] = useState<any[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<any[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [alertNotImpl, setAlertNotImpl] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = allBookmarks.filter((b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredBookmarks(filtered);
    } else {
      setFilteredBookmarks(allBookmarks);
    }
  }, [searchQuery, allBookmarks]);

  const db = useDatabaseAdapter();
  const loadData = async () => {
    try {
      if (!db) return;
      
      // Fetch all bookmarks with a high limit so the table + tag counts are accurate
      const bookmarks = await db.getBookmarks(10000);
      const bookmarkStats = await db.getBookmarkStats();
      const folders = await db.getFolders();
      const keys = await db.getAgentKeys();
      const appearance = await db.getAppearanceSettings();
      const profile = await db.getProfileSettings();
      
      const uniqueTags = new Set(bookmarks.flatMap((b: any) => b.tags || [])).size;
      
      const totalSizeMB = (
        (JSON.stringify(bookmarks).length + 
        JSON.stringify(folders).length + 
        JSON.stringify(keys).length + 
        JSON.stringify(appearance).length + 
        JSON.stringify(profile).length) / (1024 * 1024)
      ).toFixed(2);
      
      const statsData: DatabaseStats = {
        totalBookmarks: bookmarkStats.total,
        totalFolders: folders.length,
        uniqueTags,
        totalSizeMB: parseFloat(totalSizeMB),
        starredCount: bookmarkStats.starred,
        archivedCount: bookmarkStats.archived,
        totalKeys: keys.length,
        totalSettings: (appearance ? 1 : 0) + (profile ? 1 : 0),
      };

      setStats(statsData);
      setAllBookmarks(bookmarks);
      setFilteredBookmarks(bookmarks);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    if (!db) return;
    await db.deleteBookmark(id);
    await loadData();
  };

  const handleClearDatabase = async () => {
    if (!db) return;
    try {
      await db.deleteAllBookmarks();
      await db.deleteAllFolders();
      await loadData();
    } catch (e) {
      console.error("Failed to clear database:", e);
      setAlertNotImpl(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border-2 border-red-500/50 dark:border-red-500/70 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-red-500/30 dark:border-red-500/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Database className="w-5 h-5 text-cyan-700" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Database Statistics</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {stats && (
            <>
              <StatsCards stats={stats} />
              
              <BookmarkTable
                filteredBookmarks={filteredBookmarks}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onConfirmDelete={setConfirmDeleteId}
                onClearAll={() => setConfirmClearAll(true)}
                totalBookmarks={stats.totalBookmarks}
              />
            </>
          )}
        </div>
      </div>

      {/* Delete Bookmark Confirm */}
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => { if (confirmDeleteId) handleDeleteBookmark(confirmDeleteId); }}
        title="Delete Pinchmark?"
        message="Are you sure you want to delete this Pinchmark from the database?"
        confirmLabel="Delete Pinchmark"
        cancelLabel="Keep it"
        variant="danger"
      />

      {/* Clear All Confirm */}
      <ConfirmModal
        isOpen={confirmClearAll}
        onClose={() => setConfirmClearAll(false)}
        onConfirm={handleClearDatabase}
        title="Clear All Data?"
        message="Are you sure you want to clear ALL database data? This cannot be undone."
        confirmLabel="Clear Everything"
        cancelLabel="Cancel"
        variant="danger"
      />

      {/* Not Implemented Alert */}
      <AlertModal
        isOpen={alertNotImpl}
        onClose={() => setAlertNotImpl(false)}
        title="Not Available"
        message="Database clearing is not yet implemented via REST API on the frontend."
        variant="error"
      />
    </div>
  );
}