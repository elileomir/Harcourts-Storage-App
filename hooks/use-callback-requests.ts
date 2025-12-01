import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeChannel } from "@/lib/hooks/use-realtime-channel";
import { toast } from "sonner";

export type CallbackRequest = {
  id: string;
  full_name: string;
  phone_number: string;
  preferred_date: string;
  preferred_time: string;
  header: string;
  summary_conversation: string;
  importance: "Low" | "Medium" | "High";
  helpful_insights: string;
  status: "Pending" | "Contacted" | "Completed";
  created_at: string;
  updated_at: string;
};

export type CallbackRequestInput = Omit<
  CallbackRequest,
  "id" | "created_at" | "updated_at" | "status"
>;

export function useCallbackRequests() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: callbackRequests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["callback-requests"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const { data, error } = await supabase
          .from("callback_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .abortSignal(controller.signal);

        if (error) throw error;
        return data as CallbackRequest[];
      } finally {
        clearTimeout(timeoutId);
      }
    },
    retry: 1, // Fail fast on errors (like auth issues) so we don't show a spinner forever
  });

  // Real-time subscription
  useRealtimeChannel("callback-requests-realtime", [
    {
      event: "*",
      schema: "public",
      table: "callback_requests",
      callback: () => {
        queryClient.invalidateQueries({ queryKey: ["callback-requests"] });
      },
    },
  ]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: CallbackRequest["status"];
    }) => {
      const { error, count } = await supabase
        .from("callback_requests")
        .update({ status })
        .eq("id", id)
        .select();

      if (error) throw error;
      if (count === 0)
        throw new Error("No rows updated. You might not have permission.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callback-requests"] });
      toast.success("Status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const createCallbackRequestMutation = useMutation({
    mutationFn: async (request: CallbackRequestInput) => {
      const { error } = await supabase
        .from("callback_requests")
        .insert([request]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callback-requests"] });
      toast.success("Callback request created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create callback request: " + error.message);
    },
  });

  return {
    callbackRequests,
    isLoading,
    error,
    updateStatus: updateStatusMutation.mutate,
    createCallbackRequest: createCallbackRequestMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    isCreatingRequest: createCallbackRequestMutation.isPending,
  };
}
