"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Bot, User, Wrench } from "lucide-react";
import type { TranscriptEntry } from "@/lib/penny-outbound/reference-types";

interface TranscriptViewerProps {
  transcript: TranscriptEntry[];
  agentName?: string;
}

function Bubble({
  entry,
  index,
  agentName,
}: {
  entry: TranscriptEntry;
  index: number;
  agentName: string;
}) {
  // Tool call invocation — system message
  if (entry.role === "tool_call_invocation") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.02, duration: 0.2 }}
        className="flex justify-center my-2"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono text-gray-500 bg-gray-100 rounded-full border border-gray-200">
          <Wrench className="w-3 h-3" aria-hidden="true" />
          {entry.name ?? "tool_call"}
        </span>
      </motion.div>
    );
  }

  const isAgent = entry.role === "agent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      className={`flex gap-2 ${isAgent ? "justify-start" : "justify-end"}`}
    >
      {isAgent && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-200 flex-shrink-0 flex items-center justify-center mt-1">
          <Bot className="w-3.5 h-3.5 text-harcourts-blue" aria-hidden="true" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isAgent
            ? "bg-gradient-to-br from-blue-50 to-cyan-50 text-gray-900 rounded-tl-md border border-blue-100"
            : "bg-[#001F49] text-white rounded-tr-md"
        }`}
      >
        {isAgent && (
          <p className="text-[10px] font-semibold text-blue-500/80 mb-1">
            {agentName}
          </p>
        )}
        <p className="whitespace-pre-wrap">{entry.content?.trim()}</p>
      </div>
      {!isAgent && (
        <div className="w-7 h-7 rounded-full bg-gray-200 border border-gray-300 flex-shrink-0 flex items-center justify-center mt-1">
          <User className="w-3.5 h-3.5 text-gray-600" aria-hidden="true" />
        </div>
      )}
    </motion.div>
  );
}

export function TranscriptViewer({
  transcript,
  agentName = "Penny",
}: TranscriptViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!transcript || transcript.length === 0) {
    return null;
  }

  return (
    <section>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 hover:text-harcourts-blue transition-colors duration-200 cursor-pointer group"
      >
        <span className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-harcourts-blue" aria-hidden="true" />
          Call transcript
          <span className="text-[10px] font-medium text-gray-400 normal-case tracking-normal">
            {transcript.filter((t) => t.role !== "tool_call_invocation").length}{" "}
            messages
          </span>
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown
            className="w-4 h-4 text-gray-400 group-hover:text-harcourts-blue transition-colors"
            aria-hidden="true"
          />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-3 p-4 bg-white rounded-xl border border-gray-100 shadow-inner">
              {transcript.map((entry, i) => (
                <Bubble
                  key={`${entry.role}-${i}`}
                  entry={entry}
                  index={i}
                  agentName={agentName}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
