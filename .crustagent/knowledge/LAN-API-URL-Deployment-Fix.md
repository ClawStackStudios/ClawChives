# 🦞 LAN API URL Deployment Fix — Knowledge Base

> **Critical issue affecting all npm-based LAN deployments and production builds.**

---

## 🐛 The Issue: 404 Errors on LAN Access

### Symptom
When accessing ClawChives from a LAN IP (e.g., `http://192.168.1.6:4545`), the frontend displays 404 errors on all API calls:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
:4545/api/auth/token:1  Failed to load resource: the server responded with a status of 404
:4545/api/auth/register:1  Failed to load resource: the server responded with a status of 404
```

The browser console shows the app trying to hit `/api/auth/token` on **port 4545** (the UI port) instead of **port 4646** (the API port).

### Root Cause
**The frontend API URL was hardcoded to `localhost:4646` in production builds** because:

1. **Vite env variable replacement failed** — The `VITE_API_URL` environment variable was never passed to the build process
2. **Default fallback logic** — When `VITE_API_URL` was not set, `apiConfig.ts` defaulted to relative paths (`""`) for production builds
3. **Port mismatch** — Relative paths try to reach the API on the same port as the UI (4545), but the API is on 4646
4. **npm vs Docker difference** — This only affects npm runs, not Docker (which uses relative paths correctly)

### Why It Happens
```
npm run scuttle:prod-start → npm run build → vite build
                                              ↓
                                    VITE_API_URL not passed
                                              ↓
                                    Vite defaults env vars
                                              ↓
                                    import.meta.env.VITE_API_URL = undefined
                                              ↓
                                    apiConfig.ts returns ""
                                              ↓
                                    Frontend tries /api/* on same port
                                              ↓
                                    404 — API is on 4646, not 4545
```

---

## ✅ The Solution: .env Configuration

### Step 1: Create `.env` File

Copy `.env.example` and set your LAN IP:

```bash
cp .env.example .env
```

Edit `.env`:
```bash
# .env (do NOT commit)
VITE_API_URL=http://192.168.1.6:4646   # Replace with YOUR LAN IP
```

### Step 2: Understand the Priority

`apiConfig.ts` resolves API URLs in this order:

```typescript
export function getApiBaseUrl(): string {
  // Priority 1: Explicit override via environment variable
  if (BAKED_API_URL) {
    return BAKED_API_URL.replace(/\/$/, "");
  }

  // Priority 2: Production builds use relative paths (same-origin)
  if (BAKED_PROD) {
    return "";
  }

  // Priority 3: Local development default (separate ports)
  return "http://localhost:4646";
}
```

**When you set VITE_API_URL in .env:**
- Vite reads the env file at **build time**
- Vite injects the URL into the bundle
- apiConfig.ts receives the URL and uses it (Priority 1)
- Frontend knows exactly where the API is

### Step 3: Build and Run

```bash
# Vite will automatically pick up VITE_API_URL from .env
npm run build

# Then start the servers
NODE_ENV=production tsx server.ts &
vite preview &

# Or use the combined script:
npm run scuttle:prod-start
```

---

## 🔍 Debugging Checklist

### Verify .env is Being Read

1. **Check your .env file exists:**
   ```bash
   ls -la .env
   ```

2. **Verify the URL is set correctly:**
   ```bash
   grep VITE_API_URL .env
   ```

3. **Check the built bundle contains your IP:**
   ```bash
   grep "192.168.1.6" dist/assets/*.js
   ```
   If you see your LAN IP in the bundle, it worked ✅

### Verify the API is Running

```bash
# Check if API server is listening on 4646
netstat -tuln | grep 4646

# Test the API directly
curl http://192.168.1.6:4646/api/health
```

### Verify the UI Port

```bash
# Check if Vite preview is running on 4545
netstat -tuln | grep 4545

# Access the UI and check Network tab in DevTools
# All API calls should go to 192.168.1.6:4646, not 192.168.1.6:4545
```

---

## 📋 Deployment Scenarios

### Local Dev (localhost)
```bash
# .env
VITE_API_URL=http://localhost:4646

# Run
npm run scuttle:dev-start
```

### LAN / Self-Hosted (npm)
```bash
# .env
VITE_API_URL=http://192.168.1.6:4646   # Your LAN IP

# Run
npm run build
npm run scuttle:prod-start
```

### Docker (no .env needed)
```yaml
# docker-compose.yml
environment:
  VITE_API_URL: http://192.168.1.6:4646  # Set in compose, not .env

# Or leave unset and use relative paths
VITE_API_URL: ""
```

### Custom Domain (reverse proxy)
```bash
# .env
VITE_API_URL=https://bookmarks.yourdomain.com

# Run
npm run build
npm run scuttle:prod-start
```

---

## 🚨 Critical Gotchas

### ❌ DON'T forget .env is gitignored
```bash
# This won't work — .env is in .gitignore
git add .env  # SKIP THIS
```

**Why?** Each user has a different LAN IP. .env.example is the template; users create their own .env.

### ❌ DON'T modify the build script
```bash
# WRONG: Vite won't see it
npm run build --VITE_API_URL=http://192.168.1.6:4646

# RIGHT: Use .env
echo "VITE_API_URL=http://192.168.1.6:4646" > .env
npm run build
```

### ❌ DON'T hardcode API URLs in components
```typescript
// WRONG: Breaks on any IP/domain change
const API = "http://192.168.1.6:4646";

// RIGHT: Use centralized config
import { getApiBaseUrl } from "@/config/apiConfig";
const API = getApiBaseUrl();
```

### ✅ DO check .env.example for all options
```bash
cat .env.example
```

---

## 🔧 How the Fix Works

### The Chain of Events

1. **User creates .env with their LAN IP**
   ```bash
   VITE_API_URL=http://192.168.1.6:4646
   ```

2. **Vite reads .env at build time**
   ```bash
   npm run build
   ```

3. **Vite injects the URL into the bundle**
   ```javascript
   // In dist/assets/index-*.js
   const API_URL = "http://192.168.1.6:4646";
   ```

4. **apiConfig.ts prioritizes explicit URLs**
   ```typescript
   if (BAKED_API_URL) {  // ← "http://192.168.1.6:4646"
     return BAKED_API_URL;
   }
   ```

5. **Frontend knows where the API is**
   ```javascript
   // RestAdapter.ts
   const API_BASE = getApiBaseUrl();  // "http://192.168.1.6:4646"
   fetch(`${API_BASE}/api/bookmarks`)  // ✅ Correct!
   ```

---

## 📚 Related Files

- **`.env.example`** — Template with deployment scenarios
- **`src/config/apiConfig.ts`** — Centralized URL resolution logic
- **`vite.config.ts`** — Build configuration (reads .env automatically)
- **`package.json`** — `scuttle:prod-start` script
- **`CRUSTAGENT.md`** — Full integration docs and invariants

---

## 🎯 Prevention for Future Agents

**When adding new deployment scenarios:**

1. **Update .env.example** with the scenario
2. **Update apiConfig.ts** if logic changes
3. **Test all three priority levels**:
   - Explicit VITE_API_URL ✅
   - Production relative paths ✅
   - Development localhost fallback ✅
4. **Document in CRUSTAGENT.md**

---

## ✅ Verification Checklist

After implementing the fix:

- [ ] .env file created with correct LAN IP
- [ ] `npm run build` completes without errors
- [ ] `grep "YOUR_IP" dist/assets/*.js` finds your IP in bundle
- [ ] API server running on 4646: `netstat -tuln | grep 4646`
- [ ] UI server running on 4545: `netstat -tuln | grep 4545`
- [ ] Browser DevTools Network tab shows API calls to 4646 (not 4545)
- [ ] `/api/auth/token` returns 200 (not 404)
- [ ] Login and bookmark operations work
- [ ] Accessible from other machines on same LAN

---

**Maintained by CrustAgent©™**

Last Updated: 2026-03-16
