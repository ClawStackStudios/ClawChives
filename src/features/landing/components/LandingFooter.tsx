import { InteractiveBrand } from '@/shared/branding/InteractiveBrand';

export function LandingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-6 md:mb-0">
            <InteractiveBrand showIcon={true} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          </div>
          <div className="text-sm">
            © 2026 ClawChives. Your Sovereign <span className="text-red-500 font-semibold">Pinchmark</span> Library.
          </div>
        </div>
      </div>
    </footer>
  );
}
