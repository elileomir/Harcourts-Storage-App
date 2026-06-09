"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Paperclip, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadResult } from "@/lib/copilot/config";

interface ChatInputProps {
  draft: string;
  onDraftChange: (value: string) => void;
  busy: boolean;
  connected: boolean;
  /** Send typed text (no attachment). */
  onSend: (text: string) => void;
  /** Send text with an already-uploaded attachment. */
  onSendWithAttachment: (text: string, attachment: UploadResult) => void;
  /** Upload a file, reporting progress. */
  upload: (file: File, onProgress?: (pct: number) => void) => Promise<UploadResult>;
}

const ACCEPT = ".pdf,.docx,.png,.jpg,.jpeg,.gif,.webp,.heic,image/*";

export function ChatInput({
  draft,
  onDraftChange,
  busy,
  connected,
  onSend,
  onSendWithAttachment,
  upload,
}: ChatInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [attachment, setAttachment] = useState<UploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-grow the textarea up to a cap.
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, [draft]);

  const doUpload = useCallback(
    async (file: File) => {
      if (busy || uploading) return;
      setUploading(true);
      setProgress(0);
      try {
        const result = await upload(file, setProgress);
        setAttachment(result);
        textRef.current?.focus();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't upload that file.");
      } finally {
        setUploading(false);
      }
    },
    [busy, uploading, upload],
  );

  const handleSend = useCallback(() => {
    if (busy || uploading) return;
    const typed = draft.trim();
    if (attachment) {
      onSendWithAttachment(typed, attachment);
      setAttachment(null);
      onDraftChange("");
      return;
    }
    if (!typed) return;
    onSend(typed);
    onDraftChange("");
  }, [attachment, busy, draft, onDraftChange, onSend, onSendWithAttachment, uploading]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    for (const item of Array.from(e.clipboardData?.items ?? [])) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          e.preventDefault();
          const ext = (item.type.split("/")[1] || "png").replace("jpeg", "jpg");
          void doUpload(new File([blob], `pasted-${Date.now()}.${ext}`, { type: item.type }));
          return;
        }
      }
    }
  };

  const canSend = !busy && !uploading && connected && (!!draft.trim() || !!attachment);

  return (
    <div className="border-t border-slate-100 bg-white px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-2">
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void doUpload(f);
            e.target.value = "";
          }}
        />

        {(attachment || uploading) && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <Paperclip className="h-4 w-4 flex-shrink-0 text-[#00ADEF]" aria-hidden />
            <span className="min-w-0 flex-1 truncate font-medium text-[#001F49]">
              {attachment?.name ?? "Uploading…"}
            </span>
            {uploading ? (
              <span className="text-xs text-slate-500">{progress}%</span>
            ) : (
              <button
                type="button"
                onClick={() => setAttachment(null)}
                aria-label="Remove attachment"
                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-[#001F49]"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy || uploading}
            aria-label="Attach a file"
            title="Attach a PDF or image — you can also paste a screenshot"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[#001F49] transition hover:bg-slate-100 disabled:opacity-50"
          >
            <Paperclip className="h-5 w-5" aria-hidden />
          </button>

          <textarea
            ref={textRef}
            rows={1}
            value={draft}
            disabled={busy}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            placeholder="Message PM Copilot…  (Enter to send, Shift+Enter for a new line)"
            aria-label="Message PM Copilot"
            className="max-h-[150px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] text-[#001F49] outline-none transition focus:border-[#00ADEF] focus:ring-2 focus:ring-[#00ADEF]/20 disabled:opacity-60 placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white transition",
              canSend ? "bg-[#00ADEF] hover:brightness-105" : "bg-slate-300",
            )}
          >
            <Send className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
