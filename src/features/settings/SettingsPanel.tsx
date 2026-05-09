import { useState, useEffect } from "react";
import { ProfileSettings } from "./components/ProfileSettings";
import { AppearanceSettings } from "./components/AppearanceSettings";
import { AgentPermissions } from "./components/AgentPermissions";
import { ImportExportSettings } from "./components/ImportExportSettings";
import { Header } from "@/features/dashboard/components/layout/Header";
import { Sidebar } from "@/features/dashboard/components/layout/Sidebar";
import type { SettingsTab } from "@/features/dashboard/components/layout/SidebarNav";

interface SettingsPanelProps {
  onBack: () => void;
  onLogout: () => void;
  onShowDatabaseStats: () => void;
}

export function SettingsPanel({ onBack, onLogout, onShowDatabaseStats }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    const saved = sessionStorage.getItem("cc_settings_tab");
    return (saved as SettingsTab) || "profile";
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("cc_sidebar_open");
    return saved !== null ? saved === "true" : true;
  });

  // Track window size for mobile-responsive layout logic
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("cc_settings_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("cc_sidebar_open", sidebarOpen.toString());
  }, [sidebarOpen]);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-30"
        />
      )}

      {/* Sidebar — fixed, never in document flow */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 h-full flex flex-col overflow-hidden bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "256px" }}
      >
        <Sidebar
          folders={[]}
          selectedFolder={null}
          filterType="dashboard"
          searchQuery=""
          onSearchChange={() => {}}
          onSelectFolder={() => {}}
          onFilterChange={() => {}}
          bookmarkCounts={{ all: 0, starred: 0, archived: 0, tags: 0 }}
          settingsMode
          activeSettingsTab={activeTab}
          onSettingsTabChange={setActiveTab}
          onGoToDashboard={onBack}
          onLogout={onLogout}
          onShowDatabaseStats={onShowDatabaseStats}
          onClose={() => setSidebarOpen(false)}
          openCreateFolder={() => {}}
          openEditFolder={() => {}}
        />
      </aside>

      <main 
        className="flex-1 flex flex-col min-w-0 overflow-hidden h-full transition-all duration-300 ease-in-out"
        style={{ paddingLeft: sidebarOpen && !isMobile ? "256px" : 0 }}
      >
        <Header
          title="Settings"
          user={null}
          onAddBookmark={undefined}
          showGridControls={false}
          sortBy="date-desc"
          onSortChange={() => {}}
          viewMode="grid"
          onViewChange={() => {}}
          tagFilter={null}
          onClearTagFilter={() => {}}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 overflow-y-auto min-h-0 p-4 md:p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Configure your ClawChives experience and manage your Lobster identity.
            </p>
          </div>
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "appearance" && <AppearanceSettings />}
          {activeTab === "agents" && <AgentPermissions />}
          {activeTab === "import-export" && <ImportExportSettings />}
        </div>
      </main>
    </div>
  );
}