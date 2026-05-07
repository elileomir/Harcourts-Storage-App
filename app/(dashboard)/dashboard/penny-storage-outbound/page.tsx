"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart3, Warehouse } from "lucide-react";
import { StorageCallForm } from "@/components/penny-storage-outbound/StorageCallForm";

export default function PennyStorageOutboundPage() {
  return (
    <div className="max-w-3xl mx-auto pb-12 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <Warehouse className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-[#001F49] tracking-tight">
                Penny Storage Call
              </h1>
            </div>
            <p className="text-gray-500 text-base mt-2 max-w-prose">
              Penny will call the waitlisted client to inform them about
              available storage units at the selected facility. Select from the
              waitlist or fill in details manually.
            </p>
          </div>

          <Link
            href="/dashboard/analytics"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <BarChart3 className="w-4 h-4" aria-hidden="true" />
            Call analytics
          </Link>
        </div>
      </motion.div>

      <StorageCallForm />
    </div>
  );
}
