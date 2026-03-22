/**
 * LobsterModal.tsx
 * ─────────────────────────────────────────────────────────────
 * Shared Lobsterized modal components that replace browser
 * alert() and confirm() dialogs across the ClawChives app.
 *
 * Exports:
 *   <ConfirmModal>   — Red-bordered confirm/cancel dialog
 *   <AlertModal>     — Cyan-bordered info / error notification
 *   <TagBlockedModal>— Amber-bordered tag-deletion guard modal
 * ─────────────────────────────────────────────────────────────
 */

import { X, AlertTriangle, Info, Tag } from "lucide-react";
import { Button } from "./button";
import type { Bookmark } from "../../services/types";

// ─── Backdrop + Container ────────────────────────────────────

const BACKDROP = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm";

function ModalContainer({
  children,
  borderColor = "border-red-500/50 dark:border-red-500/70",
  maxWidth = "max-w-md",
}: {
  children: React.ReactNode;
  borderColor?: string;
  maxWidth?: string;
}) {
  return (
    <div className={BACKDROP}>
      <div
        className={`bg-white dark:bg-slate-900 border-2 ${borderColor} rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden`}
      >
        {children}
      </div>
    </div>
  );
}

// ─── ConfirmModal ────────────────────────────────────────────

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
    <ModalContainer borderColor={containerBorder}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b ${headerBorder}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Body */}
      <div className="p-6">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
      </div>

      {/* Footer */}
      <div className={`flex gap-3 p-6 border-t ${footerBorder}`}>
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={() => { onConfirm(); onClose(); }}
          className={`flex-1 ${confirmBtn}`}
        >
          {confirmLabel}
        </Button>
      </div>
    </ModalContainer>
  );
}

// ─── AlertModal ──────────────────────────────────────────────

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: "info" | "error";
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
}: AlertModalProps) {
  if (!isOpen) return null;

  const borderColor =
    variant === "info"
      ? "border-cyan-500/50 dark:border-cyan-500/70"
      : "border-red-500/50 dark:border-red-500/70";

  const headerBorder =
    variant === "info"
      ? "border-cyan-500/30 dark:border-cyan-500/50"
      : "border-red-500/30 dark:border-red-500/50";

  const footerBorder =
    variant === "info"
      ? "border-cyan-500/20 dark:border-cyan-500/30"
      : "border-red-500/20 dark:border-red-500/30";

  const iconBg =
    variant === "info"
      ? "bg-cyan-100 dark:bg-cyan-900/30"
      : "bg-red-100 dark:bg-red-900/30";

  const iconColor =
    variant === "info"
      ? "text-cyan-600 dark:text-cyan-400"
      : "text-red-600 dark:text-red-400";

  const btnColor =
    variant === "info"
      ? "bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/20"
      : "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20";

  return (
    <ModalContainer borderColor={borderColor}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b ${headerBorder}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Info className={`w-5 h-5 ${iconColor}`} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Body */}
      <div className="p-6">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
      </div>

      {/* Footer */}
      <div className={`flex p-6 border-t ${footerBorder}`}>
        <Button onClick={onClose} className={`flex-1 ${btnColor}`}>
          Got it 🦞
        </Button>
      </div>
    </ModalContainer>
  );
}

// ─── TagBlockedModal ─────────────────────────────────────────

interface TagBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag: string;
  attachedBookmarks: Bookmark[];
}

export function TagBlockedModal({
  isOpen,
  onClose,
  tag,
  attachedBookmarks,
}: TagBlockedModalProps) {
  if (!isOpen) return null;

  return (
    <ModalContainer borderColor="border-amber-500/50 dark:border-amber-500/70" maxWidth="max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-amber-500/30 dark:border-amber-500/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Tag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Tag Still Attached 🦞
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Remove the tag from all Pinchmarks first
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-medium rounded-full border border-amber-200 dark:border-amber-700/50">
            <Tag className="w-3.5 h-3.5" />
            {tag}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            is pinched to {attachedBookmarks.length} Pinchmark{attachedBookmarks.length !== 1 ? "s" : ""}
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          To delete this tag, first remove it from the following Pinchmarks by editing each one:
        </p>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {attachedBookmarks.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                <span className="text-sm">🦞</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                  {b.title || "Untitled"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{b.url}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex p-6 border-t border-amber-500/20 dark:border-amber-500/30">
        <Button
          onClick={onClose}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
        >
          Got it, I'll clean the reef first 🦞
        </Button>
      </div>
    </ModalContainer>
  );
}
