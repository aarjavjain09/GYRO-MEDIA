export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
}

export class SlidingWindowRateLimiter {
  private readonly store = new Map<string, number[]>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
  }

  isLimited(key: string): boolean {
    const now = Date.now();
    const recent = (this.store.get(key) || []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.maxRequests) {
      this.store.set(key, recent);
      return true;
    }
    recent.push(now);
    this.store.set(key, recent);
    return false;
  }
}

export function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

/**
 * Allows trusted HTTPS origins in production/preview, and local loopback origins
 * (localhost / 127.0.0.1) during local VS Code development.
 */
export function isTrustedOrigin(origin: string | undefined, host: string | undefined): boolean {
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    const isDev = process.env.NODE_ENV !== "production";
    const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

    if (isDev && isLocalhost && (parsed.protocol === "http:" || parsed.protocol === "https:")) {
      return true;
    }

    if (parsed.protocol !== "https:") return false;
    if (host && parsed.host === host) return true;

    if (process.env.APP_URL) {
      const appOrigin = new URL(process.env.APP_URL).origin;
      if (parsed.origin === appOrigin) return true;
    }

    return parsed.hostname.endsWith(".run.app") || parsed.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

export function buildCspHeader(isProd: boolean, isHttps: boolean): string {
  const scriptSrc = isProd
    ? "script-src 'self' https://apis.google.com https://accounts.google.com;"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com;";
  const upgradeDirective = isProd || isHttps ? "upgrade-insecure-requests; " : "";

  return `${upgradeDirective}default-src 'self'; ${scriptSrc} style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-src 'self' https://accounts.google.com https://*.firebaseapp.com; object-src 'none'; base-uri 'self'; form-action 'self';`;
}

export const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "X-DNS-Prefetch-Control": "off",
};

export const API_NO_STORE_HEADER = "no-store, no-cache, must-revalidate, private";
