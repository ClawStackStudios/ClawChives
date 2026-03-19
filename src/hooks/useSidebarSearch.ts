/**
 * useSidebarSearch — Lightweight folder filtering without React Query
 * ─────────────────────────────────────────────────────────────────────
 * Filters folders by name using simple text matching.
 * No async operations, no cache invalidation needed.
 * Pure client-side filtering for snappy UX.
 */

import { useMemo } from 'react';
import type { Folder } from '../services/types';

export function useSidebarSearch(folders: Folder[], searchQuery: string) {
  return useMemo(() => {
    if (!searchQuery.trim()) return folders;
    const q = searchQuery.toLowerCase();
    return folders.filter((f) => f.name.toLowerCase().includes(q));
  }, [folders, searchQuery]);
}
