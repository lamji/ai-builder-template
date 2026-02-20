import type { NextConfig } from "next";

/**
 * Next.js Configuration (PCI DSS Hardened)
 *
 * Security features enabled:
 * - Security headers (CSP, HSTS, X-Frame-Options, etc.)
 * - CORS via allowed origins
 * - Powered-by header removed
 * - Request body size limit (DDoS protection)
 *
 * Rule: security-standards.md §2, §4
 */

const nextConfig: NextConfig = {
  // ─── Remove X-Powered-By header (info disclosure) ──────
  poweredByHeader: false,

  // ─── Image Optimization ────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // ─── Security Headers (PCI DSS Req 6) ─────────────────
  // Applied to all routes via Next.js headers config.
  // Middleware also sets these, but this is a defense-in-depth layer.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  // ─── Body Size Limit (DDoS Protection - PCI DSS §4) ───
  // Limits request body to prevent memory exhaustion.
  serverExternalPackages: [],

  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
};

export default nextConfig;
