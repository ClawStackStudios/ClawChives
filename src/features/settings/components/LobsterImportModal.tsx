import { Upload, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useLobsterSession } from './useLobsterSession';
import { SessionStep, SessionResults } from './ImportSteps';

interface LobsterImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LobsterImportModal({ isOpen, onClose }: LobsterImportModalProps) {
  const {
    step,
    sessionKey,
    sessionErrors,
    isLoading,
    error,
    handleReady,
    handleDone,
    handleCancelSession,
    resetSession,
  } = useLobsterSession(onClose);

  if (!isOpen) return null;

  const handleModalClose = async () => {
    await resetSession();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/50 dark:border-amber-500/70 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-amber-500/30 dark:border-amber-500/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              step === 'session' ? 'bg-green-100 dark:bg-green-900/30' :
              'bg-amber-100 dark:bg-amber-900/30'
            }`}>
              <Upload className={`w-6 h-6 ${
                step === 'session' ? 'text-green-600 dark:text-green-400' :
                'text-amber-600 dark:text-amber-400'
              }`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                {step === 'idle' && 'Lobster Import'}
                {step === 'session' && 'Lobster Session Active'}
                {step === 'done' && 'Session Complete'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {step === 'idle' && (
                  <>Bulk import via <span className="text-amber-600 dark:text-amber-400 font-medium">lb-</span> agent key</>
                )}
                {step === 'session' && <span className="text-green-600 dark:text-green-400">Rate limiting suspended</span>}
                {step === 'done' && (sessionErrors.length === 0 ? 'No errors' : `${sessionErrors.length} error(s) found`)}
              </p>
            </div>
          </div>
          {step !== 'done' && (
            <button
              onClick={handleCancelSession}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
              title="Close"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {step === 'idle' && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Lobster Import allows agents with a valid <code className="text-amber-600 dark:text-amber-400 font-mono text-xs bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">lb-</code> key
                and <strong>write</strong> permission to bulk-import up to 1,000 bookmarks per request
                without rate limiting.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Click "Ready" to generate an ephemeral session key. You'll hand this key to your agent to begin the bulk import.
              </p>
            </>
          )}

          {step === 'session' && <SessionStep sessionKey={sessionKey} />}

          {step === 'done' && <SessionResults sessionErrors={sessionErrors} />}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300">Error: {error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-amber-500/20 dark:border-amber-500/30 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          {step === 'idle' && (
            <>
              <Button
                onClick={handleModalClose}
                variant="outline"
                className="border-slate-300 dark:border-slate-700"
              >
                Close
              </Button>
              <Button
                onClick={handleReady}
                disabled={isLoading}
                className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Ready
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'session' && (
            <>
              <Button
                onClick={handleCancelSession}
                variant="outline"
                className="border-slate-300 dark:border-slate-700"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDone}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 disabled:opacity-50"
              >
                {isLoading ? 'Closing...' : 'Done'}
              </Button>
            </>
          )}

          {step === 'done' && (
            <Button
              onClick={handleModalClose}
              className="bg-slate-600 hover:bg-slate-700 text-white"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
