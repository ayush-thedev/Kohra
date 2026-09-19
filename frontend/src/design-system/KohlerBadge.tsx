import React from "react";
import { RBACRole, DomainType } from "../types/index.js";

export interface KohlerBadgeProps {
  variant?: "brand" | "neutral" | "role" | "domain" | "success" | "error" | "warning";
  roleValue?: RBACRole;
  domainValue?: DomainType;
  children?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export const KohlerBadge: React.FC<KohlerBadgeProps> = ({
  variant = "neutral",
  roleValue,
  domainValue,
  children,
  size = "sm",
  className = ""
}) => {
  const sizeStyles = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  let specificStyle = "bg-surface-subtle text-content-secondary border border-border-low";

  if (variant === "brand") {
    specificStyle = "bg-brand-600 text-white font-bold border border-brand-600";
  } else if (variant === "success") {
    specificStyle = "bg-emerald-950/60 text-emerald-400 border border-emerald-500/50";
  } else if (variant === "error") {
    specificStyle = "bg-red-950/60 text-red-400 border border-red-500/50";
  } else if (variant === "warning") {
    specificStyle = "bg-amber-950/60 text-amber-300 border border-amber-500/50";
  } else if (variant === "role" && roleValue) {
    switch (roleValue) {
      case "ADMIN":
        specificStyle = "bg-brand-600 text-white font-bold border border-brand-600";
        break;
      case "LEGAL":
        specificStyle = "bg-sky-950/70 text-sky-300 border border-sky-600/60";
        break;
      case "FINANCE":
        specificStyle = "bg-amber-950/70 text-amber-300 border border-amber-600/60";
        break;
      case "HR":
        specificStyle = "bg-emerald-950/70 text-emerald-300 border border-emerald-600/60";
        break;
      case "MANAGER":
        specificStyle = "bg-surface-subtle text-gray-300 border border-border-low";
        break;
      case "EMPLOYEE":
      default:
        specificStyle = "bg-surface-muted text-gray-400 border border-border-low";
        break;
    }
  } else if (variant === "domain" && domainValue) {
    switch (domainValue) {
      case "finance":
        specificStyle = "bg-amber-950/50 text-amber-300 border border-amber-700/50";
        break;
      case "hr":
        specificStyle = "bg-emerald-950/50 text-emerald-300 border border-emerald-700/50";
        break;
      case "privacy":
        specificStyle = "bg-cyan-950/50 text-cyan-300 border border-cyan-700/50";
        break;
      case "legal":
        specificStyle = "bg-sky-950/50 text-sky-300 border border-sky-700/50";
        break;
      case "support":
        specificStyle = "bg-teal-950/50 text-teal-300 border border-teal-700/50";
        break;
      default:
        specificStyle = "bg-surface-subtle text-content-tertiary border border-border-low";
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider font-semibold rounded-none ${sizeStyles} ${specificStyle} ${className}`}
    >
      {roleValue || domainValue || children}
    </span>
  );
};
