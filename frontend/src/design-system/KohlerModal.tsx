import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface KohlerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const KohlerModal: React.FC<KohlerModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  actions
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-surface-muted border border-border-low shadow-2xl p-6 overflow-hidden rounded-none">
        {/* Architectural corner cubes */}
        <div className="corner-cube-tl" />
        <div className="corner-cube-tr" />
        <div className="corner-cube-br" />
        <div className="corner-cube-bl" />

        {/* Header with Kohler Foundations light-weight heading */}
        <div className="flex items-start justify-between border-b border-border-low pb-4 mb-4">
          <div>
            <h3 className="text-xl font-light tracking-tight text-white flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-brand-600 inline-block shadow-brandSm" />
              {title}
            </h3>
            {subtitle && <p className="text-xs text-content-tertiary mt-1 font-sans">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-content-tertiary hover:text-brand-500 hover:bg-surface-subtle transition-colors rounded-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="text-sm text-content-secondary max-h-[60vh] overflow-y-auto pr-2 space-y-4">
          {children}
        </div>

        {/* Actions */}
        {actions && <div className="border-t border-border-low pt-4 mt-6 flex justify-end gap-3">{actions}</div>}
      </div>
    </div>
  );
};
