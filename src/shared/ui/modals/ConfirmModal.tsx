import { X, AlertTriangle } from "lucide-react";
import { Button } from "../button";
import { ModalContainer } from "./ModalContainer";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const confirmBtn =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
      : "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20";

  const headerBorder =
    variant === "danger"
      ? "border-red-500/30 dark:border-red-500/50"
      : "border-amber-500/30 dark:border-amber-500/50";

  const footerBorder =
    variant === "danger"
      ? "border-red-500/20 dark:border-red-500/30"
      : "border-amber-500/20 dark:border-amber-500/30";

  const containerBorder =
    variant === "danger"
      ? "border-red-500/50 dark:border-red-500/70"
      : "border-amber-500/50 dark:border-amber-500/70";

  const iconBg =
    variant === "danger"
      ? "bg-red-100 dark:bg-red-900/30"
      : "bg-amber-100 dark:bg-amber-900/30";

  const iconColor =
    variant === "danger"
      ? "text-red-600 dark:text-red-400"
      : "text-amber-600 dark:text-amber-400";

  return (
    <ModalContainer onClose={onClose} borderColor={containerBorder} maxWidth="max-w-md">
      <div className="flex flex-col h-full max-h-[inherit]">
        {/* Header - Fixed */}
        <div className={`flex items-center justify-between p-5 md:p-6 border-b ${headerBorder} bg-white dark:bg-slate-900 shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${iconBg}`}>
              <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-50 uppercase tracking-tight">{title}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="h-9 w-9 p-0 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body - Scrollable if text is long */}
        <div className="p-5 md:p-6 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{message}</p>
        </div>

        {/* Footer - Fixed */}
        <div className={`flex gap-3 p-5 md:p-6 border-t ${footerBorder} bg-slate-50/50 dark:bg-slate-950/50 shrink-0`}>
          <Button
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="flex-1 h-12 md:h-10 rounded-xl dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 font-bold uppercase tracking-widest text-xs"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={(e) => { e.stopPropagation(); onConfirm(); onClose(); }}
            className={`flex-1 h-12 md:h-10 rounded-xl font-bold uppercase tracking-widest text-xs ${confirmBtn}`}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}
