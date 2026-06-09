"use client";

/**
 * PM Copilot — per-user session history hook.
 *
 * Sessions are namespaced by user (`${userId}__${uuid}`) so a single backend
 * (single-user during testing) cleanly isolates each signed-in PM. The current
 * session id is persisted to localStorage so a refresh resumes where you left off.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import {
  type CopilotSession,
  deleteSession,
  fetchSessions,
  renameSession,
} from "@/lib/copilot/sessions";

export interface UseSessions {
  sessions: CopilotSession[];
  currentId: string | null;
  loading: boolean;
  select: (id: string) => void;
  createNew: () => string;
  rename: (id: string, title: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

function storageKey(userId: string): string {
  return `pm-copilot.session.${userId}`;
}

export function useSessions(userId: string | null): UseSessions {
  const [sessions, setSessions] = useState<CopilotSession[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const cancelled = useRef<boolean>(false);

  const refresh = useCallback(async (): Promise<void> => {
    if (!userId) {
      if (!cancelled.current) setSessions([]);
      return;
    }
    if (!cancelled.current) setLoading(true);
    try {
      const all = await fetchSessions();
      const prefix = `${userId}__`;
      const mine = all
        .filter((s) => s.id.startsWith(prefix))
        .sort((a, b) => (a.lastAt < b.lastAt ? 1 : a.lastAt > b.lastAt ? -1 : 0));
      if (!cancelled.current) setSessions(mine);
    } catch (err) {
      console.warn("[use-sessions] refresh failed", err);
    } finally {
      if (!cancelled.current) setLoading(false);
    }
  }, [userId]);

  const select = useCallback(
    (id: string): void => {
      setCurrentId(id);
      if (userId) {
        try {
          localStorage.setItem(storageKey(userId), id);
        } catch {
          /* localStorage unavailable — non-fatal */
        }
      }
    },
    [userId],
  );

  const createNew = useCallback((): string => {
    const id = userId
      ? `${userId}__${crypto.randomUUID()}`
      : crypto.randomUUID();
    setCurrentId(id);
    if (userId) {
      try {
        localStorage.setItem(storageKey(userId), id);
      } catch {
        /* localStorage unavailable — non-fatal */
      }
    }
    return id;
  }, [userId]);

  const rename = useCallback(
    async (id: string, title: string): Promise<void> => {
      await renameSession(id, title);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      await deleteSession(id);
      const fresh = await fetchSessions();
      const prefix = userId ? `${userId}__` : "";
      const mine = fresh
        .filter((s) => (userId ? s.id.startsWith(prefix) : true))
        .sort((a, b) => (a.lastAt < b.lastAt ? 1 : a.lastAt > b.lastAt ? -1 : 0));
      if (!cancelled.current) setSessions(mine);

      if (id === currentId) {
        const next = mine.find((s) => s.id !== id);
        if (next) {
          select(next.id);
        } else {
          createNew();
        }
      }
    },
    [userId, currentId, select, createNew],
  );

  useEffect(() => {
    cancelled.current = false;

    if (!userId) {
      setSessions([]);
      setCurrentId(null);
      return () => {
        cancelled.current = true;
      };
    }

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(storageKey(userId));
    } catch {
      stored = null;
    }
    if (stored) {
      setCurrentId(stored);
    } else {
      createNew();
    }

    void refresh();

    return () => {
      cancelled.current = true;
    };
  }, [userId, refresh, createNew]);

  return { sessions, currentId, loading, select, createNew, rename, remove, refresh };
}
