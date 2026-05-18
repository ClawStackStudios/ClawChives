# 🦞 ClawChives Quickstart Handbook
*Maintained by CrustAgent©™ — Reclaim your Link Sovereignty.*

Welcome to **ClawChives**, the sovereign, self-hosted bookmark and AI agent knowledge repository. This handbook guides you through a zero-fuss local development setup, containerized Docker deployment, key registration, and initial admin configuration.

---

## 🚀 Quick Launch

You can run ClawChives either via a unified Docker Container or directly using Node.js locally.

### Option A: The Unified Docker Stack (Recommended)

ClawChives compiles into a single, high-performance container running the optimized React frontend and the SQLite-backed Express API server together.

1. **Copy the Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
2. **Launch the Container Stack:**
   ```bash
   docker compose up -d --build
   ```
3. **Verify running state:**
   * **Web GUI:** [http://localhost:4545](http://localhost:4545)
   * **API Health Check:** `curl http://localhost:4545/api/health`

---

### Option B: Local Node.js Development

If you are developing or modifying features, you can run the frontend and API server concurrently.

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Copy the Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
3. **Boot the Dev Servers:**
   ```bash
   npm run scuttle:dev-start
   ```
   * **Frontend Dev Server (Vite + HMR):** [http://localhost:4545](http://localhost:4545)
   * **Backend Express Server:** [http://localhost:4646](http://localhost:4646)

---

## 🔑 Step 1: Initialize Your Human Key (`hu-`)

ClawChives is entirely passwordless. Your identity and encryption boundaries are anchored to your high-entropy **Human Key** (`hu-`).

1. Open your browser and navigate to [http://localhost:4545](http://localhost:4545).
2. The **Setup Wizard** will launch automatically if no human users exist.
3. Click **Generate Identity Key**. A secure `hu-` token (64-character hexadecimal key) will be generated.
4. **Download or Copy the Key File.** Save it in a safe vault (e.g. 1Password or physical storage). 
5. Paste your `hu-` key into the One-Field login to access your sovereign workspace.

---

## 🤖 Step 2: Establish Agent Keys (`lb-`) for AI

To link your external AI agents (like your local agent or Gemini) to index and query your bookmarks, generate a dedicated **Lobster Key** (`lb-`).

1. Log in to the Web GUI with your `hu-` key.
2. Go to **Settings** → **Agent Keys**.
3. Click **Create Agent Key**.
4. Configure the agent settings:
   * **Name:** (e.g., `gemini-agent`)
   * **Permissions:** Select specific permissions (`canRead`, `canWrite`, `canEdit`, `canDelete`).
   * **Rate Limit:** Set request frequency limits (e.g. `60` requests per minute) to safeguard your database.
5. Save the generated `lb-` key. Provide this token to your AI script or agent configuration.

---

## 🛡️ Step 3: Enable the SuperAdmin Panel (`/admin`)

The SuperAdmin panel allows infrastructure administrators to monitor server health, check system uptime logs, audit user metadata, and adjust database retention properties.

1. **Open your `.env` configuration file.**
2. Set the `ADMIN_TOKEN` variable to a high-entropy string:
   ```env
   ADMIN_TOKEN=your-random-64-character-superadmin-token-here
   ```
3. **Restart the application** (Vite Dev Server or Docker Stack).
4. Navigate to [http://localhost:4545/admin](http://localhost:4545/admin).
5. Input your configured `ADMIN_TOKEN` to access the Control Plane.

---

## 🩺 Step 4: Health & Diagnostics

Run automated verification steps to ensure that your local system is fully operational and stable.

### Execute Test Suites
* **Standard Verification:**
  ```bash
  npm run test
  ```
* **Admin Control Plane Verification:**
  ```bash
  npm run test:admin
  ```

### Verify Code Linting
Ensure type-safety standards and style rules are perfectly aligned:
```bash
npm run lint
```

---

## 📚 Reference Map

* [**README.md**](./README.md) — Unified Project Specification & API Reference Table.
* [**ARCHITECTURE.md**](./ARCHITECTURE.md) — System blueprints, component designs, and folder maps.
* [**SECURITY.md**](./SECURITY.md) — Cryptographic details, OWASP mitigations, and hardening advice.
* [**CONTRIBUTING.md**](./CONTRIBUTING.md) — Coding styles, 250-line guidelines, and pull request procedures.

**Maintained by CrustAgent©™**
