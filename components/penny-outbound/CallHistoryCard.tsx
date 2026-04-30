"use client";

import { motion } from "framer-motion";
import {
  Eye,
  RotateCcw,
  Trash2,
  MapPin,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { CallWithReference } from "@/lib/penny-outbound/reference-types";
import { getReferenceStatusLabel } from "@/lib/penny-outbound/reference-types";
import { StatusBadge } from "./StatusBadge";

interface CallHistoryCardProps {
  call: CallWithReference;
  onView: (call: CallWithReference) => void;
  onRecall: (call: CallWithReference) => void;
  onDelete: (call: CallWithReference) => void;
  recallInFlight: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ReferenceIndicator({ status }: { status: string | null | undefined }) {
  if (!status) return null;

  const isComplete = status === "complete";
  const isDeferred = status === "deferred";

  const dotColor = isComplete
    ? "bg-emerald-500"
    : isDeferred
      ? "bg-amber-500"
      : "bg-gray-400";

  const Icon = isComplete ? CheckCircle2 : AlertCircle;
  const textColor = isComplete
    ? "text-emerald-600"
    : isDeferred
      ? "text-amber-600"
      : "text-gray-500";

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold ${textColor}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <Icon className="w-3 h-3" aria-hidden="true" />
      {getReferenceStatusLabel(status)}
    </span>
  );
}

export function CallHistoryCard({
  call,
  onView,
  onRecall,
  onDelete,
  recallInFlight,
}: CallHistoryCardProps) {
  const phoneOrWeb =
    call.call_mode === "web"
      ? "Web test"
      : call.to_number || "—";

  const refStatus = call.reference_check?.status ?? null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-harcourts-blue/30 transition-all duration-200 group"
    >
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 flex-shrink-0 flex items-center justify-center">
            <Phone className="w-5 h-5 text-harcourts-blue" aria-hidden="true" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-[#001F49] truncate text-sm">
                  {call.applicant_name}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1 min-w-0">
                    <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{call.property_address}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" aria-hidden="true" />
                    {call.referee_name}
                    <span className="text-gray-400">· {call.referee_relationship}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {timeAgo(call.created_at)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <p className="text-xs text-gray-600 font-mono">{phoneOrWeb}</p>
                  {refStatus && (
                    <>
                      <span className="text-gray-300">·</span>
                      <ReferenceIndicator status={refStatus} />
                    </>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <StatusBadge status={call.retell_call_status} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onView(call)}
              aria-label={`View details of call to ${call.referee_name}`}
              title="View details"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-harcourts-blue hover:bg-harcourts-blue/10 rounded-lg transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harcourts-blue"
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onRecall(call)}
              disabled={recallInFlight}
              aria-label={`Recall — ask Penny to call ${call.referee_name} again`}
              title="Recall — call again"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(call)}
              aria-label={`Delete record of call to ${call.referee_name}`}
              title="Delete"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
