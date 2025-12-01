import { useState } from "react";
import {
  Search,
  Filter,
  Phone,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CallbackRequest } from "@/hooks/use-callback-requests";
import { format } from "date-fns";
import { CallbackDetailDrawer } from "./callback-detail-drawer";

interface CallbackRequestsTableProps {
  requests: CallbackRequest[];
  onStatusUpdate: (id: string, status: CallbackRequest["status"]) => void;
}

export function CallbackRequestsTable({
  requests,
  onStatusUpdate,
}: CallbackRequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [importanceFilter, setImportanceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.phone_number.includes(searchTerm) ||
      request.header.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesImportance =
      importanceFilter === "all" || request.importance === importanceFilter;
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesImportance && matchesStatus;
  });

  const selectedRequest =
    requests.find((r) => r.id === selectedRequestId) || null;

  const getImportanceBadge = (importance: CallbackRequest["importance"]) => {
    switch (importance) {
      case "High":
        return "bg-red-500 text-white border-red-500 hover:bg-red-500/90";
      case "Medium":
        return "bg-orange-500 text-white border-orange-500 hover:bg-orange-500/90";
      case "Low":
        return "bg-gray-400 text-white border-gray-400 hover:bg-gray-400/90";
    }
  };

  const getStatusBadge = (status: string) => {
    // Normalize status for styling check
    const normalizedStatus =
      status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();

    switch (normalizedStatus) {
      case "Pending":
        return "!bg-blue-500 !text-white !border-blue-500 hover:!bg-blue-600";
      case "Contacted":
        return "!bg-yellow-500 !text-white !border-yellow-500 hover:!bg-yellow-600";
      case "Completed":
        return "!bg-green-500 !text-white !border-green-500 hover:!bg-green-600";
      default:
        return "!bg-gray-100 !text-gray-900 !border-gray-200 hover:!bg-gray-200";
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={importanceFilter}
              onValueChange={setImportanceFilter}
            >
              <SelectTrigger className="w-[150px] h-8">
                <div className="flex items-center gap-2">
                  <Filter className="h-3 w-3" />
                  <SelectValue placeholder="Importance" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Importance</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-8">
                <div className="flex items-center gap-2">
                  <Filter className="h-3 w-3" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Importance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preferred Time</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No callback requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => {
                  // Normalize status for the Select value to ensure it matches SelectItems
                  const normalizedStatus =
                    request.status?.charAt(0).toUpperCase() +
                      request.status?.slice(1).toLowerCase() || "Pending";

                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {request.full_name}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {request.phone_number}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2 text-sm">
                            {request.header}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`rounded-[4px] font-semibold ${getImportanceBadge(
                            request.importance
                          )}`}
                        >
                          {request.importance}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={normalizedStatus}
                          onValueChange={(value) =>
                            onStatusUpdate(
                              request.id,
                              value as CallbackRequest["status"]
                            )
                          }
                        >
                          <SelectTrigger
                            className={`h-7 w-auto min-w-[100px] gap-1 rounded-[4px] border px-2.5 py-1 text-xs font-semibold shadow-none focus:ring-0 ${getStatusBadge(
                              normalizedStatus
                            )}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {request.preferred_date}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {request.preferred_time}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(request.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequestId(request.id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedRequest && (
        <CallbackDetailDrawer
          request={selectedRequest}
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequestId(null)}
          onStatusUpdate={onStatusUpdate}
        />
      )}
    </>
  );
}
