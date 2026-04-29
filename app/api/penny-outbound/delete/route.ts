import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * DELETE /api/penny-outbound/delete?id=<uuid>
 *
 * Removes a Penny outbound call audit row. Requires authentication.
 * RLS allows any authenticated user to delete (matches expense pattern).
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing call id" },
        { status: 400 }
      );
    }

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

    const { error } = await supabase
      .from("penny_outbound_calls")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[penny-outbound/delete] delete failed:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[penny-outbound/delete] unhandled error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      },
      { status: 500 }
    );
  }
}
