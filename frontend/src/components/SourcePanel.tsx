import React from "react";
import { Citation } from "../types/index.js";
import { KohlerModal } from "../design-system/KohlerModal.js";
import { Bookmark, Hash, CheckCircle2 } from "lucide-react";

interface SourcePanelProps {
  citations: Citation[] | null;
  onClose: () => void;
}

export const SourcePanel: React.FC<SourcePanelProps> = ({ citations, onClose }) => {
  if (!citations) return null;

  return (
    <KohlerModal
      isOpen={!!citations}
      onClose={onClose}
      title="Verified Source Grounding & Citations"
      subtitle={`${citations.length} policy documents were retrieved and used to ground this answer`}
    >
      <div className="space-y-3">
        {citations.map((c, idx) => (
          <div
            key={idx}
            className="p-4 bg-surface-subtle border border-border-low hover:border-brand-600 transition-all space-y-2.5 rounded-none"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-low pb-2">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-brand-500" />
                <span className="font-primary font-medium text-sm text-white uppercase tracking-wider">
                  {c.documentTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-surface-muted text-content-tertiary text-[10px] font-mono uppercase font-bold border border-border-low rounded-none">
                  v{c.version}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Grounded
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-brand-500 font-mono font-semibold">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                <span>Section: {c.section}</span>
              </div>
              {c.filePath && (
                <span className="text-[10px] text-content-tertiary font-mono">
                  {c.filePath}
                </span>
              )}
            </div>

            <div className="p-3 bg-surface-muted border border-border-low text-xs text-content-secondary font-mono leading-relaxed rounded-none">
              "{c.snippet}"
            </div>
          </div>
        ))}
      </div>
    </KohlerModal>
  );
};
