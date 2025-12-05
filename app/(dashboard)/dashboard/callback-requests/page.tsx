"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CallbackRequestsTable } from "@/components/features/callbacks/callback-requests-table";
import { useCallbackRequests } from "@/hooks/use-callback-requests";
import { Loader2, Phone } from "lucide-react";

export default function CallbackRequestsPage() {
  const { callbackRequests, isLoading, error, updateStatus } =
    useCallbackRequests();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <div className="text-red-500">
          <Phone className="h-12 w-12" />
        </div>
        <h3 className="text-lg font-semibold">Failed to load requests</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message ||
            "There was an error loading the callback requests. Please try again."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Reload Page
        </button>
      </div>
    );
  }

  const pendingCount =
    callbackRequests?.filter((r) => r.status === "Pending").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Callback Requests
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage and respond to customer callback requests
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {callbackRequests?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Phone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting contact</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Phone className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {callbackRequests?.filter(
                (r) => r.importance === "High" && r.status !== "Completed"
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires urgent attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Callback Requests</CardTitle>
          <CardDescription>
            View and manage all callback requests from customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {callbackRequests && callbackRequests.length > 0 ? (
            <CallbackRequestsTable
              requests={callbackRequests}
              onStatusUpdate={(id, status) => updateStatus({ id, status })}
              onUpdateNotes={(id, notes) => updateStatus({ id, notes })}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Phone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">
                No callback requests yet
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                When customers request callbacks, they will appear here for you
                to manage and respond to.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
