/**
 * Hook: useStorageOutboundData
 *
 * Fetches waitlist entries, distinct facilities, and available units
 * for the Penny Storage Outbound call form.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useState, useCallback, useMemo } from "react";
import type { Unit } from "@/hooks/use-units";
import type { WaitlistRequest } from "@/hooks/use-waitlist";

/**
 * Convert local AU phone (0400123456) → E.164 (+61400123456).
 * Already-international numbers are left untouched.
 */
function normaliseToE164(raw: string): string {
  const stripped = raw.replace(/[\s\-()]/g, "").trim();
  if (stripped.startsWith("+")) return stripped;        // already international
  if (stripped.startsWith("0")) return `+61${stripped.slice(1)}`; // local AU → E.164
  return stripped;
}

/** A simplified waitlist entry for the selector */
export interface WaitlistOption {
  id: string;
  fullName: string;
  phoneNumber: string;
  facility: string;
  status: WaitlistRequest["status"];
}

/** Available unit summary for display */
export interface AvailableUnit {
  id: number;
  unitNumber: string;
  size: string;
  price: string;
  bond: string;
  unitType: string;
}

/**
 * Format available units into a Retell-friendly string
 * Example: "Unit 5: 3x6m Roller Door at Deegan Marine — $150/month, $150 bond"
 */
export function formatUnitDetails(
  units: AvailableUnit[],
  facilityName: string
): string {
  if (units.length === 0) return "No units currently available at this facility.";

  return units
    .map(
      (u) =>
        `Unit ${u.unitNumber}: ${u.size} ${u.unitType} at ${facilityName} — $${u.price}/month, $${u.bond} bond`
    )
    .join("\n");
}

export function useStorageOutboundData() {
  const supabase = createClient();
  const [selectedFacility, setSelectedFacility] = useState<string>("");

  // === Waitlist entries (Pending/Contacted — callable statuses) ===
  const {
    data: waitlistEntries,
    isLoading: waitlistLoading,
  } = useQuery({
    queryKey: ["storage-outbound-waitlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waitlist_requests")
        .select("id, full_name, phone_number, facility, status")
        .in("status", ["Pending", "Contacted"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((entry): WaitlistOption => ({
        id: entry.id,
        fullName: entry.full_name,
        phoneNumber: normaliseToE164(entry.phone_number || ""),
        facility: Array.isArray(entry.facility)
          ? entry.facility[0] || ""
          : typeof entry.facility === "string"
            ? (() => {
                try {
                  const parsed = JSON.parse(entry.facility);
                  return Array.isArray(parsed) ? parsed[0] || "" : entry.facility;
                } catch {
                  return entry.facility;
                }
              })()
            : "",
        status: entry.status,
      }));
    },
    staleTime: 30000,
  });

  // === All storage units (to derive facilities + availability) ===
  const {
    data: allUnits,
    isLoading: unitsLoading,
  } = useQuery({
    queryKey: ["storage-outbound-units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storage_units")
        .select("id, unit_number, facility, unit_type, size, price, bond, status")
        .order("facility")
        .order("unit_number");

      if (error) throw error;
      return data as Unit[];
    },
    staleTime: 30000,
  });

  // === Derived: distinct facilities ===
  const facilities = useMemo(() => {
    if (!allUnits) return [];
    const set = new Set(allUnits.map((u) => u.facility));
    return Array.from(set).sort();
  }, [allUnits]);

  // === Derived: available units for selected facility ===
  const availableUnits = useMemo((): AvailableUnit[] => {
    if (!allUnits || !selectedFacility) return [];
    return allUnits
      .filter(
        (u) =>
          u.facility === selectedFacility && u.status === "Available"
      )
      .map((u) => ({
        id: u.id,
        unitNumber: u.unit_number,
        size: u.size,
        price: u.price,
        bond: u.bond,
        unitType: u.unit_type,
      }));
  }, [allUnits, selectedFacility]);

  const selectFacility = useCallback((facility: string) => {
    setSelectedFacility(facility);
  }, []);

  return {
    /** Callable waitlist entries */
    waitlistEntries: waitlistEntries || [],
    waitlistLoading,
    /** Distinct facility names */
    facilities,
    /** Available units for the selected facility */
    availableUnits,
    /** Count of available units at selected facility */
    availableCount: availableUnits.length,
    /** Select a facility to filter available units */
    selectFacility,
    /** Currently selected facility */
    selectedFacility,
    /** Loading state */
    isLoading: waitlistLoading || unitsLoading,
  };
}
