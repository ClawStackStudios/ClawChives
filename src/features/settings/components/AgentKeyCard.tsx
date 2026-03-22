import { Shield, Clock, Trash2, XCircle, Eye, EyeOff, Copy, CheckCircle, Download, AlertTriangle, Key } from "lucide-react";
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
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
    <Card 
      className={`border-2 border-red-500/30 dark:border-red-500/50 transition-all ${
        !agent.isActive || expired 
          ? "opacity-60 bg-gray-50 dark:bg-slate-900/50" 
          : "hover:shadow-md"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${permissionInfo.bgColor}`}>
              <Shield className={`w-5 h-5 ${permissionInfo.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-900 dark:text-slate-50">{agent.name}</h4>
                {!agent.isActive && (
                  <span className="px-2 py-0.5 bg-gray-200 text-slate-600 dark:text-slate-300 text-xs rounded-full">
                    Revoked
                  </span>
                )}
                {expired && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                    Expired
                  </span>
                )}
              </div>
              {agent.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{agent.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {agent.isActive && !expired && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRevoke(agent.id)}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-50"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Revoke
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(agent.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="text-slate-600 dark:text-slate-300">Permissions:</span>
            <span className={`font-medium ${permissionInfo.color}`}>
              {permissionInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-slate-600 dark:text-slate-300">Created:</span>
            <span className="font-medium text-slate-900 dark:text-slate-50">
              {formatDate(agent.createdAt)}
            </span>
          </div>
        </div>

        {agent.expirationDate && (
          <div className="flex items-center gap-2 text-sm mb-4">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-slate-600 dark:text-slate-300">Expires:</span>
            <span className={`font-medium ${expired ? "text-red-600" : "text-slate-900 dark:text-slate-50"}`}>
              {formatDate(agent.expirationDate)}
            </span>
            {expired && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}

        {agent.rateLimit && (
          <div className="flex items-center gap-2 text-sm mb-4">
            <span className="text-slate-600 dark:text-slate-300">Rate Limit:</span>
            <span className="font-medium text-slate-900 dark:text-slate-50">
              {agent.rateLimit} req/min
            </span>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Key className="w-4 h-4 flex-shrink-0 text-slate-500 dark:text-slate-400" />
              <code className={`text-sm font-mono truncate ${isVisible ? "text-slate-900 dark:text-slate-50" : "text-slate-500 dark:text-slate-400"}`}>
                {isVisible ? safeKey : maskKey(safeKey)}
              </code>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleVisibility(agent.id)}
                className="h-8 w-8 p-0"
              >
                {isVisible ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(safeKey, agent.id)}
                className="h-8 w-8 p-0"
              >
                {copiedKey === agent.id ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0"
                title="Download Key"
              >
                <Download className="w-4 h-4 text-gray-500 hover:text-cyan-600" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
