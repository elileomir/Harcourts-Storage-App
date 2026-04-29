"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Loader2,
  Search,
  PhoneOutgoing,
  PhoneCall,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import {
  recallPennyOutbound,
  deletePennyOutbound,
} from "@/lib/penny-outbound/api";
import type { PennyOutboundCallRow } from "@/lib/penny-outbound/types";
import { CallHistoryCard } from "@/components/penny-outbound/CallHistoryCard";
import { CallDetailDrawer } from "@/components/penny-outbound/CallDetailDrawer";

export default function PennyOutboundHistoryPage() {
  const [calls, setCalls] = useState<PennyOutboundCallRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<PennyOutboundCallRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PennyOutboundCallRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [recallingId, setRecallingId] = useState<string | null>(null);

  // ─── Fetch ─────────────────────────────────────
  const fetchCalls = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("penny_outbound_calls")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching penny calls:", error);
      toast.error("Couldn't load call history", {
        description: error.message?.slice(0, 200),
      });
      setLoading(false);
      return;
    }

    setCalls((data as PennyOutboundCallRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCalls();
  }, [fetchCalls]);

  // ─── Recall ────────────────────────────────────
  const handleRecall = async (call: PennyOutboundCallRow) => {
    if (recallingId) return;
    setRecallingId(call.id);
    const toastId = toast.loading(`Recalling Penny for ${call.referee_name}…`);

    const result = await recallPennyOutbound(call.id);

    if (result.success) {
      toast.success(
        call.call_mode === "web"
          ? "Web call ready — see History."
          : `Penny is calling ${call.referee_name} again`,
        { id: toastId }
      );
      // Refetch to pick up the new row at the top.
      await fetchCalls();
    } else {
      toast.error("Penny couldn't recall", {
        id: toastId,
        description: result.error?.slice(0, 200),
      });
      // Still refetch — the audit row was created with status=failed.
      await fetchCalls();
    }
    setRecallingId(null);
  };

  // ─── Delete ────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    const result = await deletePennyOutbound(deleteTarget.id);

    if (result.success) {
      // Optimistic removal.
      setCalls((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success("Call record removed");
    } else {
      toast.error("Couldn't delete", {
        description: result.error?.slice(0, 200),
      });
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  // ─── Filter ────────────────────────────────────
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return calls;
    return calls.filter(
      (c) =>
        c.applicant_name.toLowerCase().includes(term) ||
        c.property_address.toLowerCase().includes(term) ||
        c.referee_name.toLowerCase().includes(term) ||
        (c.to_number || "").toLowerCase().includes(term)
    );
  }, [calls, searchTerm]);

  return (
    <div className="max-w-5xl mx-auto pb-12 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#001F49] tracking-tight">
              Penny call history
            </h1>
            <p className="text-gray-500 text-base mt-2">
              Every outbound call Penny has placed. Anyone signed in can view, recall, or delete.
            </p>
          </div>
          <Link
            href="/dashboard/penny-outbound"
            className="inline-flex items-center gap-2 px-4 py-2 bg-harcourts-blue hover:bg-harcourts-blue-dark text-white rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer flex-shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harcourts-blue focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            New call
          </Link>
        </div>
      </motion.div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by applicant, property, referee, or number…"
            aria-label="Search call history"
            className="input-field-normal pl-10 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-harcourts-blue" aria-hidden="true" />
          <span className="ml-2 text-gray-500">Loading call history…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-gray-200">
          <PhoneOutgoing
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
            aria-hidden="true"
          />
          <h2 className="text-base font-semibold text-[#001F49]">
            {searchTerm ? "No calls match your search" : "No calls yet"}
          </h2>
          <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
            {searchTerm
              ? "Try a different search term."
              : "When you ask Penny to make a call, it appears here. Everyone on your team can see and recall calls."}
          </p>
          {!searchTerm && (
            <Link
              href="/dashboard/penny-outbound"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-harcourts-blue hover:bg-harcourts-blue-dark text-white rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harcourts-blue focus-visible:ring-offset-2"
            >
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              Make your first call
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((call) => (
            <CallHistoryCard
              key={call.id}
              call={call}
              onView={setSelected}
              onRecall={handleRecall}
              onDelete={setDeleteTarget}
              recallInFlight={recallingId === call.id}
            />
          ))}
        </div>
      )}

      {/* Detail drawer */}
      <CallDetailDrawer call={selected} onClose={() => setSelected(null)} />

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="penny-delete-title"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" aria-hidden="true" />
              </div>
              <div>
                <h3 id="penny-delete-title" className="font-bold text-gray-900">
                  Delete this call record?
                </h3>
                <p className="text-sm text-gray-500">This removes the audit log only.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This removes the record of the call to{" "}
              <strong>{deleteTarget.referee_name}</strong> for{" "}
              <strong>{deleteTarget.applicant_name}</strong>. Penny&apos;s recording stays in Retell.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harcourts-blue focus-visible:ring-offset-2 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 min-h-[44px]"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
