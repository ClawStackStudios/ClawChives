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
import { X, Tag } from "lucide-react";
import type { Bookmark } from "@/services/types";
import { ConfirmModal, TagBlockedModal } from '@/shared/ui/LobsterModal';
import { aggregateTags } from '@/shared/lib/utils';
import { getTagColorClasses } from '@/shared/lib/lobsterColorRNG';

interface TagsViewProps {
  bookmarks: Bookmark[];
  onSelectTag: (tag: string) => void;
  onDeleteTag: (tag: string) => Promise<void>;
}



export function TagsView({ bookmarks, onSelectTag, onDeleteTag }: TagsViewProps) {
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
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 dark:text-slate-500">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-slate-200 dark:border-slate-700">
          <Tag className="w-8 h-8" />
        </div>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Tags Yet</p>
        <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">Add tags to your Pinchmarks to organize them here</p>
      </div>
    );
  }

  return (
    <div className="p-6">
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
