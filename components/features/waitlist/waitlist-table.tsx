"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  FileDown,
  Trash2,
  Lightbulb,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { WaitlistRequest, useWaitlist } from "@/hooks/use-waitlist";
import { exportToExcel } from "@/lib/excel-utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState, useMemo } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Unit } from "@/hooks/use-units";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WaitlistTableProps {
  requests: WaitlistRequest[];
  units: Unit[];
  onStatusUpdate: (id: string, status: WaitlistRequest["status"]) => void;
  onEdit: (request: WaitlistRequest) => void;
  onDelete: (id: string) => void;
}

export function WaitlistTable({
  requests,
  units,
  onStatusUpdate,
  onEdit,
  onDelete,
}: WaitlistTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const { updateWaitlistRequestsStatus, deleteWaitlistRequests } =
    useWaitlist();

  // Helper to parse facility string/json
  const parseFacilities = (facility: string | string[]): string[] => {
    if (Array.isArray(facility)) return facility;
    if (typeof facility === "string") {
      try {
        const parsed = JSON.parse(facility);
        if (Array.isArray(parsed)) return parsed;
        return [facility];
      } catch {
        return [facility];
      }
    }
    return [];
  };

  // Get unique facilities from requests for the filter
  const allFacilities = useMemo(() => {
    const facilities = new Set<string>();
    requests.forEach((req) => {
      parseFacilities(req.facility).forEach((f) => facilities.add(f));
    });
    return Array.from(facilities).sort();
  }, [requests]);

  // Insights Logic: Greedy allocation of available units
  const requestInsights = useMemo(() => {
    // 1. Count available units per facility
    const availableUnitsCounts: Record<string, number> = {};
    units.forEach((unit) => {
      if (unit.status === "Available") {
        availableUnitsCounts[unit.facility] =
          (availableUnitsCounts[unit.facility] || 0) + 1;
      }
    });

    const insights = new Map<string, string>(); // requestId -> matchedFacilityName

    // 2. Iterate requests in order (they are already sorted by created_at ASC from backend)
    requests.forEach((req) => {
      if (req.status !== "Pending") return; // Only suggest for Pending requests

      const reqFacilities = parseFacilities(req.facility);

      // Find first matching facility with available units
      const match = reqFacilities.find(
        (fac) => (availableUnitsCounts[fac] || 0) > 0
      );

      if (match) {
        insights.set(req.id, match);
        // Decrement count to reserve this unit for this higher-priority request
        availableUnitsCounts[match]--;
      }
    });

    return insights;
  }, [requests, units]);

  const filteredRequests = useMemo(() => {
    let result = requests;

    // 1. Filter
    if (selectedFacilities.length > 0) {
      result = requests.filter((req) => {
        const reqFacilities = parseFacilities(req.facility);
        return reqFacilities.some((f) => selectedFacilities.includes(f));
      });
    }

    // 2. Sort: Pending first, then by created_at (ascending/oldest first)
    return [...result].sort((a, b) => {
      const aIsPending = a.status === "Pending";
      const bIsPending = b.status === "Pending";

      // Put Pending at the top
      if (aIsPending && !bIsPending) return -1;
      if (!aIsPending && bIsPending) return 1;

      // Secondary sort: created_at ASC (Oldest first)
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, [requests, selectedFacilities]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequestIds(filteredRequests.map((r) => r.id));
    } else {
      setSelectedRequestIds([]);
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequestIds((prev) => [...prev, requestId]);
    } else {
      setSelectedRequestIds((prev) => prev.filter((id) => id !== requestId));
    }
  };

  const handleBulkStatusUpdate = (status: string) => {
    if (selectedRequestIds.length === 0) return;

    updateWaitlistRequestsStatus.mutate(
      { ids: selectedRequestIds, status: status as WaitlistRequest["status"] },
      {
        onSuccess: () => {
          setSelectedRequestIds([]);
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
      case "Contacted":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case "Offered":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
      case "Accepted":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "Declined":
        return "bg-red-100 text-red-800 hover:bg-red-100/80";
      case "Expired":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          {selectedRequestIds.length > 0 ? (
            <div className="flex items-center gap-2 mr-2 animate-in fade-in slide-in-from-right-4">
              <span className="text-sm text-muted-foreground mr-2">
                {selectedRequestIds.length} selected
              </span>
              <Select onValueChange={handleBulkStatusUpdate}>
                <SelectTrigger className="w-[160px] h-8 border-dashed border-primary text-primary">
                  <SelectValue placeholder="Bulk Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Mark Pending</SelectItem>
                  <SelectItem value="Contacted">Mark Contacted</SelectItem>
                  <SelectItem value="Offered">Mark Offered</SelectItem>
                  <SelectItem value="Accepted">Mark Accepted</SelectItem>
                  <SelectItem value="Declined">Mark Declined</SelectItem>
                  <SelectItem value="Expired">Mark Expired</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="h-8 px-2"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRequestIds([])}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-dashed"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter Facility
                  {selectedFacilities.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                      {selectedFacilities.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Filter by Facility</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allFacilities.map((facility) => (
                  <DropdownMenuCheckboxItem
                    key={facility}
                    checked={selectedFacilities.includes(facility)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFacilities((prev) => [...prev, facility]);
                      } else {
                        setSelectedFacilities((prev) =>
                          prev.filter((f) => f !== facility)
                        );
                      }
                    }}
                  >
                    {facility}
                  </DropdownMenuCheckboxItem>
                ))}
                {selectedFacilities.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => setSelectedFacilities([])}
                      className="justify-center text-center text-sm"
                    >
                      Clear filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel(requests, "Waitlist", "Waitlist")}
            className="h-8 px-2 text-muted-foreground hover:text-foreground border-dashed ml-auto sm:ml-0"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <ConfirmationDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        onConfirm={() => {
          deleteWaitlistRequests.mutate(selectedRequestIds, {
            onSuccess: () => {
              setSelectedRequestIds([]);
            },
          });
        }}
        title="Delete Waitlist Requests"
        description={`Are you sure you want to delete ${selectedRequestIds.length} requests? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    filteredRequests.length > 0 &&
                    selectedRequestIds.length === filteredRequests.length
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(checked as boolean)
                  }
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
              {/* Insight Column */}
              <TableHead>Date</TableHead>
              <TableHead>Last Notified</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>Preferred Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No waitlist requests found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => {
                const insight = requestInsights.get(request.id);
                return (
                  <TableRow
                    key={request.id}
                    className={`transition-colors duration-500 ${
                      selectedRequestIds.includes(request.id)
                        ? "bg-muted/50"
                        : ""
                    }`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedRequestIds.includes(request.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRequest(request.id, checked as boolean)
                        }
                        aria-label={`Select request for ${request.full_name}`}
                      />
                    </TableCell>
                    <TableCell>
                      {insight && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center">
                                <Lightbulb className="h-5 w-5 text-yellow-500 fill-yellow-500 animate-pulse" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Unit available at {insight}!</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(request.created_at),
                        "MMM d, yyyy h:mm a"
                      )}
                    </TableCell>
                    <TableCell>
                      {request.last_notified
                        ? format(
                            new Date(request.last_notified),
                            "MMM d, yyyy h:mm a"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {request.full_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{request.email_address}</span>
                        <span className="text-muted-foreground">
                          {request.phone_number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {parseFacilities(request.facility).map((fac, index) => (
                          <Badge key={index} variant="outline">
                            {fac}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.preferred_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={request.status}
                        onValueChange={(value) =>
                          onStatusUpdate(
                            request.id,
                            value as WaitlistRequest["status"]
                          )
                        }
                      >
                        <SelectTrigger
                          className={`w-[130px] h-8 ${getStatusColor(
                            request.status
                          )} border-0`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Contacted">Contacted</SelectItem>
                          <SelectItem value="Offered">Offered</SelectItem>
                          <SelectItem value="Accepted">Accepted</SelectItem>
                          <SelectItem value="Declined">Declined</SelectItem>
                          <SelectItem value="Expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEdit(request)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(request.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Request
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            onDelete(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete Waitlist Request"
        description="Are you sure you want to delete this waitlist request? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
