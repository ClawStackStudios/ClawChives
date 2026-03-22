import { Shield, Lock } from "lucide-react";

export function KeyInfoPanel() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-amber-500 rounded-xl">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Your Key is Your Identity</h2>
              <p className="text-slate-600 dark:text-slate-400">
                ClawChives uses a new key-based lobthentication system. No passwords to remember, no usernames to forget.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">Generate Your Unique Key</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">When you create an account, we generate a cryptographic key pair specifically for you.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">Download & Store Safely</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">You'll receive a key file. Save it securely—this is your ONLY way to access your account.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">Login with Your Key</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Simply upload your key file to access your clawchive. No passwords, no hassle.</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-100 border border-amber-300 rounded-xl">
              <p className="text-amber-900 font-medium flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Important: Never lose your key file! It cannot be recovered. Store it in multiple secure locations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
