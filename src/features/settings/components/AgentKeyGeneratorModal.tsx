import { Key, AlertTriangle, X } from "lucide-react";
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
import { ModalContainer } from '@/shared/ui/modals/ModalContainer';

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
    <ModalContainer 
      onClose={handleClose} 
      borderColor="border-cyan-500/50 dark:border-cyan-500/70"
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col h-full max-h-[inherit]">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cyan-500/30 dark:border-cyan-500/50 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-xl">
              <Key className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 uppercase tracking-tight">Generate Lobster Key</h2>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Create a secure <span className="text-cyan-600 dark:text-cyan-400">lb-</span> API key</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-9 w-9 p-0 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Step Indicator - Fixed */}
        {currentStep !== "generated" && <StepIndicator steps={steps} currentStep={currentStep} />}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {generateError && (
            <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-in fade-in zoom-in duration-200">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">{generateError}</p>
            </div>
          )}
          {renderStep()}
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t border-cyan-500/20 dark:border-cyan-500/30 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
          {currentStep !== "generated" ? (
            <>
              <Button 
                variant="outline" 
                onClick={currentStep === "details" ? handleClose : handleBack} 
                disabled={isGenerating} 
                className="h-11 md:h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-xs dark:border-slate-700"
              >
                {currentStep === "details" ? "Cancel" : "Back"}
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!isStepValid() || isGenerating} 
                className="min-w-[140px] h-11 md:h-10 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
              >
                {isGenerating ? "Generating..." : currentStep === "review" ? "Generate Key" : "Next"}
              </Button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <Button 
                onClick={handleClose} 
                className="w-full md:w-auto h-12 md:h-10 bg-cyan-600 hover:bg-cyan-700 text-white px-10 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
              >
                Done 🦞
              </Button>
            </div>
          )}
        </div>
      </div>
    </ModalContainer>
  );
}
