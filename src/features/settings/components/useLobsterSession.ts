import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { startLobsterSession, closeLobsterSession, type SessionError } from '@/services/lobster/lobsterSessionService';

export type ImportStep = 'idle' | 'session' | 'done';

export function useLobsterSession(onClose?: () => void) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<ImportStep>('idle');
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionErrors, setSessionErrors] = useState<SessionError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalidateData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['bookmarks', 'infinite'] });
    await queryClient.invalidateQueries({ queryKey: ['bookmarks', 'stats'] });
  };

  const handleReady = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { sessionId: id, sessionKey: key } = await startLobsterSession();
      setSessionId(id);
      setSessionKey(key);
      setStep('session');
    } catch (e: any) {
      setError(e.message || 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { errors } = await closeLobsterSession(sessionId);
      setSessionErrors(errors);
      await invalidateData();
      setStep('done');
    } catch (e: any) {
      setError(e.message || 'Failed to close session');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = async () => {
    setStep('idle');
    setSessionKey(null);
    setSessionId(null);
    setSessionErrors([]);
    setError(null);
    await invalidateData();
  };

  const handleCancelSession = async () => {
    if (sessionId) {
      setIsLoading(true);
      try {
        await closeLobsterSession(sessionId);
      } catch (e: any) {
        console.error('Failed to revoke session key:', e);
      } finally {
        setIsLoading(false);
      }
    }
    await resetSession();
    if (onClose) onClose();
  };

  return {
    step,
    sessionKey,
    sessionId,
    sessionErrors,
    isLoading,
    error,
    handleReady,
    handleDone,
    handleCancelSession,
    resetSession,
  };
}
