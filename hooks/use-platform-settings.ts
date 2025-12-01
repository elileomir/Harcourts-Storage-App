import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface PlatformSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  description?: string;
  updated_at?: string;
}

export function usePlatformSettings() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const { data, error } = await supabase
          .from("platform_settings")
          .select("*")
          .order("setting_key")
          .abortSignal(controller.signal);

        if (error) throw error;
        return data as PlatformSetting[];
      } finally {
        clearTimeout(timeoutId);
      }
    },
    retry: 1,
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data, error } = await supabase
        .from("platform_settings")
        .update({ setting_value: value })
        .eq("setting_key", key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  // Helper functions to get specific settings
  const getSetting = (key: string): string | undefined => {
    return settings?.find((s) => s.setting_key === key)?.setting_value;
  };

  const getMonthlyCost = (): number => {
    const value = getSetting("platform_monthly_cost");
    return value ? parseFloat(value) : 20; // Default $20
  };

  const getMonthlyCredits = (): number => {
    const value = getSetting("platform_monthly_credits");
    return value ? parseInt(value) : 100000; // Default 100k
  };

  const getCostPerCredit = (): number => {
    const cost = getMonthlyCost();
    const credits = getMonthlyCredits();
    return cost / credits; // e.g., $20 / 100000 = $0.0002 per credit
  };

  const getRevenueCommissionRate = (): number => {
    const value = getSetting("revenue_commission_rate");
    return value ? parseFloat(value) : 0.1; // Default 10% commission
  };

  const getAppDomain = (): string => {
    const value = getSetting("app_domain");
    return value || "https://harcourtsstorageapp.netlify.app"; // Default domain
  };

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    getSetting,
    getMonthlyCost,
    getMonthlyCredits,
    getCostPerCredit,
    getRevenueCommissionRate,
    getAppDomain,
  };
}
