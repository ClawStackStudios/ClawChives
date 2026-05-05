import { Shield, Clock, Trash2, XCircle, Eye, EyeOff, Copy, CheckCircle, Download, Key } from "lucide-react";
import { AgentKey, PERMISSION_INFO } from "@/types/agent";
import { maskKey, formatDate, isExpired } from "./agentPermissionsUtils";

interface AgentKeyCardProps {
  agent: AgentKey;
  isVisible: boolean;
  onToggleVisibility: (id: string) => void;
  onRevoke: (id: string) => void;
  onDelete: (id: string) => void;
  copiedKey: string | null;
  onCopy: (key: string, id: string) => void;
}

export function AgentKeyCard({
  agent,
  isVisible,
  onToggleVisibility,
  onRevoke,
  onDelete,
  copiedKey,
  onCopy,
}: AgentKeyCardProps) {
  const permissionInfo = PERMISSION_INFO[agent.permissions?.level] ?? PERMISSION_INFO["READ"];
  const expired = isExpired(agent);
  const safeKey = agent.apiKey ?? "";

  const handleDownload = () => {
    const keyData = {
      type: "agent_key",
      key: safeKey,
      id: agent.id,
      name: agent.name,
      createdAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(keyData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lobster_key_${agent.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className={`bg-white dark:bg-slate-900 rounded-xl border-2 border-cyan-500/30 dark:border-cyan-500/50 shadow-sm transition-all ${
        !agent.isActive || expired 
          ? "opacity-60 grayscale-[0.3]" 
          : "hover:border-cyan-500/50 hover:shadow-md"
      }`}
    >
      <div className="p-6">
        {/* Card Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl border ${permissionInfo.bgColor} ${permissionInfo.color.replace('text-', 'border-').replace('600', '500/30')}`}>
              <Shield className={`w-6 h-6 ${permissionInfo.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{agent.name}</h4>
                <div className="flex gap-1.5">
                  {!agent.isActive && (
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-tighter rounded-md border border-slate-200 dark:border-slate-700">
                      Revoked
                    </span>
                  )}
                  {expired && (
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-tighter rounded-md border border-red-500/20">
                      Expired
                    </span>
                  )}
                </div>
              </div>
              {agent.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{agent.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {agent.isActive && !expired && (
              <button
                onClick={() => onRevoke(agent.id)}
                className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                title="Revoke Key"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => onDelete(agent.id)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete Permanently"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-6">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <Shield className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">Level:</span>
            <span className={permissionInfo.color}>{permissionInfo.label} Access</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hatched:</span>
            <span className="text-slate-700 dark:text-slate-300">{formatDate(agent.createdAt)}</span>
          </div>
          
          {agent.expirationDate && (
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <Clock className={`w-4 h-4 ${expired ? "text-red-500" : "text-slate-400"}`} />
              <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expires:</span>
              <span className={expired ? "text-red-600" : "text-slate-700 dark:text-slate-300"}>
                {formatDate(agent.expirationDate)}
              </span>
            </div>
          )}

          {agent.rateLimit && (
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rate Limit:</span>
              <span className="text-slate-700 dark:text-slate-300">{agent.rateLimit} req/min</span>
            </div>
          )}
        </div>

        {/* Key Display & Actions */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-3 bg-slate-50 dark:bg-slate-950/40 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <Key className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <code className={`text-xs font-mono font-bold truncate ${isVisible ? "text-slate-900 dark:text-slate-200" : "text-slate-400"}`}>
                {isVisible ? safeKey : maskKey(safeKey)}
              </code>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleVisibility(agent.id)}
                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                title={isVisible ? "Hide Key" : "Show Key"}
              >
                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onCopy(safeKey, agent.id)}
                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                title="Copy Key"
              >
                {copiedKey === agent.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                title="Download Key Config"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
