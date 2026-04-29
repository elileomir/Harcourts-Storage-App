import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFormData, buildDynamicVariables } from "@/lib/penny-outbound/security";
import { validateForm } from "@/lib/penny-outbound/validation";
import {
  readRetellEnv,
  createPhoneCall,
  createWebCall,
  RetellApiError,
} from "@/lib/penny-outbound/retell";
import type { PennyOutboundFormData } from "@/lib/penny-outbound/types";

/**
 * POST /api/penny-outbound/submit
 *
 * Order of operations:
 *   1. Auth check
 *   2. Sanitise + validate form data
 *   3. Insert audit row (status: 'initiating')
 *   4. Read Retell env — fail row + return 500 if missing
 *   5. Call Retell create-phone-call | create-web-call
 *   6. Patch row with retell_call_id + status
 *
 * The DB row is the source of truth. Even on Retell failure, the row
 * exists with status='failed' and a populated error_message.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { formData?: PennyOutboundFormData };
    const rawFormData = body.formData;

    if (!rawFormData) {
      return NextResponse.json(
        { success: false, error: "Missing form data" },
        { status: 400 }
      );
    }

    // === Auth ===
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // === Sanitise + validate ===
    const formData = sanitizeFormData(rawFormData);
    const validation = validateForm(formData);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.firstError ?? "Invalid form data",
          fieldErrors: validation.errors,
        },
        { status: 400 }
      );
    }

    const dynamicVariables = buildDynamicVariables(formData);

    // === Insert audit row ===
    const { data: inserted, error: insertError } = await supabase
      .from("penny_outbound_calls")
      .insert({
        user_id: user.id,
        to_number: formData.toNumber,
        applicant_name: formData.applicantName,
        property_address: formData.propertyAddress,
        agency_name: formData.agencyName,
        referee_name: formData.refereeName,
        referee_relationship: formData.refereeRelationship,
        tenancy_address: formData.tenancyAddress || null,
        tenancy_landlord_type: formData.tenancyLandlordType || null,
        application_id: formData.applicationId || null,
        call_mode: formData.callMode,
        retell_call_status: "initiating",
        dynamic_variables: dynamicVariables,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("[penny-outbound/submit] insert failed:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to record call" },
        { status: 500 }
      );
    }
    const rowId = inserted.id as string;

    // === Read env ===
    const env = readRetellEnv();
    if (
      !env ||
      (formData.callMode === "phone" && !env.fromNumber)
    ) {
      const errorMsg = !env
        ? "Penny is not configured (missing RETELL_API_KEY or RETELL_AGENT_ID)"
        : "Penny is not configured (missing RETELL_FROM_NUMBER for phone mode)";
      await supabase
        .from("penny_outbound_calls")
        .update({
          retell_call_status: "failed",
          error_message: errorMsg,
        })
        .eq("id", rowId);
      return NextResponse.json(
        { success: false, callId: rowId, error: errorMsg },
        { status: 500 }
      );
    }

    // === Place the call ===
    try {
      let retellCallId: string;
      let accessToken: string | undefined;

      if (formData.callMode === "phone") {
        const result = await createPhoneCall({
          env,
          toNumber: formData.toNumber,
          dynamicVariables,
        });
        retellCallId = result.call_id;
      } else {
        const result = await createWebCall({ env, dynamicVariables });
        retellCallId = result.call_id;
        accessToken = result.access_token;
      }

      await supabase
        .from("penny_outbound_calls")
        .update({
          retell_call_id: retellCallId,
          retell_call_status: "registered",
        })
        .eq("id", rowId);

      return NextResponse.json({
        success: true,
        callId: rowId,
        retellCallId,
        accessToken,
      });
    } catch (err) {
      const errorMessage =
        err instanceof RetellApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Retell call failed";

      console.error("[penny-outbound/submit] retell call failed:", err);

      await supabase
        .from("penny_outbound_calls")
        .update({
          retell_call_status: "failed",
          error_message: errorMessage.slice(0, 1000),
        })
        .eq("id", rowId);

      return NextResponse.json(
        { success: false, callId: rowId, error: errorMessage },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("[penny-outbound/submit] unhandled error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Submission failed",
      },
      { status: 500 }
    );
  }
}
