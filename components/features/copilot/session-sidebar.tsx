"use client";

import { useCallback, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export interface SessionSummary {
  id: string;
  title: string;
  lastAt: string;
  msgCount: number;
}

export interface SessionSidebarProps {
  sessions: SessionSummary[];
  currentId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

/** Format an ISO-ish timestamp into a short relative label. Returns "" if unparseable. */
export function formatRelativeTime(lastAt: string): string {
  const d = lastAt.includes("T")
    ? new Date(lastAt)
    : new Date(lastAt.replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return "";

  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface SessionRowProps {
  session: SessionSummary;
  active: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onRequestDelete: (id: string) => void;
}

function SessionRow({
  session,
  active,
  onSelect,
  onRename,
  onRequestDelete,
}: SessionRowProps): React.JSX.Element {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(session.title);

  const beginEdit = useCallback(() => {
    setValue(session.title);
    setEditing(true);
  }, [session.title]);

  const commit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== session.title) {
      onRename(session.id, trimmed);
    }
    setEditing(false);
  }, [value, session.id, session.title, onRename]);

  const cancel = useCallback(() => {
    setValue(session.title);
    setEditing(false);
  }, [session.title]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    },
    [commit, cancel],
  );

  const handleRowKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(session.id);
      }
    },
    [onSelect, session.id],
  );

  const relative = formatRelativeTime(session.lastAt);
  const subLine = relative
    ? `${relative} · ${session.msgCount} msgs`
    : `${session.msgCount} msgs`;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-1 rounded-xl pl-3 pr-1.5",
        active
          ? "bg-sky-50 text-[#001F49]"
          : "text-[#001F49] hover:bg-slate-50",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-[#00ADEF]"
        />
      )}

      {editing ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          aria-label="Rename chat"
          className="my-2 min-w-0 flex-1 rounded-md border border-[#00ADEF] bg-white px-2 py-1 text-sm text-[#001F49] outline-none focus:ring-2 focus:ring-[#00ADEF]/20"
        />
      ) : (
        <button
          type="button"
          aria-current={active ? "true" : undefined}
          onClick={() => onSelect(session.id)}
          onKeyDown={handleRowKeyDown}
          className="min-w-0 flex-1 py-2 text-left outline-none"
        >
          <span className="block truncate text-sm font-medium">
            {session.title || "Untitled chat"}
          </span>
          <span className="block truncate text-xs text-slate-500">
            {subLine}
          </span>
        </button>
      )}

      {!editing && (
        <div className="flex flex-shrink-0 items-center gap-0.5 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            aria-label="Rename chat"
            onClick={(e) => {
              e.stopPropagation();
              beginEdit();
            }}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-[#001F49]"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Delete chat"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDelete(session.id);
            }}
            className="rounded-md p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

export function SessionSidebar({
  sessions,
  currentId,
  loading,
  onSelect,
  onNew,
  onRename,
  onDelete,
  className,
}: SessionSidebarProps): React.JSX.Element {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleConfirmDelete = useCallback(() => {
    if (pendingDeleteId) onDelete(pendingDeleteId);
    setPendingDeleteId(null);
  }, [pendingDeleteId, onDelete]);

  const showEmpty = sessions.length === 0 && !loading;
  const showLoading = loading && sessions.length === 0;

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col border-r border-slate-100 bg-white",
        className,
      )}
    >
      <div className="p-3">
        <Button
          type="button"
          onClick={onNew}
          className="w-full justify-start gap-2 bg-[#00ADEF] text-white hover:brightness-105"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {showLoading ? (
          <ul className="space-y-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <li
                key={i}
                className="animate-pulse rounded-xl px-3 py-2.5 motion-reduce:animate-none"
              >
                <div className="mb-2 h-3.5 w-3/4 rounded bg-slate-200" />
                <div className="h-2.5 w-1/2 rounded bg-slate-100" />
              </li>
            ))}
          </ul>
        ) : showEmpty ? (
          <p className="px-3 py-8 text-center text-sm text-slate-400">
            No chats yet — start a new one.
          </p>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                active={session.id === currentId}
                onSelect={onSelect}
                onRename={onRename}
                onRequestDelete={setPendingDeleteId}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete this chat?"
        description="This permanently removes the conversation and anything created in it. This can't be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
