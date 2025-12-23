/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user input and prevent XSS attacks.
 * While React escapes content by default, these utilities add defense-in-depth
 * for data stored in the database and displayed later.
 */

// Maximum lengths for various input types
export const INPUT_LIMITS = {
    name: 100,
    email: 255,
    reviewText: 1000,
    messageContent: 2000,
    dishName: 150,
    vendorName: 150,
    location: 200,
    timeNote: 100,
    category: 50,
} as const;

/**
 * Sanitizes HTML-like content aggressively
 * Removes script/style tags AND their content, all other tags, and dangerous patterns
 */
export function sanitizeHtml(input: string | undefined | null): string {
    if (!input) return '';

    let result = input.trim();

    // Remove script tags AND their content (including malformed)
    result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    result = result.replace(/<script[^>]*>/gi, '');

    // Remove style tags AND their content
    result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Remove ALL remaining HTML/XML tags
    result = result.replace(/<[^>]*>?/g, '');

    // Remove any remaining < or > characters
    result = result.replace(/[<>]/g, '');

    // Remove javascript:, data:, vbscript: URLs
    result = result.replace(/javascript\s*:/gi, '');
    result = result.replace(/data\s*:/gi, '');
    result = result.replace(/vbscript\s*:/gi, '');

    // Remove on* event handler patterns
    result = result.replace(/on\w+\s*=\s*["']?[^"'\s]*["']?/gi, '');
    result = result.replace(/on\w+\s*=/gi, '');

    // Remove common JS function patterns that might slip through
    result = result.replace(/\balert\s*\([^)]*\)/gi, '');
    result = result.replace(/\beval\s*\([^)]*\)/gi, '');
    result = result.replace(/\bdocument\s*\./gi, '');
    result = result.replace(/\bwindow\s*\./gi, '');

    // Remove null bytes
    result = result.replace(/\0/g, '');

    // Normalize unicode
    result = result.normalize('NFC');

    return result.trim();
}

/**
 * Sanitizes a basic string (less aggressive, for names etc)
 */
export function sanitizeString(input: string | undefined | null): string {
    if (!input) return '';
    return sanitizeHtml(input);
}

/**
 * Validates and truncates input to a maximum length
 */
export function validateLength(input: string, maxLength: number): string {
    const sanitized = sanitizeHtml(input);
    return sanitized.slice(0, maxLength);
}

/**
 * Sanitizes a user name
 */
export function sanitizeName(name: string | undefined | null): string {
    return validateLength(name, INPUT_LIMITS.name);
}

/**
 * Sanitizes review text
 */
export function sanitizeReviewText(text: string | undefined | null): string {
    return validateLength(text, INPUT_LIMITS.reviewText);
}

/**
 * Sanitizes message content
 */
export function sanitizeMessageContent(content: string | undefined | null): string {
    return validateLength(content, INPUT_LIMITS.messageContent);
}

/**
 * Sanitizes a dish/menu item name
 */
export function sanitizeDishName(name: string | undefined | null): string {
    return validateLength(name, INPUT_LIMITS.dishName);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitizes an object's string properties recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const result = { ...obj };

    for (const key in result) {
        if (typeof result[key] === 'string') {
            result[key] = sanitizeHtml(result[key]) as T[typeof key];
        } else if (typeof result[key] === 'object' && result[key] !== null) {
            result[key] = sanitizeObject(result[key]);
        }
    }

    return result;
}
