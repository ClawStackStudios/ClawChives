import { Key, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { AgentKey } from "@/types/agent";
import { useAgentKeyModal } from "../hooks/useAgentKeyModal";
import { StepIndicator } from "./StepIndicator";
import { DetailsStep } from "./steps/DetailsStep";
import { PermissionsStep } from "./steps/PermissionsStep";
import { ExpirationStep } from "./steps/ExpirationStep";
import { RateLimitStep } from "./steps/RateLimitStep";
import { ReviewStep } from "./steps/ReviewStep";
import { GeneratedStep } from "./steps/GeneratedStep";

interface AgentKeyGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyGenerated: (agentKey: AgentKey) => void;
}

export function AgentKeyGeneratorModal({ isOpen, onClose, onKeyGenerated }: AgentKeyGeneratorModalProps) {
  const {
    currentStep,
    formData,
    generatedKey,
    isMasked,
    copied,
    isGenerating,
    generateError,
    steps,
    setFormData,
    setIsMasked,
    setCopied,
    handleNext,
    handleBack,
    handleClose,
    isStepValid
  } = useAgentKeyModal(isOpen, onClose, onKeyGenerated);

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case "details": return <DetailsStep formData={formData} onChange={(d) => setFormData(p => ({ ...p, ...d }))} />;
      case "permissions": return <PermissionsStep formData={formData} onChange={(d) => setFormData(p => ({ ...p, ...d }))} />;
      case "expiration": return <ExpirationStep formData={formData} onChange={(d) => setFormData(p => ({ ...p, ...d }))} />;
      case "ratelimit": return <RateLimitStep formData={formData} onChange={(d) => setFormData(p => ({ ...p, ...d }))} />;
      case "review": return <ReviewStep formData={formData} />;
      case "generated": return <GeneratedStep generatedKey={generatedKey} isMasked={isMasked} onMaskToggle={() => setIsMasked(!isMasked)} onCopy={() => { navigator.clipboard.writeText(generatedKey?.apiKey ?? ""); setCopied(true); setTimeout(() => setCopied(false), 2000); }} copied={copied} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border-2 border-cyan-500/50 dark:border-cyan-500/70 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-cyan-500/30 dark:border-cyan-500/50">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-lg"><Key className="w-6 h-6 text-cyan-600 dark:text-cyan-400" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Generate Lobster Key</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Create a secure <span className="text-cyan-600 dark:text-cyan-400 font-medium">lb-</span> API key</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {currentStep !== "generated" && <StepIndicator steps={steps} currentStep={currentStep} />}

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {generateError && (
            <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{generateError}</p>
            </div>
          )}
          {renderStep()}
        </div>

        <div className="px-6 py-4 border-t border-cyan-500/20 dark:border-cyan-500/30 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          {currentStep !== "generated" ? (
            <>
              <Button variant="outline" onClick={currentStep === "details" ? handleClose : handleBack} disabled={isGenerating} className="text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50 rounded-xl font-bold">
                {currentStep === "details" ? "Cancel" : "Back"}
              </Button>
              <Button onClick={handleNext} disabled={!isStepValid() || isGenerating} className="min-w-[120px] bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20 rounded-xl font-black uppercase tracking-widest">
                {isGenerating ? "Generating..." : currentStep === "review" ? "Generate Key" : "Next"}
              </Button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <Button onClick={handleClose} className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20">Done 🦞</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
