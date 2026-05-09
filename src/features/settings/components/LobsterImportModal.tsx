import { Upload, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useLobsterSession } from './useLobsterSession';
import { SessionStep, SessionResults } from './ImportSteps';
import { ModalContainer } from '@/shared/ui/modals/ModalContainer';

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
    <ModalContainer 
      onClose={handleModalClose} 
      borderColor="border-cyan-500/50 dark:border-cyan-500/70"
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col h-full max-h-[inherit]">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cyan-500/30 dark:border-cyan-500/50 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              step === 'session' ? 'bg-green-100 dark:bg-green-900/30' :
              'bg-cyan-100 dark:bg-cyan-900/30'
            }`}>
              <Upload className={`w-6 h-6 ${
                step === 'session' ? 'text-green-600 dark:text-green-400' :
                'text-cyan-600 dark:text-cyan-400'
              }`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 uppercase tracking-tight">
                {step === 'idle' && 'Lobster Import'}
                {step === 'session' && 'Session Active'}
                {step === 'done' && 'Complete'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                {step === 'idle' && (
                  <>Bulk import via <span className="text-cyan-600 dark:text-cyan-400">lb-</span> agent key</>
                )}
                {step === 'session' && <span className="text-green-600 dark:text-green-400">Rate limiting suspended</span>}
                {step === 'done' && (sessionErrors.length === 0 ? 'No errors' : `${sessionErrors.length} error(s) found`)}
              </p>
            </div>
          </div>
          {step !== 'done' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelSession}
              disabled={isLoading}
              className="h-9 w-9 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          {step === 'idle' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Lobster Import allows agents with a valid <code className="text-cyan-600 dark:text-cyan-400 font-mono text-xs bg-cyan-50 dark:bg-cyan-900/20 px-1.5 py-0.5 rounded border border-cyan-100 dark:border-cyan-800">lb-</code> key
                and <strong>write</strong> permission to bulk-import up to 1,000 bookmarks per request
                without rate limiting.
              </p>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Click <span className="font-bold text-cyan-600 dark:text-cyan-400">Ready</span> to generate an ephemeral session key. You'll hand this key to your agent to begin the bulk import.
              </p>
            </div>
          )}

          {step === 'session' && <div className="animate-in zoom-in-95 duration-200"><SessionStep sessionKey={sessionKey} /></div>}

          {step === 'done' && <div className="animate-in slide-in-from-top-2 duration-300"><SessionResults sessionErrors={sessionErrors} /></div>}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-in bounce-in duration-300">
              <p className="text-sm text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
                <span>⚠️</span> Error: {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-5 border-t border-cyan-500/20 dark:border-cyan-500/30 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-3 shrink-0">
          {step === 'idle' && (
            <>
              <Button
                onClick={handleModalClose}
                variant="outline"
                className="flex-1 md:flex-none h-11 md:h-10 px-8 rounded-xl font-bold uppercase tracking-widest text-xs dark:border-slate-700"
              >
                Close
              </Button>
              <Button
                onClick={handleReady}
                disabled={isLoading}
                className="flex-1 md:flex-none h-11 md:h-10 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20 rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-50 transition-all active:scale-95"
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
                className="flex-1 md:flex-none h-11 md:h-10 px-8 rounded-xl font-bold uppercase tracking-widest text-xs dark:border-slate-700"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDone}
                disabled={isLoading}
                className="flex-1 md:flex-none h-11 md:h-10 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-50 transition-all active:scale-95"
              >
                {isLoading ? 'Closing...' : 'Done'}
              </Button>
            </>
          )}

          {step === 'done' && (
            <Button
              onClick={handleModalClose}
              className="w-full md:w-auto h-11 md:h-10 bg-slate-600 hover:bg-slate-700 text-white px-10 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </ModalContainer>
  );
}
