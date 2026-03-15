/**
 * @file Input.tsx
 * @description A styled form input component with integrated labeling and validation feedback.
 *
 * @module UIComponents
 * @category Components
 */

import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

/**
 * Props for the Input component.
 * Extends standard HTML input attributes.
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional label text displayed above the input field. */
  label?: string;

  /** Error message displayed below the input; triggers high-contrast error styling. */
  error?: string;

  /** Supplemental instructional text displayed when no error is present. */
  helperText?: string;
}

/**
 * Input Component
 *
 * A standardized text entry field that encapsulates common form layout patterns
 * (labels, inputs, error states) into a single reusable unit.
 *
 * @component
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, ...props }, ref) => {
    // Dynamic styling based on validation state
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
