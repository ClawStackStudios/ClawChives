import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { X, Folder, Star, Archive } from "lucide-react";
import { useDatabaseAdapter } from "@/services/database/DatabaseProvider";
import { useBookmarkForm } from "./useBookmarkForm";
import { TagInput } from "./TagInput";
import { ModalContainer } from '@/shared/ui/modals/ModalContainer';

import type { Bookmark, Folder as FolderType } from "@/services/types";

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: Bookmark) => void;
  bookmark?: Bookmark | null;
  folders: FolderType[];
  onFoldersRefresh?: () => void;
}

export function BookmarkModal({
  isOpen,
  onClose,
  onSave,
  bookmark,
  folders,
  onFoldersRefresh,
}: BookmarkModalProps) {
  const db = useDatabaseAdapter();
  const userKeyType = sessionStorage.getItem("cc_key_type") || "unknown";

  const {
    formState: {
      url, setUrl,
      title, setTitle,
      description, setDescription,
      tags, setTags,
      selectedFolder, setSelectedFolder,
      starred, setStarred,
      archived, setArchived,
      pinned, setPinned,
      isLoading,
      jinaConversion, setJinaConversion
    },
    handleUrlPaste,
    handleSave,
  } = useBookmarkForm({
    bookmark,
    folders,
    isOpen,
    onSave,
    onClose,
    db,
    onFoldersRefresh,
  });

  if (!isOpen) return null;

  return (
    <ModalContainer 
      onClose={onClose} 
      borderColor="border-cyan-500/50 dark:border-cyan-500/70"
      maxWidth="max-w-lg"
    >
      <div className="bg-white dark:bg-slate-900">
        {/* Header - Compact */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-cyan-500/30 dark:border-cyan-500/50 bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight">
              {bookmark ? "Edit Pinchmark" : "Add Pinchmark"}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
              {bookmark ? "Adjust your pinch" : "Pinch a URL into your collection"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content - Optimized Height */}
        <div className="p-4 md:p-6 space-y-3.5">
          {/* URL */}
          <div className="space-y-1">
            <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPaste={(e) => {
                const pastedText = e.clipboardData.getData("text");
                if (pastedText.startsWith("http")) {
                  handleUrlPaste(pastedText, true);
                }
              }}
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-white h-10"
            />
            {isLoading && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 dark:text-cyan-400 mt-1 flex items-center gap-1.5">
                <span className="animate-spin inline-block w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full" />
                Fetching metadata…
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Pinchmark title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-white h-10"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Description</Label>
            <textarea
              id="description"
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm md:text-base resize-none transition-all"
            />
          </div>

          {/* Folder & Tags Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <Label htmlFor="folder" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Pod</Label>
              <div className="relative">
                <select
                  id="folder"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm transition-all"
                >
                  <option value="">No Pod</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                <Folder className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <TagInput tags={tags} setTags={setTags} />
          </div>

          {/* Actions Bar - Compact */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
            {userKeyType === 'human' && (
              <label htmlFor="jinaConversion" className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  id="jinaConversion"
                  checked={jinaConversion}
                  onChange={(e) => setJinaConversion(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded-lg focus:ring-cyan-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">🦞 Jina</span>
              </label>
            )}

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={starred}
                onChange={(e) => setStarred(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded-lg focus:ring-amber-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-amber-500 transition-colors">
                <Star className={`w-3.5 h-3.5 ${starred ? "fill-amber-500 text-amber-500" : ""}`} />
                Star
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={archived}
                onChange={(e) => setArchived(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded-lg focus:ring-cyan-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-cyan-600 transition-colors">
                <Archive className={`w-3.5 h-3.5 ${archived ? "text-cyan-600" : ""}`} />
                Arch
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 text-red-500 rounded-lg focus:ring-red-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-red-500 transition-colors">
                <span className={`text-xs ${pinned ? "grayscale-0" : "grayscale opacity-50"}`}>📌</span>
                Pin
              </div>
            </label>
          </div>
        </div>

        {/* Footer - Solid */}
        <div className="flex gap-3 p-4 md:p-6 border-t border-cyan-500/20 dark:border-cyan-500/30 bg-slate-50/50 dark:bg-slate-950/50">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 h-11 md:h-10 dark:border-slate-700 dark:text-slate-300 rounded-xl font-bold uppercase tracking-widest text-xs"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 h-11 md:h-10 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-lg shadow-cyan-600/20 font-bold uppercase tracking-widest text-xs transition-all active:scale-95"
          >
            {bookmark ? "Save" : "Pinch It! 🦞"}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}