# Quick Usage Guide

## Installation

```bash
# Navigate to your project
cd your-project

# Create skills directory if needed
mkdir -p .crustagent/skills

# Copy the security skill
cp -r /path/to/ClawChives/.crustagent/skills/cors-helmet-proxy-security .crustagent/skills/

# Install dependencies
cd .crustagent/skills/cors-helmet-proxy-security
npm install
```

## Basic Usage

### 1. Development Setup

```typescript
// src/server.ts
import express from 'express';
import { setupSecurity } from '.crustagent/skills/cors-helmet-proxy-security';

const app = express();

// Development-friendly setup
setupSecurity(app);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

```env
# .env
NODE_ENV=development
# No CORS_ORIGIN needed in development
```

### 2. Cloudflare Tunnel Setup

```typescript
// src/server.ts
import express from 'express';
import { setupSecurity, corsConfig } from '.crustagent/skills/cors-helmet-proxy-security';

const app = express();

// Production setup for Cloudflare
setupSecurity(app, {
  cors: corsConfig('strict', 'https://yourdomain.cf')
});

app.listen(4646, () => {
  console.log('Server running on port 4646');
});
```

```env
# .env
TRUST_PROXY=true
CORS_ORIGIN=https://yourdomain.cf
ENFORCE_HTTPS=true
NODE_ENV=production
```

### 3. Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
COPY .crustagent .crustagent

EXPOSE 4646

ENV NODE_ENV=production
ENV TRUST_PROXY=true
ENV CORS_ORIGIN=https://yourdomain.com
ENV ENFORCE_HTTPS=true

CMD ["npm", "start"]
```

### 4. Custom Configuration

```typescript
import { setupSecurity, helmetConfig } from '.crustagent/skills/cors-helmet-proxy-security';

const customSecurity = {
  cors: corsConfig('strict', 'https://app.example.com,https://admin.example.com'),
  helmet: helmetConfig({
    enableCSP: true,
    customDirectives: {
      'script-src': ["'self'", "'unsafe-inline'"],
      'connect-src': ["'self'", 'https://api.example.com']
    }
  }),
  rateLimit: {
    windowMs: 60 * 1000,
    max: 500
  }
};

setupSecurity(app, customSecurity);
```

## Testing Your Setup

```bash
# Test health endpoint
curl -v http://localhost:4646/api/health

# Test CORS
curl -H "Origin: https://yourdomain.cf" -v http://localhost:4646/api/health

# Check security headers
curl -I http://localhost:4646/api/health | grep -E 'Helmet|CSP|HSTS'

# Test rate limiting (will fail after limit)
for i in {1..6}; do
  curl -H "Origin: https://yourdomain.cf" http://localhost:4646/api/health
done
```

## Common Issues

### CORS Errors
```bash
# Check your CORS_ORIGIN
echo $CORS_ORIGIN

# Test with the correct origin
curl -H "Origin: https://yourdomain.cf" -v http://localhost:4646/api/health
```

### HTTPS Redirect Not Working
```bash
# Verify environment variables
echo $ENFORCE_HTTPS
echo $TRUST_PROXY

# Check proxy headers are being passed
curl -H "X-Forwarded-Proto: https" -v http://localhost:4646/api/health
```

### Real IP Not Showing in Logs
```bash
# Ensure TRUST_PROXY is true
echo $TRUST_PROXY

# Check for proxy headers
curl -v http://localhost:4646/api/health | grep 'X-Forwarded-For'
```

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `TRUST_PROXY=true` for reverse proxies
- [ ] Set `CORS_ORIGIN` to your domain
- [ ] Set `ENFORCE_HTTPS=true` for public deployments
- [ ] Configure rate limiting limits
- [ ] Test with curl before going live
- [ ] Check security headers are applied
- [ ] Verify real IP detection in logs

---

**Maintained by CrustAgent©™**