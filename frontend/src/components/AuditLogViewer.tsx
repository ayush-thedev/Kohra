import React, { useState } from "react";
import { AuditEvent } from "../types/index.js";
import { KohlerModal } from "../design-system/KohlerModal.js";
import { Activity, Clock, Shield, Database, Cpu, FileCheck2, ChevronRight, ChevronDown } from "lucide-react";

interface AuditLogViewerProps {
  events: AuditEvent[] | null;
  onClose: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ events, onClose }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!events) return null;

  const getEventIcon = (event: string) => {
    switch (event) {
      case "QUERY_RECEIVED":
        return <Clock className="w-4 h-4 text-brand-500" />;
      case "ROUTER_CLASSIFIED":
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case "RETRIEVAL_EXECUTED":
        return <Database className="w-4 h-4 text-sky-400" />;
      case "RBAC_FILTERED":
        return <Shield className="w-4 h-4 text-amber-400" />;
      case "ANSWER_GENERATED":
        return <FileCheck2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Activity className="w-4 h-4 text-brand-500" />;
    }
  };

  return (
    <KohlerModal
      isOpen={!!events}
      onClose={onClose}
      title="Structured Governance Audit Trail & Telemetry"
      subtitle={`Request ID: ${events[0]?.requestId || "N/A"} • ${events.length} decision events recorded`}
    >
      <div className="space-y-3 font-mono">
        {events.map((ev, idx) => {
          const isExpanded = expandedIndex === idx;
          const isWarning = ev.severity === "WARNING";
          const isError = ev.severity === "ERROR";

          return (
            <div
              key={idx}
              className={`border transition-all rounded-none ${
                isError
                  ? "border-red-600/70 bg-red-950/15"
                  : isWarning
                  ? "border-amber-600/70 bg-amber-950/15"
                  : "border-border-low bg-surface-subtle"
              }`}
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-surface-muted/60 transition-colors rounded-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-surface-muted border border-border-low rounded-none">
                    {getEventIcon(ev.event)}
                  </div>
                  <div>
                    <div className="text-xs font-primary font-medium uppercase text-white tracking-wider">
                      {idx + 1}. {ev.event}
                    </div>
                    <div className="text-[10px] text-content-tertiary font-mono">
                      {new Date(ev.timestamp).toLocaleTimeString()} • Severity: {ev.severity}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-content-tertiary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-content-tertiary" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-3 border-t border-border-low bg-surface-muted/95 text-xs overflow-x-auto rounded-none">
                  <div className="text-[10px] uppercase font-mono font-bold text-brand-500 mb-1">
                    Event Payload & Diagnostics:
                  </div>
                  <pre className="text-content-secondary leading-relaxed text-[11px] font-mono">
                    {JSON.stringify(ev.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </KohlerModal>
  );
};
