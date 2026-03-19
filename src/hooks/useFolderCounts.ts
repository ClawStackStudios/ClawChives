/**
 * useFolderCounts — Fetch bookmark counts per folder
 * ─────────────────────────────────────────────────────────────────────
 * Accurate counts from the backend, including non-loaded bookmarks.
 * Always refetches on any bookmark/folder mutation (staleTime: 0).
 */

import { useQuery } from '@tanstack/react-query';
import { useDatabaseAdapter } from '../services/database/DatabaseProvider';

export const FOLDER_COUNTS_QUERY_KEY = ['bookmarks', 'folder-counts'];

export function useFolderCounts() {
  const db = useDatabaseAdapter();
  return useQuery({
    queryKey: FOLDER_COUNTS_QUERY_KEY,
    queryFn: () => db!.getFolderCounts(),
    enabled: !!db,
    staleTime: 0, // Invalidate on mutations
  });
}
