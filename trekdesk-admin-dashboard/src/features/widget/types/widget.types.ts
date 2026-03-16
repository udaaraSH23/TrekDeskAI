/**
 * @module WidgetTypes
 * @category Models
 *
 * This module defines the core data structures for the TrekDesk AI chat widget.
 * These types are shared between the administrative dashboard and the embedded chat widget.
 */

/**
 * Represents the full configuration for the TrekDesk AI chat widget.
 *
 * @category Interfaces
 */
export interface WidgetSettings {
  /**
   * Uniquely identifies the tenant (business) owning these settings.
   * @example "tenant_123"
   */
  tenant_id: string;

  /**
   * The primary brand color in HEX format. Used for buttons, waves, and highlights.
   * @defaultValue "#10b981"
   */
  primary_color: string;

  /**
   * Physical screen position of the widget launcher.
   * @defaultValue "right"
   */
  position: "left" | "right";

  /**
   * @defaultValue "Hi! How can I help you today?"
   */
  initial_message: string;

  /**
   * The name of the AI assistant shown in the widget header.
   * @defaultValue "TrekDesk AI"
   */
  agent_name: string;

  /**
   * Security: A list of authorized origins that are permitted to embed this widget.
   * If empty, the widget may be restricted or open depending on backend policy.
   */
  allowed_origins: string[];

  /**
   * ISO 8601 timestamp representing the last time these settings were modified.
   */
  updated_at?: string;
}

/**
 * Data structure used for performing partial or full updates to existing widget configuration.
 *
 * @category Payloads
 */
export interface UpdateWidgetSettingsPayload {
  /** New HEX color to apply to the brand styling. */
  primary_color?: string;

  /** New physical position for the widget launcher. */
  position?: "left" | "right";

  /** New introductory message for the chat interface. */
  initial_message?: string;

  /** New AI assistant name. */
  agent_name?: string;

  /** Updated list of allowed origins for security enforcement. */
  allowed_origins?: string[];
}
