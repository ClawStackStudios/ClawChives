import { Menu, Plus, X } from "lucide-react";
import { Button } from '@/shared/ui/button';

import { SortDropdown } from "../views/SortDropdown";
import { ViewToggle } from "../views/ViewToggle";
import type { SortBy } from '@/shared/lib/utils';

interface HeaderProps {
  user: { username: string } | null;
  onAddBookmark?: () => void;
  showGridControls: boolean;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  viewMode: "grid" | "list";
  onViewChange: (mode: "grid" | "list") => void;
  tagFilter: string | null;
  onClearTagFilter: () => void;
  onToggleSidebar?: () => void;
  title?: string;
}

export function Header({
  user,
  onAddBookmark,
  showGridControls,
  sortBy,
  onSortChange,
  viewMode,
  onViewChange,
  tagFilter,
  onClearTagFilter,
  onToggleSidebar,
  title,
}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-900 border-b-2 border-cyan-600 dark:border-red-500 px-4 md:px-6 py-2 md:py-3 flex-shrink-0">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Toggle & Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="text-slate-700 dark:text-slate-300 p-2 h-11 w-11 md:h-9 md:w-9 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6 md:w-5 md:h-5" />
            </Button>
          )}
          
          {title && (
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1 md:ml-2 truncate max-w-[120px] md:max-w-none">
              {title}
            </span>
          )}

          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
            {showGridControls && (
              <>
                <SortDropdown sortBy={sortBy} onChange={onSortChange} />
                <ViewToggle viewMode={viewMode} onChange={onViewChange} />
              </>
            )}
          </div>
        </div>

        {/* Right Side: Greeting & Actions */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mr-2">
              {user.username}
            </span>
          )}

          <div className="flex items-center gap-2">
            {onAddBookmark && (
              <Button 
                onClick={onAddBookmark} 
                className="bg-cyan-700 hover:bg-cyan-800 text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-all h-11 md:h-9 px-3 md:px-4 rounded-xl text-xs font-bold uppercase tracking-widest"
              >
                <Plus className="w-5 h-5 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">Add Pinchmark</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {tagFilter && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Filtered by tag:</span>
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 rounded-full border border-sky-200 dark:border-sky-700/50">
            {tagFilter}
            <button onClick={onClearTagFilter} className="hover:text-sky-900 dark:hover:text-sky-100">
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}
    </header>
  );
}
