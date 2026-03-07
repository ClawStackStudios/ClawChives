import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../ui/card";
import { 
  PERMISSION_CONFIGS, 
  PERMISSION_INFO, 
  PermissionLevel, 
  ExpirationType,
  AgentKeyFormData,
  AgentKey 
} from "../../types/agent";
import { saveAgentKey } from "../../services/agents/agentKeyService";
import { Check, AlertTriangle, Copy, Eye, EyeOff, Key, Clock, Zap } from "lucide-react";

type Step = "details" | "permissions" | "expiration" | "ratelimit" | "review" | "generated";

interface AgentKeyGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyGenerated: (agentKey: AgentKey) => void;
}

export function AgentKeyGeneratorModal({ isOpen, onClose, onKeyGenerated }: AgentKeyGeneratorModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [formData, setFormData] = useState<AgentKeyFormData>({
    name: "",
    description: "",
    permissionLevel: "READ",
    expirationType: "30d",
    customExpirationDate: "",
    rateLimit: 0, // 0 = unlimited
    customPermissions: { ...PERMISSION_CONFIGS.CUSTOM },
  });
  const [generatedKey, setGeneratedKey] = useState<AgentKey | null>(null);
  const [isMasked, setIsMasked] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const steps: { id: Step; label: string }[] = [
    { id: "details", label: "Details" },
    { id: "permissions", label: "Permissions" },
    { id: "expiration", label: "Expiration" },
    { id: "ratelimit", label: "Rate Limit" },
    { id: "review", label: "Review" },
  ];

  // Reset modal state when it closes
  useEffect(() => {
    if (!isOpen) {
      // Reset everything when modal closes
      setCurrentStep("details");
      setFormData({
        name: "",
        description: "",
        permissionLevel: "READ",
        expirationType: "30d",
        customExpirationDate: "",
        rateLimit: 0,
        customPermissions: { ...PERMISSION_CONFIGS.CUSTOM },
      });
      setGeneratedKey(null);
      setIsMasked(true);
      setCopied(false);
      setGenerateError("");
    }
  }, [isOpen]);

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case "details":
        return formData.name.trim().length > 0;
      case "permissions":
        return true;
      case "expiration":
        if (formData.expirationType === "custom") {
          return formData.customExpirationDate !== "";
        }
        return true;
      case "ratelimit":
        return true;
      case "review":
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === "review") {
      handleGenerate();
    } else {
      const currentIndex = steps.findIndex(s => s.id === currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].id);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError("");
    try {
      const agentKey = await saveAgentKey({
        name: formData.name,
        description: formData.description,
        permissions:
          formData.permissionLevel === "CUSTOM"
            ? formData.customPermissions!
            : PERMISSION_CONFIGS[formData.permissionLevel],
        expirationType: formData.expirationType,
        expirationDate: formData.expirationType === "custom" ? formData.customExpirationDate : undefined,
        rateLimit: formData.rateLimit === 0 ? undefined : formData.rateLimit,
      });
      setGeneratedKey(agentKey);
      setCurrentStep("generated");
      onKeyGenerated(agentKey);
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : "Failed to generate agent key. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyKey = async () => {
    if (generatedKey) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(generatedKey.apiKey);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = generatedKey.apiKey;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy key:", err);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      permissionLevel: "READ",
      expirationType: "30d",
      customExpirationDate: "",
      rateLimit: 0,
      customPermissions: { ...PERMISSION_CONFIGS.CUSTOM },
    });
    setGeneratedKey(null);
    setIsMasked(true);
    setCopied(false);
    setGenerateError("");
    setCurrentStep("details");
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border-2 border-red-500/50 dark:border-red-500/70 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-red-500/30 dark:border-red-500/50">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
              <Key className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Generate Lobster Key</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Create a secure <span className="text-amber-600 dark:text-amber-400 font-medium">lb-</span> API key for your Lobster</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        {currentStep !== "generated" && (
          <div className="px-6 py-4 border-b border-red-500/20 dark:border-red-500/30">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
                
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          isActive
                            ? "bg-amber-500 text-white"
                            : isCompleted
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                      <span
                        className={`text-xs mt-1 ${
                          isActive ? "text-amber-600 dark:text-amber-400 font-medium" : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          isCompleted ? "bg-cyan-600" : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Error banner */}
          {generateError && (
            <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{generateError}</p>
            </div>
          )}
          {currentStep === "details" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-name" className="text-base font-medium text-slate-900 dark:text-slate-50">
                  Agent Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="agent-name"
                  placeholder="e.g., My Bookmark Bot"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="agent-description" className="text-base font-medium text-slate-900 dark:text-slate-50">
                  Description <span className="text-slate-400 dark:text-slate-400">(optional)</span>
                </Label>
                <Textarea
                  id="agent-description"
                  placeholder="What will this agent do?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === "permissions" && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Select the permission level for this agent. Choose the minimum level required for its task.
              </p>
              <div className="space-y-3">
                {(Object.keys(PERMISSION_INFO) as PermissionLevel[]).map((level) => {
                  const info = PERMISSION_INFO[level];
                  const isSelected = formData.permissionLevel === level;
                  
                  return (
                    <Card
                      key={level}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? `${info.bgColor} ${info.borderColor} border-2`
                          : "border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:border-slate-700"
                      }`}
                      onClick={() => setFormData({ ...formData, permissionLevel: level })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`text-2xl ${isSelected ? "" : "opacity-50"}`}>
                            {info.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold ${info.color}`}>
                                {info.label}
                              </h3>
                              {isSelected && (
                                <Check className="w-5 h-5 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {info.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {PERMISSION_CONFIGS[level].canRead && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  Read
                                </span>
                              )}
                              {PERMISSION_CONFIGS[level].canWrite && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  Write
                                </span>
                              )}
                              {PERMISSION_CONFIGS[level].canEdit && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                  Edit
                                </span>
                              )}
                              {PERMISSION_CONFIGS[level].canMove && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                  Move
                                </span>
                              )}
                              {PERMISSION_CONFIGS[level].canDelete && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                  Delete
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Custom granular checkboxes */}
              {formData.permissionLevel === "CUSTOM" && formData.customPermissions && (
                <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <h4 className="font-semibold text-slate-700">Custom Permissions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {(["canRead", "canWrite", "canEdit", "canMove", "canDelete"] as const).map((flag) => (
                      <label key={flag} className="flex items-center gap-3 cursor-pointer">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.customPermissions![flag]}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                customPermissions: {
                                  ...formData.customPermissions!,
                                  [flag]: e.target.checked,
                                },
                              })
                            }
                            className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500/20"
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700 capitalize">
                          {flag.replace("can", "")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === "expiration" && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium text-slate-900 dark:text-slate-50">Expiration</Label>
                <Select
                  value={formData.expirationType}
                  onValueChange={(value: ExpirationType) => 
                    setFormData({ ...formData, expirationType: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never expires</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                    <SelectItem value="60d">60 days</SelectItem>
                    <SelectItem value="90d">90 days</SelectItem>
                    <SelectItem value="custom">Custom date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.expirationType === "never" && (
                <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-400">Security Warning</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Keys that never expire pose a security risk. Consider setting an expiration date for better security.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {formData.expirationType === "custom" && (
                <div>
                  <Label htmlFor="custom-date" className="text-base font-medium text-slate-900 dark:text-slate-50">
                    Custom Expiration Date
                  </Label>
                  <Input
                    id="custom-date"
                    type="date"
                    value={formData.customExpirationDate}
                    onChange={(e) => setFormData({ ...formData, customExpirationDate: e.target.value })}
                    className="mt-2"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              {formData.expirationType !== "never" && formData.expirationType !== "custom" && (
                <Card className="bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      <div>
                        <p className="text-sm text-cyan-800 dark:text-cyan-300">
                          This key will expire on{" "}
                          <span className="font-medium">
                            {formatDate(
                              new Date(
                                Date.now() +
                                  (formData.expirationType === "30d"
                                    ? 30 * 24 * 60 * 60 * 1000
                                    : formData.expirationType === "60d"
                                    ? 60 * 24 * 60 * 60 * 1000
                                    : 90 * 24 * 60 * 60 * 1000)
                              ).toISOString()
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentStep === "ratelimit" && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Rate Limit (requests per minute)</Label>
                <p className="text-sm text-gray-600 mt-1">
                  Set a limit on how many requests this agent can make per minute. Leave at 0 for unlimited.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={formData.rateLimit}
                    onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="w-24 text-right">
                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {formData.rateLimit === 0 ? "∞" : formData.rateLimit}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[0, 60, 300, 1000].map((value) => (
                    <button
                      key={value}
                      onClick={() => setFormData({ ...formData, rateLimit: value })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.rateLimit === value
                          ? "bg-amber-500 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {value === 0 ? "Unlimited" : value}
                    </button>
                  ))}
                </div>

                {formData.rateLimit > 0 && (
                  <Card className="bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        <p className="text-sm text-cyan-800 dark:text-cyan-300">
                          This agent can make up to{" "}
                          <span className="font-semibold">{formData.rateLimit}</span> requests per minute.
                          That's approximately{" "}
                          <span className="font-semibold">
                            {Math.round(formData.rateLimit * 60 * 24 / 1000)}K
                          </span>{" "}
                          requests per day.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {currentStep === "review" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Review Agent Key Configuration</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-slate-900 dark:text-slate-50">{formData.name}</CardTitle>
                  {formData.description && (
                    <CardDescription className="text-slate-600 dark:text-slate-300">{formData.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-slate-600 dark:text-slate-300">Permission Level</span>
                    <span className={`font-medium ${PERMISSION_INFO[formData.permissionLevel].color}`}>
                      {PERMISSION_INFO[formData.permissionLevel].icon}{" "}
                      {PERMISSION_INFO[formData.permissionLevel].label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-slate-600 dark:text-slate-300">Expiration</span>
                    <span className="font-medium text-slate-900 dark:text-slate-50">
                      {formData.expirationType === "never"
                        ? "Never expires"
                        : formData.expirationType === "custom"
                        ? formatDate(formData.customExpirationDate!)
                        : formData.expirationType.replace("days", " days").replace("year", " year")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-slate-600 dark:text-slate-300">Rate Limit</span>
                    <span className="font-medium text-slate-900 dark:text-slate-50">
                      {formData.rateLimit === 0 ? "Unlimited" : `${formData.rateLimit} req/min`}
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Permissions:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {PERMISSION_CONFIGS[formData.permissionLevel].canRead && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Read
                        </span>
                      )}
                      {PERMISSION_CONFIGS[formData.permissionLevel].canWrite && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Write
                        </span>
                      )}
                      {PERMISSION_CONFIGS[formData.permissionLevel].canEdit && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                          Edit
                        </span>
                      )}
                      {PERMISSION_CONFIGS[formData.permissionLevel].canMove && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Move
                        </span>
                      )}
                      {PERMISSION_CONFIGS[formData.permissionLevel].canDelete && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Delete
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "generated" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">🦞 Lobster Key Spawned!</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  Your new API key is ready. Make sure to copy it now, as you won't be able to see it again.
                </p>
              </div>

              <Card className="border-2 border-amber-300 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">API Key</Label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsMasked(!isMasked)}
                        className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
                      >
                        {isMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-3 font-mono text-sm break-all text-red-600 dark:!text-slate-50">
                      {isMasked
                        ? generatedKey?.apiKey.replace(/./g, "•")
                        : generatedKey?.apiKey}
                    </code>
                    <Button
                      onClick={handleCopyKey}
                      className="shrink-0"
                      disabled={copied}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-500/30 mt-6">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-300">Important Security Notice</h4>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        Store this API key securely. Do not share it publicly or commit it to version control.
                        Treat it like a password.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep !== "generated" && (
          <div className="px-6 py-4 border-t border-red-500/20 dark:border-red-500/30 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={currentStep === "details" ? handleClose : handleBack}
              disabled={isGenerating}
              className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {currentStep === "details" ? "Cancel" : "Back"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isGenerating}
              className="min-w-[100px] bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : currentStep === "review" ? (
                "Generate Key"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        )}

        {currentStep === "generated" && (
          <div className="px-6 py-4 border-t border-red-500/20 dark:border-red-500/30 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
            <Button onClick={handleClose} className="bg-cyan-600 hover:bg-cyan-700 text-white px-8">
              Done 🦞
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}