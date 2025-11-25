import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface ToolResult {
    type?: string
    tool_name?: string
    name?: string
    result?: unknown
    result_value?: string
    is_error?: boolean
}

export interface ToolCall {
    type?: string
    tool_name?: string
    name?: string
    arguments?: unknown
}

export interface TranscriptItem {
    role: string
    message: string | null
    tool_calls?: Array<ToolCall>
    tool_results?: Array<ToolResult>
    time_in_call_secs: number
}

export interface EvaluationRationale {
    brand_alignment?: { result: string; rationale: string }
    handoff_success?: { result: string; rationale: string }
    compliance_check?: { result: string; rationale: string }
}

export type CallLog = {
    call_id: string
    agent_id: string
    start_time: string
    end_time: string
    duration_seconds: number
    cost_credits: number
    handoff_success: boolean
    brand_alignment: boolean
    compliance_check: boolean
    csat_score: string | null
    lead_quality_score: string | null
    primary_churn_reason: string
    competitor_mention: string
    requested_move_in_window: string
    transcript_summary: string | null
    transcript_full: TranscriptItem[] | null
    evaluation_rationale: EvaluationRationale | null
}

export function useAnalytics() {
    const supabase = createClient()

    const { data: calls, isLoading, error } = useQuery({
        queryKey: ['analytics'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('call_analytics')
                .select('*')
                .order('start_time', { ascending: false })

            if (error) throw error
            return data as CallLog[]
        },
    })

    // Calculate stats
    const totalCalls = calls?.length || 0
    const successfulHandoffs = calls?.filter(c => c.handoff_success).length || 0
    const handoffRate = totalCalls > 0 ? Math.round((successfulHandoffs / totalCalls) * 100) : 0

    // Parse CSAT "5 - Delighted" -> 5
    const avgCsat = calls?.reduce((acc, curr) => {
        const score = parseInt(curr.csat_score?.split(' ')[0] || '0')
        return acc + score
    }, 0) || 0
    const csatScore = totalCalls > 0 ? (avgCsat / totalCalls).toFixed(1) : '0.0'

    // Churn reasons
    const churnReasons = calls?.reduce((acc, curr) => {
        if (curr.primary_churn_reason) {
            acc[curr.primary_churn_reason] = (acc[curr.primary_churn_reason] || 0) + 1
        }
        return acc
    }, {} as Record<string, number>)

    const topChurn = Object.entries(churnReasons || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)

    return {
        calls,
        isLoading,
        error,
        stats: {
            totalCalls,
            handoffRate,
            csatScore,
            topChurn
        }
    }
}
