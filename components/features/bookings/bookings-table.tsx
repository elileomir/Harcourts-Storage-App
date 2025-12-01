import { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Booking } from "@/hooks/use-bookings";

interface BookingsTableProps {
  bookings: Booking[];
  onStatusUpdate: (id: number, status: string) => void;
  onEdit: (booking: Booking) => void;
  onCancel: (id: number) => void;
}

export function BookingsTable({
  bookings,
  onStatusUpdate,
  onEdit,
  onCancel,
}: BookingsTableProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightId = searchParams.get("bookingId");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});

  useEffect(() => {
    if (highlightId && rowRefs.current[Number(highlightId)]) {
      rowRefs.current[Number(highlightId)]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      rowRefs.current[Number(highlightId)]?.classList.add("bg-primary/10");
      setTimeout(() => {
        rowRefs.current[Number(highlightId)]?.classList.remove("bg-primary/10");
      }, 2000);
    }
  }, [highlightId]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.storage_units.unit_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-white border-[#2C9143]";
      case "Active":
        return "text-white border-[#2563EB]";
      case "Pending":
        return "text-white border-[#C4642F]";
      case "Ending":
        return "text-white border-[#EA580C]";
      case "Completed":
        return "text-white border-[#6B7280]";
      case "Rejected":
      case "Cancelled":
        return "text-white border-destructive";
      default:
        return "text-foreground border-muted";
    }
  };

  const handleUnitClick = (unitId: number) => {
    router.push(`/dashboard/units?unitId=${unitId}&highlight=true`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-8">
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lease Period</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No bookings found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow
                  key={booking.id}
                  ref={(el) => {
                    rowRefs.current[booking.id] = el;
                  }}
                  className="transition-colors duration-500"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {booking.customer_name}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {booking.customer_email}
                      </span>
                      {booking.customer_mobile && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />{" "}
                          {booking.customer_mobile}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleUnitClick(booking.unit_id)}
                      className="flex flex-col hover:underline text-left cursor-pointer text-primary hover:text-primary/80 transition-colors"
                    >
                      <span className="font-medium flex items-center gap-1">
                        Unit {booking.storage_units.unit_number}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {booking.storage_units.facility}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={booking.status}
                      onValueChange={(value) =>
                        onStatusUpdate(booking.id, value)
                      }
                    >
                      <SelectTrigger
                        className={`h-7 w-auto min-w-[100px] gap-1 rounded-[4px] border px-2 py-0.5 text-xs font-semibold shadow-none focus:ring-0 ${getStatusColor(
                          booking.status
                        )}`}
                        style={{
                          backgroundColor:
                            booking.status === "Approved"
                              ? "#2C9143"
                              : booking.status === "Active"
                              ? "#2563EB"
                              : booking.status === "Pending"
                              ? "#C4642F"
                              : booking.status === "Ending"
                              ? "#EA580C"
                              : booking.status === "Completed"
                              ? "#6B7280"
                              : booking.status === "Cancelled" ||
                                booking.status === "Rejected"
                              ? "#DC2626"
                              : undefined,
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Ending">Ending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(
                          new Date(booking.lease_start_date),
                          "MMM d, yyyy"
                        )}
                      </span>
                      {booking.lease_end_date && (
                        <span className="text-xs text-muted-foreground pl-4">
                          to{" "}
                          {format(
                            new Date(booking.lease_end_date),
                            "MMM d, yyyy"
                          )}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(booking)}>
                          Edit Booking
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(
                              booking.customer_email
                            )
                          }
                        >
                          Copy Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onStatusUpdate(booking.id, "Approved")}
                        >
                          Mark Approved
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onStatusUpdate(booking.id, "Active")}
                        >
                          Mark Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            onStatusUpdate(booking.id, "Completed")
                          }
                        >
                          Mark Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onCancel(booking.id)}
                          className="text-destructive"
                        >
                          Cancel Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
