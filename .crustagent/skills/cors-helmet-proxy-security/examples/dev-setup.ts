/**
 * Development setup example
 * This example shows how to configure for local development with flexible CORS
 */

import express from 'express';
import { setupSecurity, corsConfig } from '../index';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Development configuration
const devConfig = {
  cors: corsConfig('development'), // Allows localhost and private IPs
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 1000 // requests per window (generous for dev)
  }
};

// Apply security middleware
setupSecurity(app, devConfig);

// Development-specific routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Development API',
    timestamp: new Date().toISOString(),
    ip: req.ip,
    environment: 'development',
    allowedOrigins: 'localhost and private IP ranges'
  });
});

// For local frontend testing
app.get('/api/config', (req, res) => {
  res.json({
    apiUrl: `http://localhost:${PORT}`,
    cors: {
      origin: process.env.CORS_ORIGIN || 'not set (development mode)',
      trustedProxy: process.env.TRUST_PROXY || 'false'
    }
  });
});

// Sample API endpoints
app.get('/api/bookmarks', (req, res) => {
  res.json([
    { id: 1, title: 'Example Bookmark', url: 'https://example.com' },
    { id: 2, title: 'Development Docs', url: 'https://nodejs.org' }
  ]);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Config: http://localhost:${PORT}/api/config`);
  console.log('');
  console.log('🔒 Development Security:');
  console.log(`   - CORS: Development mode (open for localhost/LAN)`);
  console.log(`   - Rate Limit: ${devConfig.rateLimit.max} requests per ${devConfig.rateLimit.windowMs/1000}s`);
  console.log(`   - HTTPS: ${process.env.ENFORCE_HTTPS ? 'Enabled' : 'Disabled'}`);
  console.log('');
  console.log('💡 Tips:');
  console.log('   - Frontend can run on any port');
  console.log('   - Postman/Insomnia work without CORS issues');
  console.log('   - Real IP detection works with Tailscale/VPN');
});