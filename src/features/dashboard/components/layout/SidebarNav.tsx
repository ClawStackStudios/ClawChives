import { LayoutDashboard, Folder, Star, Tag, Archive, Settings, User, Palette, Shield, Database, LogOut, Pin } from "lucide-react";

export type NavTab = "dashboard" | "all" | "starred" | "tags" | "archived" | "pinned";
export type SettingsTab = "profile" | "appearance" | "agents" | "import-export";

interface SidebarNavProps {
  filterType: NavTab;
  selectedFolder: string | null;
  onFilterChange: (filter: NavTab) => void;
  onSelectFolder: (folderId: string | null) => void;
  bookmarkCounts: {
    all: number;
    starred: number;
    archived: number;
    pinned: number;
    tags: number;
  };
  // Settings mode
  settingsMode?: boolean;
  activeSettingsTab?: SettingsTab;
  onSettingsTabChange?: (tab: SettingsTab) => void;
  onGoToSettings?: () => void;
  onGoToDashboard?: () => void;
  onShowDatabaseStats?: () => void;
  onLogout?: () => void;
  onClose?: () => void;
}

export function SidebarNav({
  filterType,
  selectedFolder,
  onFilterChange,
  onSelectFolder,
  bookmarkCounts,
  settingsMode,
  activeSettingsTab,
  onSettingsTabChange,
  onGoToSettings,
  onGoToDashboard,
  onShowDatabaseStats,
  onLogout,
  onClose,
}: SidebarNavProps) {
  const badgeBase = "text-xs px-2 py-0.5 rounded-full font-bold transition-all duration-200";
  const inactiveBadge = `${badgeBase} bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200`;

  if (settingsMode && activeSettingsTab && onSettingsTabChange && onGoToDashboard) {
    const settingsNavItems = [
      {
        id: "profile" as SettingsTab,
        label: "Profile",
        icon: User,
        active: "bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 shadow-sm",
      },
      {
        id: "appearance" as SettingsTab,
        label: "Appearance",
        icon: Palette,
        active: "bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 shadow-sm",
      },
      {
        id: "agents" as SettingsTab,
        label: "Lobster Keys",
        icon: Shield,
        active: "bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 shadow-sm",
      },
      {
        id: "import-export" as SettingsTab,
        label: "Import / Export",
        icon: Database,
        active: "bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 shadow-sm",
      },
    ];

    return (
      <nav className="space-y-1.5">
        {settingsNavItems.map(({ id, label, icon: Icon, active }) => {
          const isActive = activeSettingsTab === id;
          return (
            <button
              key={id}
              onClick={() => onSettingsTabChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl text-sm font-bold transition-all ${
                isActive ? active : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-5 h-5 md:w-4 md:h-4" />
              {label}
            </button>
          );
        })}
        <div className="border-t border-slate-200 dark:border-slate-800 my-2" />
        <button
          onClick={() => { onGoToDashboard(); if (window.innerWidth < 768) onClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <LayoutDashboard className="w-5 h-5 md:w-4 md:h-4" />
          Back to Dashboard
        </button>

        <div className="border-t border-slate-200 dark:border-slate-800 my-2" />

        {onShowDatabaseStats && (
          <button
            onClick={() => { onShowDatabaseStats(); if (window.innerWidth < 768) onClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
          >
            <Database className="w-5 h-5 md:w-4 md:h-4" />
            Database Stats
          </button>
        )}

        {onLogout && (
          <button
            onClick={() => { onLogout(); if (window.innerWidth < 768) onClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-5 h-5 md:w-4 md:h-4" />
            Claw Out
          </button>
        )}
      </nav>
    );
  }

  const navItems = [
    {
      id: "dashboard" as NavTab,
      label: "Dashboard",
      icon: LayoutDashboard,
      active: "bg-violet-100 text-violet-900 dark:bg-violet-900/30 dark:text-violet-300 shadow-sm",
      inactive: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
      badge: null,
    },
    {
      id: "all" as NavTab,
      label: "All Pinchmarks",
      icon: Folder,
      active: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-300 shadow-sm",
      inactive: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
      activeBadge: `${badgeBase} bg-cyan-200 text-cyan-900 dark:bg-cyan-800 dark:text-cyan-100`,
      badge: bookmarkCounts.all,
    },
    {
      id: "starred" as NavTab,
      label: "Starred",
      icon: Star,
      active: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300 shadow-sm",
      inactive: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
      activeBadge: `${badgeBase} bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100`,
      badge: bookmarkCounts.starred,
    },
    {
      id: "pinned" as NavTab,
      label: "Pinned",
      icon: Pin,
      active: "bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 shadow-sm",
      inactive: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
      activeBadge: `${badgeBase} bg-fuchsia-200 text-fuchsia-900 dark:bg-fuchsia-800 dark:text-fuchsia-100`,
      badge: bookmarkCounts.pinned,
    },
    {
      id: "tags" as NavTab,
      label: "Tags",
      icon: Tag,
      active: "bg-sky-700 text-white dark:bg-sky-800 dark:text-white shadow-sm",
      inactive: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
      activeBadge: `${badgeBase} bg-sky-200 text-sky-900 dark:bg-sky-800 dark:text-sky-100`,
      badge: bookmarkCounts.tags,
    },
    {
      id: "archived" as NavTab,
      label: "Archived",
      icon: Archive,
      active: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300 shadow-sm",
      inactive: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
      activeBadge: `${badgeBase} bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100`,
      badge: bookmarkCounts.archived,
    },
  ];

  return (
    <nav className="space-y-1.5">
      {navItems.map(({ id, label, icon: Icon, active, inactive, badge, activeBadge }) => {
        const isActive = selectedFolder === null && filterType === id;
        return (
          <button
            key={id}
            onClick={() => {
              onSelectFolder(null);
              onFilterChange(id);
              // Only close the sidebar drawer on mobile (< md breakpoint)
              if (window.innerWidth < 768) onClose?.();
            }}
            className={`w-full flex items-center justify-between px-3 py-3 md:py-2 rounded-xl text-sm font-bold transition-all ${isActive ? active : inactive}`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 md:w-4 md:h-4" />
              {label}
            </div>
            {badge !== null && badge !== undefined && (
              <span className={isActive && activeBadge ? activeBadge : inactiveBadge}>
                {badge}
              </span>
            )}
          </button>
        );
      })}
      {onGoToSettings && (
        <>
          <div className="border-t border-slate-200 dark:border-slate-800 my-2" />
          <div className="space-y-1.5">
            <button
              onClick={onGoToSettings}
              className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl text-sm font-bold text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all"
            >
              <Settings className="w-5 h-5 md:w-4 md:h-4" />
              Settings
            </button>
            
            {onShowDatabaseStats && (
              <button
                onClick={() => { onShowDatabaseStats(); onClose?.(); }}
                className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
              >
                <Database className="w-5 h-5 md:w-4 md:h-4" />
                Database Stats
              </button>
            )}

            {onLogout && (
              <button
                onClick={() => { onLogout(); onClose?.(); }}
                className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <LogOut className="w-5 h-5 md:w-4 md:h-4" />
                Claw Out
              </button>
            )}
          </div>
        </>
      )}
    </nav>
  );
}
