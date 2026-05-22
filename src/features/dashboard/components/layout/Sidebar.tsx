import { useCallback } from "react";
import { Search, X, Settings, Database, LogOut } from "lucide-react";
import { Input } from '@/shared/ui/input';

import { useFolderCounts } from "@/hooks/useFolderCounts";
import { InteractiveBrand } from '@/shared/branding/InteractiveBrand';
import { SidebarNav, type NavTab, type SettingsTab } from "./SidebarNav";
import { FolderList, type FolderItem } from "./FolderList";
import { SortDropdown } from "../views/SortDropdown";
import { ViewToggle } from "../views/ViewToggle";
import type { SortBy } from '@/shared/lib/utils';

interface SidebarProps {
  folders: FolderItem[];
  selectedFolder: string | null;
  filterType: NavTab;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSelectFolder: (folderId: string | null) => void;
  onFilterChange: (filter: NavTab) => void;
  bookmarkCounts: {
    all: number;
    starred: number;
    archived: number;
    pinned: number;
    tags: number;
  };
  // Mobile controls
  showGridControls?: boolean;
  sortBy?: SortBy;
  onSortChange?: (sort: SortBy) => void;
  viewMode?: "grid" | "list";
  onViewChange?: (mode: "grid" | "list") => void;
  onGoToSettings?: () => void;
  onLogout?: () => void;
  onShowDatabaseStats?: () => void;
  // Settings mode
  settingsMode?: boolean;
  activeSettingsTab?: SettingsTab;
  onSettingsTabChange?: (tab: SettingsTab) => void;
  onGoToDashboard?: () => void;
  onClose?: () => void;
  openCreateFolder: () => void;
  openEditFolder: (folder: FolderItem) => void;
}

export function Sidebar({
  folders,
  selectedFolder,
  filterType,
  searchQuery,
  onSearchChange,
  onSelectFolder,
  onFilterChange,
  bookmarkCounts,
  showGridControls,
  sortBy,
  onSortChange,
  viewMode,
  onViewChange,
  onGoToSettings,
  onLogout,
  onShowDatabaseStats,
  settingsMode,
  activeSettingsTab,
  onSettingsTabChange,
  onGoToDashboard,
  onClose,
  openCreateFolder,
  openEditFolder,
}: SidebarProps) {
  const { data: folderCountsMap } = useFolderCounts();

  const folderBookmarkCount = useCallback(
    (folderId: string) => folderCountsMap?.[folderId] ?? 0,
    [folderCountsMap]
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-900">
      {/* Logo Area */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <InteractiveBrand 
          showIcon={true} 
          showCopyright={true}
          className="text-lg sm:text-xl"
          onClick={() => {
            onSelectFolder(null);
            onFilterChange("dashboard");
          }} 
        />
        <button
          onClick={onClose}
          className="md:hidden p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar — dashboard only */}
      {!settingsMode && (
        <div className="px-3 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sort / View controls — mobile only, dashboard only */}
      {!settingsMode && showGridControls && sortBy && onSortChange && viewMode && onViewChange && (
        <div className="md:hidden px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <SortDropdown sortBy={sortBy} onChange={onSortChange} />
          <ViewToggle viewMode={viewMode} onChange={onViewChange} />
        </div>
      )}

      {/* Main Sidebar Layout */}
      <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
        {settingsMode ? (
          <div className="p-3 flex-1 overflow-y-auto">
            <SidebarNav
              filterType={filterType}
              selectedFolder={selectedFolder}
              onFilterChange={onFilterChange}
              onSelectFolder={onSelectFolder}
              bookmarkCounts={bookmarkCounts}
              settingsMode={settingsMode}
              activeSettingsTab={activeSettingsTab}
              onSettingsTabChange={onSettingsTabChange}
              onGoToDashboard={onGoToDashboard}
              onShowDatabaseStats={onShowDatabaseStats}
              onLogout={onLogout}
              onClose={onClose}
            />
          </div>
        ) : (
          <>
            {/* Scrollable middle container (Nav + Pods) */}
            <div className="flex-1 overflow-y-auto min-h-0 flex flex-col p-3 space-y-4">
              <SidebarNav
                filterType={filterType}
                selectedFolder={selectedFolder}
                onFilterChange={onFilterChange}
                onSelectFolder={onSelectFolder}
                bookmarkCounts={bookmarkCounts}
                onClose={onClose}
              />

              <div className="flex-1 min-h-0 flex flex-col">
                <FolderList
                  folders={folders}
                  selectedFolder={selectedFolder}
                  onSelectFolder={onSelectFolder}
                  openCreateFolder={openCreateFolder}
                  openEditFolder={openEditFolder}
                  folderBookmarkCount={folderBookmarkCount}
                />
              </div>
            </div>

            {/* Pinned Bottom Utility Bar */}
            {onGoToSettings && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-1.5 bg-white dark:bg-slate-900">
                <button
                  onClick={onGoToSettings}
                  className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl text-sm font-bold text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all"
                >
                  <Settings className="w-5 h-5 md:w-4 md:h-4" />
                  Settings
                </button>
                
                {onShowDatabaseStats && (
                  <button
                    onClick={() => { onShowDatabaseStats(); onClose?.(); }}
                    className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                  >
                    <Database className="w-5 h-5 md:w-4 md:h-4" />
                    Database Stats
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => { onLogout(); onClose?.(); }}
                    className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <LogOut className="w-5 h-5 md:w-4 md:h-4" />
                    Claw Out
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}