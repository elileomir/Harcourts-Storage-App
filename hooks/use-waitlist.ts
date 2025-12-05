import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeChannel } from "@/lib/hooks/use-realtime-channel";
import { toast } from "sonner";

export type WaitlistRequest = {
  id: string;
  facility: string | string[];
  full_name: string;
  email_address: string;
  phone_number: string;
  preferred_date: string;
  storage_purpose: string | null;
  status:
    | "Pending"
    | "Contacted"
    | "Offered"
    | "Accepted"
    | "Declined"
    | "Expired";
  created_at: string;
  updated_at: string;
};

export type WaitlistRequestInput = Omit<
  WaitlistRequest,
  "id" | "created_at" | "updated_at" | "status"
>;

export function useWaitlist() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: waitlistRequests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["waitlist-requests"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const { data, error } = await supabase
          .from("waitlist_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .abortSignal(controller.signal);

        if (error) throw error;
        return data as WaitlistRequest[];
      } finally {
        clearTimeout(timeoutId);
      }
    },
    retry: 1,
  });

  // Real-time subscription
  useRealtimeChannel("waitlist-realtime", [
    {
      event: "*",
      schema: "public",
      table: "waitlist_requests",
      callback: () => {
        queryClient.invalidateQueries({ queryKey: ["waitlist-requests"] });
      },
    },
  ]);

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: WaitlistRequest["status"];
    }) => {
      const { error } = await supabase
        .from("waitlist_requests")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist-requests"] });
      toast.success("Status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const updateWaitlistRequest = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: WaitlistRequestInput;
    }) => {
      // Ensure facility is stored as a JSON string if it's an array
      const payload = {
        ...data,
        facility: Array.isArray(data.facility)
          ? JSON.stringify(data.facility)
          : data.facility,
      };

      const { error } = await supabase
        .from("waitlist_requests")
        .update(payload)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist-requests"] });
      toast.success("Waitlist request updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update waitlist request: " + error.message);
    },
  });

  const createWaitlistRequest = useMutation({
    mutationFn: async (request: WaitlistRequestInput) => {
      // Ensure facility is stored as a JSON string if it's an array
      const payload = {
        ...request,
        facility: Array.isArray(request.facility)
          ? JSON.stringify(request.facility)
          : request.facility,
      };

      const { error } = await supabase
        .from("waitlist_requests")
        .insert([payload]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist-requests"] });
      toast.success("Waitlist request created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create waitlist request: " + error.message);
    },
  });

  const deleteWaitlistRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("waitlist_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist-requests"] });
      toast.success("Waitlist request deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete waitlist request: " + error.message);
    },
  });

  const updateWaitlistRequestsStatus = useMutation({
    mutationFn: async ({
      ids,
      status,
    }: {
      ids: string[];
      status: WaitlistRequest["status"];
    }) => {
      const { error } = await supabase
        .from("waitlist_requests")
        .update({ status })
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist-requests"] });
      toast.success("Status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const deleteWaitlistRequests = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("waitlist_requests")
        .delete()
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist-requests"] });
      toast.success("Waitlist requests deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete waitlist requests: " + error.message);
    },
  });

  return {
    waitlistRequests,
    isLoading,
    error,
    updateStatus: updateStatus.mutate,
    createWaitlistRequest: createWaitlistRequest.mutate,
    updateWaitlistRequest: updateWaitlistRequest.mutate,
    deleteWaitlistRequest: deleteWaitlistRequest.mutate,
    isUpdatingStatus: updateStatus.isPending,
    isCreatingRequest: createWaitlistRequest.isPending,
    isUpdatingRequest: updateWaitlistRequest.isPending,
    isDeletingRequest: deleteWaitlistRequest.isPending,
    updateWaitlistRequestsStatus,
    deleteWaitlistRequests,
  };
}
