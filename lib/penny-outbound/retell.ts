/**
 * Penny Outbound — Retell API client (SERVER-ONLY)
 *
 * NEVER import this module from a "use client" file. The Retell API key is
 * read from process.env at call time and must never reach the browser bundle.
 *
 * Reference: https://docs.retellai.com/api-references/create-phone-call
 *            https://docs.retellai.com/api-references/create-web-call
 */

import "server-only";
import type { RetellDynamicVariables } from "./types";

const RETELL_BASE = "https://api.retellai.com";

export interface RetellEnv {
  apiKey: string;
  agentId: string;
  fromNumber?: string; // required for phone calls only
}

export interface RetellPhoneCallResult {
  call_id: string;
  call_status?: string;
  agent_id?: string;
  from_number?: string;
  to_number?: string;
  // Retell may include more fields — we don't depend on them.
  [key: string]: unknown;
}

export interface RetellWebCallResult {
  call_id: string;
  access_token?: string;
  call_status?: string;
  agent_id?: string;
  [key: string]: unknown;
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
 * Read Retell credentials from env. Returns null if any required var is missing.
 * Caller decides what to do (typically: mark the audit row as failed and 500).
 */
export function readRetellEnv(): RetellEnv | null {
  const apiKey = process.env.RETELL_API_KEY?.trim();
  const agentId = process.env.RETELL_AGENT_ID?.trim();
  const fromNumber = process.env.RETELL_FROM_NUMBER?.trim();
  if (!apiKey || !agentId) return null;
  return { apiKey, agentId, fromNumber };
}

interface CreatePhoneCallArgs {
  env: RetellEnv;
  toNumber: string;
  dynamicVariables: RetellDynamicVariables;
}

export async function createPhoneCall({
  env,
  toNumber,
  dynamicVariables,
}: CreatePhoneCallArgs): Promise<RetellPhoneCallResult> {
  if (!env.fromNumber) {
    throw new RetellApiError(
      0,
      "RETELL_FROM_NUMBER not set",
      "RETELL_FROM_NUMBER is required for phone calls"
    );
  }

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
    // Server-side fetch — no caching for outbound side-effect calls.
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new RetellApiError(res.status, text);
  }

  let data: RetellPhoneCallResult;
  try {
    data = JSON.parse(text) as RetellPhoneCallResult;
  } catch {
    throw new RetellApiError(res.status, text, "Retell returned non-JSON response");
  }

  if (!data.call_id) {
    throw new RetellApiError(res.status, text, "Retell response missing call_id");
  }
  return data;
}

interface CreateWebCallArgs {
  env: RetellEnv;
  dynamicVariables: RetellDynamicVariables;
}

export async function createWebCall({
  env,
  dynamicVariables,
}: CreateWebCallArgs): Promise<RetellWebCallResult> {
  const res = await fetch(`${RETELL_BASE}/v2/create-web-call`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agent_id: env.agentId,
      retell_llm_dynamic_variables: dynamicVariables,
    }),
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new RetellApiError(res.status, text);
  }

  let data: RetellWebCallResult;
  try {
    data = JSON.parse(text) as RetellWebCallResult;
  } catch {
    throw new RetellApiError(res.status, text, "Retell returned non-JSON response");
  }

  if (!data.call_id) {
    throw new RetellApiError(res.status, text, "Retell response missing call_id");
  }
  return data;
}
