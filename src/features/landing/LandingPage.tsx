import { useState } from "react";
import { NavBar } from "./components/NavBar";
import { HeroSection } from "./components/HeroSection";
import { KeyInfoPanel } from "./components/KeyInfoPanel";
import { AuthGateway } from "./components/AuthGateway";
import { FeaturesGrid } from "./components/FeaturesGrid";
import { CTASection } from "./components/CTASection";
import { LandingFooter } from "./components/LandingFooter";

interface LandingPageProps {
  onCreateAccount: () => void;
  onLogin: () => void;
}

export function LandingPage({ onCreateAccount, onLogin }: LandingPageProps) {
  const [showKeyInfo, setShowKeyInfo] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <NavBar onLogin={onLogin} onCreateAccount={onCreateAccount} />
      
      <main>
        <HeroSection 
          onCreateAccount={onCreateAccount} 
          onToggleKeyInfo={() => setShowKeyInfo(!showKeyInfo)} 
        />
        
        {showKeyInfo && <KeyInfoPanel />}
        
        <AuthGateway onCreateAccount={onCreateAccount} />
        
        <FeaturesGrid />
        
        <CTASection onLogin={onLogin} onCreateAccount={onCreateAccount} />
      </main>

      <LandingFooter />
    </div>
  );
}
