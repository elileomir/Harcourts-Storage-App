import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Phone,
  Calendar,
  Clock,
  AlertCircle,
  MessageSquare,
  StickyNote,
  Lightbulb,
} from "lucide-react";
import { format } from "date-fns";
import { CallbackRequest } from "@/hooks/use-callback-requests";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface CallbackDetailDrawerProps {
  request: CallbackRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (id: string, status: CallbackRequest["status"]) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export function CallbackDetailDrawer({
  request,
  open,
  onOpenChange,
  onStatusUpdate,
  onUpdateNotes,
}: CallbackDetailDrawerProps) {
  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (request) {
      setNotes(request.notes || "");
    }
  }, [request]);

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onUpdateNotes(request.id, notes);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const getImportanceBadge = (importance: CallbackRequest["importance"]) => {
    switch (importance) {
      case "High":
        return {
          className: "bg-red-500 hover:bg-red-500/90 text-white",
          label: importance,
        };
      case "Medium":
        return {
          className: "bg-orange-500 hover:bg-orange-500/90 text-white",
          label: importance,
        };
      case "Low":
        return {
          className: "bg-gray-400 hover:bg-gray-400/90 text-white",
          label: importance,
        };
    }
  };

  const importanceBadge = getImportanceBadge(request.importance);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Callback Request Details
              </SheetTitle>
              <SheetDescription>
                Created{" "}
                {format(
                  new Date(request.created_at),
                  "MMM d, yyyy 'at' h:mm a"
                )}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="font-medium">{request.full_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <a
                      href={`tel:${request.phone_number}`}
                      className="font-medium hover:underline text-primary"
                    >
                      {request.phone_number}
                    </a>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Request Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  Request Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm font-medium">Subject</span>
                    </div>
                    <p className="text-sm pl-6">{request.header}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.preferred_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.preferred_time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Importance:
                    </span>
                    <Badge
                      className={`rounded-[4px] font-semibold text-sm px-4 py-1.5 ${importanceBadge.className}`}
                    >
                      {importanceBadge.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Conversation Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                    Conversation Summary
                  </h3>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {request.summary_conversation}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Helpful Insights */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                    Helpful Insights for Agent
                  </h3>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap text-gray-800">
                    {request.helpful_insights}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Notes Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                    Notes
                  </h3>
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add notes about this callback..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes || notes === request.notes}
                    size="sm"
                  >
                    {isSavingNotes ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Status Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  Update Status
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant={
                      request.status === "Pending" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => onStatusUpdate(request.id, "Pending")}
                    className="flex-1"
                  >
                    Pending
                  </Button>
                  <Button
                    variant={
                      request.status === "Contacted" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => onStatusUpdate(request.id, "Contacted")}
                    className="flex-1"
                  >
                    Contacted
                  </Button>
                  <Button
                    variant={
                      request.status === "Completed" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => onStatusUpdate(request.id, "Completed")}
                    className="flex-1"
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
