import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeChannel } from "@/lib/hooks/use-realtime-channel";

export type KnowledgeItem = {
  id: number;
  question: string;
  answer: string;
};

export function useKnowledge() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: knowledge,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["knowledge"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const { data, error } = await supabase
          .from("knowledge_base")
          .select("*")
          .order("id", { ascending: true })
          .abortSignal(controller.signal);

        if (error) throw error;
        return data as KnowledgeItem[];
      } finally {
        clearTimeout(timeoutId);
      }
    },
    retry: 1,
  });

  useRealtimeChannel("knowledge-realtime", [
    {
      event: "*",
      schema: "public",
      table: "knowledge_base",
      callback: () =>
        queryClient.invalidateQueries({ queryKey: ["knowledge"] }),
    },
  ]);

  const addKnowledge = useMutation({
    mutationFn: async (newItem: Omit<KnowledgeItem, "id">) => {
      const { error } = await supabase.from("knowledge_base").insert([newItem]);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["knowledge"] }),
  });

  const updateKnowledge = useMutation({
    mutationFn: async (item: KnowledgeItem) => {
      const { error } = await supabase
        .from("knowledge_base")
        .update({ question: item.question, answer: item.answer })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["knowledge"] }),
  });

  const deleteKnowledge = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("knowledge_base")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["knowledge"] }),
  });

  return {
    knowledge,
    isLoading,
    error,
    addKnowledge,
    updateKnowledge,
    deleteKnowledge,
  };
}
