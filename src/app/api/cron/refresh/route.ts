import { NextRequest, NextResponse } from "next/server";
import { scrapeOpenRent } from "@/lib/scraper/openrent";
import { processAndUpsertListings } from "@/lib/scraper/pipeline";
import { TARGET_POSTCODES } from "@/lib/geo/constants";
import { db, schema } from "@/lib/db";
import {
  getLastRefresh,
  createRefreshLog,
  completeRefreshLog,
  deactivateStaleListings,
} from "@/lib/db/queries";
import type { RawListing } from "@/lib/scraper/rightmove";

export const maxDuration = 60;

/**
 * GET /api/cron/refresh
 *
 * - With valid CRON_SECRET (via Vercel Cron or manual trigger): runs full fan-out refresh
 * - Without secret: returns last refresh status
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If no CRON_SECRET configured or no auth header → just return status
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    const last = await getLastRefresh();
    return NextResponse.json({ lastRefresh: last || null });
  }

  // Authenticated cron call → run full fan-out refresh
  console.log("[Cron] Starting fan-out refresh...");
  const log = await createRefreshLog("cron");

  try {
    // Split postcodes into 3 batches
    const batchSize = Math.ceil(TARGET_POSTCODES.length / 3);
    const batches = [
      TARGET_POSTCODES.slice(0, batchSize),
      TARGET_POSTCODES.slice(batchSize, batchSize * 2),
      TARGET_POSTCODES.slice(batchSize * 2),
    ];

    // Determine base URL for internal calls
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Fire 3 parallel batch requests
    const results = await Promise.allSettled(
      batches.map((postcodes, i) =>
        fetch(`${baseUrl}/api/cron/refresh-batch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cronSecret}`,
          },
          body: JSON.stringify({ postcodes, batchIndex: i }),
        }).then((res) => res.json())
      )
    );

    let totalFound = 0;
    let totalNew = 0;
    const errors: string[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        totalFound += result.value.found || 0;
        totalNew += result.value.new || 0;
        if (result.value.errors) errors.push(...result.value.errors);
      } else {
        errors.push(`Batch failed: ${result.reason}`);
      }
    }

    // Deactivate stale listings
    const staleCount = await deactivateStaleListings(3);

    await completeRefreshLog(log.id, {
      status: "completed",
      listingsFound: totalFound,
      newListings: totalNew,
      staleDeactivated: staleCount,
      errors: errors.length > 0 ? errors.join("\n") : undefined,
    });

    console.log(
      `[Cron] Refresh complete: ${totalFound} found, ${totalNew} new, ${staleCount} deactivated`
    );

    return NextResponse.json({
      success: true,
      listingsFound: totalFound,
      newListings: totalNew,
      staleDeactivated: staleCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    await completeRefreshLog(log.id, {
      status: "failed",
      errors: String(err),
    });
    console.error("[Cron] Refresh failed:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

/**
 * POST /api/cron/refresh?postcode=W2
 * Single-postcode scrape (called from manual UI refresh).
 */
export async function POST(request: NextRequest) {
  const postcode = request.nextUrl.searchParams.get("postcode");
  const source = request.nextUrl.searchParams.get("source") || "openrent";

  if (!postcode) {
    return NextResponse.json({
      postcodes: TARGET_POSTCODES,
      sources: ["openrent"],
    });
  }

  try {
    let rawListings: RawListing[] = [];
    if (source === "openrent") {
      rawListings = await scrapeOpenRent([postcode]);
    }

    const allStations = await db.select().from(schema.stations).all();
    const tagged = rawListings.map((l) => ({ ...l, source }));

    const result = await processAndUpsertListings(tagged, allStations);

    return NextResponse.json({
      success: true,
      postcode,
      source,
      found: result.found,
      new: result.newListings,
    });
  } catch (error) {
    console.error(`Scrape error for ${postcode}/${source}:`, error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
