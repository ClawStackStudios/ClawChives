import { Database, Users, Bot, Lock, Globe, FolderTree } from "lucide-react";

export function FeaturesGrid() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Human + <span className="text-red-500">Lobster</span> Collaboration
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            <span className="text-cyan-600 font-semibold">ClawChives</span> allows you to{" "}
            <span className="text-amber-500 font-semibold">molt</span> away the tediousness of grabbing multiple URLs or organizing those unkempt libraries by hand.{" "}
            Let your <span className="text-red-500 font-semibold">Lobsters</span> help you organize that mess!{" "}
            Don&apos;t feel like going out on the boat today? No problem — you{" "}
            <span className="text-amber-500 font-semibold">cast the net</span>, and your agent{" "}
            <span className="text-cyan-600 font-semibold">pulls in the URLs</span>!{" "}
            <br className="hidden sm:block" /><br className="hidden sm:block" />
            All <span className="text-amber-500 font-semibold">pinchmarks</span> are parsed and converted to a markdown version so your agent has a more{" "}
            <span className="text-cyan-600 font-semibold">traversable format</span> to{" "}
            <span className="text-cyan-600 font-semibold">scuttle</span> through.{" "}
            <br className="hidden sm:block" /><br className="hidden sm:block" />
            <em className="text-slate-700 dark:text-slate-300">
              ClawChives is a <span className="text-red-500 font-semibold">carapace</span> for your{" "}
              <span className="text-amber-500 font-semibold">pinchmarks</span>, that{" "}
              <span className="text-cyan-600 font-semibold">molts</span>, but retains its core.
            </em>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-cyan-300 transition-all">
            <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-cyan-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3">Human Curated</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Cast your own net and haul in the links yourself. Pinch URLs with precision, tag your catch, and sort your shell collection exactly your way.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-amber-300 transition-all">
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
              <Bot className="w-7 h-7 text-amber-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3"><span className="text-red-500">Lobster</span> Powered</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Unleash your <span className="text-red-500 font-semibold">Lobsters</span> to scuttle the seafloor of the web. They'll pinch links, research topics, and pack your shell full of curated catches.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-green-300 transition-all">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <FolderTree className="w-7 h-7 text-green-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3">Shared Tide Pool</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Humans and <span className="text-red-500 font-semibold">Lobsters</span> share the same reef. Both species sort the catch into the same folders, tags, and burrows — no territorial disputes.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-purple-300 transition-all">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Database className="w-7 h-7 text-purple-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3">Your Own Shell</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your pinchmarks live in your own shell — no landlords, no cloud tanks. IndexedDB or SQLite, your burrow, your rules. No evictions.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-300 transition-all">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Lock className="w-7 h-7 text-blue-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3">ShellCrypted Vault</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Every pinchmark is locked in armour-plated encryption. Nobody cracks your stash without the right key. Not even us — we don't have it.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-rose-300 transition-all">
            <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
              <Globe className="w-7 h-7 text-rose-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3"><span className="text-red-500">Lobster</span> Permits</h3>
            <p className="text-slate-600 dark:text-slate-400">
              You decide which <span className="text-red-500 font-semibold">Lobsters</span> get the master claw and which only browse the reef. Granular read/write/delete permits, per crustacean. You're the Captain.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
