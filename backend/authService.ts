import crypto from "crypto";
import { SlidingWindowRateLimiter, isTrustedOrigin, sanitizeText } from "./security";

export interface AuthenticatedUser {
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "client";
}

interface SessionPayload extends AuthenticatedUser {
  exp: number;
}

interface StoredUser {
  email: string;
  name: string;
  avatarUrl?: string;
  salt: string;
  passwordHash: string;
}

export interface AuthServiceResponse {
  status: number;
  body: Record<string, unknown>;
  headers?: Record<string, string>;
  setCookie?: string;
}

const SESSION_COOKIE = "prostudio_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const ADMIN_EMAIL = "aarjavjainn@gmail.com";
let fallbackSessionSecret: string | null = null;

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (!fallbackSessionSecret) {
    fallbackSessionSecret = crypto.randomBytes(32).toString("hex");
  }
  return fallbackSessionSecret;
}

const registeredUsers = new Map<string, StoredUser>();
const authLimiter = new SlidingWindowRateLimiter({
  windowMs: 15 * 60_000,
  maxRequests: 15,
});

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password: string, salt: string, expectedHex: string): boolean {
  const actual = Buffer.from(hashPassword(password, salt), "hex");
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function safeCompareSecret(input: string, expected: string): boolean {
  const a = crypto.createHash("sha256").update(input).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function signSession(payload: SessionPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", getSessionSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

function verifySession(token: string | undefined): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const expectedSig = crypto.createHmac("sha256", getSessionSecret()).update(encoded).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!decoded || typeof decoded.email !== "string" || typeof decoded.exp !== "number") return null;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      try {
        result[k] = decodeURIComponent(v);
      } catch {
        result[k] = v;
      }
    }
  }
  return result;
}

function buildCookieHeader(token: string, isHttps: boolean, maxAge = SESSION_TTL_SECONDS): string {
  const flags = isHttps
    ? "HttpOnly; Secure; SameSite=None; Path=/"
    : "HttpOnly; SameSite=Lax; Path=/";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${flags}; Max-Age=${maxAge}`;
}

export function handleGetSession(cookieHeader: string | undefined): AuthServiceResponse {
  const cookies = parseCookies(cookieHeader);
  const session = verifySession(cookies[SESSION_COOKIE]);
  if (!session) {
    return { status: 200, body: { authenticated: false, user: null } };
  }
  return {
    status: 200,
    body: {
      authenticated: true,
      user: {
        name: session.name,
        email: session.email,
        avatarUrl: session.avatarUrl,
        role: session.role,
      },
    },
  };
}

export function handleAuthPost(params: {
  body: any;
  cookieHeader: string | undefined;
  origin: string | undefined;
  host: string | undefined;
  clientIp: string;
  isHttps: boolean;
  statelessMode?: boolean;
  onInitializeLocalAdmin?: (saltedHash: string) => void;
}): AuthServiceResponse {
  const { body, cookieHeader, origin, host, clientIp, isHttps, statelessMode = false } = params;

  if (!isTrustedOrigin(origin, host)) {
    return { status: 403, body: { error: "Forbidden origin. Trusted origin required." } };
  }

  const cookies = parseCookies(cookieHeader);
  const { action, email, password, name, avatarUrl } = body || {};

  if (action === "logout") {
    return {
      status: 200,
      setCookie: buildCookieHeader("", isHttps, 0),
      body: { authenticated: false, user: null },
    };
  }

  if (action === "profile") {
    const session = verifySession(cookies[SESSION_COOKIE]);
    if (!session) {
      return { status: 401, body: { error: "Authentication required." } };
    }
    const cleanName = sanitizeText(name, 80) || session.name;
    let cleanAvatar = session.avatarUrl;
    if (typeof avatarUrl === "string" && (avatarUrl.startsWith("https://") || avatarUrl.startsWith("data:image/"))) {
      cleanAvatar = avatarUrl.slice(0, 200_000);
    }
    const updated: SessionPayload = {
      ...session,
      name: cleanName,
      avatarUrl: cleanAvatar,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    };
    const existing = registeredUsers.get(session.email);
    if (existing) {
      existing.name = updated.name;
      existing.avatarUrl = updated.avatarUrl;
    }
    return {
      status: 200,
      setCookie: buildCookieHeader(signSession(updated), isHttps),
      body: {
        authenticated: true,
        user: {
          name: updated.name,
          email: updated.email,
          avatarUrl: updated.avatarUrl,
          role: updated.role,
        },
      },
    };
  }

  if (authLimiter.isLimited(clientIp)) {
    return {
      status: 429,
      headers: { "Retry-After": "900" },
      body: { error: "Too many authentication attempts. Please try again later." },
    };
  }

  const cleanEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
  const cleanPassword = typeof password === "string" ? password : "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleanEmail) || cleanPassword.length < 8) {
    return { status: 400, body: { error: "Valid email and password (8+ characters) are required." } };
  }

  if (action === "signup" && cleanEmail === ADMIN_EMAIL) {
    return { status: 403, body: { error: "This administrator email cannot be registered publicly." } };
  }

  if (cleanEmail === ADMIN_EMAIL) {
    const adminPasscode = process.env.ADMIN_PASSCODE;
    const adminPasscodeHash = process.env.ADMIN_PASSCODE_HASH;

    if (!adminPasscode && !adminPasscodeHash) {
      const isLocalDev =
        !statelessMode &&
        process.env.NODE_ENV !== "production" &&
        process.env.DISABLE_HMR !== "true" &&
        !process.env.K_SERVICE &&
        typeof host === "string" &&
        (host.startsWith("localhost") || host.startsWith("127.0.0.1"));

      if (isLocalDev && params.onInitializeLocalAdmin) {
        const salt = crypto.randomBytes(16).toString("hex");
        const hash = hashPassword(cleanPassword, salt);
        const combined = `${salt}:${hash}`;
        process.env.ADMIN_PASSCODE_HASH = combined;
        params.onInitializeLocalAdmin(combined);
      } else {
        return {
          status: 403,
          body: { error: "Admin login is locked until ADMIN_PASSCODE is configured in server environment secrets." },
        };
      }
    } else if (adminPasscode) {
      if (!safeCompareSecret(cleanPassword, adminPasscode)) {
        return { status: 401, body: { error: "Invalid administrator credentials." } };
      }
    } else if (adminPasscodeHash) {
      const [salt, expectedHex] = adminPasscodeHash.split(":");
      if (!salt || !expectedHex || !verifyPassword(cleanPassword, salt, expectedHex)) {
        return { status: 401, body: { error: "Invalid administrator credentials." } };
      }
    }

    const payload: SessionPayload = {
      email: cleanEmail,
      name: "Aarjav Jain (Director)",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    };
    return {
      status: 200,
      setCookie: buildCookieHeader(signSession(payload), isHttps),
      body: {
        authenticated: true,
        user: { name: payload.name, email: payload.email, role: payload.role },
      },
    };
  }

  if (action === "signup") {
    if (!statelessMode && registeredUsers.has(cleanEmail)) {
      return { status: 409, body: { error: "An account with this email already exists. Please Sign In." } };
    }
    const cleanName = sanitizeText(name, 80) || cleanEmail.split("@")[0];
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(cleanPassword, salt);
    const generatedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=8c7456`;

    registeredUsers.set(cleanEmail, {
      email: cleanEmail,
      name: cleanName,
      avatarUrl: generatedAvatar,
      salt,
      passwordHash,
    });

    const payload: SessionPayload = {
      email: cleanEmail,
      name: cleanName,
      avatarUrl: generatedAvatar,
      role: "client",
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    };
    return {
      status: 201,
      setCookie: buildCookieHeader(signSession(payload), isHttps),
      body: {
        authenticated: true,
        user: {
          name: payload.name,
          email: payload.email,
          avatarUrl: payload.avatarUrl,
          role: payload.role,
        },
      },
    };
  }

  if (!statelessMode) {
    const storedUser = registeredUsers.get(cleanEmail);
    if (!storedUser || !verifyPassword(cleanPassword, storedUser.salt, storedUser.passwordHash)) {
      return {
        status: 401,
        body: { error: "Invalid email or password. New clients must Sign Up first." },
      };
    }

    const payload: SessionPayload = {
      email: storedUser.email,
      name: storedUser.name,
      avatarUrl: storedUser.avatarUrl,
      role: "client",
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    };
    return {
      status: 200,
      setCookie: buildCookieHeader(signSession(payload), isHttps),
      body: {
        authenticated: true,
        user: {
          name: payload.name,
          email: payload.email,
          avatarUrl: payload.avatarUrl,
          role: payload.role,
        },
      },
    };
  }

  const displayName = sanitizeText(name, 80) || cleanEmail.split("@")[0];
  const generatedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=8c7456`;
  const payload: SessionPayload = {
    email: cleanEmail,
    name: displayName,
    avatarUrl: generatedAvatar,
    role: "client",
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  return {
    status: 200,
    setCookie: buildCookieHeader(signSession(payload), isHttps),
    body: {
      authenticated: true,
      user: {
        name: payload.name,
        email: payload.email,
        avatarUrl: payload.avatarUrl,
        role: payload.role,
      },
    },
  };
}
