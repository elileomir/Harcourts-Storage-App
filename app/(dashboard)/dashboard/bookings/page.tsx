"use client";

import { useState } from "react";
import { BookingsTable } from "@/components/features/bookings/bookings-table";
import { BookingsSummary } from "@/components/features/bookings/bookings-summary";
import { BookingDialog } from "@/components/features/bookings/booking-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useBookings, Booking } from "@/hooks/use-bookings";
import { useUnits } from "@/hooks/use-units";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function BookingsPage() {
  const { bookings, isLoading, error, updateStatus, updateBooking } =
    useBookings();
  const { units } = useUnits();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setDialogOpen(true);
  };

  const handleSubmit = (id: number, updates: Partial<Booking>) => {
    updateBooking.mutate(
      { id, updates },
      {
        onSuccess: () => {
          toast.success("Booking updated successfully");
          setDialogOpen(false);
          setEditingBooking(null);
        },
        onError: () => {
          toast.error("Failed to update booking", {
            description: "Please try again",
          });
        },
      }
    );
  };

  const handleCancelClick = (id: number) => {
    setBookingToCancel(id);
    setCancelConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      updateStatus.mutate(
        { id: bookingToCancel, status: "Cancelled" },
        {
          onSuccess: () => {
            toast.success("Booking cancelled successfully");
            setCancelConfirmOpen(false);
            setBookingToCancel(null);
          },
          onError: () => {
            toast.error("Failed to cancel booking", {
              description: "Please try again",
            });
          },
        }
      );
    }
  };

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast.success("Status updated", {
            description: `Booking status changed to ${status}`,
          });
        },
        onError: () => {
          toast.error("Failed to update status");
        },
      }
    );
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
        <h3 className="text-lg font-semibold">Failed to load bookings</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          There was an error loading the bookings. Please try again.
        </p>
        <Button onClick={() => window.location.reload()}>Reload Page</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Booking Management</h1>
      </div>
      <BookingsSummary bookings={bookings || []} />
      <BookingsTable
        bookings={bookings || []}
        onStatusUpdate={handleStatusUpdate}
        onEdit={handleEdit}
        onCancel={handleCancelClick}
      />
      <BookingDialog
        key={editingBooking?.id || "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        booking={editingBooking}
        onSubmit={handleSubmit}
        units={
          units?.map((u) => ({
            id: u.id,
            unit_number: u.unit_number,
            facility: u.facility,
          })) || []
        }
      />
      <ConfirmationDialog
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        onConfirm={handleConfirmCancel}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        variant="warning"
      />
    </div>
  );
}
