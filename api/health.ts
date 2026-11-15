import type { VercelRequest, VercelResponse } from "@vercel/node";
import { API_NO_STORE_HEADER, SECURITY_HEADERS } from "../backend/security";

export default function handler(req: VercelRequest, res: VercelResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(key, value);
  }
  res.setHeader("Cache-Control", API_NO_STORE_HEADER);
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }
  return res.status(200).json({ status: "ok", httpsEnforced: true });
}
