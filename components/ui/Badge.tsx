import type { ReactNode } from "react";

type BadgeProps = {
  variant?: "default" | "primary" | "accent" | "danger";
  children: ReactNode;
  className?: string;
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-caption font-medium transition-colors";
  
  const variantStyles = {
    default: "bg-border/40 text-text-muted",
    primary: "bg-primary/10 text-primary border border-primary/20",
    accent: "bg-accent/10 text-accent border border-accent/20",
    danger: "bg-danger/10 text-danger border border-danger/20",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
