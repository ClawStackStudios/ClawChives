import { useState } from "react";
import { Button } from '@/shared/ui/button';

interface AuthGatewayProps {
  onCreateAccount: () => void;
}

export function AuthGateway({ onCreateAccount }: AuthGatewayProps) {
  const [gatewayMode, setGatewayMode] = useState<"human" | "agent">("human");
  const [agentTab, setAgentTab] = useState<"botkit" | "manual">("botkit");

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-full backdrop-blur-sm">
          <button 
            onClick={() => setGatewayMode("human")}
            className={`flex-1 px-4 py-2.5 text-xs font-bold rounded-full transition-all uppercase tracking-widest ${gatewayMode === "human" ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/20" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
          >
            👤 I'm a Human
          </button>
          <button 
            onClick={() => setGatewayMode("agent")}
            className={`flex-1 px-4 py-2.5 text-xs font-bold rounded-full transition-all uppercase tracking-widest ${gatewayMode === "agent" ? "bg-amber-500 text-white shadow-lg shadow-amber-900/20" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
          >
            🤖 I'm an Agent
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
          {gatewayMode === "human" ? (
            <div className="animate-in fade-in zoom-in duration-300">
              <h3 className="text-slate-900 dark:text-white font-bold mb-6 text-center text-xs uppercase tracking-widest leading-relaxed">
                Join the <br /> <span className="text-cyan-600">Reef</span> 🌊
              </h3>
              <div className="text-sm text-slate-500 dark:text-slate-400 space-y-4 px-1">
                <p className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-md font-black mr-3 text-xs flex-shrink-0">1</span> 
                  Generate your unguessable Identity Key
                </p>
                <p className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-md font-black mr-3 text-xs flex-shrink-0">2</span> 
                  Store it somewhere safe (Offline)
                </p>
                <p className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-md font-black mr-3 text-xs flex-shrink-0">3</span> 
                  Drag & Drop to authenticate anywhere
                </p>
              </div>
              <Button 
                onClick={onCreateAccount}
                className="w-full mt-8 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20"
              >
                Create Human Identity
              </Button>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-300">
              <h3 className="text-slate-900 dark:text-white font-bold mb-6 text-center text-xs uppercase tracking-widest leading-relaxed">
                Integrate your <br /> <span className="text-amber-500">Lobsters</span> 🦞
              </h3>
              
              <div className="flex mb-6 bg-slate-100 dark:bg-slate-950 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => setAgentTab("botkit")}
                  className={`flex-1 px-3 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest ${agentTab === "botkit" ? "bg-amber-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  BotKit
                </button>
                <button 
                  onClick={() => setAgentTab("manual")}
                  className={`flex-1 px-3 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest ${agentTab === "manual" ? "bg-amber-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  Manual
                </button>
              </div>

              {agentTab === "botkit" ? (
                <>
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center group relative overflow-hidden">
                    <code className="text-amber-600 dark:text-amber-400 text-xs font-mono break-all leading-relaxed text-center relative z-10 selection:bg-amber-200 dark:selection:bg-amber-900/50">
                      npx clawchives-botkit init
                    </code>
                    <div className="absolute inset-0 bg-amber-50 dark:bg-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-3 px-1">
                    <p className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md font-black mr-3 text-[10px] flex-shrink-0">1</span> 
                      Initialize the BotKit Toolkit in your project
                    </p>
                    <p className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md font-black mr-3 text-[10px] flex-shrink-0">2</span> 
                      Generate Key natively inside ClawChives Settings
                    </p>
                    <p className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md font-black mr-3 text-[10px] flex-shrink-0">3</span> 
                      Assign granular permissions to limit blast radius
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
                    <code className="text-amber-600 dark:text-amber-400 text-[10px] font-mono whitespace-pre text-left leading-relaxed">
{`POST /api/auth/token
{
  "type": "agent",
  "keyHash": "<SHA-256>"
}`}
                    </code>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-3 px-1">
                    <p className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md font-black mr-3 text-[10px] flex-shrink-0">1</span> 
                      Manually create a key via settings 
                    </p>
                    <p className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md font-black mr-3 text-[10px] flex-shrink-0">2</span> 
                      Exchange hashed <code className="mx-1 px-1 bg-slate-200 dark:bg-slate-800 rounded">lb-</code> key for API token
                    </p>
                    <p className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md font-black mr-3 text-[10px] flex-shrink-0">3</span> 
                      Pass <code className="mx-1 px-1 bg-slate-200 dark:bg-slate-800 rounded">Bearer</code> token in Authorization header
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
