import { useState, useEffect } from "react";
import { X, Trash2, Archive } from "lucide-react";
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border-2 border-cyan-500/50 dark:border-cyan-500/40 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyan-500/20 dark:border-cyan-500/30">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              {folder ? "Edit Pod" : "New Pod"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Name */}
          <div>
            <Label htmlFor="pod-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Pod Name
            </Label>
            <Input
              id="pod-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Research, Ideas, Work..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              autoFocus
            />
          </div>

          {/* Color Picker */}
          <div>
            <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ring-offset-2 dark:ring-offset-slate-900 ${
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
                  className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent opacity-0 absolute inset-0 z-10"
                  title="Custom color"
                />
                <div 
                  className={`w-7 h-7 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center transition-all ${
                    !PRESET_COLORS.includes(color) ? "ring-2 ring-cyan-500 ring-offset-2 dark:ring-offset-slate-900 scale-110" : "hover:border-cyan-400"
                  }`}
                  style={{ backgroundColor: !PRESET_COLORS.includes(color) ? color : 'transparent' }}
                >
                  {!PRESET_COLORS.includes(color) ? null : <span className="text-[10px] text-slate-400">+</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Pod color preview */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span>Preview:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{name || "Pod Name"}</span>
          </div>

          {/* Warning / Confirm delete */}
          {confirmDelete && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 space-y-2 animate-in slide-in-from-top-2 duration-200">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                ⚠️ This Pod contains {bookmarkCount} Pinchmark{bookmarkCount !== 1 ? "s" : ""}.
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                Deleting it will un-Pod them, but won't delete the Pinchmarks themselves.
              </p>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)} className="flex-1 rounded-lg">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleConfirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                  Delete Pod
                </Button>
              </div>
            </div>
          )}

          {/* Pinned Pod protection notice */}
          {hasPins && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-300 dark:border-amber-500/20">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                📌 Remove all pins from your Pinchmarks first before deleting the <strong>Pinned</strong> Pod.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-cyan-500/10 dark:border-cyan-500/20 bg-slate-50/50 dark:bg-slate-950/20">
          <div>
            {folder && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                disabled={hasPins}
                className={`gap-1.5 h-9 rounded-lg px-3 ${
                  hasPins 
                    ? "text-slate-300 dark:text-slate-600 cursor-not-allowed" 
                    : "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Delete</span>
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-1.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors shadow-lg shadow-cyan-600/20"
            >
              {folder ? "Save Changes" : "Create Pod"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
