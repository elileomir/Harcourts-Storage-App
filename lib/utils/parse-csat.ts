/**
 * Parse CSAT score from various formats
 * Handles: "4 - Satisfied", "5", null, undefined
 * Returns: number (1-5) or null
 */
export function parseCSAT(csatScore: string | number | null | undefined): number | null {
    if (csatScore === null || csatScore === undefined) return null

    // If already a number
    if (typeof csatScore === 'number') {
        return csatScore >= 1 && csatScore <= 5 ? csatScore : null
    }

    // If string, extract first number
    const score = parseInt(csatScore.toString().split(' ')[0])
    return !isNaN(score) && score >= 1 && score <= 5 ? score : null
}

/**
 * Format CSAT score for display
 * Returns: "4.2 ⭐" or "N/A"
 */
export function formatCSAT(csatScore: string | number | null | undefined): string {
    const score = parseCSAT(csatScore)
    return score !== null ? `${score} ⭐` : 'N/A'
}

/**
 * Get CSAT label from score
 */
export function getCSATLabel(csatScore: string | number | null | undefined): string {
    const score = parseCSAT(csatScore)
    if (score === null) return 'N/A'

    const labels: Record<number, string> = {
        5: 'Very Satisfied',
        4: 'Satisfied',
        3: 'Neutral',
        2: 'Dissatisfied',
        1: 'Very Dissatisfied'
    }

    return labels[score] || 'Unknown'
}
