/**
 * PM Copilot — shared types.
 *
 * Mirrors the backend frame contract (harcourts-docusign: backend/app/live.py,
 * frontend/ws.ts). The browser talks to the Claude leasing backend over a single
 * WebSocket; the backend streams "frames" that this client turns into chat state.
 */

export type FrameKind =
  | "bubble_start"
  | "chunk"
  | "bubble_break"
  | "activity"
  | "subagent_activity"
  | "download_chip"
  | "done"
  | "error";

/** A single server→client frame. Fields are optional per the kind. */
export interface WireFrame {
  kind: FrameKind;
  bubble_id?: string;
  /** For `chunk`: the FULL accumulated bubble text so far (replace, not append). */
  text?: string;
  /** For `activity`/`subagent_activity`: a raw tool/action label. */
  label?: string;
  tool_id?: string;
  /** For `download_chip`. */
  filename?: string;
  url?: string;
  size_bytes?: number;
  /** For `done`. */
  total_tokens?: number;
  cost_usd?: number;
  ms?: number;
  /** For `error`. */
  message?: string;
}

export type ChatRole = "user" | "assistant";

/** A rendered chat message held in client state. */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  /** Raw assistant markdown (incl. ```form / <AskUserQuestion> widgets) or user text. */
  content: string;
  /** True while the assistant bubble is still streaming. */
  streaming?: boolean;
  /** A pasted/attached file shown on a user bubble. */
  attachmentName?: string;
  attachmentKind?: "image" | "file";
  createdAt: number;
}

/** A download chip surfaced by the backend (e.g. a finished agreement PDF). */
export interface DownloadChip {
  id: string;
  filename: string;
  url: string;
  sizeBytes?: number;
}

export type ConnectionStatus = "connecting" | "connected" | "offline";

/** An uploaded attachment ready to send with the next message. */
export interface PendingAttachment {
  name: string;
  path: string;
  kind: "image" | "file";
}

// ── Smart-widget specs (parsed from assistant text) ───────────────────────────

export type FormFieldType =
  | "text"
  | "number"
  | "date"
  | "email"
  | "tel"
  | "select"
  | "radio"
  | "checkbox"
  | "textarea";

export interface FormFieldSpec {
  name?: string;
  label?: string;
  type?: FormFieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  default?: string;
}

export interface FormSpec {
  /** "form" or "checklist" — checklist defaults fields to checkboxes. */
  mode: "form" | "checklist";
  title?: string;
  intro?: string;
  submitLabel?: string;
  fields: FormFieldSpec[];
}

export interface ChoiceOption {
  label: string;
  description?: string;
}

export interface ChoiceQuestion {
  question: string;
  header: string;
  options: ChoiceOption[];
}

/** A parsed segment of assistant content: prose, an interactive widget, or a
 *  still-streaming widget being prepared (shown as an animated pill). */
export type ContentSegment =
  | { type: "markdown"; html: string }
  | { type: "form"; spec: FormSpec }
  | { type: "ask"; questions: ChoiceQuestion[] }
  | { type: "pending"; widget: "form" | "checklist" | "ask"; partial?: string };
