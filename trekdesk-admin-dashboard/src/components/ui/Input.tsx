import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, ...props }, ref) => {
    const inputClasses = [
      styles.input,
      error ? styles.errorInput : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={styles.inputWrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <p className={styles.errorText}>{error}</p>}
        {!error && helperText && (
          <p className={styles.helperText}>{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
