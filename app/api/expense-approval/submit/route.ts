import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { buildExpenseApprovalPayload, sendToWebhook } from "@/lib/expense-approval/api";
import { checkRateLimit } from "@/lib/expense-approval/rateLimit";
import { validateHoneypot, sanitizeFormData, validateSubmission } from "@/lib/expense-approval/security";
import type { ExpenseApprovalFormData } from "@/lib/expense-approval/types";

/**
 * POST /api/expense-approval/submit
 * Saves expense approval to Supabase and sends payload to n8n webhook.
 * Supports both authenticated (dashboard) and anonymous (public form) submissions.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const rawFormData: ExpenseApprovalFormData = body.formData;
        const existingId: string | undefined = body.existingId;
        const honeypot: string | undefined = body._hp_field;
        const isPublic: boolean = body.isPublic === true;

        if (!rawFormData) {
            return NextResponse.json({ error: "Missing form data" }, { status: 400 });
        }

        // === Security: Honeypot Check ===
        if (!validateHoneypot(honeypot)) {
            return NextResponse.json({ success: true, submissionId: "ok" });
        }

        // === Security: Rate Limiting for public submissions ===
        if (isPublic) {
            const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
                || request.headers.get("x-real-ip")
                || "unknown";

            const rateLimitResult = checkRateLimit(ip);
            if (!rateLimitResult.success) {
                return NextResponse.json(
                    {
                        error: "Too many submissions. Please try again later.",
                        resetAt: rateLimitResult.resetAt,
                    },
                    {
                        status: 429,
                        headers: {
                            "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
                            "X-RateLimit-Remaining": "0",
                        },
                    }
                );
            }
        }

        // === Security: Sanitize + Validate ===
        const formData = sanitizeFormData(rawFormData);
        const validation = validateSubmission(formData);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Clean up extra "ghost" owners before saving
        formData.owners = formData.owners.slice(0, formData.ownerCount);

        // Build payload for n8n
        const payload = buildExpenseApprovalPayload(formData);

        // 🔍 DEBUG: TasWater field tracing
        console.log("🔍 [DEBUG] TasWater formData:", {
            taswater: formData.taswater,
            taswaterChangeOwnership: formData.taswaterChangeOwnership,
            taswaterCancelBpay: formData.taswaterCancelBpay,
            taswaterCancelDirectDebit: formData.taswaterCancelDirectDebit,
            taswaterSettlementDate: formData.taswaterSettlementDate,
        });
        console.log("🔍 [DEBUG] TasWater payload:", {
            taswater_change_ownership: payload.taswater_change_ownership,
            taswater_cancel_bpay: payload.taswater_cancel_bpay,
            taswater_cancel_direct_debit: payload.taswater_cancel_direct_debit,
            taswater_settlement_date: payload.taswater_settlement_date,
        });

        // Summary fields
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
            .join(" ") || "No address";
        const servicesSelected = [
            formData.councilRates ? "Council Rates" : null,
            formData.landTax ? "Land Tax" : null,
            formData.taswater ? "TasWater" : null,
        ]
            .filter(Boolean)
            .join(", ");

        // Get IP and email for audit trail
        const submitterIp = isPublic
            ? (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
                || request.headers.get("x-real-ip")
                || "unknown")
            : null;
        const submitterEmail = isPublic
            ? formData.owners[0]?.email || null
            : null;

        // === Choose Supabase client based on auth status ===
        let savedId: string;

        if (isPublic) {
            const adminSupabase = createAdminClient();

            if (existingId) {
                const { data: existing } = await adminSupabase
                    .from("landlord_expense_approvals")
                    .select("form_data, original_form_data")
                    .eq("id", existingId)
                    .single();

                const originalFormData = existing?.original_form_data || existing?.form_data;

                const { error: updateError } = await adminSupabase
                    .from("landlord_expense_approvals")
                    .update({
                        form_data: formData,
                        original_form_data: originalFormData,
                        updated_at: new Date().toISOString(),
                        owner_name: ownerName,
                        property_address: propertyAddress,
                        services_selected: servicesSelected,
                        submitter_ip: submitterIp,
                    })
                    .eq("id", existingId);

                if (updateError) {
                    console.error("Supabase anonymous update error:", updateError);
                    return NextResponse.json(
                        { error: "Failed to update submission" },
                        { status: 500 }
                    );
                }
                savedId = existingId;
            } else {
                const { data: insertData, error: insertError } = await adminSupabase
                    .from("landlord_expense_approvals")
                    .insert({
                        user_id: null,
                        status: "completed",
                        form_data: formData,
                        owner_name: ownerName,
                        property_address: propertyAddress,
                        services_selected: servicesSelected,
                        submitter_email: submitterEmail,
                        submitter_ip: submitterIp,
                    })
                    .select("id")
                    .single();

                if (insertError) {
                    console.error("Supabase anonymous insert error:", insertError);
                    return NextResponse.json(
                        { error: "Failed to save submission" },
                        { status: 500 }
                    );
                }
                savedId = insertData.id;
            }
        } else {
            const supabase = await createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            if (existingId) {
                const { data: existing } = await supabase
                    .from("landlord_expense_approvals")
                    .select("form_data, original_form_data")
                    .eq("id", existingId)
                    .single();

                const originalFormData = existing?.original_form_data || existing?.form_data;

                const { error: updateError } = await supabase
                    .from("landlord_expense_approvals")
                    .update({
                        status: "completed",
                        form_data: formData,
                        original_form_data: originalFormData,
                        updated_at: new Date().toISOString(),
                        owner_name: ownerName,
                        property_address: propertyAddress,
                        services_selected: servicesSelected,
                    })
                    .eq("id", existingId)
                    .eq("user_id", user.id);

                if (updateError) {
                    console.error("Supabase update error:", updateError);
                    return NextResponse.json(
                        { error: "Failed to update submission" },
                        { status: 500 }
                    );
                }
                savedId = existingId;
            } else {
                const { data: insertData, error: insertError } = await supabase
                    .from("landlord_expense_approvals")
                    .insert({
                        user_id: user.id,
                        status: "completed",
                        form_data: formData,
                        owner_name: ownerName,
                        property_address: propertyAddress,
                        services_selected: servicesSelected,
                    })
                    .select("id")
                    .single();

                if (insertError) {
                    console.error("Supabase insert error:", insertError);
                    return NextResponse.json(
                        { error: "Failed to save submission" },
                        { status: 500 }
                    );
                }
                savedId = insertData.id;
            }
        }

        // Send to n8n webhook
        const webhookResult = await sendToWebhook({ ...payload });

        if (!webhookResult.success) {
            console.warn("Webhook failed but submission saved:", webhookResult.error);
        }

        return NextResponse.json({
            success: true,
            submissionId: savedId,
            webhookSent: webhookResult.success,
            docusignUrl: webhookResult.docusignUrl || null,
            ownerName: ownerName,
        });
    } catch (error) {
        console.error("Expense approval submit error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Submission failed" },
            { status: 500 }
        );
    }
}
