import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, errorText, id, className = "", ...rest },
  ref,
) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`w-full rounded-xl border border-border bg-surface/80 px-3 py-2 text-sm text-text outline-none transition backdrop-blur-xl focus:border-primary focus:ring-2 focus:ring-primary/20 ${errorText ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200/50" : ""} ${className}`}
        {...rest}
      />
      {errorText ? (
        <p className="text-xs font-medium text-rose-400">{errorText}</p>
      ) : (
        helperText && <p className="text-xs text-muted">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
