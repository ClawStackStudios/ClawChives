import { Search, Star, Archive, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface BookmarkTableProps {
  filteredBookmarks: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onConfirmDelete: (id: string) => void;
  onClearAll: () => void;
  totalBookmarks: number;
}

export function BookmarkTable({
  filteredBookmarks,
  searchQuery,
  setSearchQuery,
  onConfirmDelete,
  onClearAll,
  totalBookmarks,
}: BookmarkTableProps) {
  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            All Pinchmarks
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search pinchmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBookmarks.map((bookmark) => (
                <tr
                  key={bookmark.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {bookmark.starred && (
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                      )}
                      {bookmark.archived && (
                        <Archive className="w-4 h-4 text-cyan-600" />
                      )}
                      <span className="font-medium text-slate-900 dark:text-slate-50">
                        {bookmark.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-600 hover:underline truncate block max-w-xs"
                    >
                      {bookmark.url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {bookmark.tags?.slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {bookmark.tags?.length > 2 && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          +{bookmark.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(bookmark.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onConfirmDelete(bookmark.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookmarks.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No Pinchmarks found 🦞
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Showing {filteredBookmarks.length} of {totalBookmarks} Pinchmarks
        </div>
        <Button
          variant="destructive"
          onClick={onClearAll}
          className="bg-red-600 hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All Data
        </Button>
      </div>
    </>
  );
}
