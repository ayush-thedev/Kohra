import { HITLDecision, DomainType, RBACRole } from "../types/index.js";

export function assessRisk(
  query: string,
  domain: DomainType,
  rbacRole: RBACRole
): HITLDecision {
  const queryLower = query.toLowerCase();

  // CRITICAL Risk Triggers
  if (
    queryLower.includes("executive compensation") ||
    queryLower.includes("c-suite bonus") ||
    queryLower.includes("salary band") ||
    queryLower.includes("confidential severance formula")
  ) {
    return {
      requiresApproval: true,
      riskLevel: "CRITICAL",
      reason: "Query involves sensitive executive compensation or confidential personnel formulas requiring Human-in-the-Loop authorization.",
      escalateTo: "HR"
    };
  }

  // HIGH Risk Triggers
  if (
    (queryLower.includes("breach notification") && queryLower.includes("authority")) ||
    (queryLower.includes("vendor data sharing") && queryLower.includes("exception")) ||
    queryLower.includes("override encryption")
  ) {
    return {
      requiresApproval: true,
      riskLevel: "HIGH",
      reason: "High-risk compliance action involving regulatory breach disclosure or security policy deviation.",
      escalateTo: "LEGAL"
    };
  }

  // MEDIUM Risk Triggers
  if (
    queryLower.includes("policy exception") ||
    queryLower.includes("budget override") ||
    queryLower.includes("waive approval threshold")
  ) {
    return {
      requiresApproval: false, // Informs but does not block standard reading
      riskLevel: "MEDIUM",
      reason: "Query references policy exceptions or financial threshold overrides. Formal managerial approval ticket is recommended.",
      escalateTo: "MANAGER"
    };
  }

  // LOW Risk (Standard policy lookup)
  return {
    requiresApproval: false,
    riskLevel: "LOW",
    reason: "Standard policy inquiry within acceptable governance boundaries.",
    escalateTo: "MANAGER"
  };
}
