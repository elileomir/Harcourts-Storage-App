import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeChannel } from "@/lib/hooks/use-realtime-channel";

export type Booking = {
  id: number;
  unit_id: number;
  customer_name: string;
  customer_email: string;
  customer_mobile: string | null;
  lease_start_date: string;
  lease_end_date: string | null;
  docusign_link: string | null;
  status:
    | "Pending"
    | "Approved"
    | "Active"
    | "Ending"
    | "Completed"
    | "Rejected"
    | "Cancelled";
  monthly_rent: number | null;
  storage_units: {
    unit_number: string;
    facility: string;
  };
  created_at: string;
  platform?: string;
};

export function useBookings() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*, storage_units(unit_number, facility)") // Platform is auto-selected if in *
          .abortSignal(controller.signal);

        if (error) throw error;
        return data as Booking[];
      } finally {
        clearTimeout(timeoutId);
      }
    },
    retry: 1,
  });

  useRealtimeChannel("bookings-realtime", [
    {
      event: "*",
      schema: "public",
      table: "bookings",
      callback: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
    },
  ]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const updateBooking = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<Booking>;
    }) => {
      const { error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const deleteBooking = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("bookings").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const updateBookingsStatus = useMutation({
    mutationFn: async ({ ids, status }: { ids: number[]; status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const deleteBookings = useMutation({
    mutationFn: async (ids: number[]) => {
      const { error } = await supabase.from("bookings").delete().in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  return {
    bookings,
    isLoading,
    error,
    updateStatus,
    updateBooking,
    deleteBooking,
    updateBookingsStatus,
    deleteBookings,
  };
}
