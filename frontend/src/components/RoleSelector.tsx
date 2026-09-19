import React, { useState } from "react";
import { RBACRole } from "../types/index.js";
import { KohlerBadge } from "../design-system/KohlerBadge.js";
import { Shield, ChevronDown } from "lucide-react";

interface RoleSelectorProps {
  currentRole: RBACRole;
  onRoleChange: (role: RBACRole) => void;
}

const ROLES: Array<{ role: RBACRole; label: string; desc: string }> = [
  { role: "EMPLOYEE", label: "Employee", desc: "Standard PTO, general benefits, public warranties" },
  { role: "MANAGER", label: "Manager", desc: "Team budgets, expense sign-offs up to $5,000, hybrid approvals" },
  { role: "HR", label: "Human Resources", desc: "Confidential severance formulas, executive personnel" },
  { role: "FINANCE", label: "Finance & Accounting", desc: "Executive entertainment budgets, procurement, multi-tier approvals" },
  { role: "LEGAL", label: "Legal & Compliance", desc: "Cloud vendor DPA, whistleblower hotline, regulatory risk" },
  { role: "ADMIN", label: "Enterprise Admin", desc: "Unrestricted access across all 5 Kohler policy repositories" }
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ currentRole, onRoleChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface-subtle border border-border-low hover:border-brand-600 transition-colors text-xs font-primary uppercase tracking-wider text-white select-none rounded-none"
      >
        <Shield className="w-3.5 h-3.5 text-brand-500" />
        <span className="text-content-tertiary">Role:</span>
        <KohlerBadge variant="role" roleValue={currentRole} size="sm" />
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1 w-80 bg-surface-muted border border-border-low shadow-2xl z-40 p-1.5 space-y-1 rounded-none animate-fadeIn">
            <div className="px-3 py-2 text-[10px] font-primary uppercase tracking-wider text-content-tertiary border-b border-border-low">
              Select RBAC Governance Tier
            </div>
            {ROLES.map((r) => {
              const isSelected = r.role === currentRole;
              return (
                <button
                  key={r.role}
                  onClick={() => {
                    onRoleChange(r.role);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 transition-all flex flex-col gap-1 border rounded-none ${
                    isSelected
                      ? "bg-surface-subtle border-brand-600"
                      : "bg-transparent border-transparent hover:bg-surface-subtle/80 hover:border-border-low"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-primary font-medium text-xs uppercase tracking-wider text-white">
                      {r.label}
                    </span>
                    <KohlerBadge variant="role" roleValue={r.role} size="sm" />
                  </div>
                  <p className="text-[11px] text-content-tertiary leading-tight font-sans font-light">{r.desc}</p>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
