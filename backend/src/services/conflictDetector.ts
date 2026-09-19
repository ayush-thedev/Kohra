import { PolicyChunk, ConflictWarning } from "../types/index.js";

export function detectConflicts(chunks: PolicyChunk[]): ConflictWarning[] {
  const warnings: ConflictWarning[] = [];
  const currentDate = new Date().toISOString().split("T")[0];

  // 1. Supersession Check (e.g. v3.0 supersedes v2.0)
  for (const chunk of chunks) {
    if (chunk.supersedes) {
      warnings.push({
        severity: "warning",
        type: "superseded",
        message: `Policy "${chunk.title}" v${chunk.version} supersedes version ${chunk.supersedes} (effective from ${chunk.validFrom}). Newer policy terms must be applied.`,
        affectedPolicies: [chunk.title, `v${chunk.supersedes}`]
      });
    }

    // 2. Date Expiry Check
    if (chunk.validUntil && chunk.validUntil < currentDate) {
      warnings.push({
        severity: "warning",
        type: "expired",
        message: `Policy "${chunk.title}" expired on ${chunk.validUntil}. Refer to active 2026 guidelines.`,
        affectedPolicies: [chunk.title]
      });
    }

    // 3. Explicit Conflicts Metadata
    if (chunk.conflictsWith && chunk.conflictsWith.length > 0) {
      warnings.push({
        severity: "info",
        type: "contradicts",
        message: `Policy "${chunk.title}" has documented interactions with: ${chunk.conflictsWith.join(", ")}.`,
        affectedPolicies: [chunk.title, ...chunk.conflictsWith]
      });
    }
  }

  // Deduplicate warnings
  const uniqueMessages = new Set<string>();
  return warnings.filter((w) => {
    if (uniqueMessages.has(w.message)) return false;
    uniqueMessages.add(w.message);
    return true;
  });
}
