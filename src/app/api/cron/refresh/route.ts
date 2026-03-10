import { NextRequest, NextResponse } from "next/server";
import { scrapeRightmove } from "@/lib/scraper/rightmove";
import { scrapeOpenRent } from "@/lib/scraper/openrent";
import { detectAmenities, computeAmenityScore } from "@/lib/scoring/amenity-score";
import { adjustTransportScoreByDistance } from "@/lib/scoring/transport-score";
import { computeCompositeScore } from "@/lib/scoring/composite-score";
import { geocodePostcode, findNearestStation } from "@/lib/geo/distance";
import { MAX_WALK_DISTANCE_M, TARGET_POSTCODES } from "@/lib/geo/constants";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { getLastRefresh, createRefreshLog, completeRefreshLog } from "@/lib/db/queries";

export const maxDuration = 60;

/**
 * POST /api/cron/refresh?postcode=W2
 * Scrapes a single postcode (or a small batch). Called repeatedly from the client.
 */
export async function POST(request: NextRequest) {
  const postcode = request.nextUrl.searchParams.get("postcode");
  const source = request.nextUrl.searchParams.get("source") || "rightmove";

  // If no postcode specified, return the list of postcodes to scrape
  if (!postcode) {
    return NextResponse.json({
      postcodes: TARGET_POSTCODES,
      sources: ["rightmove", "openrent"],
    });
  }

  try {
    // Scrape single postcode from single source
    let rawListings: Array<{
      sourceId: string;
      url: string;
      title: string;
      address: string;
      postcode: string;
      pricePerMonth: number;
      bedrooms: number;
      description: string;
      imageUrls: string[];
      lat?: number;
      lon?: number;
    }> = [];

    if (source === "rightmove") {
      rawListings = await scrapeRightmove([postcode]);
    } else {
      rawListings = await scrapeOpenRent([postcode]);
    }

    // Load stations for matching
    const allStations = await db.select().from(schema.stations).all();
    const now = new Date().toISOString();
    let newCount = 0;

    // Filter out listings without prices
    const validListings = rawListings.filter((l) => l.pricePerMonth > 0);
    console.log(`  ${rawListings.length} raw listings, ${validListings.length} with valid prices`);

    for (const raw of validListings) {
      // Check existing
      const existing = await db
        .select()
        .from(schema.listings)
        .where(
          and(
            eq(schema.listings.source, source),
            eq(schema.listings.sourceId, raw.sourceId)
          )
        )
        .get();

      if (existing) {
        await db.update(schema.listings)
          .set({ lastSeen: now, isActive: true })
          .where(eq(schema.listings.id, existing.id))
          .run();
        continue;
      }

      // Use lat/lon from scraper if available, otherwise geocode
      let lat: number | null = raw.lat || null;
      let lon: number | null = raw.lon || null;
      if (!lat && !lon && raw.postcode) {
        const geo = await geocodePostcode(raw.postcode);
        if (geo) { lat = geo.lat; lon = geo.lon; }
      }

      // Amenities
      const amenities = detectAmenities(raw.description);
      const amenityScore = computeAmenityScore(amenities);

      // Nearest station
      let nearestStationId: number | null = null;
      let distanceToStationM: number | null = null;
      let transportScore = 0;

      if (lat && lon) {
        const nearest = findNearestStation(lat, lon, allStations);
        if (nearest && nearest.distanceM <= MAX_WALK_DISTANCE_M) {
          nearestStationId = nearest.stationId;
          distanceToStationM = nearest.distanceM;
          const station = allStations.find((s) => s.id === nearest.stationId);
          if (station) {
            transportScore = adjustTransportScoreByDistance(
              station.transportScore || 0,
              nearest.distanceM
            );
          }
        }
      }

      const compositeScore = computeCompositeScore({
        transportScore,
        amenityScore,
        pricePerMonth: raw.pricePerMonth,
        firstSeenDate: now,
      });

      await db.insert(schema.listings).values({
        source,
        sourceId: raw.sourceId,
        url: raw.url,
        title: raw.title,
        address: raw.address,
        postcode: raw.postcode,
        lat, lon,
        pricePerMonth: raw.pricePerMonth,
        bedrooms: raw.bedrooms,
        description: raw.description,
        imageUrls: JSON.stringify(raw.imageUrls),
        furnishing: amenities.furnishing,
        hasWasher: amenities.hasWasher,
        hasDryer: amenities.hasDryer,
        hasModularKitchen: amenities.hasModularKitchen,
        hasDishwasher: amenities.hasDishwasher,
        nearestStationId,
        distanceToStationM,
        transportScore,
        amenityScore,
        compositeScore,
        firstSeen: now,
        lastSeen: now,
        isActive: true,
      }).run();

      newCount++;
    }

    // Count total in DB after insert
    const totalInDb = await db.select().from(schema.listings).all();
    console.log(`  Total listings in DB after scrape: ${totalInDb.length}`);

    return NextResponse.json({
      success: true,
      postcode,
      source,
      found: rawListings.length,
      valid: validListings.length,
      new: newCount,
      totalInDb: totalInDb.length,
    });
  } catch (error) {
    console.error(`Scrape error for ${postcode}/${source}:`, error);
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
