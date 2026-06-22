/**
 * TagsView.tsx
 * ─────────────────────────────────────────────────────────────
 * Displays all unique tags aggregated from bookmarks.
 * Users can click to filter, or delete a tag via the X button.
 * Tags with attached Pinchmarks are guarded — shows a
 * TagBlockedModal; tags with no attachments show ConfirmModal.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useMemo } from "react";
import { X, Tag, ArrowLeft } from "lucide-react";
import type { Bookmark } from "@/services/types";
import { ConfirmModal, TagBlockedModal } from '@/shared/ui/LobsterModal';
import { aggregateTags } from '@/shared/lib/utils';
import { getTagColorClasses } from '@/shared/lib/lobsterColorRNG';
import { BookmarkGrid } from "./BookmarkGrid";

interface TagsViewProps {
  bookmarks: Bookmark[];
  filteredBookmarks?: Bookmark[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onDeleteTag: (tag: string) => Promise<void>;
  
  // Grid props
  viewMode?: "grid" | "list";
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (id: string) => void;
  onToggleStar?: (bookmark: Bookmark) => void;
  onToggleArchive?: (bookmark: Bookmark) => void;
  onTogglePin?: (bookmark: Bookmark) => void;
  onFetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  compactMode?: boolean;
  showFavicons?: boolean;
}

export function TagsView({ 
  bookmarks, 
  filteredBookmarks = [],
  selectedTag,
  onSelectTag, 
  onDeleteTag,
  viewMode = "grid",
  onEdit,
  onDelete,
  onToggleStar,
  onToggleArchive,
  onTogglePin,
  onFetchNextPage,
  hasNextPage = false,
  isFetchingNextPage = false,
  compactMode = false,
  showFavicons = false,
}: TagsViewProps) {
  const [blockedTag, setBlockedTag] = useState<string | null>(null);
  const [blockedBookmarks, setBlockedBookmarks] = useState<Bookmark[]>([]);
  const [confirmTag, setConfirmTag] = useState<string | null>(null);

  // Aggregate tags (memoized for performance)
  const tags = useMemo(() => aggregateTags(bookmarks), [bookmarks]);

  const handleDeleteClick = (e: React.MouseEvent, tag: string, count: number) => {
    e.stopPropagation();
    if (count > 0) {
      // Blocked — show warning with attached pinchmarks
      const attached = bookmarks.filter((b) => b.tags.includes(tag));
      setBlockedTag(tag);
      setBlockedBookmarks(attached);
    } else {
      // Safe to delete — show confirm
      setConfirmTag(tag);
    }
  };

  if (tags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400 dark:text-slate-500 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-slate-200 dark:border-slate-700">
          <Tag className="w-8 h-8" />
        </div>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Tags Yet</p>
        <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">Add tags to your Pinchmarks to organize them here</p>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (selectedTag) {
    const tagCount = tags.find(t => t[0] === selectedTag)?.[1] || 0;
    const cls = getTagColorClasses(selectedTag);
    
    return (
      <div key="detail-view" className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <div className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 flex-shrink-0">
          <button 
            onClick={() => onSelectTag(null)}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
            title="Back to all tags"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-base font-bold shadow-sm ${cls}`}>
                <Tag className="w-4 h-4" />
                {selectedTag}
              </span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {tagCount} Pinchmarks
              </span>
            </div>
            
            <button
              onClick={(e) => handleDeleteClick(e, selectedTag, tagCount)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Delete Tag
            </button>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 p-6">
          <BookmarkGrid
            bookmarks={filteredBookmarks}
            layout={viewMode}
            onEdit={onEdit!}
            onDelete={onDelete!}
            onToggleStar={onToggleStar!}
            onToggleArchive={onToggleArchive!}
            onTogglePin={onTogglePin!}
            onFetchNextPage={onFetchNextPage!}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            compactMode={compactMode}
            showFavicons={showFavicons}
          />
        </div>

        {/* Modals for detail view */}
        <TagBlockedModal
          isOpen={!!blockedTag}
          onClose={() => { setBlockedTag(null); setBlockedBookmarks([]); }}
          tag={blockedTag ?? ""}
          attachedBookmarks={blockedBookmarks}
        />
        <ConfirmModal
          isOpen={!!confirmTag}
          onClose={() => setConfirmTag(null)}
          onConfirm={() => { if (confirmTag) { onDeleteTag(confirmTag); onSelectTag(null); } }}
          title="Delete Tag?"
          message={`Are you sure you want to delete the tag "${confirmTag}"? This cannot be undone.`}
          confirmLabel="Delete Tag"
          cancelLabel="Cancel"
          variant="danger"
        />
      </div>
    );
  }

  // --- MASTER VIEW ---
  return (
    <div key="master-view" className="p-6 h-full overflow-y-auto animate-in fade-in zoom-in-105 duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Tags</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {tags.length} tag{tags.length !== 1 ? "s" : ""} across all your Pinchmarks. Click to filter.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {tags.map(([tag, count]) => {
          const cls = getTagColorClasses(tag);
          return (
            <div key={tag} className="relative group/tag">
              <button
                onClick={() => onSelectTag(tag)}
                className={`inline-flex items-center gap-2 pl-4 pr-9 py-2 rounded-full border text-sm font-medium transition-all hover:scale-105 hover:shadow-md ${cls}`}
              >
                <Tag className="w-3.5 h-3.5" />
                {tag}
                <span className="text-xs opacity-75 bg-white/40 dark:bg-black/20 px-1.5 py-0.5 rounded-full font-bold">
                  {count}
                </span>
              </button>
              {/* Delete X — visible on hover */}
              <button
                onClick={(e) => handleDeleteClick(e, tag, count)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-white/60 dark:bg-slate-900/60 opacity-0 group-hover/tag:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/40 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                title={count > 0 ? "Cannot delete — tag has Pinchmarks" : "Delete tag"}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Tag Blocked Modal */}
      <TagBlockedModal
        isOpen={!!blockedTag}
        onClose={() => { setBlockedTag(null); setBlockedBookmarks([]); }}
        tag={blockedTag ?? ""}
        attachedBookmarks={blockedBookmarks}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmTag}
        onClose={() => setConfirmTag(null)}
        onConfirm={() => { if (confirmTag) onDeleteTag(confirmTag); }}
        title="Delete Tag?"
        message={`Are you sure you want to delete the tag "${confirmTag}"? This cannot be undone.`}
        confirmLabel="Delete Tag"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
