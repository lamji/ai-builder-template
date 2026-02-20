/**
 * Rate Limiting Utility (PCI DSS Req 6)
 *
 * In-memory rate limiter for API endpoints.
 * Prevents brute-force attacks and DDoS on sensitive routes.
 *
 * Configuration: 100 requests per 15 minutes per IP (default).
 * Auth endpoints use stricter limits (20 requests per 15 min).
 *
 * Usage:
 *   import { rateLimitCheck } from "@/lib/security";
 *
 *   // In API route handler:
 *   const ip = request.headers.get("x-forwarded-for") ?? "unknown";
 *   const allowed = rateLimitCheck(ip, "auth");
 *   if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 *
 * Rule: security-standards.md §2 - Rate Limiting
 */

// ─── Configuration ───────────────────────────────────────
export const RATE_LIMIT_CONFIG = {
  /** Default: 100 requests per 15 minutes */
  default: { maxRequests: 100, windowMs: 15 * 60 * 1000 },

  /** Auth endpoints: Stricter - 20 requests per 15 minutes */
  auth: { maxRequests: 20, windowMs: 15 * 60 * 1000 },

  /** Booking endpoints: 50 requests per 15 minutes */
  booking: { maxRequests: 50, windowMs: 15 * 60 * 1000 },
} as const;

type RateLimitCategory = keyof typeof RATE_LIMIT_CONFIG;

// ─── In-Memory Store ─────────────────────────────────────
// For production, replace with Redis-backed store.
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// ─── Cleanup Interval ────────────────────────────────────
// Periodically clean expired entries to prevent memory leaks.
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);

  // Allow the process to exit cleanly
  if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Checks if a request is within rate limits.
 *
 * @param identifier - Unique identifier (usually IP address)
 * @param category - Rate limit category (default, auth, booking)
 * @returns true if request is allowed, false if rate limited
 */
export function rateLimitCheck(
  identifier: string,
  category: RateLimitCategory = "default"
): boolean {
  startCleanup();

  const config = RATE_LIMIT_CONFIG[category];
  const key = `${category}:${identifier}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  // No existing entry or window expired → allow and create/reset
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return true;
  }

  // Within window → increment and check
  entry.count += 1;

  if (entry.count > config.maxRequests) {
    return false; // Rate limited
  }

  return true;
}

/**
 * Returns remaining requests for a given identifier and category.
 * Useful for setting X-RateLimit-Remaining headers.
 */
export function getRateLimitRemaining(
  identifier: string,
  category: RateLimitCategory = "default"
): number {
  const config = RATE_LIMIT_CONFIG[category];
  const key = `${category}:${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry || Date.now() > entry.resetTime) {
    return config.maxRequests;
  }

  return Math.max(0, config.maxRequests - entry.count);
}
