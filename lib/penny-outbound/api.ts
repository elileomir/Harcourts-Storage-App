/**
 * Penny Outbound — client-side API helpers
 *
 * Thin wrappers around fetch() to /api/penny-outbound/* — keeps the form/list
 * pages free of fetch boilerplate and gives us one place to evolve the contract.
 */

import type { PennyOutboundFormData } from "./types";

export interface SubmitResponse {
  success: boolean;
  callId?: string;
  retellCallId?: string;
  accessToken?: string; // web mode only
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface RecallResponse {
  success: boolean;
  callId?: string;
  retellCallId?: string;
  accessToken?: string;
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  error?: string;
}

export async function submitPennyOutbound(
  formData: PennyOutboundFormData
): Promise<SubmitResponse> {
  try {
    const res = await fetch("/api/penny-outbound/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    });
    const data = (await res.json()) as SubmitResponse;
    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Request failed (${res.status})`,
        fieldErrors: data.fieldErrors,
      };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

export async function recallPennyOutbound(
  id: string
): Promise<RecallResponse> {
  try {
    const res = await fetch("/api/penny-outbound/recall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = (await res.json()) as RecallResponse;
    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Recall failed (${res.status})`,
      };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

export async function deletePennyOutbound(id: string): Promise<DeleteResponse> {
  try {
    const res = await fetch(
      `/api/penny-outbound/delete?id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
    const data = (await res.json()) as DeleteResponse;
    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Delete failed (${res.status})`,
      };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
