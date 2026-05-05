# Skill Implementation Notes

## CORS-Helmet-Proxy Security Skill

### Implementation Context
Created on: 2026-05-03
From: ClawChives project server configuration
Goal: Make security setup easily portable to other projects

### Key Implementation Decisions

1. **Three-Mode CORS System**
   - Development: Open for localhost and private IPs
   - LAN: Private network access only
   - Strict: Production with specific domain allowlist
   - Rationale: Provides flexibility across different deployment scenarios

2. **Helmet Configuration**
   - CSP with font.googleapis.com for UI frameworks
   - WebSocket support for real-time features
   - COEP/ CORP disabled for compatibility
   - Customizable directives for third-party integrations

3. **Trusted Proxy Support**
   - Single `TRUST_PROXY=true` enables all proxy features
   - Real IP detection for audit logs
   - Cloudflare, Nginx, Docker compatible

### Environment Variables Mapping

| Variable | Purpose | Default |
|----------|---------|---------|
| `TRUST_PROXY` | Enable reverse proxy support | false |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | Dynamic |
| `ENFORCE_HTTPS` | Force HTTPS redirect | false |
| `NODE_ENV` | Environment mode | development |

### Integration Patterns

1. **Basic Integration**
   ```typescript
   import { setupSecurity } from '.crustagent/skills/cors-helmet-proxy-security';
   setupSecurity(app);
   ```

2. **Cloudflare Tunnel Integration**
   ```typescript
   setupSecurity(app, {
     cors: corsConfig('strict', 'https://yourdomain.cf'),
     rateLimit: { windowMs: 15 * 60 * 1000, max: 1000 }
   });
   ```

3. **Development Integration**
   ```typescript
   setupSecurity(app, {
     cors: corsConfig('development'),
     rateLimit: { windowMs: 60 * 1000, max: 1000 }
   });
   ```

### Testing Strategy

1. **Unit Tests**
   - CORS configuration for each mode
   - Security headers verification
   - Rate limiting behavior

2. **Integration Tests**
   - HTTPS redirect functionality
   - IP address detection through proxies
   - Cross-origin request handling

3. **Production Tests**
   - Cloudflare tunnel integration
   - Multiple origin support
   - Rate limiting under load

### Deployment Considerations

1. **Environment Setup**
   - Always set `TRUST_PROXY` for reverse proxies
   - Configure `CORS_ORIGIN` in production
   - Enable `ENFORCE_HTTPS` for public deployments

2. **Docker Best Practices**
   - Copy entire `.crustagent` directory
   - Set production environment variables
   - Use non-root user if possible

3. **Cloudflare Tunnel**
   - DNS configuration required
   - Tunnel authentication
   - Custom domain setup

### Future Enhancements

1. **Rate Limiting Per Endpoints**
   - Separate limits for auth vs API
   - Dynamic limit adjustment
   - Distributed rate limiting

2. **Security Headers Management**
   - Header configuration per environment
   - A/B testing for security headers
   - Performance impact monitoring

3. **CORS Enhancement**
   - Wildcard support with credentials
   - CORS preflight caching
   - Origin validation regex

### Migration Notes

From original ClawChives implementation:
- Extracted `corsConfig.js` to configurable function
- Separated helmet configuration for customization
- Added HTTPS redirect middleware
- Made rate limiting configurable
- Added comprehensive documentation

---

**Maintained by CrustAgent©™**