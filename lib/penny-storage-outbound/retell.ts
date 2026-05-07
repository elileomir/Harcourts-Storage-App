/**
 * Penny Storage Outbound — Retell API client (SERVER-ONLY)
 *
 * Uses RETELL_STORAGE_AGENT_ID instead of RETELL_AGENT_ID.
 * Shares RETELL_API_KEY and RETELL_FROM_NUMBER with the reference outbound.
 *
 * NEVER import this module from a "use client" file.
 */

import "server-only";
import type { StorageRetellDynamicVariables } from "./types";

const RETELL_BASE = "https://api.retellai.com";

export interface StorageRetellEnv {
  apiKey: string;
  agentId: string;
  fromNumber: string;
}

export class RetellApiError extends Error {
  constructor(
    public status: number,
    public bodyText: string,
    message?: string
  ) {
    super(message ?? `Retell API error ${status}: ${bodyText.slice(0, 300)}`);
    this.name = "RetellApiError";
  }
}

/**
 * Read storage-specific Retell credentials from env.
 * Returns null if any required var is missing.
 */
export function readStorageRetellEnv(): StorageRetellEnv | null {
  const apiKey = process.env.RETELL_API_KEY?.trim();
  const agentId = process.env.RETELL_STORAGE_AGENT_ID?.trim();
  const fromNumber = process.env.RETELL_FROM_NUMBER?.trim();

  if (!apiKey || !agentId || !fromNumber) return null;
  return { apiKey, agentId, fromNumber };
}

interface CreateStorageCallArgs {
  env: StorageRetellEnv;
  toNumber: string;
  dynamicVariables: StorageRetellDynamicVariables;
}

export interface RetellCallResult {
  call_id: string;
  call_status?: string;
  [key: string]: unknown;
}

export async function createStoragePhoneCall({
  env,
  toNumber,
  dynamicVariables,
}: CreateStorageCallArgs): Promise<RetellCallResult> {
  const res = await fetch(`${RETELL_BASE}/v2/create-phone-call`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from_number: env.fromNumber,
      to_number: toNumber,
      override_agent_id: env.agentId,
      retell_llm_dynamic_variables: dynamicVariables,
    }),
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new RetellApiError(res.status, text);
  }

  let data: RetellCallResult;
  try {
    data = JSON.parse(text) as RetellCallResult;
  } catch {
    throw new RetellApiError(res.status, text, "Retell returned non-JSON response");
  }

  if (!data.call_id) {
    throw new RetellApiError(res.status, text, "Retell response missing call_id");
  }
  return data;
}
