import React from "react";
import { Button } from "./button";

export type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="ui:fixed ui:inset-0 ui:z-[9999] ui:flex ui:items-center ui:justify-center ui:p-4">
      {/* Dialog */}
      <div
        className={`ui:relative ui:bg-white ui:rounded-lg ui:shadow-2xl ui:max-w-md ui:w-full ui:max-h-[90vh] ui:overflow-hidden ui:z-[10000] ${className ?? ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Header */}
        <div className="ui:flex ui:items-center ui:justify-between ui:p-6 ui:border-b ui:border-gray-200">
          <h3
            id="dialog-title"
            className="ui:text-lg ui:font-semibold ui:text-gray-900"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="ui:text-gray-400 cursor-pointer hover:ui:text-gray-600 ui:transition-colors ui:p-1 ui:rounded-md hover:ui:bg-gray-100"
            aria-label="Close dialog"
          >
            <svg
              className="ui:w-5 ui:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="ui:p-6 ui:overflow-y-auto ui:max-h-[60vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="ui:flex ui:items-center ui:justify-end ui:gap-3 ui:p-6 ui:border-t ui:border-gray-200 ui:bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export type DialogActionsProps = {
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
};

export function DialogActions({
  onCancel,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Confirm",
  isLoading = false,
}: DialogActionsProps) {
  return (
    <div className="ui:flex ui:items-center ui:justify-end ui:gap-3">
      {onCancel && (
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
      )}
      {onConfirm && (
        <Button variant="primary" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Loading..." : confirmText}
        </Button>
      )}
    </div>
  );
}
