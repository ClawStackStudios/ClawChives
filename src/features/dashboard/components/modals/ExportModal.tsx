/**
 * ExportModal — ClawChives©™
 *
 * A sophisticated wizard for granularly selecting and hatching Pinchmarks
 * into JSON, HTML, or CSV bundles.
 *
 * Maintained by CrustAgent©™
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, Download, CheckCircle2, Circle, Search, 
  FileText, Database, LayoutGrid, Loader2, Archive, Star, Filter
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTags } from "@/hooks/useTags";
import { Folder } from "@/services/types";
import { useDatabaseAdapter } from "@/services/database/DatabaseProvider";
import { exportBookmarks } from "@/features/settings/utils/importExportUtils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFormat?: "json" | "html" | "pdf" | "md";
}

export function ExportModal({ isOpen, onClose, initialFormat = 'html' }: ExportModalProps) {
  const db = useDatabaseAdapter();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<"json" | "html" | "pdf" | "md">(initialFormat as any);
  const [exportTheme, setExportTheme] = useState<'light' | 'dark'>('dark');
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  
  const { data: allTags } = useTags();
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && db) {
      loadBookmarks();
    }
  }, [isOpen, db]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const [all, f] = await Promise.all([db.getBookmarks(), db.getFolders()]);
      setBookmarks(all);
      setFolders(f);
      // Default to all selected
      setSelectedIds(new Set(all.map((b: any) => b.id)));
    } catch (err) {
      console.error('[ExportModal] Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookmarks based on search and bulk filter mode
  const filteredBookmarks = useMemo(() => {
    let result = bookmarks;

    if (filterMode === "starred") {
      result = result.filter(b => b.starred);
    } else if (filterMode.startsWith("tag:")) {
      const tag = filterMode.split(":")[1];
      result = result.filter(b => b.tags?.includes(tag));
    } else if (filterMode.startsWith("folder:")) {
      const folderId = filterMode.split(":")[1];
      result = result.filter(b => b.folderId === folderId);
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(b => 
        (b.title || '').toLowerCase().includes(s) ||
        (b.url || '').toLowerCase().includes(s) ||
        (b.description || '').toLowerCase().includes(s)
      );
    }
    return result;
  }, [bookmarks, search, filterMode]);

  const virtualizer = useVirtualizer({
    count: filteredBookmarks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // height of compact row
    overscan: 5,
  });

  const toggleAll = () => {
    if (selectedIds.size === filteredBookmarks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBookmarks.map(n => n.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleExport = async () => {
    if (selectedIds.size === 0 || !db) return;
    setIsExporting(true);
    try {
      // For now, we use existing logic. CSV is mapped to 'csv'.
      const targetFormat = format;
      await exportBookmarks(db, targetFormat as any, exportTheme);
      onClose();
    } catch (err) {
      console.error('[ExportModal] Hatching failed:', err);
      alert('Export failed. Check the logs.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border-2 border-cyan-500/50 dark:border-cyan-500/70 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600" />
        
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
              <Archive className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Hatch Export Wizard</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Select Pinchmarks to include in your sovereign archive</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search & Selection Controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center bg-white dark:bg-slate-900 z-10 relative">
          <div className="relative flex-1 w-full min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search Pinchmarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all dark:text-white"
            />
          </div>
          
          <div className="relative w-full md:w-auto">
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full md:w-[180px] appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500/30 outline-none cursor-pointer"
            >
              <option value="all">All Pinchmarks</option>
              <option value="starred">⭐ Starred Only</option>
              {allTags && allTags.length > 0 && (
                <optgroup label="Tags">
                  {allTags.map(t => <option key={`tag:${t.name}`} value={`tag:${t.name}`}>#{t.name}</option>)}
                </optgroup>
              )}
              {folders && folders.length > 0 && (
                <optgroup label="Folders">
                  {folders.map(f => <option key={`folder:${f.id}`} value={`folder:${f.id}`}>📁 {f.name}</option>)}
                </optgroup>
              )}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <button 
            onClick={toggleAll}
            className="w-full md:w-auto text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            {selectedIds.size === filteredBookmarks.length ? 'Deselect All' : 'Select All Filtered'}
          </button>
        </div>

        {/* Selection List */}
        <div 
          ref={parentRef}
          className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-950/20"
        >
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm font-medium">Scanning the reef...</p>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="py-20 text-center text-slate-500 dark:text-slate-400">
              <p className="font-medium">No Pinchmarks found matching your filters.</p>
            </div>
          ) : (
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map(virtualRow => {
                const b = filteredBookmarks[virtualRow.index];
                const isSelected = selectedIds.has(b.id);
                return (
                  <button
                    key={b.id}
                    onClick={() => toggleOne(b.id)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={`flex items-center gap-3 px-6 py-2 border-b transition-all text-left group ${
                      isSelected 
                        ? 'bg-cyan-50/80 dark:bg-cyan-900/10 border-cyan-500/20' 
                        : 'bg-transparent border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isSelected 
                        ? <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        : <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-cyan-400/50" />
                      }
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <h4 className={`font-semibold text-sm truncate max-w-[200px] md:max-w-[250px] ${isSelected ? 'text-cyan-800 dark:text-cyan-200' : 'text-slate-800 dark:text-slate-200'}`}>
                        {b.title || "Untitled"}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium truncate flex-1 min-w-0">{b.url}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {b.starred && (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      )}
                      {b.tags?.slice(0, 2).map((tag: string) => (
                         <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 truncate max-w-[80px]">
                           {tag}
                         </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Format & Action */}
        <div className="p-6 border-t border-cyan-500/20 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <div className="flex items-center justify-between gap-4 px-1 h-6">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Archive Format</label>
                {format === 'html' && (
                  <div className="flex bg-slate-200 dark:bg-slate-900 p-0.5 rounded-lg gap-0.5 transition-all animate-in fade-in slide-in-from-right-2">
                    <button 
                      onClick={() => setExportTheme('light')}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${
                        exportTheme === 'light' 
                          ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Light
                    </button>
                    <button 
                      onClick={() => setExportTheme('dark')}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${
                        exportTheme === 'dark' 
                          ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-xl gap-1">
                {[
                  { id: 'html', label: 'HTML', icon: LayoutGrid },
                  { id: 'pdf', label: 'PDF', icon: FileText },
                  { id: 'md', label: 'MD', icon: FileText },
                  { id: 'json', label: 'JSON', icon: Database },
                ].map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      format === fmt.id 
                        ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <fmt.icon className="w-3.5 h-3.5" />
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-slate-900 dark:text-white">{selectedIds.size} Pinchmarks Selected</div>
                <div className="text-[10px] text-slate-500 font-medium italic">Standard Reef Package</div>
              </div>
              <button
                disabled={selectedIds.size === 0 || isExporting || loading}
                onClick={handleExport}
                className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3 bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl shadow-xl shadow-cyan-600/20 transition-all min-w-[180px]"
              >
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isExporting ? 'Hatching...' : 'Hatch Archive'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
