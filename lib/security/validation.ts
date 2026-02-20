import { z, ZodSchema } from "zod";

/**
 * Request Validation Utility (PCI DSS Req 6)
 *
 * Enforces Zod schema validation on ALL API request bodies.
 * EVERY API route handler MUST use this before processing.
 *
 * Usage:
 *   import { validateRequestBody } from "@/lib/security";
 *
 *   const schema = z.object({ name: z.string().min(1) });
 *   const result = validateRequestBody(schema, requestBody);
 *   if (!result.success) return NextResponse.json(result.error, { status: 400 });
 *
 * Rule: security-standards.md §2 - Input Validation
 */

// ─── Types ───────────────────────────────────────────────
interface ValidationSuccess<T> {
  success: true;
  data: T;
}

interface ValidationError {
  success: false;
  error: {
    code: "VALIDATION_ERROR";
    message: string;
    details: z.ZodIssue[];
  };
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

/**
 * Validates a request body against a Zod schema.
 * Returns a typed result with either parsed data or structured error.
 *
 * @param schema - Zod schema to validate against
 * @param body - Raw request body to validate
 * @returns Typed validation result
 */
export function validateRequestBody<T>(
  schema: ZodSchema<T>,
  body: unknown
): ValidationResult<T> {
  const result = schema.safeParse(body);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Request validation failed. Check the details for specifics.",
      details: result.error.issues,
    },
  };
}

// ─── Common Reusable Schemas ─────────────────────────────
// Pre-built schemas for frequently validated fields.

/** Email validation */
export const emailSchema = z.string().email("Invalid email format").trim();

/** Password validation (PCI DSS Req 8 compliant) */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

/** MongoDB ObjectId validation */
export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID format");

/** Pagination query params */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
