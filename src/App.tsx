import { useState, useEffect } from "react";
import { LandingPage } from "./components/landing/LandingPage";
import { LoginForm } from "./components/auth/LoginForm";
import { SetupWizard } from "./components/auth/SetupWizard";
import { Dashboard } from "./components/dashboard/Dashboard";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { DatabaseStatsModal } from "./components/dashboard/DatabaseStatsModal";
import * as IndexedDB from "./lib/indexedDB";
import type { User } from "./lib/indexedDB";

type View = "landing" | "login" | "setup" | "dashboard" | "settings";

function App() {
  const [currentView, setCurrentView] = useState<View>("landing");
  const [_isAuthenticated, setIsAuthenticated] = useState(false);
  const [_currentUser, setCurrentUser] = useState<User | null>(null);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  /** On startup: check if there's a persisted user account to auto-navigate to dashboard */
  const checkAuth = async () => {
    try {
      const user = await IndexedDB.getUser();
      if (user) {
        // User exists — still require key-file login for security
        // We show landing so they can click Login
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const handleCreateAccount = () => {
    setCurrentView("setup");
  };

  const handleLogin = () => {
    setCurrentView("login");
  };

  const handleSetupComplete = (_username: string, _token: string) => {
    setIsAuthenticated(true);
    setCurrentView("dashboard");
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView("landing");
  };

  const handleGoToSettings = () => {
    setCurrentView("settings");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {currentView === "landing" && (
        <LandingPage 
          onCreateAccount={handleCreateAccount}
          onLogin={handleLogin}
        />
      )}

      {currentView === "login" && (
        <LoginForm 
          onSuccess={handleLoginSuccess}
          onCancel={() => setCurrentView("landing")}
        />
      )}

      {currentView === "setup" && (
        <SetupWizard 
          onComplete={handleSetupComplete}
        />
      )}

      {currentView === "dashboard" && (
        <Dashboard 
          onLogout={handleLogout}
          onGoToSettings={handleGoToSettings}
          onShowDatabaseStats={() => setShowDatabaseModal(true)}
        />
      )}

      {currentView === "settings" && (
        <SettingsPanel 
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
        />
      )}

      <DatabaseStatsModal 
        isOpen={showDatabaseModal}
        onClose={() => setShowDatabaseModal(false)}
      />
    </div>
  );
}

export default App;