import { useRef, useState, useMemo } from "react";
import { Plus, Pencil, Search, X } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from '@/shared/ui/button';

export interface FolderItem {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

interface FolderListProps {
  folders: FolderItem[];
  selectedFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  openCreateFolder: () => void;
  openEditFolder: (folder: FolderItem) => void;
  folderBookmarkCount: (folderId: string) => number;
}

export function FolderList({
  folders,
  selectedFolder,
  onSelectFolder,
  openCreateFolder,
  openEditFolder,
  folderBookmarkCount,
}: FolderListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredFolders = useMemo(() => {
    return folders.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [folders, searchQuery]);

  const virtualizer = useVirtualizer({
    count: filteredFolders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52, // Height of each pod item (adjusted for mobile py-3)
    overscan: 5,
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Pods header — always visible, never shrinks */}
      <div className="flex items-center justify-between px-3 mt-4 mb-2 shrink-0">
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Pods
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 md:h-6 md:w-6 p-0 text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 rounded-lg"
          onClick={openCreateFolder}
        >
          <Plus className="w-5 h-5 md:w-4 md:h-4" />
        </Button>
      </div>

      {/* Pod Search */}
      {folders.length > 5 && (
        <div className="px-3 mb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-3.5 md:h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Pods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 md:py-1.5 text-sm md:text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
              >
                <X className="w-4 h-4 md:w-3 md:h-3 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Folder list — virtualized for large libraries */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {folders.length === 0 ? (
          <div className="px-3">
            <button
              onClick={openCreateFolder}
              className="w-full flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-bold text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-2 border-dashed border-slate-300 dark:border-slate-800"
            >
              <Plus className="w-5 h-5" />
              New Pod
            </button>
          </div>
        ) : filteredFolders.length === 0 ? (
          <p className="px-4 py-3 text-xs text-slate-500 font-bold uppercase tracking-tight italic">No pods match your search</p>
        ) : (
          <div 
            ref={parentRef} 
            className="h-full overflow-y-auto custom-scrollbar"
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const folder = filteredFolders[virtualItem.index];
                const isActive = selectedFolder === folder.id;
                return (
                  <div
                    key={folder.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    className="px-3"
                  >
                    <div
                      className={`group/pod flex items-center gap-0 rounded-xl transition-all ${
                        isActive
                          ? "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-300 shadow-sm"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectFolder(folder.id);
                        }}
                        className="flex items-center justify-between gap-3 flex-1 px-3 py-3 md:py-2 text-sm font-bold text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: folder.color ?? "#06b6d4" }}
                          />
                          <span className="truncate">{folder.name}</span>
                        </div>
                        <span className={`text-[10px] font-bold flex-shrink-0 px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-cyan-200 text-cyan-900 dark:bg-cyan-800 dark:text-cyan-100"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        }`}>
                          {folderBookmarkCount(folder.id)}
                        </span>
                      </button>
                      {/* Edit Pod button - always visible on mobile, hover on desktop */}
                      <button
                        onClick={() => openEditFolder(folder)}
                        className="opacity-100 md:opacity-0 md:group-hover/pod:opacity-100 transition-opacity p-2.5 mr-1 rounded-xl text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                        title="Edit Pod"
                      >
                        <Pencil className="w-4 h-4 md:w-3.5 md:h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
