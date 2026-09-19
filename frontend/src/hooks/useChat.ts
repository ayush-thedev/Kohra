import { useState, useCallback } from "react";
import { ChatMessage, RBACRole, FormatType, Citation, AuditEvent, ScenarioResult } from "../types/index.js";
import { sendChatMessage, runScenario, runAllScenarios } from "../services/api.js";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>(() => `sess_${Math.random().toString(36).substring(2, 9)}`);
  const [rbacRole, setRbacRole] = useState<RBACRole>("EMPLOYEE");
  const [selectedFormat, setSelectedFormat] = useState<FormatType>("prose");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<string>("");

  // Drawer / Inspection States
  const [selectedCitations, setSelectedCitations] = useState<Citation[] | null>(null);
  const [selectedAuditEvents, setSelectedAuditEvents] = useState<AuditEvent[] | null>(null);
  const [isScenarioLauncherOpen, setIsScenarioLauncherOpen] = useState<boolean>(false);
  const [scenarioResults, setScenarioResults] = useState<Record<number, ScenarioResult>>({});
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);

  // Send Message Action
  const sendMessage = useCallback(
    async (text: string, overrideRole?: RBACRole, overrideFormat?: FormatType) => {
      const query = text.trim();
      if (!query || isLoading) return;

      const roleToUse = overrideRole || rbacRole;
      const formatToUse = overrideFormat || selectedFormat;

      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        role: "user",
        content: query,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setActiveStep("Routing intent & analyzing domain...");

      try {
        const assistantMsg = await sendChatMessage(query, sessionId, roleToUse, formatToUse);
        setMessages((prev) => [...prev, assistantMsg]);
        if (assistantMsg.citations && assistantMsg.citations.length > 0) {
          setSelectedCitations(assistantMsg.citations);
        }
        if (assistantMsg.auditEvents && assistantMsg.auditEvents.length > 0) {
          setSelectedAuditEvents(assistantMsg.auditEvents);
        }
      } catch (err: any) {
        const errorMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: `⚠️ Error processing query: ${err.message || "Failed to reach Kohler agent API."}`,
          timestamp: new Date().toISOString(),
          stage: "refused"
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
        setActiveStep("");
      }
    },
    [isLoading, rbacRole, selectedFormat, sessionId]
  );

  // Run a single scenario
  const executeScenarioById = useCallback(async (id: number) => {
    setIsBenchmarking(true);
    try {
      const res = await runScenario(id);
      setScenarioResults((prev) => ({ ...prev, [id]: res }));
    } catch (e) {
      console.error("Scenario run failed:", e);
    } finally {
      setIsBenchmarking(false);
    }
  }, []);

  // Run all scenarios
  const executeAllScenarios = useCallback(async () => {
    setIsBenchmarking(true);
    try {
      const res = await runAllScenarios();
      const mapped: Record<number, ScenarioResult> = {};
      res.results.forEach((r) => {
        mapped[r.scenarioId] = r;
      });
      setScenarioResults(mapped);
    } catch (e) {
      console.error("Benchmark failed:", e);
    } finally {
      setIsBenchmarking(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(`sess_${Math.random().toString(36).substring(2, 9)}`);
    setSelectedCitations(null);
    setSelectedAuditEvents(null);
  }, []);

  return {
    messages,
    sessionId,
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
  };
}
