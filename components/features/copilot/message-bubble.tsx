"use client";

import { useMemo } from "react";
import { FileText, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { cleanUserText, parseAssistantContent } from "@/lib/copilot/markdown";
import type { ChatMessage } from "@/lib/copilot/types";
import { InChatForm } from "./in-chat-form";
import { ChoiceCards } from "./choice-cards";
import { PendingForm } from "./pending-form";

interface MessageBubbleProps {
  message: ChatMessage;
  onSend: (text: string) => void;
  /** The user reply that follows this assistant message (locks its widgets in history). */
  answer?: string;
}

// Scoped markdown styling — keeps the prose on-brand without a global stylesheet.
const MD_CLASS = cn(
  "text-[15px] leading-relaxed text-[#001F49]",
  "[&>:first-child]:mt-0 [&>:last-child]:mb-0",
  "[&_p]:my-2",
  "[&_h2]:mb-1.5 [&_h2]:mt-3 [&_h2]:text-[1.12em] [&_h2]:font-semibold",
  "[&_h3]:mb-1 [&_h3]:mt-2.5 [&_h3]:text-[1.05em] [&_h3]:font-semibold",
  "[&_h4]:mb-1 [&_h4]:mt-2 [&_h4]:font-semibold",
  "[&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5",
  "[&_a]:font-semibold [&_a]:text-[#00ADEF] [&_a]:underline",
  "[&_strong]:font-semibold",
  "[&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px]",
  "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[#001F49] [&_pre]:p-3 [&_pre]:text-slate-100",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-100",
  "[&_table]:my-2 [&_table]:w-full [&_table]:border-collapse",
  "[&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left",
  "[&_td]:border [&_td]:border-slate-200 [&_td]:px-2.5 [&_td]:py-1.5",
);

export function MessageBubble({ message, onSend, answer }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const segments = useMemo(
    () => (isUser ? [] : parseAssistantContent(message.content)),
    [isUser, message.content],
  );

  if (isUser) {
    const text = cleanUserText(message.content);
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] space-y-1.5 rounded-2xl rounded-br-sm bg-[#001F49] px-4 py-2.5 text-[15px] text-white shadow-sm">
          {message.attachmentName && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-sky-200">
              {message.attachmentKind === "image" ? (
                <ImageIcon className="h-4 w-4" aria-hidden />
              ) : (
                <FileText className="h-4 w-4" aria-hidden />
              )}
              {message.attachmentName}
            </span>
          )}
          {text && <span className="whitespace-pre-wrap break-words">{text}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-slate-100 bg-white px-4 py-3 shadow-sm">
        {segments.map((seg, i) => {
          if (seg.type === "markdown") {
            return (
              <div key={i} className={MD_CLASS} dangerouslySetInnerHTML={{ __html: seg.html }} />
            );
          }
          if (seg.type === "form") {
            return <InChatForm key={i} spec={seg.spec} onSubmit={onSend} answer={answer} />;
          }
          if (seg.type === "pending") {
            if (seg.widget === "ask") {
              return (
                <div
                  key={i}
                  role="status"
                  aria-live="polite"
                  className="mt-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm font-medium text-slate-500"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-[#00ADEF] motion-reduce:animate-none" aria-hidden />
                  Thinking through your options…
                </div>
              );
            }
            return <PendingForm key={i} partial={seg.partial} mode={seg.widget} />;
          }
          return <ChoiceCards key={i} questions={seg.questions} onSubmit={onSend} answer={answer} />;
        })}
      </div>
    </div>
  );
}
