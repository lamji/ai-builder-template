/**
 * Input Sanitization Utility (PCI DSS Req 6)
 *
 * Prevents XSS (Cross-Site Scripting) and injection attacks
 * by sanitizing all user-generated content before processing.
 *
 * Usage:
 *   import { sanitizeInput } from "@/lib/security";
 *   const clean = sanitizeInput(userInput);
 *
 * Rule: security-standards.md §4 - Input Sanitization
 */

/**
 * Sanitizes a single string input by stripping dangerous HTML/script tags.
 * @param input - Raw user input string
 * @returns Sanitized string safe for display and storage
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/`/g, "&#96;")
    .trim();
}

/**
 * Recursively sanitizes all string values in an object.
 * Useful for sanitizing entire request bodies.
 *
 * @param obj - Object containing user input
 * @returns New object with all string values sanitized
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string"
          ? sanitizeInput(item)
          : typeof item === "object" && item !== null
            ? sanitizeObject(item as Record<string, unknown>)
            : item
      );
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
