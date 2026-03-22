import type { Bookmark } from "@/services/types";

interface BookmarkContextMenuProps {
  bookmark: Bookmark;
  contextMenu: { x: number; y: number } | null;
  setContextMenu: (menu: { x: number; y: number } | null) => void;
  userKeyType: string;
}

export function BookmarkContextMenu({
  bookmark,
  contextMenu,
  setContextMenu,
  userKeyType,
}: BookmarkContextMenuProps) {
  if (!contextMenu) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        onClick={(e) => {
          e.stopPropagation();
          setContextMenu(null);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenu(null);
        }}
      />
      <div
        className="fixed z-[51] bg-white dark:bg-slate-900 border-2 border-red-500/50 dark:border-red-500/70 rounded-xl shadow-2xl py-2 min-w-[200px]"
        style={{ top: contextMenu.y, left: contextMenu.x }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setContextMenu(null);
            window.open(bookmark.url, "_blank", "noopener,noreferrer");
          }}
          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
        >
          🌐 Open URL
        </button>
        {userKeyType === "human" && (
          <>
            {bookmark.jinaUrl ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenu(null);
                  window.open(bookmark.jinaUrl!, "_blank", "noopener,noreferrer");
                }}
                className="w-full text-left px-4 py-2 text-sm text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 font-medium transition-colors border-t border-red-500/10 dark:border-red-500/20"
              >
                🦞 Open r.jina.ai Version
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenu(null);
                  window.open(`https://r.jina.ai/${bookmark.url}`, "_blank", "noopener,noreferrer");
                }}
                className="w-full text-left px-4 py-2 text-sm text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 font-medium transition-colors border-t border-red-500/10 dark:border-red-500/20"
              >
                🦞 Open in r.jina.ai
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
