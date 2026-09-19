import React from "react";

export interface KohlerCardProps {
  children: React.ReactNode;
  className?: string;
  withCornerCubes?: boolean;
  highlightOnHover?: boolean;
}

export const KohlerCard: React.FC<KohlerCardProps> = ({
  children,
  className = "",
  withCornerCubes = false,
  highlightOnHover = false
}) => {
  return (
    <div
      className={`relative bg-surface-muted border border-border-low p-5 rounded-none transition-all duration-150 ${
        highlightOnHover ? "hover:border-brand-600 hover:bg-surface-subtle" : ""
      } ${className}`}
    >
      {withCornerCubes && (
        <>
          <div className="corner-cube-tl" />
          <div className="corner-cube-tr" />
          <div className="corner-cube-br" />
          <div className="corner-cube-bl" />
        </>
      )}
      {children}
    </div>
  );
};
