import { NextResponse } from "next/server";
import { runScrapingPipeline } from "@/lib/scraper/pipeline";
import { createRefreshLog, completeRefreshLog, getLastRefresh } from "@/lib/db/queries";

export async function POST() {
  const log = await createRefreshLog();

  try {
    const result = await runScrapingPipeline();

    await completeRefreshLog(log.id, {
      status: "completed",
      listingsFound: result.listingsFound,
      newListings: result.newListings,
      errors: result.errors.length > 0 ? result.errors.join("\n") : undefined,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    await completeRefreshLog(log.id, {
      status: "failed",
      errors: String(error),
    });

    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  const last = await getLastRefresh();
  return NextResponse.json({ lastRefresh: last || null });
}
