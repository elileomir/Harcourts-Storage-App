/**
 * Penny Storage Outbound — client-side API
 *
 * Sends the form data to the server API route which calls Retell.
 * NEVER import retell.ts from client-side code.
 */

import type { StorageOutboundFormData } from "./types";
import type { FieldErrors } from "./validation";

export interface SubmitResult {
  success: boolean;
  retellCallId?: string;
  error?: string;
  fieldErrors?: FieldErrors;
}

export async function submitStorageOutbound(
  formData: StorageOutboundFormData
): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/penny-storage-outbound/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Request failed (${res.status})`,
        fieldErrors: data.fieldErrors,
      };
    }

    return {
      success: true,
      retellCallId: data.retellCallId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
