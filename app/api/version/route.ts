import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const buildId =
    process.env.NEXT_PUBLIC_BUILD_ID ??
    process.env.BUILD_ID ??
    "unknown";

  return NextResponse.json(
    { buildId },
    {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    }
  );
}
