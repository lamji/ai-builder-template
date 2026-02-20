/**
 * Session & Cookie Security Configuration (PCI DSS Req 7 & 8)
 *
 * Defines secure defaults for session management and cookies.
 * ALL authentication implementations MUST use these constants.
 *
 * Usage:
 *   import { COOKIE_OPTIONS, SESSION_CONFIG } from "@/lib/security";
 *
 * Rule: security-standards.md §3 - Access Control
 */

// ─── Secure Cookie Options (PCI DSS Req 8) ──────────────
// Cookies MUST be HttpOnly, Secure, and SameSite: Strict.
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 30 * 60, // 30 minutes (PCI DSS session timeout)
} as const;

// ─── Session Configuration ───────────────────────────────
export const SESSION_CONFIG = {
  /** Session timeout in seconds (30 minutes of inactivity) */
  maxAge: 30 * 60,

  /** Session cookie name */
  cookieName: "session-token",

  /** Force HTTPS in production */
  secureCookie: process.env.NODE_ENV === "production",

  /** Refresh session on activity (sliding window) */
  updateAge: 5 * 60, // Refresh every 5 minutes of activity

  /** Maximum absolute session duration (24 hours) */
  absoluteTimeout: 24 * 60 * 60,
} as const;

// ─── Auth Route Constants ────────────────────────────────
export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  callback: "/api/auth/callback",
} as const;

// ─── Password Policy (PCI DSS Req 8) ────────────────────
export const PASSWORD_POLICY = {
  /** Minimum password length */
  minLength: 8,

  /** Require uppercase letter */
  requireUppercase: true,

  /** Require lowercase letter */
  requireLowercase: true,

  /** Require numeric digit */
  requireNumber: true,

  /** Require special character */
  requireSpecialChar: true,

  /** bcrypt cost factor (minimum 12 for PCI DSS) */
  bcryptRounds: 12,
} as const;
