import { useState } from 'react';
import { Eye, EyeOff, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { type SessionError } from '@/services/lobster/lobsterSessionService';

interface SessionStepProps {
  sessionKey: string | null;
}

export function SessionStep({ sessionKey }: SessionStepProps) {
  const [isMasked, setIsMasked] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (sessionKey) {
      navigator.clipboard.writeText(sessionKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
        <p className="text-sm text-green-700 dark:text-green-300 font-medium">
          ✓ Session Active — rate limiting suspended
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Session Key</label>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-slate-50 overflow-hidden">
            <span className="truncate">{isMasked ? '•'.repeat(48) : sessionKey}</span>
          </div>
          <button
            onClick={() => setIsMasked(!isMasked)}
            className="p-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors rounded-lg border border-slate-200 dark:border-slate-700"
            title={isMasked ? 'Show' : 'Hide'}
          >
            {isMasked ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors rounded-lg border border-slate-200 dark:border-slate-700"
            title="Copy"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
        {copied && <p className="text-xs text-green-600 dark:text-green-400">Copied to clipboard!</p>}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-4">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          <strong>Give this key to your agent.</strong> It expires in 15 minutes or when you click "Done".
        </p>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
        ⚠️ Key shown once. If you close this modal without copying, the key is not recoverable.
      </p>
    </>
  );
}

interface SessionResultsProps {
  sessionErrors: SessionError[];
}

export function SessionResults({ sessionErrors }: SessionResultsProps) {
  return (
    <>
      {sessionErrors.length === 0 ? (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-lg font-semibold text-green-700 dark:text-green-300">
            All clear — session closed successfully
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No errors during bulk import.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-3">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{sessionErrors.length} error(s) found</span>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            {sessionErrors.map((err, i) => (
              <div key={i} className="text-xs space-y-0.5">
                <p className="text-slate-600 dark:text-slate-400 break-all">
                  <span className="font-mono">
                    {err.url.length > 50 ? err.url.substring(0, 47) + '...' : err.url}
                  </span>
                </p>
                <p className="text-amber-600 dark:text-amber-400 ml-2">→ {err.reason}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
