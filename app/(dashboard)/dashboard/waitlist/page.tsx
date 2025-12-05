"use client";

import { useState } from "react";
import { WaitlistTable } from "@/components/features/waitlist/waitlist-table";
import { WaitlistStats } from "@/components/features/waitlist/waitlist-stats";
import { WaitlistDialog } from "@/components/features/waitlist/waitlist-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import {
  useWaitlist,
  WaitlistRequest,
  WaitlistRequestInput,
} from "@/hooks/use-waitlist";

export default function WaitlistPage() {
  const {
    waitlistRequests,
    isLoading,
    error,
    updateStatus,
    createWaitlistRequest,
    updateWaitlistRequest,
    deleteWaitlistRequest,
  } = useWaitlist();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<WaitlistRequest | null>(
    null
  );

  const handleEdit = (request: WaitlistRequest) => {
    setEditingRequest(request);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingRequest(null);
    setDialogOpen(true);
  };

  const handleSubmit = (data: WaitlistRequestInput) => {
    if (editingRequest) {
      updateWaitlistRequest(
        { id: editingRequest.id, data },
        {
          onSuccess: () => {
            setDialogOpen(false);
          },
        }
      );
    } else {
      createWaitlistRequest(data, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  const handleStatusUpdate = (
    id: string,
    status: WaitlistRequest["status"]
  ) => {
    updateStatus({ id, status });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <div className="text-red-500">
          <AlertCircle className="h-12 w-12" />
        </div>
        <h3 className="text-lg font-semibold">Failed to load waitlist</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          There was an error loading the waitlist requests. Please try again.
        </p>
        <Button onClick={() => window.location.reload()}>Reload Page</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Waitlist Management</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Request
        </Button>
      </div>

      <WaitlistStats requests={waitlistRequests || []} />

      <WaitlistTable
        requests={waitlistRequests || []}
        onStatusUpdate={handleStatusUpdate}
        onEdit={handleEdit}
        onDelete={(id) => deleteWaitlistRequest(id)}
      />

      <WaitlistDialog
        key={editingRequest?.id || "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        request={editingRequest}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
