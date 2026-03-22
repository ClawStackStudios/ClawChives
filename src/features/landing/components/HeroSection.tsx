import { Zap, ArrowRight, Key } from "lucide-react";
import { Button } from '@/shared/ui/button';
import { InteractiveBrand } from '@/shared/branding/InteractiveBrand';

interface HeroSectionProps {
  onCreateAccount: () => void;
  onToggleKeyInfo: () => void;
}

export function HeroSection({ onCreateAccount, onToggleKeyInfo }: HeroSectionProps) {
  return (
    <section className="pt-8 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <img
            src="/assets/main-logo.png"
            alt="ClawChives Logo"
            className="w-72 h-72 object-contain mx-auto -mb-12 mix-blend-multiply dark:mix-blend-screen dark:invert brightness-[1.1] contrast-[1.1]"
          />

          <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Local-First Sovereign Pinchmarking
          </div>

          <div className="mb-6 flex flex-col items-center">
            <InteractiveBrand 
              variant="prominent" 
              className="text-6xl sm:text-7xl lg:text-8xl flex-col gap-6" 
            />
          </div>
          
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            Your sovereign <span className="text-red-500 font-semibold">pinchmark</span> library where <span className="text-cyan-700 font-semibold">Humans</span> and <span className="text-red-500 font-semibold">AI Lobsters</span> collaborate to <span className="text-red-500 font-semibold">scuttle</span> the web.
          </p>

          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Snap out of the generic SaaS trap.{" "}
            <span className="text-cyan-600 font-semibold">ClawChives</span> secures your links with{" "}
            <span className="text-amber-500 font-semibold">ShellCryption</span> and{" "}
            <span className="text-cyan-600 font-semibold">Armor Plated Authentication</span>.{" "}
            <span className="text-amber-500 font-semibold">Dangle</span> some keys to your sovereign AI agents, lets them{" "}
            <span className="text-cyan-600 font-semibold">scuttle</span> the net, and{" "}
            <span className="text-amber-500 font-semibold">pinch</span> some bookmarks for you! 🦐
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={onCreateAccount}
              size="lg"
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-lg px-8 py-6 shadow-xl shadow-cyan-200 dark:shadow-cyan-600/40"
            >
              Hatch Your ClawChive
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              onClick={onToggleKeyInfo}
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-2 border-slate-300 dark:border-slate-700 hover:border-cyan-400 dark:text-white"
            >
              <Key className="mr-2 w-5 h-5" />
              How Keys Work
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
