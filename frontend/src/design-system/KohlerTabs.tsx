import React from "react";
import { FormatType } from "../types/index.js";

export interface KohlerTabsProps {
  formats: FormatType[];
  activeFormat: FormatType;
  onChange: (format: FormatType) => void;
  className?: string;
}

export const KohlerTabs: React.FC<KohlerTabsProps> = ({
  formats,
  activeFormat,
  onChange,
  className = ""
}) => {
  return (
    <div className={`inline-flex bg-surface-subtle border border-border-low p-0.5 gap-0.5 rounded-none ${className}`}>
      {formats.map((fmt) => {
        const isActive = activeFormat === fmt;
        return (
          <button
            key={fmt}
            onClick={() => onChange(fmt)}
            className={`px-3 py-1 text-[11px] font-primary uppercase tracking-wider transition-all duration-150 select-none rounded-none ${
              isActive
                ? "bg-brand-600 text-white font-semibold shadow-brandSm"
                : "text-content-tertiary hover:text-white hover:bg-surface-muted"
            }`}
          >
            {fmt}
          </button>
        );
      })}
    </div>
  );
};
