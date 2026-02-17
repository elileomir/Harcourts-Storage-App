"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Bot,
  Wrench,
  Award,
  Target,
  CheckCircle2,
  FileText,
  X,
  Terminal,
} from "lucide-react";
import { CallLog } from "@/hooks/use-analytics";

interface CallDetailsDrawerProps {
  call: CallLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to format message with markdown (bold tags and line breaks)
function formatMessage(message: string | null): string {
  if (!message) return "";

  return message
    .replace(/<b>(.*?)<\/b>/g, "**$1**")
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    .replace(/\n/g, "\n");
}

// Helper function to render formatted text with bold
function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-navy">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

// Helper function to get CSAT badge
function getCSATBadge(score: string | null) {
  if (!score)
    return {
      variant: "secondary" as const,
      label: "N/A",
      className: "bg-gray-100 text-mid-grey",
    };

  const numScore = parseInt(score);
  const labels: Record<number, string> = {
    5: "Delighted",
    4: "Satisfied",
    3: "Neutral",
    2: "Dissatisfied",
    1: "Frustrated",
  };

  // Harcourts Palette for scores
  const colors: Record<number, string> = {
    5: "bg-success text-white",
    4: "bg-harcourts-blue text-white",
    3: "bg-[#FFC107] text-navy", // Warning Yellow
    2: "bg-action text-white",
    1: "bg-destructive text-white",
  };

  return {
    label: `${score} - ${labels[numScore] || "Unknown"}`,
    className: colors[numScore] || "bg-mid-grey text-white",
  };
}

export function CallDetailsDrawer({
  call,
  open,
  onOpenChange,
}: CallDetailsDrawerProps) {
  if (!call) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTime = (timeInCallSecs: number) => {
    const mins = Math.floor(timeInCallSecs / 60);
    const secs = timeInCallSecs % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const csatBadge = getCSATBadge(call.csat_score);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] p-0 overflow-hidden animate-in slide-in-from-bottom duration-300 rounded-t-[6px] border-t-0 [&>button]:hidden bg-background"
      >
        {/* Header with Sash */}
        <div className="bg-white border-t-4 border-harcourts-blue px-8 py-6 relative shadow-[0_2px_8px_rgba(0,0,0,0.1)] z-10">
          <SheetHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-navy text-2xl font-bold tracking-tight">
                Call Details
              </SheetTitle>
              <SheetClose className="rounded-[4px] p-2 hover:bg-gray-100 transition-colors text-navy focus:outline-none focus:ring-2 focus:ring-harcourts-blue/50">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>
            <SheetDescription className="text-mid-grey text-base font-normal">
              {new Date(call.start_time).toLocaleString()} • Duration:{" "}
              {formatDuration(call.duration_seconds)}
            </SheetDescription>
          </SheetHeader>
        </div>

        <ScrollArea className="h-[calc(85vh-120px)] bg-[#F1F3F4]">
          <div className="px-8 py-8 space-y-8 max-w-5xl mx-auto">
            {/* Summary Card */}
            {call.transcript_summary && (
              <Card className="border-none shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden rounded-[4px]">
                <div className="bg-harcourts-blue h-1 w-full" />
                <CardHeader className="pb-3 bg-white">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-navy">
                    <FileText className="h-5 w-5 text-harcourts-blue" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-white">
                  <p className="text-sm text-navy leading-relaxed">
                    {call.transcript_summary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Evaluation Card */}
            <Card className="border-none shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden rounded-[4px]">
              <div className="bg-harcourts-blue h-1 w-full" />
              <CardHeader className="pb-3 bg-white">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-navy">
                  <Award className="h-5 w-5 text-harcourts-blue" />
                  Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="space-y-3 flex-1">
                    <label className="text-xs font-bold text-mid-grey uppercase tracking-wider">
                      CSAT Score
                    </label>
                    <div className="flex">
                      <Badge
                        className={`${csatBadge.className} text-sm px-4 py-1.5 rounded-[4px] shadow-none border-0 font-semibold`}
                      >
                        {csatBadge.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    <label className="text-xs font-bold text-mid-grey uppercase tracking-wider">
                      Lead Quality
                    </label>
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-navy bg-gray-100 px-4 py-1.5 rounded-[4px]">
                        {call.lead_quality_score || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rationale Card */}
            {call.evaluation_rationale && (
              <Card className="border-none shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden rounded-[4px]">
                <div className="bg-harcourts-blue h-1 w-full" />
                <CardHeader className="pb-3 bg-white">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-navy">
                    <Target className="h-5 w-5 text-harcourts-blue" />
                    Evaluation Rationale
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-white space-y-6">
                  {call.evaluation_rationale.brand_alignment && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2">
                        <h4 className="font-bold text-sm text-navy">
                          Brand Alignment
                        </h4>
                        <Badge
                          className={`rounded-[4px] font-semibold ${call.evaluation_rationale.brand_alignment.result === "success" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}`}
                        >
                          {call.evaluation_rationale.brand_alignment.result}
                        </Badge>
                      </div>
                      <p className="text-sm text-navy leading-relaxed bg-gray-50 p-4 rounded-[4px] border border-gray-100">
                        {call.evaluation_rationale.brand_alignment.rationale}
                      </p>
                    </div>
                  )}
                  {call.evaluation_rationale.handoff_success && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2">
                        <h4 className="font-bold text-sm text-navy">
                          Handoff Success
                        </h4>
                        <Badge
                          className={`rounded-[4px] font-semibold ${call.evaluation_rationale.handoff_success.result === "success" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}`}
                        >
                          {call.evaluation_rationale.handoff_success.result}
                        </Badge>
                      </div>
                      <p className="text-sm text-navy leading-relaxed bg-gray-50 p-4 rounded-[4px] border border-gray-100">
                        {call.evaluation_rationale.handoff_success.rationale}
                      </p>
                    </div>
                  )}
                  {call.evaluation_rationale.compliance_check && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2">
                        <h4 className="font-bold text-sm text-navy">
                          Compliance Check
                        </h4>
                        <Badge
                          className={`rounded-[4px] font-semibold ${call.evaluation_rationale.compliance_check.result === "success" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}`}
                        >
                          {call.evaluation_rationale.compliance_check.result}
                        </Badge>
                      </div>
                      <p className="text-sm text-navy leading-relaxed bg-gray-50 p-4 rounded-[4px] border border-gray-100">
                        {call.evaluation_rationale.compliance_check.rationale}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Transcript Card */}
            {call.transcript_full && call.transcript_full.length > 0 && (
              <Card className="border-none shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden rounded-[4px]">
                <div className="bg-harcourts-blue h-1 w-full" />
                <CardHeader className="pb-3 bg-white">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-navy">
                    <CheckCircle2 className="h-5 w-5 text-harcourts-blue" />
                    Conversation Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-white p-0">
                  <div className="divide-y divide-gray-100">
                    {call.transcript_full.map((turn, index) => {
                      const isUser = turn.role === "user";
                      const hasToolCalls =
                        turn.tool_calls && turn.tool_calls.length > 0;
                      const hasToolResults =
                        turn.tool_results && turn.tool_results.length > 0;
                      const message = turn.message || turn.content || "";

                      // Handle timestamp: Use time_in_call_secs (ElevenLabs) or start of first word (Retell)
                      let timestamp = turn.time_in_call_secs;
                      if (
                        timestamp === undefined &&
                        turn.words &&
                        turn.words.length > 0
                      ) {
                        timestamp = turn.words[0].start;
                      }

                      return (
                        <div
                          key={index}
                          className={`flex gap-4 p-6 transition-colors duration-200 ${isUser ? "bg-white" : "bg-[#F8F9FA]"}`}
                        >
                          <div className="flex-shrink-0 pt-1">
                            {isUser ? (
                              <div className="w-10 h-10 rounded-[4px] bg-navy flex items-center justify-center shadow-sm">
                                <User className="h-5 w-5 text-white" />
                              </div>
                            ) : hasToolCalls || hasToolResults ? (
                              <div className="w-10 h-10 rounded-[4px] bg-mid-grey flex items-center justify-center shadow-sm">
                                <Wrench className="h-5 w-5 text-white" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-[4px] bg-harcourts-blue flex items-center justify-center shadow-sm">
                                <Bot className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-navy">
                                {isUser ? "USER" : "AGENT"}
                              </span>
                              {timestamp !== undefined && (
                                <span className="text-xs text-mid-grey font-mono">
                                  {formatTime(timestamp)}
                                </span>
                              )}
                            </div>

                            {/* Message Content */}
                            {message && (
                              <div className="text-sm text-navy leading-relaxed whitespace-pre-wrap font-medium">
                                {renderFormattedText(formatMessage(message))}
                              </div>
                            )}

                            {/* Tool Calls */}
                            {hasToolCalls && (
                              <div className="space-y-2 mt-2">
                                {turn.tool_calls!.map((tool, toolIndex) => (
                                  <div
                                    key={toolIndex}
                                    className="inline-flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-[4px] border border-gray-200 shadow-sm"
                                  >
                                    <Terminal className="h-3 w-3 text-mid-grey" />
                                    <span className="font-mono text-xs font-semibold text-navy">
                                      Called:{" "}
                                      {tool.tool_name ||
                                        tool.name ||
                                        "Unknown Tool"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Tool Results */}
                            {hasToolResults && (
                              <div className="space-y-2 mt-2">
                                {turn.tool_results!.map(
                                  (result, resultIndex) => (
                                    <div
                                      key={resultIndex}
                                      className="inline-flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-[4px] border border-gray-200 shadow-sm"
                                    >
                                      <CheckCircle2 className="h-3 w-3 text-success" />
                                      <span className="font-mono text-xs font-semibold text-navy">
                                        Result:{" "}
                                        {result.tool_name ||
                                          result.name ||
                                          "System Action"}
                                        {result.type === "system"
                                          ? " (System)"
                                          : ""}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}

                            {/* Fallback for empty agent turns */}
                            {!message && !hasToolCalls && !hasToolResults && (
                              <div className="text-sm text-mid-grey italic">
                                (Processing...)
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
