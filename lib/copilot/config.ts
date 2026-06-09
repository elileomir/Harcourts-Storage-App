/**
 * PM Copilot — backend URL resolution, REST helpers, and label/error humanisers.
 *
 * The backend URL comes from env (local dev mac now, neo tunnel in prod). We keep
 * the persona fixed to the leasing assistant.
 */

import type { ChatMessage } from "@/lib/copilot/types";

export const PERSONA = "harcourts-pm";
export const WS_SUBPROTOCOL = "harcourts-pm.v1";

// 127.0.0.1, not "localhost": the backend binds IPv4-only and macOS resolves
// "localhost" to IPv6 ::1 first, which the browser WebSocket can't fall back from.
const DEFAULT_API = "http://127.0.0.1:8787";

/** HTTP base for REST + uploads, e.g. https://pm.iautomatedev.com */
export function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_CLAUDE_API_URL?.trim();
  return (raw || DEFAULT_API).replace(/\/+$/, "");
}

/**
 * WebSocket base. Prefer an explicit NEXT_PUBLIC_CLAUDE_WS_URL; otherwise derive
 * from the API base by swapping the scheme (http→ws, https→wss).
 */
export function wsBase(): string {
  const explicit = process.env.NEXT_PUBLIC_CLAUDE_WS_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  return apiBase().replace(/^http/, "ws");
}

export function chatSocketUrl(sessionId: string): string {
  const params = new URLSearchParams({ session_id: sessionId, persona: PERSONA });
  return `${wsBase()}/ws/chat?${params.toString()}`;
}

// ── REST ──────────────────────────────────────────────────────────────────────

interface RawMessage {
  id: number;
  role: string;
  content: string;
  created_at?: string;
}

/** Load a session's saved history so a refresh keeps the conversation. */
export async function fetchHistory(sessionId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${apiBase()}/api/sessions/${encodeURIComponent(sessionId)}/messages`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const rows = (await res.json()) as RawMessage[];
  return rows
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m, i) => ({
      id: `hist-${m.id ?? i}`,
      role: m.role as ChatMessage["role"],
      content: m.content ?? "",
      createdAt: m.created_at ? Date.parse(m.created_at.replace(" ", "T") + "Z") || 0 : 0,
    }));
}

export interface UploadResult {
  name: string;
  path: string;
  kind: "image" | "file";
}

const IMAGE_RE = /\.(png|jpe?g|gif|webp|heic)$/i;
export const isImageName = (n: string): boolean => IMAGE_RE.test(n || "");

/** Upload a file to the backend; returns the stored path used in the message context. */
export async function uploadFile(
  file: File,
  sessionId: string,
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  return new Promise<UploadResult>((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("session_id", sessionId);
    fd.append("persona", PERSONA);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiBase()}/api/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let body: { name?: string; path?: string; detail?: string } = {};
      try {
        body = JSON.parse(xhr.responseText || "{}");
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        const name = body.name || file.name;
        resolve({ name, path: body.path || "", kind: isImageName(name) ? "image" : "file" });
      } else if (xhr.status === 413) {
        reject(new Error("That file's too large — the limit is 25 MB."));
      } else {
        reject(new Error(body.detail || "Couldn't upload that file. Please try again."));
      }
    };
    xhr.onerror = () => reject(new Error("Couldn't upload — connection problem. Please try again."));
    xhr.send(fd);
  });
}

export interface Notification {
  message: string;
}

/** Poll for backend-pushed events (e.g. a form was submitted, signing completed). */
export async function fetchNotifications(sessionId: string): Promise<Notification[]> {
  try {
    const res = await fetch(
      `${apiBase()}/api/notifications?session=${encodeURIComponent(sessionId)}`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return [];
    const j = (await res.json()) as { notifications?: Notification[] };
    return j.notifications ?? [];
  } catch {
    return [];
  }
}

// ── Humanisers (no jargon — staff are non-technical) ───────────────────────────

/** Map a raw tool/action label into something a property manager understands. */
export function activityLabel(raw?: string): string {
  const x = (raw || "").toLowerCase();
  if (x.includes("docusign-list-templates")) return "Looking up agreement templates…";
  if (x.includes("docusign-create-form")) return "Building the web form…";
  if (x.includes("create_from_pdf") || x.includes("docusign-create-lease"))
    return "Preparing the agreement…";
  if (x.includes("docusign-send-draft")) return "Sending for signing…";
  if (x.includes("docusign-envelope-status")) return "Checking signing status…";
  if (x.includes("vaultre")) return "Fetching the property details…";
  if (x === "read" || x.includes("read")) return "Reading the document…";
  if (x === "bash" || x === "") return "Working on it…";
  return "Working on it…";
}

/** Turn a raw backend error into something calm and actionable. */
export function friendlyError(message?: string): string {
  const m = (message || "").toString();
  if (/timeout|timed out/i.test(m)) return "That took too long to respond. Please try again.";
  if (/connect|network|unreachable/i.test(m))
    return "I couldn't reach the service just now. Please try again in a moment.";
  return "Something went wrong on my end — please try again.";
}
