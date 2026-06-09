"use client";

/**
 * use-copilot — the WebSocket client for PM Copilot.
 *
 * Owns the connection to the Claude leasing backend, the frame→state mapping, the
 * durable-turn reconnect replay, and the helpers the UI calls to send messages,
 * upload attachments, and poll for backend events.
 *
 * Lifecycle discipline mirrors lib/hooks/use-realtime-channel.ts: one managed socket
 * per session, guarded against StrictMode double-mounts, with cleanup + backoff.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  activityLabel,
  chatSocketUrl,
  fetchHistory,
  fetchNotifications,
  friendlyError,
  uploadFile,
  WS_SUBPROTOCOL,
  type UploadResult,
} from "@/lib/copilot/config";
import type {
  ChatMessage,
  ConnectionStatus,
  DownloadChip,
  WireFrame,
} from "@/lib/copilot/types";

const RECONNECT_MS = 1500;
const POLL_MS = 4000;

export interface SendOptions {
  showUser?: boolean;
  attachmentName?: string;
  attachmentKind?: "image" | "file";
}

export interface UseCopilot {
  messages: ChatMessage[];
  status: ConnectionStatus;
  busy: boolean;
  activity: string | null;
  /** Ordered tool/progress steps for the current turn (last item = current step). */
  activitySteps: string[];
  downloads: DownloadChip[];
  loadingHistory: boolean;
  /** Send a typed message (shows a user bubble). */
  sendMessage: (text: string) => void;
  /** Send a message accompanied by an already-uploaded attachment. */
  sendWithAttachment: (text: string, attachment: UploadResult) => void;
  /** Upload a file to the backend; returns the stored reference. */
  upload: (file: File, onProgress?: (pct: number) => void) => Promise<UploadResult>;
}

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

export function useCopilot(sessionId: string | null): UseCopilot {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState<string | null>(null);
  const [activitySteps, setActivitySteps] = useState<string[]>([]);
  const [downloads, setDownloads] = useState<DownloadChip[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const currentBubbleId = useRef<string | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedByUs = useRef(false);
  const busyRef = useRef(false);
  // Backend updates (signing/void/etc.) that land while Claude is mid-reply wait here.
  const pendingNotes = useRef<string[]>([]);

  const setBusyBoth = useCallback((v: boolean) => {
    busyRef.current = v;
    setBusy(v);
  }, []);

  const offline = useCallback(() => {
    const ws = wsRef.current;
    return !ws || ws.readyState !== WebSocket.OPEN;
  }, []);

  const rawSend = useCallback(
    (text: string, opts: SendOptions = {}): boolean => {
      const ws = wsRef.current;
      if (!text || !ws || ws.readyState !== WebSocket.OPEN) return false;
      const { showUser = true, attachmentName, attachmentKind } = opts;
      if (showUser) {
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "user",
            content: text,
            attachmentName,
            attachmentKind,
            createdAt: Date.now(),
          },
        ]);
      }
      currentBubbleId.current = null;
      setBusyBoth(true);
      setActivity("Thinking…");
      setActivitySteps(["Thinking…"]);
      ws.send(JSON.stringify({ kind: "user_message", text }));
      return true;
    },
    [setBusyBoth],
  );

  // Send any queued updates the moment Claude is idle + connected. Coalesces a
  // burst of events into one turn so a long reply never drops a signing event.
  const flushPending = useCallback(() => {
    if (busyRef.current || offline() || !pendingNotes.current.length) return;
    const batch = pendingNotes.current;
    pendingNotes.current = [];
    const text =
      batch.length === 1
        ? batch[0]
        : "A few updates came in:\n" + batch.map((m) => `- ${m}`).join("\n");
    rawSend(text, { showUser: false });
  }, [offline, rawSend]);

  // ── Frame handling ───────────────────────────────────────────────────────────
  const handleFrame = useCallback(
    (frame: WireFrame) => {
      switch (frame.kind) {
        case "bubble_start":
          setBusyBoth(true);
          currentBubbleId.current = null;
          break;

        case "chunk": {
          setBusyBoth(true);
          setActivity(null);
          const text = frame.text ?? "";
          let id = currentBubbleId.current;
          if (!id) {
            id = newId();
            currentBubbleId.current = id;
            const bubbleId = id;
            setMessages((prev) => [
              ...prev,
              { id: bubbleId, role: "assistant", content: text, streaming: true, createdAt: Date.now() },
            ]);
          } else {
            const bubbleId = id;
            setMessages((prev) =>
              prev.map((m) => (m.id === bubbleId ? { ...m, content: text, streaming: true } : m)),
            );
          }
          break;
        }

        case "bubble_break": {
          const id = currentBubbleId.current;
          if (id) setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, streaming: false } : m)));
          currentBubbleId.current = null;
          break;
        }

        case "activity":
        case "subagent_activity": {
          setBusyBoth(true);
          const label = activityLabel(frame.label);
          setActivity(label);
          setActivitySteps((prev) => (prev[prev.length - 1] === label ? prev : [...prev, label]));
          currentBubbleId.current = null;
          break;
        }

        case "download_chip":
          if (frame.url && frame.filename) {
            setDownloads((prev) => [
              ...prev,
              {
                id: newId(),
                filename: frame.filename as string,
                url: frame.url as string,
                sizeBytes: frame.size_bytes,
              },
            ]);
          }
          break;

        case "done":
          setBusyBoth(false);
          setActivity(null);
          setActivitySteps([]);
          setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)));
          currentBubbleId.current = null;
          flushPending(); // send anything that queued up while this turn was running
          break;

        case "error":
          setBusyBoth(false);
          setActivity(null);
          setActivitySteps([]);
          setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)));
          currentBubbleId.current = null;
          toast.error(friendlyError(frame.message));
          break;
      }
    },
    [setBusyBoth, flushPending],
  );

  // ── Connection (history → socket, with reconnect) ──────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    closedByUs.current = false;
    let cancelled = false;

    // Switching sessions: clear the previous conversation's state immediately so
    // nothing bleeds across, then load the new session's history below.
    setMessages([]);
    setDownloads([]);
    setActivity(null);
    setActivitySteps([]);
    setBusyBoth(false);
    currentBubbleId.current = null;
    pendingNotes.current = [];

    const connect = () => {
      if (cancelled) return;
      let ws: WebSocket;
      try {
        ws = new WebSocket(chatSocketUrl(sessionId), [WS_SUBPROTOCOL]);
      } catch {
        setStatus("offline");
        reconnectTimer.current = setTimeout(connect, RECONNECT_MS);
        return;
      }
      wsRef.current = ws;
      setStatus("connecting");

      ws.onopen = () => {
        setStatus("connected");
        // Durable replay: drop any un-finalised streaming bubble so the backend's
        // replay of the in-progress turn rebuilds it cleanly (no duplicates).
        currentBubbleId.current = null;
        setMessages((prev) => prev.filter((m) => !(m.role === "assistant" && m.streaming)));
      };
      ws.onmessage = (ev) => {
        let frame: WireFrame;
        try {
          frame = JSON.parse(ev.data) as WireFrame;
        } catch {
          return;
        }
        handleFrame(frame);
      };
      ws.onerror = () => setStatus("offline");
      ws.onclose = () => {
        if (closedByUs.current || cancelled) return;
        setStatus("offline");
        reconnectTimer.current = setTimeout(connect, RECONNECT_MS);
      };
    };

    (async () => {
      setLoadingHistory(true);
      try {
        const history = await fetchHistory(sessionId);
        if (!cancelled) setMessages(history);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
      connect();
    })();

    return () => {
      cancelled = true;
      closedByUs.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      const ws = wsRef.current;
      wsRef.current = null;
      if (ws) {
        ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
        try {
          ws.close();
        } catch {
          /* ignore */
        }
      }
    };
  }, [sessionId, handleFrame, setBusyBoth]);

  // ── Notification poll (form submitted / signing updates) ───────────────────────
  useEffect(() => {
    if (!sessionId) return;
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      const notes = await fetchNotifications(sessionId);
      if (stopped || !notes.length) return;
      for (const n of notes) {
        toast.info(n.message.split(".")[0]);
        pendingNotes.current.push(n.message);
      }
      // Sends immediately if Claude is idle; otherwise stays queued and the next
      // `done` (or the next poll once idle) flushes it.
      flushPending();
    };
    const id = setInterval(tick, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(id);
    };
    // flushPending is stable (useCallback); intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ── Senders ────────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t || busyRef.current) return;
      if (offline()) {
        toast.error("Not connected right now — reconnecting. Please try again in a moment.");
        return;
      }
      rawSend(t);
    },
    [offline, rawSend],
  );

  const sendWithAttachment = useCallback(
    (text: string, attachment: UploadResult) => {
      if (busyRef.current) return;
      if (offline()) {
        toast.error("Not connected right now — reconnecting. Please try again in a moment.");
        return;
      }
      const typed = text.trim();
      const isImg = attachment.kind === "image";
      // Show a user bubble with the filename, then send the (hidden) context message.
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "user",
          content: typed,
          attachmentName: attachment.name,
          attachmentKind: attachment.kind,
          createdAt: Date.now(),
        },
      ]);
      const ctx = `[Attached ${isImg ? "image" : "PDF"}: ${attachment.name} at ${attachment.path}]\n`;
      const body =
        typed ||
        (isImg
          ? "Please look at this screenshot and tell me what you see / help me with it."
          : "Please analyse the attached document and suggest what we can do with it.");
      rawSend(ctx + body, { showUser: false });
    },
    [offline, rawSend],
  );

  const upload = useCallback(
    (file: File, onProgress?: (pct: number) => void) => uploadFile(file, sessionId ?? "", onProgress),
    [sessionId],
  );

  return {
    messages,
    status,
    busy,
    activity,
    activitySteps,
    downloads,
    loadingHistory,
    sendMessage,
    sendWithAttachment,
    upload,
  };
}
