import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, children, className = "" }: EmptyStateProps) {
  return (
    <div className={`rounded-lg border border-border bg-surface px-6 py-12 text-center max-w-md mx-auto shadow-sm space-y-4 ${className}`}>
      <div className="space-y-2">
        <h3 className="font-display text-heading text-text">{title}</h3>
        <p className="font-body text-body text-text-muted">{description}</p>
      </div>
      {children ? (
        <div className="flex justify-center pt-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}
