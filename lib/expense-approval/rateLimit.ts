/**
 * Expense Approval Rate Limiting
 * In-memory rate limiter for public form submissions (mirrors offer/rateLimit.ts)
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_SUBMISSIONS = 5; // Max per window

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string): { success: boolean; resetAt: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return { success: true, resetAt: now + WINDOW_MS };
    }

    if (entry.count >= MAX_SUBMISSIONS) {
        return { success: false, resetAt: entry.resetAt };
    }

    entry.count++;
    return { success: true, resetAt: entry.resetAt };
}
