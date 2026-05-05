import { X, Sun, Moon, Monitor, LogIn, UserPlus } from "lucide-react";
import { Button } from '@/shared/ui/button';
import { useTheme } from '@/shared/theme/theme-provider';
import { InteractiveBrand } from '@/shared/branding/InteractiveBrand';

interface LandingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onCreateAccount: () => void;
}

export function LandingSidebar({ 
  isOpen, 
  onClose, 
  onLogin, 
  onCreateAccount 
}: LandingSidebarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-[70] w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/50">
            <InteractiveBrand showIcon={true} />
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Auth Actions */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
                Sovereign Entry
              </p>
              <Button 
                onClick={() => { onLogin(); onClose(); }}
                className="w-full justify-start gap-3 h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 border-none shadow-none text-sm font-bold"
              >
                <LogIn className="w-4 h-4 text-amber-500" />
                Claw In
              </Button>
              <Button 
                onClick={() => { onCreateAccount(); onClose(); }}
                className="w-full justify-start gap-3 h-12 bg-cyan-600 hover:bg-cyan-700 text-white border-none shadow-lg shadow-cyan-600/20 text-sm font-bold"
              >
                <UserPlus className="w-4 h-4" />
                Hatch Habitat
              </Button>
            </div>

            {/* Theme Habitat */}
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
                Visual Habitat
              </p>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={(e) => setTheme("light", e.clientX, e.clientY)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                    theme === 'light' 
                      ? 'bg-white text-amber-600 shadow-md ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">Light</span>
                </button>
                <button
                  onClick={(e) => setTheme("dark", e.clientX, e.clientY)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                    theme === 'dark' 
                      ? 'bg-slate-800 text-cyan-400 shadow-md ring-1 ring-slate-700' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">Dark</span>
                </button>
                <button
                  onClick={(e) => setTheme("auto", e.clientX, e.clientY)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                    theme === 'auto' 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-md ring-1 ring-slate-200 dark:ring-slate-600' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">Auto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Sovereign & Local
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
