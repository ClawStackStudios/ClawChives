import { useState, useEffect } from "react";
import { Label } from '@/shared/ui/label';
import { Palette, Layout, Grid, List, Sun, Moon, Monitor } from "lucide-react";
import { useDatabaseAdapter } from "@/services/database/DatabaseProvider";

import { useTheme } from '@/shared/theme/theme-provider';

type Layout = "grid" | "list" | "masonry";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [layout, setLayout] = useState<Layout>("grid");
  const [itemsPerPage, setItemsPerPage] = useState<12 | 24 | 48>(12);
  const [compactMode, setCompactMode] = useState(false);
  const [showFavicons, setShowFavicons] = useState(true);
  const [sortBy, setSortBy] = useState<"dateAdded" | "title" | "starred">("dateAdded");
  const [notifications, setNotifications] = useState(true);
  const [pwaUpdates, setPwaUpdates] = useState(true);
  const [isResizable, setIsResizable] = useState(() => localStorage.getItem("cc_is_resizable") === "true");
  const [showToast, setShowToast] = useState(false);

  const db = useDatabaseAdapter();

  useEffect(() => {
    loadAppearanceSettings();
  }, []);

  const loadAppearanceSettings = async () => {
    if (!db) return;
    try {
      const settings = await db.getAppearanceSettings();
      if (settings) {
        // Note: We don't call setTheme here - the theme is already loaded from sessionStorage
        // in ThemeProvider. We just sync the UI state to show the current theme setting.
        setLayout(settings.layout);
        setItemsPerPage(settings.itemsPerPage as 12 | 24 | 48);
        setCompactMode(settings.compactMode ?? false);
        setShowFavicons(settings.showFavicons ?? true);
        setSortBy(settings.sortBy || "dateAdded");
        setNotifications(settings.notifications ?? true);
        setPwaUpdates(settings.pwaUpdates ?? true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async () => {
    if (!db) return;
    await db.saveAppearanceSettings({
      theme,
      layout,
      itemsPerPage,
      compactMode,
      showFavicons,
      sortBy,
      notifications,
      pwaUpdates,
    });
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-cyan-500/30 dark:border-cyan-500/50 shadow-sm transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold leading-none tracking-tight text-cyan-600 dark:text-cyan-400 mb-1.5">Appearance Settings</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Customize how ClawChives looks and feels</p>
        </div>
        <div className="p-6 space-y-6">
          {/* Theme Selection */}
          <div>
            <Label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={(e) => setTheme("light", e.clientX, e.clientY)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  theme === "light"
                    ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-100"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                <Sun className="w-6 h-6 text-amber-500" />
                <span className="text-sm font-medium">Light</span>
              </button>
              <button
                onClick={(e) => setTheme("dark", e.clientX, e.clientY)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  theme === "dark"
                    ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-100"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                <Moon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                <span className="text-sm font-medium">Dark</span>
              </button>
              <button
                onClick={(e) => setTheme("auto", e.clientX, e.clientY)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  theme === "auto"
                    ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-100"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                <Monitor className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                <span className="text-sm font-medium">Auto</span>
              </button>
            </div>
          </div>

          {/* Layout Selection */}
          <div>
            <Label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">Bookmark Layout</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setLayout("grid")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  layout === "grid"
                    ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-100"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                <Grid className="w-6 h-6 text-cyan-600" />
                <span className="text-sm font-medium">Grid</span>
              </button>
              <button
                onClick={() => setLayout("list")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  layout === "list"
                    ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-100"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                <List className="w-6 h-6 text-cyan-600" />
                <span className="text-sm font-medium">List</span>
              </button>
              <button
                onClick={() => setLayout("masonry")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  layout === "masonry"
                    ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-100"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                <Layout className="w-6 h-6 text-cyan-600" />
                <span className="text-sm font-medium">Masonry</span>
              </button>
            </div>
          </div>

          {/* Items Per Page */}
          <div>
            <Label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">Items Per Page</Label>
            <div className="flex gap-2">
              {[12, 24, 48, 96].map((count) => (
                <button
                  key={count}
                  onClick={() => setItemsPerPage(count as 12 | 24 | 48)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    itemsPerPage === count
                      ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-100"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium text-slate-900 dark:text-white">Compact Mode</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Reduce spacing for more content</p>
              </div>
              <button
                onClick={() => setCompactMode(!compactMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  compactMode ? "bg-cyan-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full transition-transform ${
                    compactMode ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium text-slate-900 dark:text-white">Show Favicons</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Display website icons on bookmarks</p>
              </div>
              <button
                onClick={() => setShowFavicons(!showFavicons)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  showFavicons ? "bg-cyan-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full transition-transform ${
                    showFavicons ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium text-slate-900 dark:text-white">Resizable Sidebar</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enable draggable sidebar width (Dashboard only)</p>
              </div>
              <button
                onClick={() => {
                  const newVal = !isResizable;
                  setIsResizable(newVal);
                  localStorage.setItem("cc_is_resizable", newVal ? "true" : "false");
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isResizable ? "bg-cyan-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full transition-transform ${
                    isResizable ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleSaveSettings}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/20 active:scale-[0.99] transition-all"
            >
              <Palette className="w-4 h-4" />
              Apply Appearance Settings
            </button>
            
            {showToast && (
              <div className="mt-4 p-3 rounded-lg bg-cyan-500 text-white font-bold text-center animate-in fade-in slide-in-from-top-2 duration-300">
                Appearance Settings Applied Successfully! 🦞
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}