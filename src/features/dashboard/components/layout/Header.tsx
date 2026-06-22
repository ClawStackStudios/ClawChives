import { Menu, Plus } from "lucide-react";
import { Button } from '@/shared/ui/button';

import { SortDropdown } from "../views/SortDropdown";
import { ViewToggle } from "../views/ViewToggle";
import { FilterDropdown } from "../views/FilterDropdown";
import type { SortBy } from '@/shared/lib/utils';

interface FilterStatus {
  starred: boolean;
  pinned: boolean;
  archived: boolean;
}

interface HeaderProps {
  user: { username: string } | null;
  onAddBookmark?: () => void;
  showGridControls: boolean;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  viewMode: "grid" | "list";
  onViewChange: (mode: "grid" | "list") => void;
  filterStatus?: FilterStatus;
  onFilterStatusChange?: (status: FilterStatus) => void;
  tagFilter: string | null;
  onTagFilterChange?: (tag: string | null) => void;
  allTags?: string[];
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
  filterStatus,
  onFilterStatusChange,
  tagFilter,
  onTagFilterChange,
  allTags,
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
                {filterStatus && onFilterStatusChange && onTagFilterChange && (
                  <FilterDropdown
                    filterStatus={filterStatus}
                    onFilterStatusChange={onFilterStatusChange}
                    tagFilter={tagFilter}
                    onTagFilterChange={onTagFilterChange}
                    allTags={allTags}
                  />
                )}
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
    </header>
  );
}
