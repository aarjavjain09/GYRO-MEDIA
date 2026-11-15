# AI Sales Navigator — ProStudio Production Suite

Cleanly separated full-stack React + Express + Vercel Serverless codebase ready for Visual Studio Code and Vercel deployment.

## Architecture (Frontend vs. Backend)

```text
├── src/                        # FRONTEND (React + Vite + Tailwind CSS)
│   ├── services/apiClient.ts   # Single typed boundary for all /api/* requests
│   ├── components/             # UI components & modals
│   ├── App.tsx                 # Main frontend application shell
│   └── types.ts                # Shared frontend types
│
├── backend/                    # SHARED BACKEND CORE (Node.js + TypeScript)
│   ├── security.ts             # HTTPS/origin guards, rate limiters, CSP, sanitization
│   ├── authService.ts          # scrypt password hashing, HMAC-SHA256 HttpOnly cookies
│   └── chatService.ts          # Gemini AI proxy, prompt rules, quote parsing
│
├── server.ts                   # Local Dev & Node.js server entrypoint (port 5174 locally)
└── api/                        # Vercel Serverless Function adapters (/api/*)
    ├── auth.ts
    ├── chat.ts
    └── health.ts
```

## Editing & Running in Visual Studio Code

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start both Frontend + Backend together:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5174` (or the port printed in your terminal).
   - No manual `.env` setup is required locally—`server.ts` automatically creates a private `.env` with a fresh random `SESSION_SECRET` on first run.
   - The first time you sign in locally as `aarjavjainn@gmail.com` (8+ character password), that password is securely hashed and saved to your local `.env` automatically.
   - *(Optional)* Paste your `GEMINI_API_KEY` into `.env` anytime if you want live Gemini responses locally (otherwise built-in studio responses work automatically).
   - Editing files in `src/` updates the **Frontend**.
   - Editing files in `backend/` updates **both** the local `server.ts` backend and Vercel's `api/` serverless functions automatically.

4. **Type-check & build:**
   ```bash
   npm run lint
   npm run build
   ```

## Deploying to Vercel

Add these Environment Variables in **Vercel → Project Settings → Environment Variables**:
- `GEMINI_API_KEY`
- `SESSION_SECRET`
- `ADMIN_PASSCODE`

Vercel automatically runs `vite build`, serves `dist/`, and routes `/api/*` to `api/`.
