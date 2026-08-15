import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label ? (
          <label className="block font-body text-caption font-semibold text-text" htmlFor={id}>
            {label}
          </label>
        ) : null}
        <input
          id={id}
          ref={ref}
          className={`w-full rounded-md border bg-background px-4 py-3 font-body text-body text-text outline-none transition-colors duration-base ease-base placeholder:text-text-muted focus:border-primary ${
            error ? "border-danger focus:border-danger" : "border-border focus:border-primary"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="font-body text-caption text-danger mt-1">{error}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
