import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { createClient } from "@libsql/client";

// One-time migration: add listing_type column if missing
let migrated = false;
async function ensureListingTypeColumn() {
  if (migrated) return;
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:./data/db.sqlite",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    await client.execute("ALTER TABLE listings ADD COLUMN listing_type TEXT DEFAULT 'flat'");
  } catch {
    // Column already exists — ignore
  }
  migrated = true;
}

export async function GET(request: NextRequest) {
  await ensureListingTypeColumn();
  const searchParams = request.nextUrl.searchParams;
  const maxPrice = searchParams.get("maxPrice");
  const hasWasher = searchParams.get("hasWasher");
  const hasDryer = searchParams.get("hasDryer");
  const hasDishwasher = searchParams.get("hasDishwasher");
  const hasModularKitchen = searchParams.get("hasModularKitchen");

  try {
    // Fetch all listings (JS-side filter to avoid libsql boolean issues)
    const allListings = await db.select().from(schema.listings).all();
    const allStations = await db.select().from(schema.stations).all();

    // Build station lookup
    const stationMap = new Map(allStations.map((s) => [s.id, s]));

    // Filter active listings
    let results = allListings.filter((l) => l.isActive !== false);
    results.sort((a, b) => (b.compositeScore || 0) - (a.compositeScore || 0));

    if (maxPrice) {
      const max = parseInt(maxPrice);
      results = results.filter((l) => !l.pricePerMonth || l.pricePerMonth <= max);
    }
    if (hasWasher === "true") results = results.filter((l) => l.hasWasher);
    if (hasDryer === "true") results = results.filter((l) => l.hasDryer);
    if (hasDishwasher === "true") results = results.filter((l) => l.hasDishwasher);
    if (hasModularKitchen === "true") results = results.filter((l) => l.hasModularKitchen);

    // Enrich with station name + fix OpenRent URLs
    const enriched = results.map((l) => {
      const station = l.nearestStationId ? stationMap.get(l.nearestStationId) : null;
      // Fix old-format OpenRent URLs
      let url = l.url;
      if (l.source === "openrent" && url.includes("/property-to-rent/") && !url.includes("/london/")) {
        const idMatch = url.match(/\/property-to-rent\/(\d+)/);
        if (idMatch) {
          url = `https://www.openrent.co.uk/property-to-rent/london/flat/${idMatch[1]}`;
        }
      }
      // Infer listingType for old data that doesn't have it set
      let listingType = l.listingType || "flat";
      if (listingType === "flat") {
        const text = ((l.title || "") + " " + (l.description || "")).toLowerCase();
        if (text.includes("studio") || l.bedrooms === 0) listingType = "studio";
        else if (text.includes("flat share") || text.includes("flatshare") || text.includes("house share")
          || text.includes("room in") || text.includes("shared")) listingType = "flatshare";
      }
      return {
        ...l,
        url,
        listingType,
        stationName: station?.name || null,
        stationZone: station?.zone || null,
        journeyToOfficeMin: station?.journeyToOfficeMin || null,
      };
    });

    const totalActive = enriched.length;
    const avgPrice = totalActive > 0
      ? Math.round(enriched.reduce((sum, l) => sum + (l.pricePerMonth || 0), 0) / totalActive)
      : 0;
    const avgScore = totalActive > 0
      ? Math.round(enriched.reduce((sum, l) => sum + (l.compositeScore || 0), 0) / totalActive)
      : 0;

    return NextResponse.json({
      listings: enriched,
      stats: { totalActive, avgPrice, avgScore },
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}
