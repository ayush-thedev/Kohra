import { PolicyChunk, RBACRole, RBACFilterResult } from "../types/index.js";

export function filterByRole(
  chunks: PolicyChunk[],
  rbacRole: RBACRole = "EMPLOYEE"
): RBACFilterResult {
  const filtered: PolicyChunk[] = [];
  const droppedReasons: string[] = [];
  let droppedCount = 0;

  for (const chunk of chunks) {
    const isAllowed = chunk.rbacTiers.includes(rbacRole);

    if (isAllowed) {
      filtered.push(chunk);
    } else {
      droppedCount++;
      const required = chunk.rbacTiers.join(" or ");
      droppedReasons.push(
        `Document "${chunk.title}" (Section: ${chunk.section}) requires ${required} role (User role: ${rbacRole})`
      );
    }
  }

  return {
    filtered,
    droppedCount,
    droppedReasons
  };
}
