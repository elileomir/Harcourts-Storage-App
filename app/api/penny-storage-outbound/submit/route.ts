import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateForm } from "@/lib/penny-storage-outbound/validation";
import { normalisePhone } from "@/lib/penny-storage-outbound/validation";
import { buildStorageDynamicVariables } from "@/lib/penny-storage-outbound/types";
import type { StorageOutboundFormData } from "@/lib/penny-storage-outbound/types";
import {
  readStorageRetellEnv,
  createStoragePhoneCall,
  RetellApiError,
} from "@/lib/penny-storage-outbound/retell";

/**
 * POST /api/penny-storage-outbound/submit
 *
 * Order of operations:
 *   1. Auth check
 *   2. Validate form data
 *   3. Read storage Retell env (RETELL_STORAGE_AGENT_ID)
 *   4. Call Retell create-phone-call with storage dynamic variables
 *   5. Return call_id on success
 *
 * No DB audit table — the N8N flow handles post-call logging
 * to call_analytics and updating waitlist_requests.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      formData?: StorageOutboundFormData;
    };
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

    // === Sanitise phone ===
    const formData: StorageOutboundFormData = {
      ...rawFormData,
      clientName: rawFormData.clientName?.trim() || "",
      clientFirstname: rawFormData.clientFirstname?.trim() || "",
      facilityName: rawFormData.facilityName?.trim() || "",
      agencyName: rawFormData.agencyName?.trim() || "",
      toNumber: normalisePhone(rawFormData.toNumber || ""),
      unitDetails: rawFormData.unitDetails?.trim() || "",
    };

    // === Validate ===
    const validation = validateForm(formData);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.firstError ?? "Invalid form data",
          fieldErrors: validation.errors,
        },
        { status: 422 }
      );
    }

    // === Retell env ===
    const retellEnv = readStorageRetellEnv();
    if (!retellEnv) {
      console.error(
        "[penny-storage-outbound] Missing env: RETELL_API_KEY, RETELL_STORAGE_AGENT_ID, or RETELL_FROM_NUMBER"
      );
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // === Build dynamic variables ===
    const dynamicVariables = buildStorageDynamicVariables(formData);

    // === Call Retell ===
    const result = await createStoragePhoneCall({
      env: retellEnv,
      toNumber: formData.toNumber,
      dynamicVariables,
    });

    console.log(
      `[penny-storage-outbound] Call placed: ${result.call_id} → ${formData.toNumber} (facility: ${formData.facilityName})`
    );

    return NextResponse.json({
      success: true,
      retellCallId: result.call_id,
    });
  } catch (error) {
    if (error instanceof RetellApiError) {
      console.error(
        `[penny-storage-outbound] Retell error ${error.status}: ${error.bodyText}`
      );
      return NextResponse.json(
        {
          success: false,
          error: `Call failed: ${error.message}`,
        },
        { status: 502 }
      );
    }

    console.error("[penny-storage-outbound] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
