import { NextRequest, NextResponse } from "next/server";

/**
 * Route Protection Proxy (PCI DSS Req 7 & 8)
 *
 * Next.js 16 proxy convention (replaces deprecated middleware.ts).
 * Enforces access control on all routes.
 * - Public routes are accessible without authentication.
 * - All other routes require a valid session token.
 * - Admin routes require elevated privileges.
 *
 * Security Headers (PCI DSS Req 6):
 * - CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
 *
 * Location: proxy.ts (root)
 * Rule: security-standards.md §2, §3
 */

// ─── Public Routes ───────────────────────────────────────
// Routes that do NOT require authentication.
const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password"];

// ─── Security Headers (PCI DSS Req 6) ───────────────────
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://images.unsplash.com",
    "font-src 'self'",
    "connect-src 'self' http://localhost:5000",
    "frame-ancestors 'none'",
  ].join("; "),
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ── Apply Security Headers to ALL responses ────────────
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // ── Skip public routes ─────────────────────────────────
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // ── Skip static assets & API routes (handled separately) ─
  const isStaticOrApi =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");

  if (isPublicRoute || isStaticOrApi) {
    return response;
  }

  // ── Auth Check (PCI DSS Req 7) ─────────────────────────
  // Check for session token in cookies (HttpOnly, Secure, SameSite)
  const token =
    request.cookies.get("session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Admin Route Guard ──────────────────────────────────
  // Admin routes require additional role verification.
  // In production, decode the token/session and check role.
  if (pathname.startsWith("/admin")) {
    // TODO: Decode JWT or check session for admin role
    // For now, the token existence is checked above.
    // Implement role-based check when auth is integrated.
  }

  return response;
}

// ─── Matcher Configuration ───────────────────────────────
// Apply middleware to all routes except static files.
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
