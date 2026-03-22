import { useState, useEffect } from "react";
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400">Lobster Keys</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Manage API keys for external agents and automation
          </p>
        </div>
        <Button onClick={() => setIsGeneratorOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Generate Key
        </Button>
      </div>

      {agents.length === 0 ? (
        <Card className="border-2 border-red-500/20 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="w-12 h-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">No Agent Keys</h4>
            <p className="text-sm text-gray-500 text-center mb-4">
              Create an API key to allow external agents to interact with your bookmarks
            </p>
            <Button onClick={() => setIsGeneratorOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Key
            </Button>
          </CardContent>
        </Card>
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

      {/* Confirm Delete Modal */}
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
  );
}