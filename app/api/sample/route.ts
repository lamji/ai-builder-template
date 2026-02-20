import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  validateRequestBody,
  rateLimitCheck,
  sanitizeObject,
  redactSensitiveData,
  createAuditLog,
} from "@/lib/security";

/**
 * Sample Secure API Route Handler (PCI DSS Reference Implementation)
 *
 * This file demonstrates the MANDATORY security pattern for ALL API routes.
 * Every new API route MUST follow this exact structure:
 *
 * 1. Rate Limit Check
 * 2. Zod Schema Validation
 * 3. Input Sanitization
 * 4. Business Logic
 * 5. Audit Logging
 * 6. Redacted Error Handling
 *
 * Rule: security-standards.md §1-§5
 */

// ─── Schema Definition (PCI DSS Req 6) ──────────────────
const SampleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  message: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  // ─── 1. Rate Limit Check (PCI DSS Req 6) ──────────────
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!rateLimitCheck(ip, "default")) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    // ─── 2. Parse & Validate (PCI DSS Req 6) ────────────
    const body = await request.json();
    const validation = validateRequestBody(SampleSchema, body);

    if (!validation.success) {
      return NextResponse.json(validation.error, { status: 400 });
    }

    // ─── 3. Sanitize Input (PCI DSS Req 4) ──────────────
    const sanitizedData = sanitizeObject(validation.data);

    // ─── 4. Business Logic ──────────────────────────────
    // TODO: Replace with actual business logic.
    const result = {
      id: crypto.randomUUID(),
      ...sanitizedData,
      createdAt: new Date().toISOString(),
    };

    // ─── 5. Audit Log (PCI DSS Req 10) ──────────────────
    createAuditLog({
      timestamp: new Date().toISOString(),
      userId: "anonymous", // Replace with actual user ID from session
      action: "SAMPLE_CREATE",
      sourceIp: ip,
      result: "SUCCESS",
      details: `Created sample: ${result.id}`,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // ─── 6. Redacted Error Handling ─────────────────────
    const errorData = redactSensitiveData({
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack ?? "" : "",
    });

    console.error("[API] Sample route error:", errorData);

    createAuditLog({
      timestamp: new Date().toISOString(),
      userId: "anonymous",
      action: "SAMPLE_CREATE",
      sourceIp: ip,
      result: "FAIL",
      details: String(errorData.message),
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
