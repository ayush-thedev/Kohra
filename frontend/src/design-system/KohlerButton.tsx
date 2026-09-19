import React from "react";

export interface KohlerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "brand" | "neutral" | "white" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const KohlerButton: React.FC<KohlerButtonProps> = ({
  variant = "brand",
  size = "md",
  icon,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "relative inline-flex items-center justify-center font-primary font-medium uppercase tracking-wider transition-all duration-150 select-none overflow-hidden rounded-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]";

  const sizeStyles = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-xs gap-2",
    lg: "h-12 px-6 text-sm gap-2.5"
  };

  const variantStyles = {
    brand:
      "bg-brand-600 text-white border border-brand-600 hover:bg-brand-500 hover:border-brand-500 shadow-brandSm active:bg-brand-700",
    neutral:
      "bg-surface-subtle text-white border border-border-low hover:border-brand-600 hover:text-brand-500 active:bg-surface-muted",
    white:
      "bg-white text-black border border-white hover:bg-brand-600 hover:border-brand-600 hover:text-white",
    outline:
      "bg-transparent text-white border border-border-low hover:border-brand-600 hover:text-brand-500",
    ghost:
      "bg-transparent text-content-secondary hover:text-brand-500 hover:bg-surface-subtle"
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};
