"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Mic,
  Clock,
  AlertTriangle,
  MessageSquareText,
  User,
  Calendar,
  Phone,
} from "lucide-react";
import type {
  ReferenceCheckRow,
  ReferenceResponseArgs,
} from "@/lib/penny-outbound/reference-types";
import { formatCallDuration } from "@/lib/penny-outbound/reference-types";

interface ReferenceResultCardProps {
  referenceCheck: ReferenceCheckRow;
}

/* ── Helpers ──────────────────────────────────── */
function ConsentIndicator({
  granted,
  label,
}: {
  granted: boolean | undefined | null;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      {granted ? (
        <CheckCircle2
          className="w-3.5 h-3.5 text-emerald-500"
          aria-hidden="true"
        />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
      )}
      <span className={granted ? "text-emerald-700" : "text-red-600"}>
        {label}
      </span>
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon
        className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
    deferred: "bg-amber-50 text-amber-700 border-amber-200",
    declined: "bg-red-50 text-red-700 border-red-200",
    no_answer: "bg-gray-100 text-gray-600 border-gray-200",
    pending: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const labels: Record<string, string> = {
    complete: "Complete",
    deferred: "Callback Requested",
    declined: "Declined",
    no_answer: "No Answer",
    pending: "Pending",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] ?? styles.pending}`}
    >
      {status === "complete" && (
        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
      )}
      {status === "deferred" && (
        <Clock className="w-3 h-3" aria-hidden="true" />
      )}
      {labels[status] ?? status}
    </span>
  );
}

/* ── Main Component ───────────────────────────── */
export function ReferenceResultCard({
  referenceCheck,
}: ReferenceResultCardProps) {
  const args: ReferenceResponseArgs | null =
    referenceCheck.response_data?.args ?? null;

  if (!args) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 text-center">
        <p className="text-sm text-gray-500">
          Reference data not yet available.
        </p>
      </div>
    );
  }

  const isDeferred = args.status === "deferred";
  const isComplete = args.status === "complete";
  const personal = args.personalResponse;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
        <ShieldCheck
          className="w-4 h-4 text-harcourts-blue"
          aria-hidden="true"
        />
        Reference check result
      </h3>

      <div className="space-y-4">
        {/* Status + Consent Row */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={args.status} />
          <div className="flex items-center gap-4">
            <ConsentIndicator granted={args.consentGiven} label="Consent" />
            <ConsentIndicator
              granted={args.recordingConsent}
              label="Recording"
            />
          </div>
        </div>

        {/* Red Flags Alert */}
        {args.redFlags && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2"
          >
            <AlertTriangle
              className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                Red Flags Identified
              </p>
              <p className="text-sm text-red-800 mt-1">{args.redFlags}</p>
            </div>
          </div>
        )}

        {/* Deferred Info */}
        {isDeferred && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 space-y-2.5">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              Callback preferences
            </p>
            <InfoRow
              icon={Clock}
              label="Preferred time"
              value={args.preferredTimeWindow}
            />
            <InfoRow
              icon={Calendar}
              label="Preferred date"
              value={args.preferredDate}
            />
            <InfoRow
              icon={Phone}
              label="Preferred phone"
              value={args.preferredPhone}
            />
            {args.notes && (
              <InfoRow icon={MessageSquareText} label="Notes" value={args.notes} />
            )}
          </div>
        )}

        {/* Personal Reference Results */}
        {isComplete && personal && (
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-harcourts-blue" aria-hidden="true" />
              Character assessment
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow
                icon={User}
                label="Knows applicant via"
                value={personal.knowsApplicantHow}
              />
              <InfoRow
                icon={Clock}
                label="Known for"
                value={personal.knowsApplicantDuration}
              />
              <InfoRow
                icon={ShieldCheck}
                label="Character & reliability"
                value={personal.characterReliability}
              />
              <InfoRow
                icon={Mic}
                label="Call duration"
                value={formatCallDuration(args.callDurationSeconds)}
              />
            </div>
            {personal.comments && (
              <div className="mt-2 pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                  <MessageSquareText className="w-3.5 h-3.5" aria-hidden="true" />
                  AI summary
                </p>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {personal.comments}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Additional Comments */}
        {args.additionalComments && (
          <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">
              Additional comments
            </p>
            <p className="text-sm text-gray-800">
              {args.additionalComments}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
