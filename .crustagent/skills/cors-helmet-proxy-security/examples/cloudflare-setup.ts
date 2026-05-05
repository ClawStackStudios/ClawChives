/**
 * Cloudflare Tunnel setup example
 * This example shows how to configure for production with Cloudflare Tunnel
 */

import express from 'express';
import { setupSecurity, corsConfig } from '../index';

// Create Express app
const app = express();
const PORT = process.env.PORT || 4646;

// Configure for Cloudflare Tunnel
const cloudflareConfig = {
  cors: corsConfig('strict', process.env.CORS_ORIGIN),
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // requests per window
  }
};

// Apply security middleware with Cloudflare-specific config
setupSecurity(app, cloudflareConfig);

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'ClawChives API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    ip: req.ip, // Real client IP through Cloudflare
    headers: {
      'cf-connecting-ip': req.headers['cf-connecting-ip'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip']
    }
  });
});

// Auth endpoints with stricter rate limiting
import { RateLimiterMemory } from 'rate-limiter-flexible';
const authLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 5, // 5 attempts
  duration: 900, // per 15 minutes
});

app.post('/api/auth/login', authLimiter.consume.bind(authLimiter), (req, res) => {
  // Login logic here
  res.json({ message: 'Login endpoint' });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ClawChives API server started');
  console.log(`🌐 Health check: https://${process.env.CORS_ORIGIN}/api/health`);
  console.log('');
  console.log('🔒 Security Configuration:');
  console.log(`   - Trusted Proxy: ${process.env.TRUST_PROXY || 'false'}`);
  console.log(`   - CORS Origin: ${process.env.CORS_ORIGIN || 'not set'}`);
  console.log(`   - HTTPS Enforcement: ${process.env.ENFORCE_HTTPS || 'false'}`);
  console.log('');
  console.log('☁️ Cloudflare Setup:');
  console.log('   1. Ensure tunnel is running');
  console.log('   2. DNS is configured for your domain');
  console.log('   3. Cloudflare headers are being passed');
});