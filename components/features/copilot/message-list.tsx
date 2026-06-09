"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, Download, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage, DownloadChip } from "@/lib/copilot/types";
import { apiBase } from "@/lib/copilot/config";
import { MessageBubble } from "./message-bubble";
import { WorkingIndicator } from "./working-indicator";

interface MessageListProps {
  messages: ChatMessage[];
  busy: boolean;
  activity: string | null;
  activitySteps: string[];
  downloads: DownloadChip[];
  loadingHistory: boolean;
  onSend: (text: string) => void;
  onStarter: (text: string) => void;
}

const STARTERS = [
  "Help me set up a new tenancy — what do you need from me?",
  "What agreements are still waiting to be signed?",
  "I want to turn a document into a signable agreement.",
];

export function MessageList({
  messages,
  busy,
  activity,
  activitySteps,
  downloads,
  loadingHistory,
  onSend,
  onStarter,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showPill, setShowPill] = useState(false);

  const nearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 140;
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setShowPill(false);
  }, []);

  // Auto-stick to the bottom only if the reader is already there; otherwise nudge.
  // Deferred to a frame so we measure after the new content has painted.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (nearBottom()) {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
        setShowPill(false);
      } else {
        setShowPill(true);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [messages, activity, activitySteps, nearBottom]);

  const handleScroll = useCallback(() => {
    if (nearBottom()) setShowPill(false);
  }, [nearBottom]);

  const isEmpty = !loadingHistory && messages.length === 0;

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className="h-full overflow-y-auto px-4 py-5 sm:px-6"
      >
        {isEmpty ? (
          <div className="mx-auto mt-6 max-w-md text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#00ADEF]">
              <Sparkles className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-[#001F49]">PM Copilot</h2>
            <p className="mt-1 text-sm text-slate-500">
              I can turn a lease or form into a signable agreement, gather details with a shareable
              link, and track signing. Attach a file or pick a starting point.
            </p>
            <div className="mt-5 flex flex-col items-stretch gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStarter(s)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#001F49] transition hover:border-[#00ADEF] hover:bg-sky-50/60"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {messages.map((m, i) => {
              const next = messages[i + 1];
              const answer =
                m.role === "assistant" && next?.role === "user" ? next.content : undefined;
              return <MessageBubble key={m.id} message={m} onSend={onSend} answer={answer} />;
            })}

            {busy && (activitySteps.length > 0 || activity) && (
              <div className="mx-auto w-full max-w-3xl">
                <WorkingIndicator
                  steps={activitySteps.length ? activitySteps : activity ? [activity] : []}
                />
              </div>
            )}

            {downloads.length > 0 && (
              <div className="mx-auto flex w-full max-w-3xl flex-wrap gap-2">
                {downloads.map((d) => (
                  <a
                    key={d.id}
                    href={d.url.startsWith("http") ? d.url : `${apiBase()}${d.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#00ADEF]/30 bg-sky-50 px-3 py-2 text-sm font-semibold text-[#001F49] transition hover:bg-sky-100"
                  >
                    <Download className="h-4 w-4 text-[#00ADEF]" aria-hidden />
                    {d.filename}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={scrollToBottom}
        className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-[#001F49] px-4 py-2 text-xs font-semibold text-white shadow-lg transition",
          showPill ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ArrowDown className="h-3.5 w-3.5" aria-hidden />
        New messages
      </button>
    </div>
  );
}
