"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { useCopilot } from "@/hooks/use-copilot";
import { useSessions } from "@/hooks/use-sessions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { SessionSidebar } from "./session-sidebar";

/**
 * PM Copilot chat surface. Each signed-in user has their own set of conversations
 * (namespaced session ids); the sidebar lists them and lets staff switch, rename,
 * create, and delete. The active session drives the live Claude connection.
 */
export function ChatPanel() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const { sessions, currentId, loading: sessionsLoading, select, createNew, rename, remove, refresh } =
    useSessions(userId);

  const {
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
  } = useCopilot(currentId);

  const [draft, setDraft] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const connected = status === "connected";

  // Refresh the session list when a turn finishes — picks up a brand-new chat's
  // first title/preview and updated message counts.
  const prevBusy = useRef(false);
  useEffect(() => {
    if (prevBusy.current && !busy) void refresh();
    prevBusy.current = busy;
  }, [busy, refresh]);

  const handleSelect = (id: string) => {
    select(id);
    setDrawerOpen(false);
  };
  const handleNew = () => {
    createNew();
    setDrawerOpen(false);
  };

  return (
    <div className="flex h-[calc(100dvh-13rem)] min-h-[420px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-900/5">
      {/* Sessions sidebar — desktop column */}
      <SessionSidebar
        className="hidden md:flex"
        sessions={sessions}
        currentId={currentId}
        loading={sessionsLoading}
        onSelect={handleSelect}
        onNew={handleNew}
        onRename={rename}
        onDelete={remove}
      />

      {/* Sessions sidebar — mobile drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Your chats</SheetTitle>
          </SheetHeader>
          <SessionSidebar
            className="flex w-full border-r-0"
            sessions={sessions}
            currentId={currentId}
            loading={sessionsLoading}
            onSelect={handleSelect}
            onNew={handleNew}
            onRename={rename}
            onDelete={remove}
          />
        </SheetContent>
      </Sheet>

      {/* Chat column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open chats"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <div>
              <h1 className="text-base font-semibold text-[#001F49]">PM Copilot</h1>
              <p className="text-xs text-slate-500">Your leasing assistant</p>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
              connected ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600",
            )}
            role="status"
            aria-live="polite"
          >
            {connected ? <Wifi className="h-3.5 w-3.5" aria-hidden /> : <WifiOff className="h-3.5 w-3.5" aria-hidden />}
            {status === "connected" ? "Connected" : status === "connecting" ? "Connecting…" : "Reconnecting…"}
          </span>
        </div>

        <MessageList
          messages={messages}
          busy={busy}
          activity={activity}
          activitySteps={activitySteps}
          downloads={downloads}
          loadingHistory={loadingHistory}
          onSend={sendMessage}
          onStarter={(text) => setDraft(text)}
        />

        <ChatInput
          draft={draft}
          onDraftChange={setDraft}
          busy={busy}
          connected={connected}
          onSend={sendMessage}
          onSendWithAttachment={sendWithAttachment}
          upload={upload}
        />
      </div>
    </div>
  );
}
