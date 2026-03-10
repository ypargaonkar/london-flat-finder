import { NextRequest, NextResponse } from "next/server";
import { scrapeOpenRent } from "@/lib/scraper/openrent";
import { processAndUpsertListings } from "@/lib/scraper/pipeline";
import { db, schema } from "@/lib/db";
import type { RawListing } from "@/lib/scraper/rightmove";

export const maxDuration = 60;

/**
 * POST /api/cron/refresh-batch
 * Worker endpoint: scrapes a batch of postcodes sequentially.
 * Called by the orchestrator (/api/cron/refresh).
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { postcodes, batchIndex } = body as { postcodes: string[]; batchIndex: number };

  if (!postcodes || !Array.isArray(postcodes)) {
    return NextResponse.json({ error: "Missing postcodes array" }, { status: 400 });
  }

  console.log(`[Batch ${batchIndex}] Starting: ${postcodes.join(", ")}`);

  const allStations = await db.select().from(schema.stations).all();
  let totalFound = 0;
  let totalNew = 0;
  const errors: string[] = [];

  for (const pc of postcodes) {
    try {
      const rawListings = await scrapeOpenRent([pc]);
      const tagged: (RawListing & { source: string })[] = rawListings.map((l) => ({
        ...l,
        source: "openrent",
      }));

      const result = await processAndUpsertListings(tagged, allStations);
      totalFound += result.found;
      totalNew += result.newListings;
      errors.push(...result.errors);

      console.log(`[Batch ${batchIndex}] ${pc}: ${result.found} found, ${result.newListings} new`);
    } catch (err) {
      const msg = `[Batch ${batchIndex}] ${pc} failed: ${err}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  console.log(`[Batch ${batchIndex}] Complete: ${totalFound} found, ${totalNew} new`);

  return NextResponse.json({
    batchIndex,
    found: totalFound,
    new: totalNew,
    errors: errors.length > 0 ? errors : undefined,
  });
}
