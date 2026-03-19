import { Upload, X } from 'lucide-react';
import { Button } from '../ui/button';

interface LobsterImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LobsterImportModal({ isOpen, onClose }: LobsterImportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/50 dark:border-amber-500/70 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-amber-500/30 dark:border-amber-500/50">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
              <Upload className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Lobster Import</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Bulk import via <span className="text-amber-600 dark:text-amber-400 font-medium">lb-</span> agent key
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Lobster Import allows agents with a valid <code className="text-amber-600 dark:text-amber-400 font-mono text-xs bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">lb-</code> key
            and <strong>write</strong> permission to bulk-import up to 1,000 bookmarks per request
            without rate limiting.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Import logic coming soon. Your Lobster is sharpening its claws. 🦞
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-amber-500/20 dark:border-amber-500/30 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-300 dark:border-slate-700"
          >
            Close
          </Button>
          <Button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
          >
            <Upload className="w-4 h-4 mr-2" />
            Ready
          </Button>
        </div>
      </div>
    </div>
  );
}
