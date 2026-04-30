import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  readRetellEnv,
  createPhoneCall,
  createWebCall,
  RetellApiError,
} from "@/lib/penny-outbound/retell";
import type {
  PennyOutboundCallRow,
  RetellDynamicVariables,
} from "@/lib/penny-outbound/types";

/**
 * POST /api/penny-outbound/recall
 *
 * Re-dial a previous call using its stored dynamic_variables. Always inserts
 * a NEW row — the original is left untouched so the audit trail records every
 * attempt independently.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string };
    const sourceId = body.id;

    if (!sourceId) {
      return NextResponse.json(
        { success: false, error: "Missing call id" },
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

    // === Load source row ===
    const { data: source, error: loadError } = await supabase
      .from("penny_outbound_calls")
      .select("*")
      .eq("id", sourceId)
      .single<PennyOutboundCallRow>();

    if (loadError || !source) {
      return NextResponse.json(
        { success: false, error: "Original call not found" },
        { status: 404 }
      );
    }

    const dynamicVariables = source.dynamic_variables as RetellDynamicVariables;

    // === Insert NEW audit row (status: 'initiating') ===
    const recallEnv = readRetellEnv();

    const { data: inserted, error: insertError } = await supabase
      .from("penny_outbound_calls")
      .insert({
        user_id: user.id,
        to_number: source.to_number,
        applicant_name: source.applicant_name,
        property_address: source.property_address,
        agency_name: source.agency_name,
        referee_name: source.referee_name,
        referee_relationship: source.referee_relationship,
        tenancy_address: source.tenancy_address,
        tenancy_landlord_type: source.tenancy_landlord_type,
        application_id: source.application_id,
        call_mode: source.call_mode,
        retell_call_status: "initiating",
        dynamic_variables: dynamicVariables,
        from_number: source.from_number || recallEnv?.fromNumber || null,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("[penny-outbound/recall] insert failed:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to record recall" },
        { status: 500 }
      );
    }
    const rowId = inserted.id as string;

    // === Env ===
    const env = readRetellEnv();
    if (
      !env ||
      (source.call_mode === "phone" && !env.fromNumber)
    ) {
      const errorMsg = !env
        ? "Penny is not configured"
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

    // === Dial ===
    try {
      let retellCallId: string;
      let accessToken: string | undefined;

      if (source.call_mode === "phone") {
        const result = await createPhoneCall({
          env,
          toNumber: source.to_number,
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

      console.error("[penny-outbound/recall] retell call failed:", err);

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
    console.error("[penny-outbound/recall] unhandled error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Recall failed",
      },
      { status: 500 }
    );
  }
}
