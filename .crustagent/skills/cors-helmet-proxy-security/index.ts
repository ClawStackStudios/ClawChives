/**
 * Security middleware setup for Express.js
 * Combines CORS, Helmet, trusted proxy, and rate limiting
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Import utilities from project
import { getCorsConfig } from '../../../src/config/corsConfig.js';

export interface SecurityOptions {
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

export function setupSecurity(app: express.Application, options: SecurityOptions = {}) {
  // Trust proxy if configured
  if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
  }

  // HTTPS Redirect middleware
  if (process.env.ENFORCE_HTTPS === 'true') {
    app.use(httpsRedirect);
  }

  // Helmet security
  app.use(helmet(getHelmetConfig(options.helmet)));

  // CORS configuration
  const corsConfig = getCorsWithMode(options.cors?.mode, options.cors?.origin);
  app.use(cors(corsConfig));

  // Built-in JSON parsing
  app.use(express.json());

  // Apply global rate limiting if configured
  if (options.rateLimit) {
    const rateLimiter = new RateLimiterMemory({
      keyGenerator: options.rateLimit.keyGenerator || ((req) => req.ip),
      points: options.rateLimit.max || 100,
      duration: options.rateLimit.windowMs ? options.rateLimit.windowMs / 1000 : 60,
    });
    app.use(rateLimiterMiddleware(rateLimiter));
  }
}

function getHelmetConfig(options: SecurityOptions['helmet'] = {}) {
  const config: any = {
    strictTransportSecurity: options.enableHSTS !== false ? {
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true
    } : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    originAgentCluster: false,
  };

  if (options.enableCSP !== false) {
    config.contentSecurityPolicy = {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'wss:', 'ws:'],
        ...options.customDirectives,
      },
    };
    config.contentSecurityPolicyDirectiveDefaults = {
      'upgrade-insecure-requests': process.env.ENFORCE_HTTPS === 'true' ? [] : null,
    };
  }

  return config;
}

function getCorsWithMode(mode: 'development' | 'lan' | 'strict' = 'development', origin?: string) {
  const modeMap = {
    development: 'development',
    lan: 'lan',
    strict: 'strict'
  };

  // Temporarily set environment to get correct config
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = mode === 'development' ? 'development' : 'production';

  // Override CORS_ORIGIN if provided
  if (origin) {
    process.env.CORS_ORIGIN = origin;
  }

  const corsConfig = getCorsConfig();

  // Restore original environment
  process.env.NODE_ENV = originalEnv;
  if (origin) {
    delete process.env.CORS_ORIGIN;
  }

  return corsConfig;
}

function httpsRedirect(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (process.env.ENFORCE_HTTPS === 'true') {
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    if (!isSecure) {
      const port = process.env.HTTPS_PORT || 443;
      const host = req.hostname;
      const portSuffix = String(port) === '443' ? '' : `:${port}`;
      return res.redirect(301, `https://${host}${portSuffix}${req.originalUrl}`);
    }
  }
  next();
}

function rateLimiterMiddleware(rateLimiter: RateLimiterMemory) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      await rateLimiter.consume(req.ip);
      next();
    } catch (rejRes: any) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: rejRes.msBeforeNext,
      });
    }
  };
}

// Export individual utilities
export { getCorsWithMode as corsConfig, getHelmetConfig as helmetConfig };

export default setupSecurity;