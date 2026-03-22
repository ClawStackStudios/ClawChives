import { ArrowRight } from "lucide-react";
import { Button } from '@/shared/ui/button';

interface CTASectionProps {
  onCreateAccount: () => void;
  onLogin: () => void;
}

export function CTASection({ onCreateAccount, onLogin }: CTASectionProps) {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-600 to-cyan-800">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="text-5xl">🦞</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to Build Your ClawChive?
        </h2>
        <p className="text-xl text-cyan-100 mb-10 max-w-2xl mx-auto">
          Join the Reef, Let your <span className="text-red-500 font-semibold">Lobsters</span> help keep your <span className="text-amber-500 font-semibold">tacklebox</span> organized and streamlined.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onCreateAccount}
            size="lg"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-lg px-8 py-6 shadow-xl shadow-red-900/20"
          >
            Hatch Your ClawChive
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            onClick={onLogin}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-white dark:text-slate-900 font-medium text-lg px-8 py-6 shadow-xl shadow-amber-900/20"
          >
            Login with Key
          </Button>
        </div>
      </div>
    </section>
  );
}
