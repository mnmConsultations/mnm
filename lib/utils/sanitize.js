/**
 * Input Sanitization Utilities
 * 
 * Protects against:
 * - XSS (Cross-Site Scripting)
 * - NoSQL Injection
 * - HTML Injection
 * - Path Traversal
 * 
 * Usage:
 * ```javascript
 * import { sanitizeString, sanitizeEmail } from '@/lib/utils/sanitize';
 * 
 * const cleanName = sanitizeString(userInput.name, 100);
 * const cleanEmail = sanitizeEmail(userInput.email);
 * ```
 */

/**
 * Sanitize a general string input
 * Removes HTML tags, trims whitespace, limits length
 * 
 * @param {string} str - Input string to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export function sanitizeString(str, maxLength = 1000) {
  if (!str) return '';
  
  // Convert to string if not already
  let clean = String(str);
  
  // Remove HTML tags
  clean = clean.replace(/<[^>]*>/g, '');
  
  // Remove null bytes
  clean = clean.replace(/\0/g, '');
  
  // Trim whitespace
  clean = clean.trim();
  
  // Limit length
  clean = clean.substring(0, maxLength);
  
  return clean;
}

/**
 * Sanitize email address
 * Normalizes and validates email format
 * 
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email in lowercase
 */
export function sanitizeEmail(email) {
  if (!email) return '';
  
  // Convert to string and trim
  let clean = String(email).trim().toLowerCase();
  
  // Remove spaces
  clean = clean.replace(/\s/g, '');
  
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return '';
  }
  
  return clean;
}

/**
 * Sanitize HTML content
 * Strips all HTML tags or allows only safe tags
 * 
 * @param {string} html - HTML content to sanitize
 * @param {boolean} stripAll - If true, removes all HTML; if false, allows safe tags
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html, stripAll = true) {
  if (!html) return '';
  
  let clean = String(html);
  
  if (stripAll) {
    // Remove all HTML tags
    clean = clean.replace(/<[^>]*>/g, '');
  } else {
    // Allow only safe tags (whitelist approach)
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li'];
    const tagRegex = /<(\/?)([\w]+)[^>]*>/g;
    
    clean = clean.replace(tagRegex, (match, slash, tag) => {
      if (allowedTags.includes(tag.toLowerCase())) {
        return `<${slash}${tag}>`;
      }
      return '';
    });
  }
  
  // Remove script and style content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove event handlers
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  return clean;
}

/**
 * Escape special characters for regex
 * Prevents ReDoS and NoSQL injection via regex
 * 
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for regex
 */
export function escapeRegex(str) {
  if (!str) return '';
  
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitize MongoDB query operators
 * Prevents NoSQL injection attacks
 * 
 * @param {object} query - Query object to sanitize
 * @returns {object} Sanitized query object
 */
export function sanitizeMongoQuery(query) {
  if (!query || typeof query !== 'object') {
    return {};
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(query)) {
    // Remove keys starting with $ (MongoDB operators)
    if (key.startsWith('$')) {
      continue;
    }
    
    // Recursively sanitize nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeMongoQuery(value);
    } else if (Array.isArray(value)) {
      // Sanitize array values
      sanitized[key] = value.map(item => 
        typeof item === 'object' ? sanitizeMongoQuery(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Sanitize URL to prevent open redirects
 * Validates URL is safe and points to allowed domain
 * 
 * @param {string} url - URL to validate
 * @param {string[]} allowedDomains - Array of allowed domains
 * @returns {string|null} Sanitized URL or null if invalid
 */
export function sanitizeUrl(url, allowedDomains = []) {
  if (!url) return null;
  
  try {
    // If relative URL, it's safe
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    
    const parsedUrl = new URL(url);
    
    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    if (dangerousProtocols.some(proto => parsedUrl.protocol.toLowerCase().includes(proto))) {
      return null;
    }
    
    // Check against allowed domains if provided
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) {
        return null;
      }
    }
    
    return parsedUrl.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize phone number
 * Removes non-numeric characters, validates format
 * 
 * @param {string} phone - Phone number to sanitize
 * @returns {string} Sanitized phone number (digits only)
 */
export function sanitizePhone(phone) {
  if (!phone) return '';
  
  // Remove all non-numeric characters except +
  let clean = String(phone).replace(/[^\d+]/g, '');
  
  // Ensure + is only at the start
  if (clean.includes('+')) {
    const parts = clean.split('+');
    clean = '+' + parts.join('');
  }
  
  return clean;
}

/**
 * Sanitize filename to prevent path traversal
 * 
 * @param {string} filename - Filename to sanitize
 * @returns {string} Safe filename
 */
export function sanitizeFilename(filename) {
  if (!filename) return '';
  
  let clean = String(filename);
  
  // Remove path separators
  clean = clean.replace(/[\/\\]/g, '');
  
  // Remove parent directory references
  clean = clean.replace(/\.\./g, '');
  
  // Remove null bytes
  clean = clean.replace(/\0/g, '');
  
  // Limit to alphanumeric, dots, dashes, underscores
  clean = clean.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Prevent hidden files (starting with .)
  if (clean.startsWith('.')) {
    clean = '_' + clean.substring(1);
  }
  
  // Limit length
  clean = clean.substring(0, 255);
  
  return clean;
}

/**
 * Validate and sanitize integer
 * 
 * @param {any} value - Value to parse as integer
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} Sanitized integer
 */
export function sanitizeInteger(value, min = -Infinity, max = Infinity, defaultValue = 0) {
  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed)) {
    return defaultValue;
  }
  
  if (parsed < min) {
    return min;
  }
  
  if (parsed > max) {
    return max;
  }
  
  return parsed;
}

/**
 * Sanitize object by removing undefined and null values
 * 
 * @param {object} obj - Object to sanitize
 * @returns {object} Sanitized object
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
