export interface AuthenticatedUser {
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "client";
}

export interface ChatQuoteOffer {
  serviceName: string;
  price: number;
  deadline: string;
  details: string;
}

export interface ChatApiResult {
  text: string;
  quoteOffer?: ChatQuoteOffer;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function fetchSession(): Promise<AuthenticatedUser | null> {
  const res = await fetch(apiUrl("/api/auth"), { credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.authenticated && data?.user ? (data.user as AuthenticatedUser) : null;
}

export async function authenticateWithEmail(params: {
  action: "login" | "signup";
  email: string;
  password: string;
  name?: string;
}): Promise<{ ok: boolean; user?: AuthenticatedUser; error?: string }> {
  const res = await fetch(apiUrl("/api/auth"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.authenticated || !data?.user) {
    return { ok: false, error: data?.error || "Authentication failed. Please check your credentials." };
  }
  return { ok: true, user: data.user as AuthenticatedUser };
}

export async function logoutSession(): Promise<void> {
  await fetch(apiUrl("/api/auth"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "logout" }),
  });
}

export async function updateSessionProfile(params: {
  name: string;
  avatarUrl?: string;
}): Promise<AuthenticatedUser | null> {
  const res = await fetch(apiUrl("/api/auth"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "profile", ...params }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.authenticated && data?.user ? (data.user as AuthenticatedUser) : null;
}

export async function sendChatMessage(
  messages: Array<{ sender: "user" | "ai"; text: string }>,
  signal?: AbortSignal
): Promise<ChatApiResult> {
  const res = await fetch(apiUrl("/api/chat"), {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    throw new Error("Failed to communicate with AI server");
  }
  return (await res.json()) as ChatApiResult;
}
