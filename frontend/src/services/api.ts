import { ChatMessage, FormatType, RBACRole, ScenarioResult } from "../types/index.js";

const API_BASE = "";

export async function sendChatMessage(
  query: string,
  sessionId?: string,
  rbacRole: RBACRole = "EMPLOYEE",
  format: FormatType = "prose"
): Promise<ChatMessage> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, sessionId, rbacRole, format })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return {
    id: data.requestId,
    role: "assistant",
    content: data.answer,
    timestamp: new Date().toISOString(),
    domain: data.domain,
    confidence: data.confidence,
    grounded: data.grounded,
    stage: data.stage,
    citations: data.citations,
    auditEvents: data.auditEvents,
    timing: data.timing,
    fileUrl: data.fileUrl,
    filename: data.filename,
    mimeType: data.mimeType,
    format,
    hitlDecision: data.hitlDecision,
    conflictWarnings: data.conflictWarnings
  };
}

export async function fetchScenarios(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/scenarios`);
  if (!res.ok) throw new Error("Failed to fetch scenarios");
  return res.json();
}

export async function runScenario(id: number): Promise<ScenarioResult> {
  const res = await fetch(`${API_BASE}/api/scenarios/run/${id}`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to run scenario ${id}`);
  return res.json();
}

export async function runAllScenarios(): Promise<{ summary: any; results: ScenarioResult[] }> {
  const res = await fetch(`${API_BASE}/api/scenarios/run-all`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to run benchmark suite");
  return res.json();
}

export async function fetchSessionAudit(sessionId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/audit/${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch audit log");
  return res.json();
}
