/**
 * API Test Script — CRUD Tests for PCI DSS Security Layer
 *
 * Tests the sample secure API route and all security utilities.
 * Run: npx tsx scripts/test-api-security.ts
 *
 * Rule: api-test-protocol.md — Always test all API
 */

const BASE_URL = "http://localhost:3000";

// ─── Test Helpers ────────────────────────────────────────
let passed = 0;
let failed = 0;

function log(label: string, status: "PASS" | "FAIL", detail?: string) {
  const icon = status === "PASS" ? "✅" : "❌";
  console.log(`${icon} [${status}] ${label}${detail ? ` — ${detail}` : ""}`);
  if (status === "PASS") passed++;
  else failed++;
}

async function testFetch(
  url: string,
  options?: RequestInit
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

// ─── Test Suite ──────────────────────────────────────────

async function testSecurityHeaders() {
  console.log("\n═══ 1. Security Headers ═══");
  const res = await fetch(`${BASE_URL}/`);

  const requiredHeaders = [
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "strict-transport-security",
    "permissions-policy",
  ];

  for (const header of requiredHeaders) {
    const value = res.headers.get(header);
    if (value) {
      log(`Header: ${header}`, "PASS", value);
    } else {
      log(`Header: ${header}`, "FAIL", "Missing");
    }
  }
}

async function testCRUDSampleRoute() {
  console.log("\n═══ 2. Sample CRUD Route ═══");

  // CREATE — Valid payload
  const validPayload = {
    name: "Test User",
    email: "test@example.com",
    message: "Hello, this is a test message.",
  };

  const createRes = await testFetch(`${BASE_URL}/api/sample`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  });

  if (createRes.status === 201) {
    log("POST /api/sample (valid)", "PASS", `Status: ${createRes.status}`);
  } else {
    log("POST /api/sample (valid)", "FAIL", `Status: ${createRes.status}, Body: ${JSON.stringify(createRes.body)}`);
  }
}

async function testInputValidation() {
  console.log("\n═══ 3. Input Validation (Zod) ═══");

  // Missing required fields
  const emptyRes = await testFetch(`${BASE_URL}/api/sample`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (emptyRes.status === 400) {
    log("Reject empty body", "PASS", `Status: ${emptyRes.status}`);
  } else {
    log("Reject empty body", "FAIL", `Status: ${emptyRes.status}`);
  }

  // Invalid email format
  const badEmailRes = await testFetch(`${BASE_URL}/api/sample`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test", email: "not-an-email", message: "Hi" }),
  });

  if (badEmailRes.status === 400) {
    log("Reject invalid email", "PASS", `Status: ${badEmailRes.status}`);
  } else {
    log("Reject invalid email", "FAIL", `Status: ${badEmailRes.status}`);
  }

  // Oversized message (>500 chars)
  const longMsg = await testFetch(`${BASE_URL}/api/sample`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test", email: "t@t.com", message: "x".repeat(501) }),
  });

  if (longMsg.status === 400) {
    log("Reject oversized message", "PASS", `Status: ${longMsg.status}`);
  } else {
    log("Reject oversized message", "FAIL", `Status: ${longMsg.status}`);
  }
}

async function testXSSPrevention() {
  console.log("\n═══ 4. XSS / Sanitization ═══");

  // XSS payload in name field — should be sanitized, not rejected
  const xssPayload = {
    name: '<script>alert("xss")</script>',
    email: "safe@test.com",
    message: "Normal message",
  };

  const xssRes = await testFetch(`${BASE_URL}/api/sample`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(xssPayload),
  });

  if (xssRes.status === 201) {
    const body = xssRes.body as Record<string, unknown>;
    const nameField = body?.name as string;
    if (nameField && !nameField.includes("<script>")) {
      log("XSS in name sanitized", "PASS", `Result: ${nameField}`);
    } else {
      log("XSS in name sanitized", "FAIL", `Result still contains raw script tag: ${nameField}`);
    }
  } else {
    log("XSS test request", "FAIL", `Status: ${xssRes.status}`);
  }
}

async function testRateLimiting() {
  console.log("\n═══ 5. Rate Limiting ═══");

  // Send rapid requests — should not crash (rate limit is 100/15min default)
  const promises = Array.from({ length: 5 }, (_, i) =>
    testFetch(`${BASE_URL}/api/sample`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Rapid ${i}`,
        email: `rapid${i}@test.com`,
        message: "Rate limit test",
      }),
    })
  );

  const results = await Promise.all(promises);
  const allOk = results.every((r) => r.status === 201);

  if (allOk) {
    log("5 rapid requests accepted", "PASS", "No 429s within normal limits");
  } else {
    const statuses = results.map((r) => r.status);
    log("Rapid request test", "FAIL", `Statuses: ${statuses.join(", ")}`);
  }
}

async function testRouteProtection() {
  console.log("\n═══ 6. Route Protection (Middleware) ═══");

  // Protected route without token should redirect to login
  const adminRes = await fetch(`${BASE_URL}/admin`, {
    redirect: "manual",
  });

  if (adminRes.status === 307 || adminRes.status === 302) {
    const location = adminRes.headers.get("location") ?? "";
    if (location.includes("/login")) {
      log("Admin redirect to login", "PASS", `Location: ${location}`);
    } else {
      log("Admin redirect to login", "FAIL", `Redirected to: ${location}`);
    }
  } else {
    log("Admin route protection", "FAIL", `Status: ${adminRes.status} (expected 307/302)`);
  }
}

// ─── Runner ──────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   PCI DSS Security Test Suite               ║");
  console.log("║   Template: ai-builder-template              ║");
  console.log("╚══════════════════════════════════════════════╝");

  try {
    await testSecurityHeaders();
    await testCRUDSampleRoute();
    await testInputValidation();
    await testXSSPrevention();
    await testRateLimiting();
    await testRouteProtection();
  } catch (err) {
    console.error("\n❌ FATAL ERROR:", err);
  }

  console.log("\n════════════════════════════════════════════════");
  console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log("════════════════════════════════════════════════\n");

  process.exit(failed > 0 ? 1 : 0);
}

main();
