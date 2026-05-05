# CORS-Helmet-Proxy Security Skill

A comprehensive security middleware package for Express.js applications, featuring smart CORS configuration, Helmet security headers, and trusted proxy support optimized for Cloudflare deployments.

## Installation

```bash
# Install dependencies
npm install cors helmet express rate-limiter-flexible

# Or using the skill's package.json
cd .crustagent/skills/cors-helmet-proxy-security
npm install
```

## Quick Start

```typescript
import express from 'express';
import { setupSecurity } from '.crustagent/skills/cors-helmet-proxy-security';

const app = express();

// Apply complete security middleware
setupSecurity(app);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Secure endpoint' });
});
```

## Environment Configuration

Create a `.env` file in your project root:

```env
# Security Settings
TRUST_PROXY=true                    # Enable for reverse proxies (Cloudflare, Nginx)
CORS_ORIGIN=https://yourdomain.com # Restrict to specific domains (Cloudflare Tunnel)
ENFORCE_HTTPS=true                 # Force HTTPS redirect

# Rate Limiting (Optional)
AUTH_RATE_WINDOW=900000            # 15 minutes in ms
AUTH_RATE_LIMIT=5                  # Max requests per window
API_RATE_WINDOW=60000             # 1 minute in ms
API_RATE_LIMIT=100                # Max requests per window
```

## Configuration Options

### 1. Basic Setup (Recommended)

```typescript
import { setupSecurity } from '.crustagent/skills/cors-helmet-proxy-security';

setupSecurity(app);
```

### 2. Custom CORS Configuration

```typescript
import { setupSecurity, corsConfig } from '.crustagent/skills/cors-helmet-proxy-security';

// Development mode - allows localhost and private IPs
setupSecurity(app, {
  cors: corsConfig('development')
});

// LAN mode - allows private network access
setupSecurity(app, {
  cors: corsConfig('lan')
});

// Strict mode - restrict to specific origin (Cloudflare Tunnel)
setupSecurity(app, {
  cors: corsConfig('strict', 'https://yourdomain.com')
});
```

### 3. Custom Helmet Configuration

```typescript
import { setupSecurity, helmetConfig } from '.crustagent/skills/cors-helmet-proxy-security';

const customHelmet = helmetConfig({
  enableCSP: true,
  enableHSTS: true,
  customDirectives: {
    'connect-src': ["'self'", 'https://api.example.com'],
    'script-src': ["'self'", "'unsafe-inline'"]
  }
});

setupSecurity(app, { helmet: customHelmet });
```

### 4. Rate Limiting

```typescript
import { setupSecurity } from '.crustagent/skills/cors-helmet-proxy-security';

// Global rate limiting (100 requests per minute)
setupSecurity(app, {
  rateLimit: {
    windowMs: 60 * 1000,
    max: 100
  }
});

// Custom rate limiting per route
import { rateLimiterMiddleware } from '.crustagent/skills/cors-helmet-proxy-security';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const authLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 900, // per 15 minutes
});

app.use('/api/auth', rateLimiterMiddleware(authLimiter));
```

## Deployment Examples

### Cloudflare Tunnel Setup

```env
# .env
TRUST_PROXY=true
CORS_ORIGIN=https://yourdomain.cf
ENFORCE_HTTPS=true
```

```bash
# Create Cloudflare tunnel
cloudflared tunnel create myapp

# Configure DNS
cloudflared tunnel route dns myapp yourdomain.cf

# Start tunnel
cloudflared tunnel run myapp
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4646

ENV TRUST_PROXY=true
ENV CORS_ORIGIN=https://yourdomain.com
ENV ENFORCE_HTTPS=true

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "4646:4646"
    environment:
      - NODE_ENV=production
      - TRUST_PROXY=true
      - CORS_ORIGIN=https://yourdomain.com
      - ENFORCE_HTTPS=true
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

## Testing

### Test Endpoints

```bash
# Health check
curl http://localhost:4646/api/health

# Test CORS
curl -H "Origin: http://localhost:3000" -v http://localhost:4646/api/health

# Test HTTPS redirect
curl -I http://localhost:4646/api/health

# Check security headers
curl -I http://localhost:4646/api/health | grep -E 'Helmet|CSP|HSTS'
```

### Test Rate Limiting

```bash
# Exceed rate limit (will return 429 after 5 requests)
for i in {1..6}; do
  curl -H "Origin: http://localhost:3000" http://localhost:4646/api/health
done
```

## API Reference

### `setupSecurity(app, options?)`

Configure complete security middleware stack.

#### Parameters
- `app` - Express.js application instance
- `options` - Optional configuration object

```typescript
interface SecurityOptions {
  cors?: {
    mode: 'development' | 'lan' | 'strict';
    origin?: string;
  };
  helmet?: {
    enableCSP?: boolean;
    enableHSTS?: boolean;
    customDirectives?: Record<string, any[]>;
  };
  rateLimit?: {
    windowMs?: number;
    max?: number;
    keyGenerator?: (req: express.Request) => string;
  };
}
```

### `corsConfig(mode, origin?)`

Create CORS configuration object.

#### Parameters
- `mode` - CORS mode: `'development'`, `'lan'`, or `'strict'`
- `origin` - Origin string (required for strict mode)

### `helmetConfig(options?)`

Create Helmet configuration object.

#### Parameters
- `options` - Helmet configuration options

```typescript
interface HelmetOptions {
  enableCSP?: boolean;
  enableHSTS?: boolean;
  customDirectives?: Record<string, any[]>;
}
```

## Security Features

### CORS Configuration

1. **Development Mode**
   - Allows `localhost` and private IP ranges
   - No `CORS_ORIGIN` required
   - Perfect for local development

2. **LAN Mode**
   - Allows private network access
   - No `CORS_ORIGIN` required
   - Good for self-hosted deployments

3. **Strict Mode**
   - Restricts to specified `CORS_ORIGIN`
   - Required for Cloudflare Tunnel
   - Most secure option

### Security Headers Applied

- **X-Content-Type-Options**: Prevents MIME-sniffing
- **X-Frame-Options**: Clickjacking protection
- **X-XSS-Protection**: Basic XSS protection
- **Strict-Transport-Security**: HTTPS enforcement
- **Content-Security-Policy**: XSS and data injection protection
- **Cross-Origin-Resource-Policy**: Controls cross-origin requests

### IP Address Detection

When `TRUST_PROXY=true`, the middleware correctly reads the real client IP from reverse proxy headers:

- `X-Forwarded-For`
- `X-Real-IP`
- `X-Forwarded-Proto`

## Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Check CORS_ORIGIN setting
   echo $CORS_ORIGIN
   
   # Test with correct origin
   curl -H "Origin: https://yourdomain.com" -v http://localhost:4646/api/health
   ```

2. **HTTPS Redirect Not Working**
   ```bash
   # Ensure ENFORCE_HTTPS is set
   echo $ENFORCE_HTTPS
   
   # Check proxy headers are being passed
   curl -H "X-Forwarded-Proto: https" -v http://localhost:4646/api/health
   ```

3. **Rate Limiting Not Working**
   ```bash
   # Check rate limiting headers
   curl -I http://localhost:4646/api/health | grep -i rate-limit
   
   # Reset IP (if needed)
   export YOUR_IP="127.0.0.1"
   ```

## Contributing

This skill is maintained by CrustAgent©™. To contribute:

1. Follow the existing code structure
2. Update documentation for new features
3. Add tests for new functionality
4. Update examples in README.md

---

**Maintained by CrustAgent©™**