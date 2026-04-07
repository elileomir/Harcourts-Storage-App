/**
 * Expense Approval History Storage
 * Supabase CRUD for draft/history (mirrors offer/historyStorage.ts)
 */

import { createClient } from "@/lib/supabase/client";
import type { ExpenseApprovalFormData } from "./types";

const TABLE = "landlord_expense_approvals";

export interface ExpenseApprovalHistoryEntry {
    id: string;
    propertyAddress: string;
    ownerName: string;
    servicesSelected: string;
    status: string;
    updatedAt: string;
    isOwn: boolean;
}

// ============================================
// Get history entries
// ============================================
export async function getHistory(): Promise<ExpenseApprovalHistoryEntry[]> {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from(TABLE)
        .select("id, property_address, owner_name, services_selected, status, updated_at, user_id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(20);

    if (error) {
        console.error("Failed to fetch history:", error);
        return [];
    }

    return (data || []).map((row) => ({
        id: row.id,
        propertyAddress: row.property_address || "No address",
        ownerName: row.owner_name || "No owner",
        servicesSelected: row.services_selected || "",
        status: row.status,
        updatedAt: row.updated_at,
        isOwn: row.user_id === user.id,
    }));
}

// ============================================
// Save submission (create or update)
// ============================================
export async function saveSubmission(
    formData: ExpenseApprovalFormData,
    status: "draft" | "completed",
    existingId?: string
): Promise<string | null> {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const ownerName =
        formData.owners[0]?.fullName ||
        formData.companyName ||
        formData.trustName ||
        "Untitled";

    const propertyAddress = [
        formData.propertyStreet,
        formData.propertySuburb,
        formData.propertyState,
        formData.propertyPostcode,
    ]
        .filter(Boolean)
        .join(" ");

    const servicesSelected = [
        formData.councilRates ? "Council Rates" : null,
        formData.landTax ? "Land Tax" : null,
        formData.taswater ? "TasWater" : null,
    ]
        .filter(Boolean)
        .join(", ");

    if (existingId) {
        const { error } = await supabase
            .from(TABLE)
            .update({
                form_data: formData,
                status,
                property_address: propertyAddress,
                owner_name: ownerName,
                services_selected: servicesSelected,
                updated_at: new Date().toISOString(),
            })
            .eq("id", existingId)
            .eq("user_id", user.id);

        if (error) {
            console.error("Failed to update submission:", error);
            return null;
        }
        return existingId;
    }

    const { data, error } = await supabase
        .from(TABLE)
        .insert({
            user_id: user.id,
            status,
            form_data: formData,
            property_address: propertyAddress,
            owner_name: ownerName,
            services_selected: servicesSelected,
        })
        .select("id")
        .single();

    if (error) {
        console.error("Failed to save submission:", error);
        return null;
    }

    return data?.id || null;
}

// ============================================
// Load submission by ID
// ============================================
export async function loadSubmission(id: string): Promise<ExpenseApprovalFormData | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from(TABLE)
        .select("form_data")
        .eq("id", id)
        .single();

    if (error || !data) {
        console.error("Failed to load submission:", error);
        return null;
    }

    return data.form_data as ExpenseApprovalFormData;
}

// ============================================
// Delete submission
// ============================================
export async function deleteSubmission(id: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase.from(TABLE).delete().eq("id", id);

    if (error) {
        console.error("Failed to delete submission:", error);
        return false;
    }

    return true;
}

// ============================================
// Relative time helper
// ============================================
export function getRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}
