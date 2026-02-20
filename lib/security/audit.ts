/**
 * Audit Logging & Data Redaction (PCI DSS Req 10)
 *
 * - Records all administrative actions with required audit fields.
 * - Automatically redacts sensitive information from log output.
 * - Audit entries include: Timestamp, UserID, Action, Source IP, Result.
 *
 * Usage:
 *   import { createAuditLog, redactSensitiveData } from "@/lib/security";
 *
 * Rule: security-standards.md §5 - Monitoring & Audit
 */

// ─── Sensitive Field Patterns ────────────────────────────
// Fields/patterns that MUST be redacted in any log output.
const SENSITIVE_PATTERNS: RegExp[] = [
  /password/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /cookie/i,
  /cvv/i,
  /cvc/i,
  /credit.?card/i,
  /card.?number/i,
  /pan/i,
  /ssn/i,
  /social.?security/i,
];

// Credit card number pattern (full or partial)
const CARD_NUMBER_REGEX = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;

// ─── Types ───────────────────────────────────────────────
export interface AuditLogEntry {
  timestamp: string;
  userId: string;
  action: string;
  sourceIp: string;
  result: "SUCCESS" | "FAIL";
  details?: string;
  resource?: string;
}

/**
 * Redacts sensitive data from an object (for logging purposes).
 * Replaces values of sensitive keys with "[REDACTED]".
 * Also masks credit card numbers found in string values.
 *
 * @param data - Object to redact
 * @returns New object with sensitive values replaced
 */
export function redactSensitiveData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // Check if the key matches any sensitive pattern
    const isSensitive = SENSITIVE_PATTERNS.some((pattern) =>
      pattern.test(key)
    );

    if (isSensitive) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "string") {
      // Mask any credit card numbers in string values
      redacted[key] = value.replace(
        CARD_NUMBER_REGEX,
        "****-****-****-****"
      );
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = Array.isArray(value)
        ? value.map((item) =>
            typeof item === "object" && item !== null
              ? redactSensitiveData(item as Record<string, unknown>)
              : item
          )
        : redactSensitiveData(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Creates a standardized audit log entry (PCI DSS Req 10).
 *
 * Every administrative action MUST be logged using this function.
 * Entries are output to console in structured JSON format.
 * In production, pipe these to a secure, tamper-proof log store.
 *
 * @param entry - Audit log entry fields
 */
export function createAuditLog(entry: AuditLogEntry): void {
  const logEntry = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
    _type: "AUDIT_LOG",
    _version: "1.0",
  };

  // In production: Send to secure log aggregation service
  // (e.g., Datadog, Splunk, AWS CloudWatch)
  // For now, structured console output.
  console.log(JSON.stringify(logEntry));
}
