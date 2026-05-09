import { useState, useEffect } from "react";
import { X, Trash2, Archive } from "lucide-react";
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { ModalContainer } from '@/shared/ui/modals/ModalContainer';

interface FolderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** undefined = create mode */
  folder?: { id: string; name: string; color?: string } | null;
  /** Bookmark count inside this pod */
  bookmarkCount?: number;
  onSave: (data: { name: string; color: string }) => void;
  onDelete?: () => void;
}

const PRESET_COLORS = [
  "#06b6d4", "#0891b2", "#8b5cf6", "#10b981",
  "#ef4444", "#3b82f6", "#ec4899", "#f59e0b",
];

export function FolderEditModal({
  isOpen,
  onClose,
  folder,
  bookmarkCount = 0,
  onSave,
  onDelete,
}: FolderEditModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#06b6d4");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isPinnedPod = folder?.name === "Pinned";
  const hasPins = isPinnedPod && bookmarkCount > 0;

  useEffect(() => {
    if (!isOpen) return;
    setName(folder?.name ?? "");
    setColor(folder?.color ?? "#06b6d4");
    setConfirmDelete(false);
  }, [isOpen, folder]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color });
    onClose();
  };

  const handleDeleteClick = () => {
    if (hasPins) return; // protected
    if (bookmarkCount > 0) {
      setConfirmDelete(true);
    } else {
      onDelete?.();
      onClose();
    }
  };

  const handleConfirmDelete = () => {
    onDelete?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalContainer 
      onClose={onClose} 
      borderColor="border-cyan-500/50 dark:border-cyan-500/40"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col h-full max-h-[inherit]">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-5 border-b border-cyan-500/20 dark:border-cyan-500/30 shrink-0">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 uppercase tracking-tight">
              {folder ? "Edit Pod" : "New Pod"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1.5 h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 custom-scrollbar">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="pod-name" className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Pod Name
            </Label>
            <Input
              id="pod-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Research, Ideas, Work..."
              className="w-full h-11 md:h-10 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              autoFocus
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-200">Color</Label>
            <div className="flex items-center gap-3 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 md:w-8 md:h-8 rounded-full transition-all ring-offset-2 dark:ring-offset-slate-900 ${
                    color === c 
                      ? "ring-2 ring-cyan-500 scale-110 shadow-lg" 
                      : "hover:scale-110 border border-slate-200 dark:border-slate-700"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 md:w-8 md:h-8 rounded-full cursor-pointer border-0 bg-transparent opacity-0 absolute inset-0 z-10"
                  title="Custom color"
                />
                <div 
                  className={`w-9 h-9 md:w-8 md:h-8 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center transition-all ${
                    !PRESET_COLORS.includes(color) ? "ring-2 ring-cyan-500 ring-offset-2 dark:ring-offset-slate-900 scale-110" : "hover:border-cyan-400"
                  }`}
                  style={{ backgroundColor: !PRESET_COLORS.includes(color) ? color : 'transparent' }}
                >
                  {!PRESET_COLORS.includes(color) ? null : <span className="text-sm text-slate-400">+</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Pod color preview */}
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
            <div className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: color }} />
            <span className="font-bold uppercase tracking-wider text-[10px]">Preview:</span>
            <span className="font-bold text-slate-700 dark:text-slate-100 truncate">{name || "Pod Name"}</span>
          </div>

          {/* Warning / Confirm delete */}
          {confirmDelete && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300 font-bold">
                    This Pod contains {bookmarkCount} Pinchmark{bookmarkCount !== 1 ? "s" : ""}.
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed mt-1">
                    Deleting it will un-Pod them, but won't delete the Pinchmarks themselves.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={() => setConfirmDelete(false)} className="flex-1 rounded-xl h-11 md:h-9">
                  Cancel
                </Button>
                <Button onClick={handleConfirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 md:h-9 font-bold">
                  Delete Pod
                </Button>
              </div>
            </div>
          )}

          {/* Pinned Pod protection notice */}
          {hasPins && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-300 dark:border-amber-500/20 flex gap-2 items-start">
              <span className="text-lg">📌</span>
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                Remove all pins from your Pinchmarks first before deleting the <strong>Pinned</strong> Pod.
              </p>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-between p-5 border-t border-cyan-500/10 dark:border-cyan-500/20 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
          <div>
            {folder && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                disabled={hasPins}
                className={`gap-1.5 h-11 md:h-9 rounded-xl px-4 ${
                  hasPins 
                    ? "text-slate-300 dark:text-slate-600 cursor-not-allowed" 
                    : "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Delete</span>
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={onClose}
              className="px-6 h-11 md:h-9 text-xs font-bold uppercase tracking-widest rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-6 h-11 md:h-9 text-xs font-bold uppercase tracking-widest rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors shadow-lg shadow-cyan-600/20"
            >
              {folder ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}
