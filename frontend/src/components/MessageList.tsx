import React, { useEffect, useRef } from "react";
import { ChatMessage, Citation, AuditEvent } from "../types/index.js";
import { MessageBubble } from "./MessageBubble.js";
import { Sparkles, HelpCircle, Shield, FileCheck, Layers, ArrowUpRight } from "lucide-react";

interface MessageListProps {
  messages: ChatMessage[];
  onSelectCitations: (citations: Citation[]) => void;
  onSelectAudit: (events: AuditEvent[]) => void;
  onSelectPrompt: (prompt: string, role?: string) => void;
}

const SAMPLE_PROMPTS = [
  {
    num: "01",
    domain: "FINANCE",
    title: "Scenario 1: Single-Domain Grounding",
    query: "What's my daily travel per diem for domestic trips?",
    role: "EMPLOYEE",
    icon: <Sparkles className="w-3.5 h-3.5 text-brand-500" />
  },
  {
    num: "02",
    domain: "PRIVACY & LEGAL",
    title: "Scenario 2: Cross-Domain Synthesis",
    query: "Can we share customer data with a cloud vendor?",
    role: "LEGAL",
    icon: <Layers className="w-3.5 h-3.5 text-brand-500" />
  },
  {
    num: "03",
    domain: "SECURITY / RBAC",
    title: "Scenario 3: RBAC Containment",
    query: "What are executive entertainment budgets?",
    role: "EMPLOYEE",
    icon: <Shield className="w-3.5 h-3.5 text-brand-500" />
  },
  {
    num: "04",
    domain: "HR GOVERNANCE",
    title: "Scenario 4: Policy Conflict & Supersession",
    query: "What's my leave allowance?",
    role: "EMPLOYEE",
    icon: <FileCheck className="w-3.5 h-3.5 text-brand-500" />
  },
  {
    num: "05",
    domain: "SERIALIZATION",
    title: "Scenario 5: Multi-Format Dynamic Output",
    query: "List all HR policies",
    role: "ADMIN",
    icon: <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
  },
  {
    num: "06",
    domain: "CUSTOMER SUPPORT",
    title: "Scenario 6: Customer Support & Warranty Terms",
    query: "What are Kohler's warranty and return terms for India?",
    role: "EMPLOYEE",
    icon: <Sparkles className="w-3.5 h-3.5 text-brand-500" />
  },
  {
    num: "07",
    domain: "SECURITY / LEGAL",
    title: "Scenario 7: RBAC Supplier Governance",
    query: "What is Kohler's supplier code of conduct?",
    role: "EMPLOYEE",
    icon: <Shield className="w-3.5 h-3.5 text-brand-500" />
  },
  {
    num: "08",
    domain: "PRIVACY & COMPLIANCE",
    title: "Scenario 8: Employee Privacy Governance",
    query: "What data does Kohler collect under the employee privacy notice?",
    role: "EMPLOYEE",
    icon: <FileCheck className="w-3.5 h-3.5 text-brand-500" />
  }
];

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onSelectCitations,
  onSelectAudit,
  onSelectPrompt
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-12 md:py-16 flex flex-col items-center justify-start text-center">
        <div className="max-w-4xl space-y-8 my-auto">
          {/* Hero Branding with Kohler Foundations Light Heading Scale */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-subtle border border-border-low text-xs font-primary uppercase tracking-wider text-brand-500">
              <span className="w-2 h-2 bg-brand-600 shadow-brandSm" />
              KOHRA Foundations Intelligence Core
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-inter font-light tracking-tight text-white leading-tight">
              Enterprise Policy Intelligence
            </h1>
            <p className="text-sm md:text-base text-content-secondary max-w-2xl mx-auto leading-relaxed font-light">
              Unified conversational governance across 30 corporate policy repositories with deterministic source grounding, temporal conflict detection, and role-based containment.
            </p>
          </div>

          {/* Quick Prompt Grid with Foundations Styling */}
          <div className="pt-2 text-left">
            <div className="text-xs font-primary uppercase tracking-wider text-content-tertiary mb-3 text-center">
              Quick Test Inquiries (Benchmark Scenarios 1–8)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(sample.query, sample.role)}
                  className="relative p-4 bg-surface-muted border border-border-low hover:border-brand-600 hover:bg-surface-subtle text-left transition-all duration-150 group flex flex-col justify-between gap-2 shadow-sm rounded-none"
                >
                  <div className="corner-cube-tl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-brand-500">{sample.num}</span>
                      <span className="text-xs font-medium uppercase tracking-wider text-white group-hover:text-brand-500 transition-colors">
                        {sample.title}
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-content-tertiary group-hover:text-brand-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>

                  <p className="text-xs text-content-secondary line-clamp-2 font-sans font-light">
                    "{sample.query}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-border-low/60 text-[10px] font-mono text-content-tertiary">
                    <span>{sample.domain}</span>
                    <span className="bg-surface-subtle px-1.5 py-0.2 border border-border-low text-white font-semibold">
                      {sample.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 max-w-5xl mx-auto w-full">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          onSelectCitations={onSelectCitations}
          onSelectAudit={onSelectAudit}
        />
      ))}
    </div>
  );
};
