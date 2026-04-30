"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
import type { CallWithReference, ReferenceCheckRow } from "@/lib/penny-outbound/reference-types";
import type { PennyOutboundCallRow } from "@/lib/penny-outbound/types";
import { CallHistoryCard } from "@/components/penny-outbound/CallHistoryCard";
import { CallDetailDrawer } from "@/components/penny-outbound/CallDetailDrawer";
import { StatsBar } from "@/components/penny-outbound/StatsBar";

type FilterTab = "all" | "completed" | "deferred" | "failed";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "deferred", label: "Deferred" },
  { key: "failed", label: "Failed" },
];

export default function PennyOutboundHistoryPage() {
  const [calls, setCalls] = useState<CallWithReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<CallWithReference | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CallWithReference | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [recallingId, setRecallingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // ─── Fetch joined data ───────────────────────────
  const fetchCalls = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    // Fetch outbound calls
    const { data: callsData, error: callsError } = await supabase
      .from("penny_outbound_calls")
      .select("*")
      .order("created_at", { ascending: false });

    if (callsError) {
      console.error("Error fetching penny calls:", callsError);
      toast.error("Couldn't load call history", {
        description: callsError.message?.slice(0, 200),
      });
      setLoading(false);
      return;
    }

    // Fetch reference checks
    const { data: refsData, error: refsError } = await supabase
      .from("reference_checks")
      .select("*");

    if (refsError) {
      console.error("Error fetching reference checks:", refsError);
      // Non-fatal — continue with calls only
    }

    // Build a lookup: outbound_call_id → ReferenceCheckRow
    const refsByCallId = new Map<string, ReferenceCheckRow>();
    if (refsData) {
      for (const ref of refsData as ReferenceCheckRow[]) {
        if (ref.outbound_call_id) {
          refsByCallId.set(ref.outbound_call_id, ref);
        }
      }
    }

    // Merge
    const merged: CallWithReference[] = ((callsData as PennyOutboundCallRow[]) || []).map(
      (call) => ({
        ...call,
        reference_check: refsByCallId.get(call.id) ?? null,
      })
    );

    setCalls(merged);
    setLoading(false);
  }, []);

  const fetchStarted = useRef<boolean | null>(null);
  if (fetchStarted.current == null) {
    fetchStarted.current = true;
    void fetchCalls();
  }

  // ─── Recall ────────────────────────────────────
  const handleRecall = async (call: CallWithReference) => {
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
      await fetchCalls();
    } else {
      toast.error("Penny couldn't recall", {
        id: toastId,
        description: result.error?.slice(0, 200),
      });
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
    let result = calls;

    // Tab filter
    if (activeTab === "completed") {
      result = result.filter((c) => c.reference_check?.status === "complete");
    } else if (activeTab === "deferred") {
      result = result.filter((c) => c.reference_check?.status === "deferred");
    } else if (activeTab === "failed") {
      result = result.filter(
        (c) =>
          c.retell_call_status === "failed" ||
          c.reference_check?.status === "declined" ||
          c.reference_check?.status === "no_answer"
      );
    }

    // Search filter
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (c) =>
          c.applicant_name.toLowerCase().includes(term) ||
          c.property_address.toLowerCase().includes(term) ||
          c.referee_name.toLowerCase().includes(term) ||
          (c.to_number || "").toLowerCase().includes(term)
      );
    }

    return result;
  }, [calls, searchTerm, activeTab]);

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
              Every outbound call Penny has placed, with reference check results and transcripts.
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

      {/* Stats Bar */}
      {!loading && calls.length > 0 && <StatsBar calls={calls} />}

      {/* Search + Filter Tabs */}
      <div className="mb-6 space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harcourts-blue ${
                activeTab === tab.key
                  ? "bg-white text-[#001F49] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
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
            {searchTerm || activeTab !== "all"
              ? "No calls match your filters"
              : "No calls yet"}
          </h2>
          <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
            {searchTerm || activeTab !== "all"
              ? "Try a different search term or filter."
              : "When you ask Penny to make a call, it appears here. Everyone on your team can see and recall calls."}
          </p>
          {!searchTerm && activeTab === "all" && (
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
