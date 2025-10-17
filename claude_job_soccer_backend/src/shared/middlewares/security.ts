import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API-only backend
});

//  Rate limiting configuration
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Compression middleware
export const compressionConfig: RequestHandler = compression({
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024,
});

// Enhanced input sanitization middleware with MongoDB injection and XSS protection
export const additionalSanitization = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // MongoDB injection patterns to remove
  const mongoInjectionPatterns = [
    /\$where/gi,
    /\$ne/gi,
    /\$gt/gi,
    /\$lt/gi,
    /\$gte/gi,
    /\$lte/gi,
    /\$exists/gi,
    /\$in/gi,
    /\$nin/gi,
    /\$size/gi,
    /\$all/gi,
    /\$regex/gi,
    /\$options/gi,
    /\$expr/gi,
    /\$jsonSchema/gi,
    /\$mod/gi,
    /\$text/gi,
    /\$elemMatch/gi,
  ];

  // Sanitize common XSS patterns and MongoDB injection
  const sanitizeString = (str: string): string => {
    let sanitized = str;

    // Remove XSS patterns
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    // Remove MongoDB injection patterns
    mongoInjectionPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '_');
    });

    return sanitized;
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          // Sanitize key itself to prevent MongoDB injection in field names
          const sanitizedKey = sanitizeString(key);
          sanitized[sanitizedKey] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  // Log potential injection attempts before sanitization
  const checkForInjection = (data: any, source: string): void => {
    const dataStr = JSON.stringify(data);
    mongoInjectionPatterns.forEach((pattern) => {
      if (pattern.test(dataStr)) {
        console.warn(
          `⚠️  Potential MongoDB injection attempt detected in ${source} from ${req.ip}:`,
          {
            pattern: pattern.source,
            data: dataStr.substring(0, 200) + (dataStr.length > 200 ? '...' : ''),
            userAgent: req.get('User-Agent'),
            url: req.url,
            timestamp: new Date().toISOString(),
          }
        );
      }
    });
  };

  try {
    // Sanitize request body
    if (req.body && Object.keys(req.body).length > 0) {
      checkForInjection(req.body, 'body');
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && Object.keys(req.query).length > 0) {
      checkForInjection(req.query, 'query');
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && Object.keys(req.params).length > 0) {
      checkForInjection(req.params, 'params');
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error('❌ Error in sanitization middleware:', error);
    // Continue processing even if sanitization fails
    next();
  }
};




