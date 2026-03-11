import { NextRequest, NextResponse } from "next/server";
import { createRefreshLog, completeRefreshLog, deactivateStaleListings, verifyActiveListings } from "@/lib/db/queries";

/**
 * POST /api/cron/refresh-log
 * Creates a new refresh_log entry for manual refreshes.
 */
export async function POST() {
  const log = await createRefreshLog("manual");
  return NextResponse.json({ logId: log.id });
}

/**
 * PATCH /api/cron/refresh-log
 * Completes a refresh_log entry with results + runs stale deactivation.
 */
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { logId, listingsFound, newListings, errors } = body as {
    logId: number;
    listingsFound: number;
    newListings: number;
    errors?: string;
  };

  if (!logId) {
    return NextResponse.json({ error: "Missing logId" }, { status: 400 });
  }

  // Deactivate listings not re-seen in 1 day, then verify remaining
  const staleCount = await deactivateStaleListings(1);
  const letCount = await verifyActiveListings();
  const totalDeactivated = staleCount + letCount;

  await completeRefreshLog(logId, {
    status: "completed",
    listingsFound,
    newListings,
    staleDeactivated: totalDeactivated,
    errors,
  });

  return NextResponse.json({ success: true, staleDeactivated: totalDeactivated });
}
