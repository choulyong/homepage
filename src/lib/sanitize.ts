/**
 * Content sanitization utilities
 * Prevents XSS attacks by sanitizing user-generated content
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize comment content (plain text only)
 * Removes ALL HTML tags for maximum security
 * Use this for comment content that should be plain text
 */
export function sanitizeComment(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });
}

/**
 * Sanitize rich content (limited HTML)
 * Allows basic formatting tags if needed in the future
 * Currently not used but available for future enhancements
 */
export function sanitizeRichContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
    ALLOWED_ATTR: ['href'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):)/i,
  });
}

/**
 * Sanitize name/author fields
 * Removes HTML but keeps unicode characters for international names
 */
export function sanitizeName(name: string): string {
  return DOMPurify.sanitize(name, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}
