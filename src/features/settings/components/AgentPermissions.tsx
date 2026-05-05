import { useState, useEffect } from "react";
import { 
  getAllAgentKeys, 
  deleteAgentKey, 
  revokeAgentKey 
} from "@/services/agents/agentKeyService";
import { AgentKey } from "@/types/agent";
import { Key, Plus } from "lucide-react";
import { AgentKeyGeneratorModal } from "./AgentKeyGeneratorModal";
import { ConfirmModal } from '@/shared/ui/LobsterModal';
import { AgentKeyCard } from "./AgentKeyCard";
import { handleCopyText } from "./agentPermissionsUtils";

export function AgentPermissions() {
  const [agents, setAgents] = useState<AgentKey[]>([]);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const loadedAgents = await getAllAgentKeys();
      setAgents(loadedAgents);
    } catch (error) {
      console.error("Failed to load agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAgentKey(id);
      await loadAgents();
    } catch (error) {
      console.error("Failed to delete agent key:", error);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeAgentKey(id);
      await loadAgents();
    } catch (error) {
      console.error("Failed to revoke agent key:", error);
    }
  };

  const handleCopyKey = async (key: string, id: string) => {
    const success = await handleCopyText(key);
    if (success) {
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-cyan-500/30 dark:border-cyan-500/50 shadow-sm transition-colors p-6">
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">Lobster Keys©™</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage API keys for external agents and automation
            </p>
          </div>
          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Hatch New Key
          </button>
        </div>

        {agents.length === 0 ? (
          <div className="border-2 border-dashed border-cyan-500/30 dark:border-cyan-500/20 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-cyan-50 dark:bg-cyan-900/20 rounded-full flex items-center justify-center mb-4">
              <Key className="w-7 h-7 text-cyan-500" />
            </div>
            <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2">No Lobster Keys</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
              Hatch a ClawKey©™ to allow external agents to interact with your Pearls
            </p>
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-cyan-500/50 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-sm font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Your First Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map((agent) => (
              <AgentKeyCard
                key={agent.id}
                agent={agent}
                isVisible={visibleKeys.has(agent.id)}
                onToggleVisibility={toggleKeyVisibility}
                onRevoke={handleRevoke}
                onDelete={setConfirmDeleteId}
                onCopy={handleCopyKey}
                copiedKey={copiedKey}
              />
            ))}
          </div>
        )}

        <AgentKeyGeneratorModal
          isOpen={isGeneratorOpen}
          onClose={() => setIsGeneratorOpen(false)}
          onKeyGenerated={loadAgents}
        />

        <ConfirmModal
          isOpen={!!confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); }}
          title="Delete Lobster Key?"
          message="Are you sure you want to delete this Lobster Key? Any Lobsters using it will lose access. This cannot be undone."
          confirmLabel="Delete Key"
          cancelLabel="Keep it"
          variant="danger"
        />
      </div>
    </div>
  );
}