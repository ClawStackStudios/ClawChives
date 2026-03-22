import { useState, useEffect } from "react";
import { Button } from '@/shared/ui/button';
import { ArrowLeft, User, Palette, Shield, Database, LogOut } from "lucide-react";
import { ProfileSettings } from "./components/ProfileSettings";
import { AppearanceSettings } from "./components/AppearanceSettings";
import { AgentPermissions } from "./components/AgentPermissions";
import { ImportExportSettings } from "./components/ImportExportSettings";
import { InteractiveBrand } from '@/shared/branding/InteractiveBrand';

type SettingsTab = "profile" | "appearance" | "agents" | "import-export";

interface SettingsPanelProps {
  onBack: () => void;
  onLogout: () => void;
}

export function SettingsPanel({ onBack, onLogout }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    // Load saved tab from sessionStorage on mount
    const saved = sessionStorage.getItem("cc_settings_tab");
    return (saved as SettingsTab) || "profile";
  });

  // Save active tab to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("cc_settings_tab", activeTab);
  }, [activeTab]);

  const tabs = [
    { id: "profile" as SettingsTab, label: "Profile", icon: User, activeColor: "cyan" },
    { id: "appearance" as SettingsTab, label: "Appearance", icon: Palette, activeColor: "cyan" },
    { id: "agents" as SettingsTab, label: "Lobster Keys", icon: Shield, activeColor: "amber" },
    { id: "import-export" as SettingsTab, label: "Import / Export", icon: Database, activeColor: "cyan" },
  ];

  const getTabClasses = (tabId: SettingsTab, color: string) => {
    const isActive = activeTab === tabId;
    if (color === "amber") {
      return isActive
        ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
    }
    return isActive
      ? "bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800"
      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b-2 border-cyan-600 dark:border-red-500 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Button variant="ghost" onClick={onBack} className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0">
              <ArrowLeft className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Back to Pinchmarks</span>
            </Button>
            <div className="hidden md:flex items-center gap-2 min-w-0">
              <InteractiveBrand onClick={onBack} />
              <span className="text-slate-500 dark:text-slate-400 font-normal text-lg ml-2">/ Settings</span>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30 flex-shrink-0">
            <LogOut className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Mobile: horizontal tab bar */}
        <nav className="md:hidden flex gap-1 mb-4 overflow-x-auto pb-2 bg-white dark:bg-slate-900 rounded-xl border-2 border-red-500/30 dark:border-red-500/50 p-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${getTabClasses(tab.id, tab.activeColor)}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex gap-6">
          {/* Desktop: vertical sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <nav className="bg-white dark:bg-slate-900 rounded-xl border-2 border-red-500/30 dark:border-red-500/50 p-2 space-y-1 sticky top-24">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${getTabClasses(tab.id, tab.activeColor)}`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "appearance" && <AppearanceSettings />}
            {activeTab === "agents" && <AgentPermissions />}
            {activeTab === "import-export" && <ImportExportSettings />}
          </main>
        </div>
      </div>
    </div>
  );
}