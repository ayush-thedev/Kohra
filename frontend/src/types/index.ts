export type DomainType = "hr" | "finance" | "support" | "privacy" | "legal" | "out_of_scope";

export type RBACRole = "EMPLOYEE" | "MANAGER" | "HR" | "FINANCE" | "LEGAL" | "ADMIN";

export type FormatType = "prose" | "json" | "xml" | "xlsx" | "email";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Citation {
  documentTitle: string;
  section: string;
  version: string;
  snippet: string;
  filePath?: string;
}

export interface AuditEvent {
  timestamp: string;
  requestId: string;
  event: string;
  severity: "INFO" | "WARNING" | "ERROR";
  details: Record<string, any>;
}

export interface TimingBreakdown {
  routeMs: number;
  retrieveMs: number;
  rbacMs: number;
  conflictMs: number;
  hitlMs: number;
  answerMs: number;
  formatMs: number;
  totalMs: number;
}

export interface ConflictWarning {
  severity: "info" | "warning" | "critical";
  type: string;
  message: string;
  affectedPolicies: string[];
}

export interface HITLDecision {
  requiresApproval: boolean;
  riskLevel: RiskLevel;
  reason: string;
  escalateTo: "MANAGER" | "HR" | "LEGAL" | "ADMIN";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  domain?: DomainType;
  confidence?: number;
  grounded?: boolean;
  stage?: "answered" | "clarification" | "restricted" | "escalated" | "refused";
  citations?: Citation[];
  auditEvents?: AuditEvent[];
  timing?: TimingBreakdown;
  fileUrl?: string;
  filename?: string;
  mimeType?: string;
  format?: FormatType;
  hitlDecision?: HITLDecision;
  conflictWarnings?: ConflictWarning[];
}

export interface ScenarioResult {
  scenarioId: number;
  slug: string;
  title: string;
  status: "PASS" | "FAIL";
  assertions: Array<{ check: string; passed: boolean; details?: string }>;
  timingMs: number;
  outputSample?: string;
}
