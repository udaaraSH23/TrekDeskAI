/**
 * Hardcoded Tenant ID for the MVP (Kandy Treks).
 * Using a fixed UUID forces the backend logic into a multi-tenant structure from day one,
 * enabling fast prototyping while ensuring zero architectural debt when expanding to new customers.
 */
export const MVP_TENANT_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Security Whitelist for System Administrators.
 * In MVP mode, only Google Accounts present in this array are allowed
 * to authenticate past the Controller tier.
 */
export const GOOGLE_AUTH_WHITELIST = [
  "admin@kandytreks.com",
  "developer@axiolonlabs.com",
  "ds@summitlogic.io", // Primary developer access
];
