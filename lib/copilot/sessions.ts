/**
 * PM Copilot — session history data layer.
 *
 * Thin REST wrappers over the backend's /api/sessions endpoints. Titles are
 * cleaned up here (attachment envelopes / icon prefixes stripped) so the UI
 * can render them verbatim.
 */

import { apiBase, PERSONA } from "@/lib/copilot/config";

export interface CopilotSession {
  id: string;
  title: string;
  lastAt: string;
  msgCount: number;
}

interface RawSession {
  id: string;
  title: string | null;
  preview: string | null;
  created_at: string;
  last_at: string;
  msg_count: number;
}

const ATTACHMENT_ENVELOPE_RE = /^\[Attached (PDF|image|document):[^\]]*\]\s*/i;
const ICON_PREFIX_RE = /^(📎|🖼)\s*/;

function cleanTitle(raw: RawSession): string {
  let title = raw.title || raw.preview || "";
  title = title.replace(ATTACHMENT_ENVELOPE_RE, "");
  title = title.replace(ICON_PREFIX_RE, "");
  title = title.trim().slice(0, 48);
  return title || "New chat";
}

/** Fetch the full session list for this persona. Returns [] on any non-ok response. */
export async function fetchSessions(): Promise<CopilotSession[]> {
  const res = await fetch(
    `${apiBase()}/api/sessions?persona_slug=${encodeURIComponent(PERSONA)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return [];
  const rows = (await res.json()) as RawSession[];
  return rows.map((raw) => ({
    id: raw.id,
    title: cleanTitle(raw),
    lastAt: raw.last_at || raw.created_at,
    msgCount: raw.msg_count ?? 0,
  }));
}

/** Rename a session. Throws on a non-ok response. */
export async function renameSession(id: string, title: string): Promise<void> {
  const res = await fetch(`${apiBase()}/api/sessions/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Failed to rename session (${res.status})`);
}

/** Delete a session. Throws on a non-ok response. */
export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`${apiBase()}/api/sessions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete session (${res.status})`);
}
