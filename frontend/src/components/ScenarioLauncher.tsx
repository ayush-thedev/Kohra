import React from "react";
import { ScenarioResult, RBACRole } from "../types/index.js";
import { KohlerModal } from "../design-system/KohlerModal.js";
import { KohlerButton } from "../design-system/KohlerButton.js";
import { Play, PlayCircle, CheckCircle2, XCircle } from "lucide-react";

interface ScenarioLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioResults: Record<number, ScenarioResult>;
  isBenchmarking: boolean;
  onRunScenario: (id: number) => void;
  onRunAll: () => void;
  onLoadInChat: (query: string, role: RBACRole) => void;
}

const SCENARIOS = [
  {
    id: 1,
    title: "Scenario 1: Single-Domain Grounding",
    category: "Retrieval & Grounding",
    query: "What's my daily travel per diem for domestic trips?",
    role: "EMPLOYEE" as RBACRole,
    desc: "Tests precise single-domain extraction from Travel Per Diem Policy v2.1 ($75/day)."
  },
  {
    id: 2,
    title: "Scenario 2: Cross-Domain Synthesis",
    category: "Multi-Domain Reasoning",
    query: "Can we share customer data with a cloud vendor?",
    role: "LEGAL" as RBACRole,
    desc: "Synthesizes rules across Privacy (DPA & encryption) and Legal (MSA indemnification)."
  },
  {
    id: 3,
    title: "Scenario 3: RBAC Containment",
    category: "Security & Role Governance",
    query: "What are executive entertainment budgets?",
    role: "EMPLOYEE" as RBACRole,
    desc: "Blocks executive budget disclosure for EMPLOYEE while permitting full access for FINANCE."
  },
  {
    id: 4,
    title: "Scenario 4: Policy Conflict & Supersession",
    category: "Temporal & Conflict Governance",
    query: "What's my leave allowance?",
    role: "EMPLOYEE" as RBACRole,
    desc: "Validates active PTO v3.0 (20 days) superseding legacy v2.0 (15 days)."
  },
  {
    id: 5,
    title: "Scenario 5: Multi-Format Dynamic Output",
    category: "Formatting & Serialization",
    query: "List all HR policies",
    role: "ADMIN" as RBACRole,
    desc: "Outputs HR policy catalog across Prose, JSON, XML, Excel (.xlsx), and Email draft."
  },
  {
    id: 6,
    title: "Scenario 6: Customer Support & Warranty Terms",
    category: "Domain Expansion & Grounding",
    query: "What are Kohler's warranty and return terms for India?",
    role: "EMPLOYEE" as RBACRole,
    desc: "Extracts terms from official Kohler India D2C terms and global warranty policies."
  },
  {
    id: 7,
    title: "Scenario 7: RBAC Supplier Governance",
    category: "Security & Role Governance",
    query: "What is Kohler's supplier code of conduct?",
    role: "EMPLOYEE" as RBACRole,
    desc: "Restricts Kohler Supplier Code of Conduct for EMPLOYEE while permitting LEGAL / MANAGER access."
  },
  {
    id: 8,
    title: "Scenario 8: Employee Privacy Governance",
    category: "Privacy & Compliance",
    query: "What data does Kohler collect under the employee privacy notice?",
    role: "EMPLOYEE" as RBACRole,
    desc: "Answers employee data handling rules from official Employee Privacy Notice."
  }
];

export const ScenarioLauncher: React.FC<ScenarioLauncherProps> = ({
  isOpen,
  onClose,
  scenarioResults,
  isBenchmarking,
  onRunScenario,
  onRunAll,
  onLoadInChat
}) => {
  const allResults = Object.values(scenarioResults);
  const totalPassed = allResults.filter((r) => r.status === "PASS").length;

  return (
    <KohlerModal
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluation Benchmark Suite"
      subtitle="Automated verification harness across all 8 evaluation scenarios"
      actions={
        <div className="flex items-center gap-3">
          {allResults.length > 0 && (
            <span className="text-xs font-mono text-content-tertiary">
              Score: <strong className="text-brand-500">{totalPassed} / {SCENARIOS.length} PASSED</strong> ({Math.round((totalPassed / SCENARIOS.length) * 100)}%)
            </span>
          )}
          <KohlerButton
            variant="brand"
            size="sm"
            onClick={onRunAll}
            disabled={isBenchmarking}
            icon={<PlayCircle className="w-4 h-4 text-white" />}
          >
            {isBenchmarking ? "Running Benchmark Suite..." : "Run All 8 Benchmarks"}
          </KohlerButton>
        </div>
      }
    >
      <div className="space-y-3">
        {SCENARIOS.map((s) => {
          const result = scenarioResults[s.id];
          const isPassed = result?.status === "PASS";
          const isFailed = result?.status === "FAIL";

          return (
            <div
              key={s.id}
              className={`p-4 bg-surface-subtle border transition-all rounded-none ${
                isPassed
                  ? "border-emerald-600/60 bg-emerald-950/10"
                  : isFailed
                  ? "border-red-600/60 bg-red-950/10"
                  : "border-border-low hover:border-gray-500"
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <div className="text-[10px] font-primary uppercase tracking-wider text-brand-500 font-bold">
                    {s.category}
                  </div>
                  <h4 className="text-sm font-primary font-medium uppercase tracking-wider text-white">
                    {s.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {result && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono uppercase font-bold border rounded-none ${
                        isPassed
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/50"
                          : "bg-red-950/60 text-red-400 border-red-500/50"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {result.status} ({result.timingMs}ms)
                    </span>
                  )}

                  <KohlerButton
                    variant="neutral"
                    size="sm"
                    onClick={() => onRunScenario(s.id)}
                    disabled={isBenchmarking}
                    icon={<Play className="w-3 h-3 text-brand-500" />}
                  >
                    Run
                  </KohlerButton>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-content-tertiary mb-3 font-sans font-light">{s.desc}</p>

              {/* Query box */}
              <div className="p-2.5 bg-surface-muted border border-border-low text-xs flex items-center justify-between gap-2 rounded-none">
                <div className="font-mono text-content-secondary truncate">
                  <span className="text-brand-500 font-bold">[{s.role}]</span> "{s.query}"
                </div>
                <button
                  onClick={() => {
                    onLoadInChat(s.query, s.role);
                    onClose();
                  }}
                  className="px-2 py-0.5 bg-surface-subtle text-[10px] font-primary uppercase tracking-wider text-content-tertiary hover:text-brand-500 transition-colors whitespace-nowrap rounded-none"
                >
                  Load in Chat
                </button>
              </div>

              {/* Assertions checklist if run */}
              {result && (
                <div className="mt-3 pt-3 border-t border-border-low space-y-1.5 font-mono text-[11px]">
                  <div className="text-[10px] font-primary uppercase tracking-wider font-bold text-content-tertiary">
                    Validation Checks:
                  </div>
                  {result.assertions.map((a, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {a.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={a.passed ? "text-content-secondary" : "text-red-400"}>
                        {a.check} {a.details ? `(${a.details})` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </KohlerModal>
  );
};
