import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { handleAuthPost, handleGetSession } from "./backend/authService";
import { handleChatPost } from "./backend/chatService";
import {
  API_NO_STORE_HEADER,
  SECURITY_HEADERS,
  buildCspHeader,
} from "./backend/security";

const isAiStudioRuntime = process.env.DISABLE_HMR === "true" || Boolean(process.env.K_SERVICE);

function ensureLocalEnvFile() {
  if (isAiStudioRuntime || process.env.NODE_ENV === "production") return;
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    const generatedSecret = crypto.randomBytes(32).toString("hex");
    const initialEnv = [
      "# Auto-generated local development config (never commit this file)",
      "PORT=5174",
      `SESSION_SECRET="${generatedSecret}"`,
      "# Optional: add your Gemini key for live AI responses locally",
      'GEMINI_API_KEY=""',
      "",
    ].join("\n");
    try {
      fs.writeFileSync(envPath, initialEnv, { encoding: "utf8", mode: 0o600 });
    } catch {
      // Ignore read-only filesystem errors
    }
  }
}

function saveLocalAdminHash(saltedHash: string) {
  if (isAiStudioRuntime || process.env.NODE_ENV === "production") return;
  const envPath = path.join(process.cwd(), ".env");
  try {
    const current = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
    const line = `ADMIN_PASSCODE_HASH="${saltedHash}"`;
    const updated = current.includes("ADMIN_PASSCODE_HASH=")
      ? current.replace(/^ADMIN_PASSCODE_HASH=.*$/m, line)
      : `${current.trimEnd()}\n${line}\n`;
    fs.writeFileSync(envPath, updated, { encoding: "utf8", mode: 0o600 });
  } catch {
    // Ignore filesystem errors
  }
}

ensureLocalEnvFile();
dotenv.config();

async function startServer() {
  const app = express();
  const preferredPort = Number(process.env.PORT) || (isAiStudioRuntime ? 3000 : 5174);

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // Enforce HTTPS in production behind reverse proxy
  app.use((req, res, next) => {
    const proto = req.headers["x-forwarded-proto"];
    if (process.env.NODE_ENV === "production" && proto === "http") {
      return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    }
    next();
  });

  // Strict security headers on all responses
  app.use((req, res, next) => {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      res.setHeader(key, value);
    }
    const isProd = process.env.NODE_ENV === "production";
    const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
    res.setHeader("Content-Security-Policy", buildCspHeader(isProd, isHttps));
    next();
  });

  app.use("/api/auth", express.json({ limit: "256kb" }));
  app.use(express.json({ limit: "32kb" }));

  // Health Check
  app.get("/api/health", (_req, res) => {
    res.setHeader("Cache-Control", API_NO_STORE_HEADER);
    res.json({ status: "ok", httpsEnforced: true });
  });

  // Cryptographic Auth & Session Routes
  app.get("/api/auth", (req, res) => {
    res.setHeader("Cache-Control", API_NO_STORE_HEADER);
    const result = handleGetSession(req.headers.cookie);
    res.status(result.status).json(result.body);
  });

  app.post("/api/auth", (req, res) => {
    res.setHeader("Cache-Control", API_NO_STORE_HEADER);
    const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
    const result = handleAuthPost({
      body: req.body,
      cookieHeader: req.headers.cookie,
      origin: req.headers.origin,
      host: req.headers.host,
      clientIp: req.ip || req.socket.remoteAddress || "unknown",
      isHttps,
      onInitializeLocalAdmin: saveLocalAdminHash,
    });
    if (result.setCookie) {
      res.setHeader("Set-Cookie", result.setCookie);
    }
    if (result.headers) {
      for (const [k, v] of Object.entries(result.headers)) {
        res.setHeader(k, v);
      }
    }
    res.status(result.status).json(result.body);
  });

  // AI Negotiation Chat Route
  app.post("/api/chat", async (req, res) => {
    res.setHeader("Cache-Control", API_NO_STORE_HEADER);
    const result = await handleChatPost({
      body: req.body,
      origin: req.headers.origin,
      host: req.headers.host,
      clientIp: req.ip || req.socket.remoteAddress || "unknown",
    });
    if (result.headers) {
      for (const [k, v] of Object.entries(result.headers)) {
        res.setHeader(k, v);
      }
    }
    res.status(result.status).json(result.body);
  });

  // Serve Vite dev middleware locally, or static dist/ in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const listenWithFallback = (port: number) => {
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${port}`);
    });
    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE" && !isAiStudioRuntime) {
        const nextPort = port + 1;
        console.warn(`Port ${port} is busy, trying port ${nextPort}...`);
        listenWithFallback(nextPort);
      } else {
        throw err;
      }
    });
  };

  listenWithFallback(preferredPort);
}

startServer();
