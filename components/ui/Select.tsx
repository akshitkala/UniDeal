import { SelectHTMLAttributes, forwardRef } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = "", id, children, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label ? (
          <label className="block font-body text-caption font-semibold text-text" htmlFor={id}>
            {label}
          </label>
        ) : null}
        <select
          id={id}
          ref={ref}
          className={`w-full rounded-md border bg-background px-4 py-3 font-body text-body text-text outline-none transition-colors duration-base ease-base focus:border-primary ${
            error ? "border-danger focus:border-danger" : "border-border focus:border-primary"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <p className="font-body text-caption text-danger mt-1">{error}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
