import React from "react";
import { RBACRole } from "../types/index.js";
import { useChat } from "../hooks/useChat.js";
import { RoleSelector } from "./RoleSelector.js";
import { PipelineProgress } from "./PipelineProgress.js";
import { MessageList } from "./MessageList.js";
import { ChatInput } from "./ChatInput.js";
import { SourcePanel } from "./SourcePanel.js";
import { AuditLogViewer } from "./AuditLogViewer.js";
import { ScenarioLauncher } from "./ScenarioLauncher.js";
import { KohlerButton } from "../design-system/KohlerButton.js";
import { CheckSquare, Database } from "lucide-react";

export const ChatShell: React.FC = () => {
  const {
    messages,
    rbacRole,
    setRbacRole,
    selectedFormat,
    setSelectedFormat,
    isLoading,
    activeStep,
    sendMessage,
    clearChat,
    selectedCitations,
    setSelectedCitations,
    selectedAuditEvents,
    setSelectedAuditEvents,
    isScenarioLauncherOpen,
    setIsScenarioLauncherOpen,
    scenarioResults,
    isBenchmarking,
    executeScenarioById,
    executeAllScenarios
  } = useChat();

  const totalPassed = Object.values(scenarioResults).filter((r) => r.status === "PASS").length;

  return (
    <div className="flex flex-col h-screen bg-surface-bg text-white overflow-hidden font-primary bg-kohler-grid">
      {/* Top Kohler Architectural Navigation Header */}
      <header className="h-16 bg-surface-muted/95 backdrop-blur-md border-b border-border-low px-6 flex items-center justify-between flex-shrink-0 z-20">
        {/* Brand & System Logo */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 flex items-center justify-center font-primary font-light text-white text-base tracking-tighter shadow-brand select-none">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-primary font-light text-lg uppercase tracking-wider text-white">
                  KOHRA
                </span>
                <span className="text-[10px] font-primary uppercase tracking-wider px-1.5 py-0.5 bg-brand-600 text-white font-bold select-none">
                  Foundations
                </span>
                <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-border-low">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                  <span className="text-[10px] font-mono text-content-tertiary uppercase">Active</span>
                </div>
              </div>
              <div className="text-[10px] text-content-tertiary font-mono">
                Enterprise Policy Intelligence Core • Foundations Design System
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 border-l border-border-low pl-4 text-xs font-mono text-content-tertiary">
            <Database className="w-3.5 h-3.5 text-brand-500" />
            <span>30 Policies • 5 Knowledge Repositories</span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Scenario Benchmark Launcher CTA */}
          <KohlerButton
            variant="neutral"
            size="sm"
            onClick={() => setIsScenarioLauncherOpen(true)}
            icon={<CheckSquare className="w-3.5 h-3.5 text-brand-500" />}
          >
            <span>Benchmarks</span>
            {totalPassed > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-brand-600 text-white text-[10px] font-bold">
                {totalPassed}/8
              </span>
            )}
          </KohlerButton>

          {/* Role Governance Selector */}
          <RoleSelector currentRole={rbacRole} onRoleChange={setRbacRole} />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {/* Pipeline Progress Indicator */}
        {isLoading && <PipelineProgress activeStep={activeStep} />}

        {/* Message Stream */}
        <MessageList
          messages={messages}
          onSelectCitations={setSelectedCitations}
          onSelectAudit={setSelectedAuditEvents}
          onSelectPrompt={(p, r) => {
            if (r) setRbacRole(r as RBACRole);
            sendMessage(p, (r as RBACRole) || rbacRole);
          }}
        />

        {/* Input Bar */}
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
          onClear={clearChat}
        />
      </main>

      {/* Citations Side Drawer / Modal */}
      <SourcePanel
        citations={selectedCitations}
        onClose={() => setSelectedCitations(null)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        events={selectedAuditEvents}
        onClose={() => setSelectedAuditEvents(null)}
      />

      {/* Scenario Benchmark Launcher Modal */}
      <ScenarioLauncher
        isOpen={isScenarioLauncherOpen}
        onClose={() => setIsScenarioLauncherOpen(false)}
        scenarioResults={scenarioResults}
        isBenchmarking={isBenchmarking}
        onRunScenario={executeScenarioById}
        onRunAll={executeAllScenarios}
        onLoadInChat={(q, r) => {
          setRbacRole(r);
          sendMessage(q, r);
        }}
      />
    </div>
  );
};
