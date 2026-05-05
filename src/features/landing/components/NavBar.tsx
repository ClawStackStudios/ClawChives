import { Sun, Moon, Monitor, Menu } from "lucide-react";
import { Button } from '@/shared/ui/button';
import { InteractiveBrand } from '@/shared/branding/InteractiveBrand';
import { useTheme } from '@/shared/theme/theme-provider';

interface NavBarProps {
  onLogin: () => void;
  onCreateAccount: () => void;
  onOpenSidebar: () => void;
}

export function NavBar({ onLogin, onCreateAccount, onOpenSidebar }: NavBarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b-2 border-cyan-600 dark:border-red-500 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenSidebar}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <InteractiveBrand showIcon={true} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700 ml-4">
              <button
                onClick={(e) => setTheme("light", e.clientX, e.clientY)}
                className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                title="Light Mode"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => setTheme("dark", e.clientX, e.clientY)}
                className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-700 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                title="Dark Mode"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => setTheme("auto", e.clientX, e.clientY)}
                className={`p-1.5 rounded-full transition-all ${theme === 'auto' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                title="System Theme"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button 
              onClick={onLogin} 
              className="bg-amber-500 hover:bg-amber-600 text-white dark:text-slate-900 font-medium shadow-sm"
            >
              Claw In
            </Button>
            <Button 
              onClick={onCreateAccount}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20"
            >
              Hatch Habitat
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
