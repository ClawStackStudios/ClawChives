import { Filter, Check, Star, Pin, Archive, Tag } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useState, useRef, useEffect } from "react";
import { getTagColorClasses } from "@/shared/lib/lobsterColorRNG";

interface FilterStatus {
  starred: boolean;
  pinned: boolean;
  archived: boolean;
}

interface FilterDropdownProps {
  filterStatus: FilterStatus;
  onFilterStatusChange: (status: FilterStatus) => void;
  tagFilter: string | null;
  onTagFilterChange: (tag: string | null) => void;
  allTags?: string[];
}

export function FilterDropdown({
  filterStatus,
  onFilterStatusChange,
  tagFilter,
  onTagFilterChange,
  allTags = [],
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeFiltersCount =
    (filterStatus.starred ? 1 : 0) +
    (filterStatus.pinned ? 1 : 0) +
    (filterStatus.archived ? 1 : 0) +
    (tagFilter ? 1 : 0);

  const toggleStatus = (key: keyof FilterStatus) => {
    onFilterStatusChange({
      ...filterStatus,
      [key]: !filterStatus[key],
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
          activeFiltersCount > 0
            ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800 shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-cyan-600 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <Filter className="w-4 h-4 mr-2" />
        Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-900 border-2 border-cyan-500/20 dark:border-cyan-500/50 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1 w-56">
          <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Status
          </div>
          <button
            onClick={() => toggleStatus("starred")}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${filterStatus.starred ? "text-amber-500 fill-current" : ""}`} />
              <span className={filterStatus.starred ? "font-bold text-amber-600 dark:text-amber-500" : ""}>Starred</span>
            </div>
            {filterStatus.starred && <Check className="w-4 h-4 text-amber-500" />}
          </button>
          
          <button
            onClick={() => toggleStatus("pinned")}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Pin className={`w-4 h-4 ${filterStatus.pinned ? "text-fuchsia-500 fill-current" : ""}`} />
              <span className={filterStatus.pinned ? "font-bold text-fuchsia-600 dark:text-fuchsia-500" : ""}>Pinned</span>
            </div>
            {filterStatus.pinned && <Check className="w-4 h-4 text-fuchsia-500" />}
          </button>

          <button
            onClick={() => toggleStatus("archived")}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Archive className={`w-4 h-4 ${filterStatus.archived ? "text-cyan-600 fill-current" : ""}`} />
              <span className={filterStatus.archived ? "font-bold text-cyan-600 dark:text-cyan-500" : ""}>Archived</span>
            </div>
            {filterStatus.archived && <Check className="w-4 h-4 text-cyan-500" />}
          </button>

          {allTags.length > 0 && (
            <>
              <div className="border-t border-slate-100 dark:border-slate-800 my-2" />
              <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Tags
              </div>
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {allTags.map((tag) => {
                  const isSelected = tagFilter === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => onTagFilterChange(isSelected ? null : tag)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getTagColorClasses(tag)}`}>
                          {tag}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-cyan-500" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {activeFiltersCount > 0 && (
            <>
              <div className="border-t border-slate-100 dark:border-slate-800 my-2" />
              <button
                onClick={() => {
                  onFilterStatusChange({ starred: false, pinned: false, archived: false });
                  onTagFilterChange(null);
                  setIsOpen(false);
                }}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
