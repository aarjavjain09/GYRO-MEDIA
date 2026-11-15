import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleChatPost } from "../backend/chatService";
import { API_NO_STORE_HEADER, SECURITY_HEADERS } from "../backend/security";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(key, value);
  }
  res.setHeader("Cache-Control", API_NO_STORE_HEADER);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const forwardedFor = req.headers["x-forwarded-for"];
  const clientIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : (forwardedFor || req.socket?.remoteAddress || "unknown").split(",")[0].trim();

  const result = await handleChatPost({
    body: req.body,
    origin: req.headers.origin,
    host: req.headers.host,
    clientIp,
  });

  if (result.headers) {
    for (const [k, v] of Object.entries(result.headers)) {
      res.setHeader(k, v);
    }
  }
  return res.status(result.status).json(result.body);
}
