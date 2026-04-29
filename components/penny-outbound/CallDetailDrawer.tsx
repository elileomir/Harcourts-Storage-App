"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Copy,
  Check,
  TriangleAlert,
  Phone,
  MapPin,
  Building2,
  Hash,
  Clock,
  Globe,
} from "lucide-react";
import type { PennyOutboundCallRow } from "@/lib/penny-outbound/types";
import { StatusBadge } from "./StatusBadge";

interface CallDetailDrawerProps {
  call: PennyOutboundCallRow | null;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — older browsers
    }
  };
  return (
    <button
      type="button"
      onClick={handle}
      aria-label={`Copy ${label}`}
      className="p-1.5 text-gray-400 hover:text-harcourts-blue hover:bg-harcourts-blue/10 rounded-md transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harcourts-blue"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-3 text-sm text-gray-500">
      <span className="col-span-1 border-r border-gray-100 pr-3">{label}</span>
      <span className={`col-span-2 pl-3 text-gray-900 font-medium ${mono ? "font-mono text-xs" : ""}`}>
        {value || "—"}
      </span>
    </div>
  );
}

export function CallDetailDrawer({ call, onClose }: CallDetailDrawerProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Trap Escape to close + focus close button on open.
  useEffect(() => {
    if (!call) return;
    closeBtnRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [call, onClose]);

  if (!call) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-gray-900/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="penny-call-detail-title"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full max-w-lg bg-white shadow-2xl h-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="min-w-0">
            <h2 id="penny-call-detail-title" className="text-lg font-bold text-[#001F49] truncate">
              {call.applicant_name}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(call.created_at)}</p>
            <div className="mt-2"><StatusBadge status={call.retell_call_status} /></div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close detail"
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harcourts-blue"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto overflow-x-hidden space-y-6 flex-1 custom-scrollbar">
          {/* Error callout */}
          {call.error_message && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2"
            >
              <TriangleAlert className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                  Call failed
                </p>
                <p className="text-sm text-red-800 mt-1 break-words">{call.error_message}</p>
              </div>
            </div>
          )}

          {/* Summary */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-harcourts-blue" aria-hidden="true" />
              Call summary
            </h3>
            <div className="space-y-2.5">
              <Row label="Applicant" value={call.applicant_name} />
              <Row
                label="Property"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                    {call.property_address}
                  </span>
                }
              />
              <Row
                label="Agency"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                    {call.agency_name}
                  </span>
                }
              />
              <Row label="Referee" value={`${call.referee_name} (${call.referee_relationship})`} />
              {call.tenancy_address && <Row label="Tenancy" value={call.tenancy_address} />}
              {call.tenancy_landlord_type && (
                <Row label="Acts as" value={call.tenancy_landlord_type} />
              )}
              {call.application_id && (
                <Row
                  label="Application"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                      {call.application_id}
                    </span>
                  }
                  mono
                />
              )}
              <Row
                label="Mode"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    {call.call_mode === "web" ? (
                      <Globe className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                    ) : (
                      <Phone className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                    )}
                    {call.call_mode === "web" ? "Web test" : "Phone call"}
                  </span>
                }
              />
              {call.to_number && call.call_mode === "phone" && (
                <Row label="To number" value={call.to_number} mono />
              )}
              <Row
                label="Created"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                    {formatDate(call.created_at)}
                  </span>
                }
              />
            </div>
          </section>

          {/* Retell metadata */}
          {call.retell_call_id && (
            <section>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                Retell metadata
              </h3>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                <code className="text-xs font-mono text-gray-700 truncate flex-1">
                  {call.retell_call_id}
                </code>
                <CopyButton value={call.retell_call_id} label="Retell call ID" />
              </div>
            </section>
          )}

          {/* Dynamic variables (for debugging) */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
              Penny&apos;s variables
            </h3>
            <details className="group">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-900 select-none transition-colors">
                Show JSON payload sent to Retell
              </summary>
              <pre className="mt-2 bg-gray-900 text-gray-100 text-[11px] leading-relaxed rounded-lg p-3 overflow-x-auto font-mono">
                {JSON.stringify(call.dynamic_variables, null, 2)}
              </pre>
            </details>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
