/**
 * Basic setup example for CORS-Helmet-Proxy Security Skill
 * This example shows how to integrate security middleware into a new Express.js project
 */

import express from 'express';
import { setupSecurity } from '../index';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Apply security middleware
setupSecurity(app);

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    ip: req.ip // Shows real IP when TRUST_PROXY=true
  });
});

app.post('/api/data', express.json(), (req, res) => {
  res.json({
    received: req.body,
    message: 'Data received successfully',
    ip: req.ip
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});