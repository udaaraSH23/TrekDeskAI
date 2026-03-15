/**
 * @file Badge.tsx
 * @description A versatile status indicator component used for categorization and labeling.
 *
 * @module UIComponents
 * @category Components
 */

import { forwardRef, type HTMLAttributes } from "react";
import styles from "./Badge.module.css";

/**
 * Props for the Badge component.
 * Extends standard HTML div attributes.
 */
export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The visual style variant of the badge.
   * @default "default"
   */
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
}

/**
 * Badge Component
 *
 * A compact element used to highlight status, category, or other metadata identifiers.
 * Supports multiple semantic variants for consistent themed feedback.
 *
 * @component
 */
export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const classNames = [styles.badge, styles[variant], className]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classNames} {...props}>
        {children}
      </div>
    );
  },
);

Badge.displayName = "Badge";
