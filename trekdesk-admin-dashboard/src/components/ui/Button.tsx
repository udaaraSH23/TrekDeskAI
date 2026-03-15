/**
 * @file Button.tsx
 * @description A highly configurable button component with support for multiple variants,
 * sizes, loading states, and icon integration.
 *
 * @module UIComponents
 * @category Components
 */

import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

/**
 * Props for the Button component.
 * Extends standard HTML button attributes for full compatibility.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style variant.
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";

  /**
   * The physical size of the button.
   * @default "md"
   */
  size?: "sm" | "md" | "lg" | "icon";

  /**
   * If true, displays a spinning loader and disables interaction.
   */
  isLoading?: boolean;

  /**
   * An optional icon to display before the button text.
   */
  icon?: React.ReactNode;
}

/**
 * Button Component
 *
 * The primary interaction element used throughout the dashboard.
 * Implements a design system that provides clear affordances and
 * feedback (loading spinners, hover effects).
 *
 * @component
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading,
      icon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Combine base styles with variant and size classes for CSS Module compatibility
    const classNames = [styles.button, styles[variant], styles[size], className]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className={`${styles.spinner} animate-spin`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              opacity="0.25"
            ></circle>
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!isLoading && icon && <span className={styles.iconSpan}>{icon}</span>}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
