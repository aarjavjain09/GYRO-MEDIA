import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleAuthPost, handleGetSession } from "../backend/authService";
import { API_NO_STORE_HEADER, SECURITY_HEADERS } from "../backend/security";

export default function handler(req: VercelRequest, res: VercelResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(key, value);
  }
  res.setHeader("Cache-Control", API_NO_STORE_HEADER);

  if (req.method === "GET") {
    const result = handleGetSession(req.headers.cookie);
    return res.status(result.status).json(result.body);
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const forwardedFor = req.headers["x-forwarded-for"];
  const clientIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : (forwardedFor || req.socket?.remoteAddress || "unknown").split(",")[0].trim();

  const result = handleAuthPost({
    body: req.body,
    cookieHeader: req.headers.cookie,
    origin: req.headers.origin,
    host: req.headers.host,
    clientIp,
    isHttps: true,
    statelessMode: true,
  });

  if (result.setCookie) {
    res.setHeader("Set-Cookie", result.setCookie);
  }
  if (result.headers) {
    for (const [k, v] of Object.entries(result.headers)) {
      res.setHeader(k, v);
    }
  }
  return res.status(result.status).json(result.body);
}
