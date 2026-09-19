export type DomainType = "hr" | "finance" | "support" | "privacy" | "legal" | "out_of_scope";

export type RBACRole = "EMPLOYEE" | "MANAGER" | "HR" | "FINANCE" | "LEGAL" | "ADMIN";

export type FormatType = "prose" | "json" | "xml" | "xlsx" | "email";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface PolicyMetadata {
  title: string;
  domain: DomainType;
  version: string;
  validFrom: string;
  validUntil?: string;
  supersedes?: string;
  keywords: string[];
  rbacTiers: RBACRole[];
  conflictsWith?: string[];
  filePath?: string;
}

export interface PolicyChunk {
  id: string;
  domain: DomainType;
  title: string;
  section: string;
  content: string;
  keywords: string[];
  version: string;
  validFrom: string;
  validUntil?: string;
  supersedes?: string;
  rbacTiers: RBACRole[];
  conflictsWith?: string[];
  embedding?: number[];
  filePath?: string;
}

export interface RouterResult {
  domain: DomainType;
  confidence: number;
  allDomains?: Array<{ domain: DomainType; score: number }>;
  clarifyingQuestion?: string;
}

export interface RBACFilterResult {
  filtered: PolicyChunk[];
  droppedCount: number;
  droppedReasons: string[];
}

export interface RetrievalResult {
  chunks: PolicyChunk[];
  semanticScores: number[];
  keywordScores: number[];
  mergedScores: number[];
}

export interface ConflictWarning {
  severity: "info" | "warning" | "critical";
  type: "superseded" | "contradicts" | "requires_dpia" | "gap" | "expired";
  message: string;
  affectedPolicies: string[];
}

export interface HITLDecision {
  requiresApproval: boolean;
  riskLevel: RiskLevel;
  reason: string;
  escalateTo: "MANAGER" | "HR" | "LEGAL" | "ADMIN";
}

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
  event:
    | "QUERY_RECEIVED"
    | "ROUTER_CLASSIFIED"
    | "RETRIEVAL_EXECUTED"
    | "RBAC_FILTERED"
    | "CONFLICT_DETECTED"
    | "HITL_REQUIRED"
    | "ANSWER_GENERATED"
    | "FORMATTED_OUTPUT"
    | "RESPONSE_SENT";
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

export interface ChatRequest {
  query: string;
  sessionId?: string;
  rbacRole?: RBACRole;
  format?: FormatType;
  requestId?: string;
}

export interface ChatResponse {
  requestId: string;
  sessionId: string;
  answer: string;
  domain: DomainType;
  confidence: number;
  grounded: boolean;
  stage: "answered" | "clarification" | "restricted" | "escalated" | "refused";
  citations: Citation[];
  auditEvents: AuditEvent[];
  timing: TimingBreakdown;
  fileUrl?: string;
  filename?: string;
  mimeType?: string;
  hitlDecision?: HITLDecision;
  conflictWarnings?: ConflictWarning[];
}

export interface ErrorResponse {
  requestId: string;
  error: "OUT_OF_SCOPE" | "ACCESS_DENIED" | "HITL_ESCALATED" | "INTERNAL_ERROR" | "VALIDATION_ERROR";
  message: string;
  suggestedAction?: "REDIRECT_TO_TEAM" | "SWITCH_ROLE" | "RETRY" | "PROVIDE_MORE_CONTEXT";
  recommendedTeam?: "IT_SUPPORT" | "HR" | "LEGAL" | "FINANCE" | "CUSTOMER_CARE";
  auditEvents?: AuditEvent[];
  timing?: Partial<TimingBreakdown>;
}

export interface MessageTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SessionData {
  sessionId: string;
  messages: MessageTurn[];
  createdAt: string;
  lastAccessedAt: string;
}
