/**
 * @file Card.tsx
 * @description A flexible container system used for grouping related content and actions.
 * Supports standard and glassmorphic variants with optional hover effects.
 *
 * @module UIComponents
 * @category Components
 */

import { forwardRef, type HTMLAttributes } from "react";
import styles from "./Card.module.css";

/**
 * Props for the main Card component.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The visual theme of the card.
   * @default "default"
   */
  variant?: "default" | "glass";

  /**
   * If true, applies a subtle lift animation and shadow on hover.
   * @default false
   */
  hoverable?: boolean;
}

/**
 * Card Component
 *
 * The primary layout building block for dashboard widgets and sections.
 * Designed to be used with CardHeader, CardContent, and CardFooter sub-components.
 *
 * @component
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = "",
      variant = "default",
      hoverable = false,
      children,
      ...props
    },
    ref,
  ) => {
    const classNames = [
      styles.card,
      variant === "glass" && styles.glass,
      hoverable && styles.hoverable,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classNames} {...props}>
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

/**
 * CardHeader sub-component for titles and descriptive introductions.
 */
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`${styles.header} ${className}`} {...props} />
));
CardHeader.displayName = "CardHeader";

/**
 * CardTitle sub-component rendered as an H3 with theme-aligned typography.
 */
export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className = "", ...props }, ref) => (
  <h3 ref={ref} className={`${styles.title} ${className}`} {...props} />
));
CardTitle.displayName = "CardTitle";

/**
 * CardDescription for supplemental context within the header.
 */
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <p ref={ref} className={`${styles.description} ${className}`} {...props} />
));
CardDescription.displayName = "CardDescription";

/**
 * CardContent - The main body container for the card's payload.
 */
export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`${styles.content} ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * CardFooter for secondary actions or supplemental links at the bottom.
 */
export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`${styles.footer} ${className}`} {...props} />
));
CardFooter.displayName = "CardFooter";
