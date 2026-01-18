# mcgill-agenda

A Next.js (App Router) web app for a personal academic agenda.

- ✅ Auth0 login/logout
- ✅ Prisma + SQLite local database
- ✅ User-scoped events (each user sees their own calendar/events)

This repo is meant to be **public** and **clone → configure → run** on **macOS or Windows**.

---

## What you need installed (Mac + Windows)

### 1) Node.js (REQUIRED)

Install **Node.js LTS (18+ recommended, 20 LTS also OK)**.

- Download: Node.js website (LTS)

Verify in a terminal:

**macOS / Linux**
```bash
node -v
npm -v
```

**Windows (PowerShell)**
```powershell
node -v
npm -v
```

> If `node` is not found after installing, restart your terminal (or restart your PC).

### 2) Git (REQUIRED)

You need Git to clone the repo.

**macOS**
- If `git` isn’t installed, install it via Homebrew or Git installer.

**Windows**
- Install **Git for Windows** (includes Git Bash).

Verify:
```bash
git --version
```

---

## 1) Download the project

### Option A — Clone with Git (recommended)

**macOS / Linux**
```bash
git clone <YOUR_REPO_URL>
cd mcgill-agenda
```

**Windows (PowerShell)**
```powershell
git clone <YOUR_REPO_URL>
cd mcgill-agenda
```

### Option B — Download ZIP

- Download the ZIP from GitHub
- Unzip
- Open the folder in VS Code

---

## 2) Install dependencies

Run in the project root:

**macOS / Linux**
```bash
npm install
```

**Windows (PowerShell)**
```powershell
npm install
```

---

## 3) Create `.env.local` (REQUIRED)

In the **project root** (same level as `package.json`), create a file named:

- `.env.local`

### Minimal `.env.local`

```env
# Prisma (SQLite)
DATABASE_URL="file:./dev.db"

# Auth0
AUTH0_SECRET="REPLACE_ME"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://YOUR_AUTH0_DOMAIN"
AUTH0_CLIENT_ID="YOUR_AUTH0_CLIENT_ID"
AUTH0_CLIENT_SECRET="YOUR_AUTH0_CLIENT_SECRET"

# Optional (only if you use Gemini parsing later)
GEMINI_API_KEY=""
```

### Generate `AUTH0_SECRET`

Use ONE of these:

**macOS / Linux**
```bash
openssl rand -hex 32
```

**Windows (PowerShell)** (no OpenSSL needed):
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output into `AUTH0_SECRET`.

---

## 4) Auth0 setup (REQUIRED for login)

You must create an Auth0 application so other people can run the project.

### A) Create an Auth0 app

1. Create an Auth0 account
2. Create an application:
   - Type: **Regular Web Application**
3. Copy these into `.env.local`:
   - Domain → `AUTH0_ISSUER_BASE_URL` (format: `https://YOUR_DOMAIN`)
   - Client ID → `AUTH0_CLIENT_ID`
   - Client Secret → `AUTH0_CLIENT_SECRET`

### B) Set the Auth0 URLs

In the Auth0 app settings, add:

**Allowed Callback URLs**
```
http://localhost:3000/auth/callback
```

**Allowed Logout URLs**
```
http://localhost:3000/login
http://localhost:3000/
```

**Allowed Web Origins**
```
http://localhost:3000
```

Save changes.

> If you run on a different port (e.g., 3001), you MUST update these URLs too.

---

## 5) Database setup (Prisma)

This project uses SQLite locally.

Run:

**macOS / Linux**
```bash
npx prisma migrate dev
npx prisma generate
```

**Windows (PowerShell)**
```powershell
npx prisma migrate dev
npx prisma generate
```

---

## 6) Run the app

Start the dev server:

```bash
npm run dev
```

Open:
- http://localhost:3000

### Expected behavior

- Visiting `/main` while logged out redirects you to `/login`
- Clicking login sends you to Auth0
- After login you can access:
  - `/main`
  - `/calendar`
  - `/todo`
  - `/notifications`
  - `/settings`
- Clicking logout returns you to `/login`

---

## If something breaks (quick fixes)

### A) “Port 3000 is already in use”

Run on another port:
```bash
npm run dev -- -p 3001
```
Then update `.env.local`:
```env
AUTH0_BASE_URL="http://localhost:3001"
```
Also update the Auth0 Allowed URLs to use `3001`.

### B) Weird Next.js build issues

Clear cache:

**macOS / Linux**
```bash
rm -rf .next
npm run dev
```

**Windows (PowerShell)**
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

### C) Auth0 error on logout / callback

Almost always an Auth0 URL mismatch.
- Confirm `AUTH0_BASE_URL` matches your running port
- Confirm Allowed Callback URLs contains:
  - `http://localhost:XXXX/auth/callback`
- Confirm Allowed Logout URLs contains:
  - `http://localhost:XXXX/login`

---

## Project structure (high-level)

- `app/(dashboard)/...` → protected pages
- `app/login/page.tsx` → login screen
- `app/api/events/...` → events API
- `lib/auth0.ts` → Auth0 SDK wiring
- `lib/prisma.ts` → Prisma client
- `prisma/schema.prisma` → DB schema

---

## Notes for publishing

- Do NOT commit `.env.local`
- For production deployment, set environment variables on the host (Vercel/Railway/etc.)
- SQLite is fine for local dev; for real multi-user deployments use Postgres

---

## License

Add a license (MIT is common).