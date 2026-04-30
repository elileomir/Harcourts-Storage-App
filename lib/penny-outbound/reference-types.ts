/**
 * Penny Outbound — Reference Check Types
 *
 * Types for the `reference_checks` table and the joined view
 * between `penny_outbound_calls` and `reference_checks`.
 */

import type { PennyOutboundCallRow } from "./types";

// ============================================
// Reference check status
// ============================================
export type ReferenceStatus =
  | "complete"
  | "deferred"
  | "declined"
  | "no_answer"
  | "pending";

// ============================================
// Structured response sub-types
// ============================================
export interface PersonalResponse {
  knowsApplicantHow: string;
  knowsApplicantDuration: string;
  characterReliability: string;
  comments: string;
}

export interface LivingHistoryResponse {
  tenancyDuration: string;
  rentPaidOnTime: string;
  propertyCondition: string;
  noticePeriod: string;
  wouldReRent: string;
  comments: string;
}

export interface FinancialResponse {
  employmentStatus: string;
  employmentDuration: string;
  incomeRange: string;
  comments: string;
}

// ============================================
// The args object inside response_data
// ============================================
export interface ReferenceResponseArgs {
  status: string;
  refereeName: string;
  referenceType: string;
  refereeRelationship: string;
  consentGiven: boolean;
  recordingConsent: boolean;
  redFlags: string | null;
  applicationId: string;
  callDurationSeconds: number;
  additionalComments: string | null;
  personalResponse: PersonalResponse | null;
  livingHistoryResponse: LivingHistoryResponse | null;
  financialResponse: FinancialResponse | null;
  // Deferred-specific
  preferredDate?: string | null;
  preferredPhone?: string | null;
  preferredTimeWindow?: string | null;
  notes?: string;
}

// ============================================
// Transcript entry from Retell
// ============================================
export interface TranscriptEntry {
  role: "agent" | "user" | "tool_call_invocation";
  content: string;
  name?: string; // tool call name
  type?: string;
  time_sec?: number;
  arguments?: string;
  metadata?: { response_id?: number };
}

// ============================================
// The call object inside response_data
// ============================================
export interface ReferenceCallData {
  call_id: string;
  call_type: string;
  direction: string;
  to_number: string;
  from_number: string;
  agent_name: string;
  agent_version: number;
  call_status: string;
  transcript: string;
  transcript_object: TranscriptEntry[];
  transcript_with_tool_calls: TranscriptEntry[];
  start_timestamp: number;
  call_cost?: {
    combined_cost: number;
    total_duration_seconds: number;
  };
}

// ============================================
// Full response_data shape
// ============================================
export interface ReferenceResponseData {
  args: ReferenceResponseArgs;
  call: ReferenceCallData;
  name: string; // tool call name e.g. "log_reference_response"
}

// ============================================
// Reference check DB row
// ============================================
export interface ReferenceCheckRow {
  id: string;
  reference_check_id: string;
  outbound_call_id: string;
  status: ReferenceStatus | string;
  reference_type: string;
  referee_name: string;
  response_data: ReferenceResponseData | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Composite: outbound call + linked reference check
// ============================================
export interface CallWithReference extends PennyOutboundCallRow {
  reference_check: ReferenceCheckRow | null;
}

// ============================================
// Helpers
// ============================================
export function formatCallDuration(seconds: number | undefined | null): string {
  if (!seconds || seconds <= 0) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function getReferenceStatusLabel(status: string | undefined | null): string {
  if (!status) return "No reference";
  const labels: Record<string, string> = {
    complete: "Reference complete",
    deferred: "Callback requested",
    declined: "Declined",
    no_answer: "No answer",
    pending: "Pending",
  };
  return labels[status] ?? status;
}
