import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-body font-semibold transition-colors duration-base ease-base outline-none disabled:cursor-not-allowed disabled:opacity-60";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-caption rounded-sm",
    md: "px-4 py-3 text-body rounded-md",
    lg: "px-6 py-4 text-body rounded-lg",
  };

  const variantStyles = {
    primary: "bg-primary text-on-primary hover:bg-primary-hover focus:bg-primary-hover",
    secondary: "bg-background border border-border text-text hover:bg-surface focus:bg-surface",
    danger: "bg-danger text-white hover:bg-danger/90 focus:bg-danger/90",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
