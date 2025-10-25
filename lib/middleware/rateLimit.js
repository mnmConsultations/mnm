/**
 * Rate Limiting Middleware
 * 
 * Protects against brute force attacks, spam, and abuse
 * Uses in-memory storage for simplicity (consider Redis for production scaling)
 * 
 * Features:
 * - Configurable rate limits per identifier (email, IP, etc.)
 * - Automatic cleanup of expired entries
 * - Returns retry-after time for clients
 * 
 * Usage:
 * ```javascript
 * import { checkRateLimit } from '@/lib/middleware/rateLimit';
 * 
 * const rateLimitCheck = checkRateLimit(email, 5, 15 * 60 * 1000);
 * if (!rateLimitCheck.allowed) {
 *   return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 * ```
 */

const rateLimit = new Map();

/**
 * Check if request should be rate limited
 * 
 * @param {string} identifier - Unique identifier (email, IP, userId)
 * @param {number} maxRequests - Maximum requests allowed in time window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ allowed: boolean, retryAfter?: number, remaining?: number }}
 */
export function checkRateLimit(identifier, maxRequests = 5, windowMs = 15 * 60 * 1000) {
  if (!identifier) {
    return { allowed: false, retryAfter: 0 };
  }

  const now = Date.now();
  const userRequests = rateLimit.get(identifier) || [];
  
  // Remove old requests outside the time window
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    const oldestRequest = recentRequests[0];
    const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
    
    return { 
      allowed: false, 
      retryAfter,
      remaining: 0
    };
  }
  
  // Add current request timestamp
  recentRequests.push(now);
  rateLimit.set(identifier, recentRequests);
  
  return { 
    allowed: true,
    remaining: maxRequests - recentRequests.length
  };
}

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or administrative override
 * 
 * @param {string} identifier - Identifier to reset
 */
export function resetRateLimit(identifier) {
  rateLimit.delete(identifier);
}

/**
 * Get current request count for identifier
 * 
 * @param {string} identifier - Identifier to check
 * @param {number} windowMs - Time window in milliseconds
 * @returns {number} Number of requests in current window
 */
export function getRateLimitCount(identifier, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const userRequests = rateLimit.get(identifier) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  return recentRequests.length;
}

/**
 * Clean up old entries periodically
 * Prevents memory leaks from abandoned identifiers
 * Runs every minute
 */
function cleanupOldEntries() {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour
  
  for (const [key, requests] of rateLimit.entries()) {
    const recent = requests.filter(time => now - time < maxAge);
    
    if (recent.length === 0) {
      rateLimit.delete(key);
    } else {
      rateLimit.set(key, recent);
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldEntries, 60000);
}

/**
 * Get client IP address from request
 * Handles various proxy headers
 * 
 * @param {Request} request - Next.js request object
 * @returns {string} Client IP address
 */
export function getClientIp(request) {
  // Check various headers in order of trust
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  return 'unknown';
}

/**
 * Rate limit configuration presets
 */
export const RateLimitPresets = {
  // Authentication endpoints - strict
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  
  // API endpoints - moderate
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // Contact form - prevent spam
  CONTACT: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  // Admin operations - relaxed
  ADMIN: {
    maxRequests: 200,
    windowMs: 60 * 1000, // 1 minute
  },
};
