import { scrapeOpenRent } from "./openrent";
import { detectAmenities, computeAmenityScore } from "../scoring/amenity-score";
import { adjustTransportScoreByDistance } from "../scoring/transport-score";
import { computeCompositeScore } from "../scoring/composite-score";
import { geocodePostcode, findNearestStation } from "../geo/distance";
import { MAX_WALK_DISTANCE_M, TARGET_POSTCODES } from "../geo/constants";
import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
import type { RawListing } from "./rightmove";
import type { Station } from "../db/schema";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Shared upsert logic: processes raw listings and inserts/updates them in DB.
 * Used by both the cron batch worker and the manual single-postcode refresh.
 */
export async function processAndUpsertListings(
  rawListings: (RawListing & { source: string })[],
  allStations: Station[]
): Promise<{ found: number; newListings: number; errors: string[] }> {
  const errors: string[] = [];
  let newListings = 0;
  const now = new Date().toISOString();

  const validListings = rawListings.filter((l) => l.pricePerMonth > 0);

  for (const raw of validListings) {
    try {
      const existing = await db
        .select()
        .from(schema.listings)
        .where(
          and(
            eq(schema.listings.source, raw.source),
            eq(schema.listings.sourceId, raw.sourceId)
          )
        )
        .get();

      if (existing) {
        // Re-seen: update lastSeen, reactivate, and recompute score
        const compositeScore = computeCompositeScore({
          transportScore: existing.transportScore || 0,
          amenityScore: existing.amenityScore || 0,
          pricePerMonth: existing.pricePerMonth,
          firstSeenDate: existing.firstSeen,
          lastSeenDate: now,
        });

        await db.update(schema.listings)
          .set({ lastSeen: now, isActive: true, deactivatedAt: null, compositeScore })
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
        await sleep(1100);
      }

      const amenities = detectAmenities(raw.description);
      const amenityScore = computeAmenityScore(amenities);

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
        lastSeenDate: now,
      });

      await db.insert(schema.listings).values({
        source: raw.source,
        sourceId: raw.sourceId,
        url: raw.url,
        title: raw.title,
        address: raw.address,
        postcode: raw.postcode,
        lat, lon,
        pricePerMonth: raw.pricePerMonth,
        bedrooms: raw.bedrooms,
        listingType: raw.listingType || "flat",
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

      newListings++;
    } catch (err) {
      errors.push(`Failed to process listing ${raw.sourceId}: ${err}`);
    }
  }

  return { found: rawListings.length, newListings, errors };
}

/**
 * Full scraping + processing pipeline (used by scripts, not cron)
 */
export async function runScrapingPipeline(): Promise<{
  listingsFound: number;
  newListings: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let rawListings: (RawListing & { source: string })[] = [];

  console.log("Starting scraping pipeline...");
  console.log(`Target postcodes: ${TARGET_POSTCODES.join(", ")}`);

  try {
    console.log("\n--- Scraping OpenRent ---");
    const orListings = await scrapeOpenRent(TARGET_POSTCODES);
    rawListings.push(...orListings.map((l) => ({ ...l, source: "openrent" as const })));
    console.log(`OpenRent total: ${orListings.length} listings`);
  } catch (err) {
    const msg = `OpenRent scraping failed: ${err}`;
    console.error(msg);
    errors.push(msg);
  }

  console.log(`\nTotal raw listings: ${rawListings.length}`);

  const allStations = await db.select().from(schema.stations).all();
  console.log(`Loaded ${allStations.length} stations for matching`);

  const result = await processAndUpsertListings(rawListings, allStations);

  console.log(`\nPipeline complete: ${result.found} found, ${result.newListings} new`);
  return {
    listingsFound: result.found,
    newListings: result.newListings,
    errors: [...errors, ...result.errors],
  };
}
