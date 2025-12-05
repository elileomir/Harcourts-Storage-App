import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeChannel } from "@/lib/hooks/use-realtime-channel";
import { triggerAvailabilityWebhook } from "@/lib/webhook-utils";

export type Unit = {
  id: number;
  unit_number: string;
  facility: string;
  unit_type: string;
  size: string;
  price: string;
  bond: string;
  access_hours: string;
  status: "Available" | "Submitted" | "Unavailable";
};

export type UnitInput = Omit<Unit, "id">;

export function useUnits() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: units,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const { data, error } = await supabase
          .from("storage_units")
          .select("*, bookings(*)")
          .order("facility", { ascending: true })
          .order("unit_number", { ascending: true })
          .abortSignal(controller.signal);

        if (error) throw error;
        return data as Unit[];
      } finally {
        clearTimeout(timeoutId);
      }
    },
    retry: 1,
  });

  useRealtimeChannel("units-realtime", [
    {
      event: "*",
      schema: "public",
      table: "storage_units",
      callback: () => queryClient.invalidateQueries({ queryKey: ["units"] }),
    },
  ]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      // First, get the unit to know its facility
      const { data: unit, error: fetchError } = await supabase
        .from("storage_units")
        .select("facility")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("storage_units")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      if (status === "Available" && unit) {
        await triggerAvailabilityWebhook([unit.facility]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });

  const updateUnitsStatus = useMutation({
    mutationFn: async ({
      ids,
      status,
      facilities,
    }: {
      ids: number[];
      status: string;
      facilities?: string[];
    }) => {
      const { error } = await supabase
        .from("storage_units")
        .update({ status })
        .in("id", ids);

      if (error) throw error;

      if (status === "Available" && facilities && facilities.length > 0) {
        await triggerAvailabilityWebhook(facilities);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });

  const deleteUnits = useMutation({
    mutationFn: async (ids: number[]) => {
      const { error } = await supabase
        .from("storage_units")
        .delete()
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });

  const addUnit = useMutation({
    mutationFn: async (newUnit: UnitInput) => {
      const { error } = await supabase.from("storage_units").insert([newUnit]);

      if (error) throw error;

      if (newUnit.status === "Available") {
        await triggerAvailabilityWebhook([newUnit.facility]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });

  const updateUnit = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<Unit>;
    }) => {
      const { error } = await supabase
        .from("storage_units")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      if (updates.status === "Available") {
        let facility = updates.facility;
        if (!facility) {
          const { data: unit } = await supabase
            .from("storage_units")
            .select("facility")
            .eq("id", id)
            .single();
          facility = unit?.facility;
        }

        if (facility) {
          await triggerAvailabilityWebhook([facility]);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });

  const deleteUnit = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("storage_units")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });

  return {
    units,
    isLoading,
    error,
    updateStatus,
    updateUnitsStatus,
    deleteUnits,
    addUnit,
    updateUnit,
    deleteUnit,
  };
}
