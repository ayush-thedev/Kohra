import React, { useState } from "react";
import { ChatMessage, Citation, AuditEvent } from "../types/index.js";
import { KohlerBadge } from "../design-system/KohlerBadge.js";
import {
  FileText,
  Activity,
  Download,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  ShieldAlert
} from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
  onSelectCitations: (citations: Citation[]) => void;
  onSelectAudit: (events: AuditEvent[]) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSelectCitations,
  onSelectAudit
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-2xl bg-surface-subtle border border-border-low p-4 text-sm text-white shadow-card rounded-none">
          <div className="text-[10px] font-mono uppercase tracking-wider text-brand-500 mb-1 font-semibold">
            User Query
          </div>
          <p className="whitespace-pre-wrap leading-relaxed font-sans">{message.content}</p>
        </div>
      </div>
    );
  }

  const isRestricted = message.stage === "restricted";
  const isEscalated = message.stage === "escalated";

  return (
    <div className="flex justify-start mb-6">
      <div
        className={`relative w-full max-w-4xl bg-surface-muted border p-5 shadow-card rounded-none ${
          isRestricted
            ? "border-red-600/70 bg-red-950/10"
            : isEscalated
            ? "border-amber-600/70 bg-amber-950/10"
            : "border-border-low hover:border-gray-500"
        }`}
      >
        {/* Top corner accent cubes */}
        <div className="corner-cube-tl" />
        <div className="corner-cube-tr" />
        <div className="corner-cube-br" />
        <div className="corner-cube-bl" />

        {/* Message Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-low pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-600 shadow-brandSm" />
            <span className="text-xs font-primary font-medium uppercase tracking-wider text-white">
              Kohler Intelligence Core
            </span>
            {message.domain && (
              <KohlerBadge variant="domain" domainValue={message.domain} size="sm" />
            )}
            {message.stage && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 uppercase tracking-wider font-semibold ${
                  message.stage === "answered"
                    ? "text-emerald-400 bg-emerald-950/40 border border-emerald-500/30"
                    : message.stage === "restricted"
                    ? "text-red-400 bg-red-950/40 border border-red-500/30"
                    : "text-amber-400 bg-amber-950/40 border border-amber-500/30"
                }`}
              >
                {message.stage}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-content-tertiary">
            {message.confidence !== undefined && (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-brand-500" />
                <span>Confidence: {(message.confidence * 100).toFixed(0)}%</span>
              </span>
            )}
            {message.timing && (
              <span className="text-[11px] text-content-tertiary">
                {message.timing.totalMs}ms
              </span>
            )}
          </div>
        </div>

        {/* Conflict / Supersession Notice Banner */}
        {message.conflictWarnings && message.conflictWarnings.length > 0 && (
          <div className="mb-3 p-3 bg-amber-950/20 border border-amber-500/50 flex items-start gap-2.5 text-xs text-amber-300 font-sans">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-primary font-bold uppercase tracking-wider text-[10px] block text-amber-400">
                Policy Governance Notice: Temporal Supersession Detected
              </span>
              {message.conflictWarnings.map((w, i) => (
                <p key={i} className="text-xs mt-0.5 text-amber-200/90 leading-relaxed">
                  {w.message}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* HITL Notice Banner */}
        {message.hitlDecision && message.hitlDecision.requiresApproval && (
          <div className="mb-3 p-3 bg-amber-950/25 border border-amber-500/60 flex items-start gap-2.5 text-xs text-amber-300 font-sans">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-primary font-bold uppercase tracking-wider text-[10px] text-amber-400">
                  Human-In-The-Loop Safety Gate
                </span>
                <span className="px-1.5 py-0.2 bg-amber-400 text-black text-[9px] font-bold uppercase font-mono">
                  {message.hitlDecision.riskLevel} RISK
                </span>
              </div>
              <p className="text-xs mt-1 text-amber-100">{message.hitlDecision.reason}</p>
              <p className="text-[11px] mt-1 text-content-tertiary font-mono">
                Escalated to: Kohler {message.hitlDecision.escalateTo} Governance Desk
              </p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="text-sm text-content-secondary leading-relaxed font-sans space-y-3 font-light">
          {message.format === "json" || message.format === "xml" ? (
            <div className="relative bg-surface-subtle border border-border-low p-3.5 font-mono text-xs text-content-secondary overflow-x-auto rounded-none">
              <button
                onClick={handleCopy}
                className="absolute top-2.5 right-2.5 p-1 bg-surface-muted hover:text-brand-500 text-content-tertiary transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <pre>{message.content}</pre>
            </div>
          ) : message.format === "email" ? (
            <div className="bg-surface-subtle border border-border-low p-4 font-mono text-xs text-content-secondary whitespace-pre-wrap rounded-none">
              {message.content}
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>

        {/* Excel Binary Download Action */}
        {message.fileUrl && (
          <div className="mt-4 pt-3 border-t border-border-low flex items-center justify-between bg-surface-subtle p-3.5 border border-border-low rounded-none">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 font-bold text-xs font-mono">
                XLS
              </div>
              <div>
                <div className="text-xs font-primary font-medium text-white uppercase tracking-wider">
                  {message.filename || "kohler_policy_report.xlsx"}
                </div>
                <div className="text-[11px] text-content-tertiary font-mono">
                  Excel Multi-Sheet Workbook • Summary, Citations & Governance Metadata
                </div>
              </div>
            </div>
            <a
              href={message.fileUrl}
              download={message.filename || "kohler_policy_report.xlsx"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-primary font-medium uppercase tracking-wider hover:bg-brand-500 transition-colors shadow-brandSm"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              Download .xlsx
            </a>
          </div>
        )}

        {/* Bottom Inspection & Telemetry Bar */}
        <div className="mt-4 pt-3 border-t border-border-low flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            {message.citations && message.citations.length > 0 && (
              <button
                onClick={() => onSelectCitations(message.citations!)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-subtle border border-border-low hover:border-brand-600 hover:text-brand-500 text-content-secondary transition-colors text-xs rounded-none"
              >
                <FileText className="w-3.5 h-3.5 text-brand-500" />
                <span>Sources ({message.citations.length})</span>
              </button>
            )}

            {message.auditEvents && message.auditEvents.length > 0 && (
              <button
                onClick={() => onSelectAudit(message.auditEvents!)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-subtle border border-border-low hover:border-brand-600 hover:text-brand-500 text-content-secondary transition-colors text-xs rounded-none"
              >
                <Activity className="w-3.5 h-3.5 text-brand-500" />
                <span>Audit Trail ({message.auditEvents.length} events)</span>
              </button>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-content-tertiary hover:text-white transition-colors text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Response"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
