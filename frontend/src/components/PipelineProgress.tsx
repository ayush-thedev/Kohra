import React from "react";
import { Loader2 } from "lucide-react";

interface PipelineProgressProps {
  activeStep: string;
}

const STEPS = [
  { label: "1. ROUTER", desc: "Intent Classification" },
  { label: "2. RETRIEVER", desc: "Hybrid BM25 + Vector" },
  { label: "3. RBAC GATE", desc: "Role Containment" },
  { label: "4. CONFLICT", desc: "Supersession Check" },
  { label: "5. SYNTHESIS", desc: "Grounded LLM Call" },
  { label: "6. FORMATTER", desc: "Multi-Format Output" }
];

export const PipelineProgress: React.FC<PipelineProgressProps> = ({ activeStep }) => {
  return (
    <div className="bg-surface-muted/95 border-b border-brand-600/50 p-3 max-w-5xl mx-auto w-full backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-brand-500 animate-spin" />
          <span className="text-xs font-primary uppercase tracking-wider text-brand-500 font-medium">
            Executing Pipeline: {activeStep}
          </span>
        </div>
        <span className="text-[10px] font-mono text-content-tertiary uppercase tracking-wider">Real-time Telemetry</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
        {STEPS.map((s, idx) => (
          <div
            key={idx}
            className="p-1.5 bg-surface-subtle border border-border-low text-center rounded-none"
          >
            <div className="text-[9px] font-primary font-medium uppercase tracking-wider text-brand-500">{s.label}</div>
            <div className="text-[9px] text-content-tertiary truncate font-sans font-light">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
