import { Database, FileText, Folder, Tag, Star, Archive } from "lucide-react";

export interface DatabaseStats {
  totalBookmarks: number;
  totalFolders: number;
  uniqueTags: number;
  totalSizeMB: number;
  starredCount: number;
  archivedCount: number;
  totalKeys: number;
  totalSettings: number;
}

interface StatsCardsProps {
  stats: DatabaseStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900/40 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
            <span className="text-sm font-medium text-cyan-900 dark:text-cyan-400">Pinchmarks</span>
          </div>
          <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{stats.totalBookmarks}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Folder className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-900 dark:text-amber-400">Pods</span>
          </div>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.totalFolders}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900/40 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-purple-700 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-400">Unique Tags</span>
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.uniqueTags}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-slate-700 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-300">Size</span>
          </div>
          <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{stats.totalSizeMB} MB</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-900 dark:text-amber-400">Starred</span>
          </div>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.starredCount}</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900/40 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Archive className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
            <span className="text-sm font-medium text-cyan-900 dark:text-cyan-400">Archived</span>
          </div>
          <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{stats.archivedCount}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900/40 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-green-700 dark:text-green-400" />
            <span className="text-sm font-medium text-green-900 dark:text-green-400">Keys</span>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalKeys}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-400">Settings</span>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalSettings}</p>
        </div>
      </div>
    </>
  );
}
