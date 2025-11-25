/**
 * Parse price from text format like "$120 p/m" or "$120 per month"
 * Returns the monthly price as a number
 */
export function parseMonthlyPrice(price: string | number | null | undefined): number {
    if (price === null || price === undefined) return 0
    if (typeof price === 'number') return price

    // Fallback for any remaining string formats (though DB is now numeric)
    const match = price.match(/\$?(\d+(?:\.\d{2})?)/)
    return match ? parseFloat(match[1]) : 0
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

/**
 * Format number with abbreviation (e.g., 1.5K, 2.3M)
 */
export function formatNumberAbbreviated(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`
}
