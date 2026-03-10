import { scrapeRightmove } from "./rightmove";
import { scrapeOpenRent } from "./openrent";
import { detectAmenities, computeAmenityScore } from "../scoring/amenity-score";
import { adjustTransportScoreByDistance } from "../scoring/transport-score";
import { computeCompositeScore } from "../scoring/composite-score";
import { geocodePostcode } from "../geo/distance";
import { findNearestStation } from "../geo/distance";
import { MAX_WALK_DISTANCE_M, TARGET_POSTCODES } from "../geo/constants";
import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
import type { RawListing } from "./rightmove";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Full scraping + processing pipeline
 */
export async function runScrapingPipeline(): Promise<{
  listingsFound: number;
  newListings: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let listingsFound = 0;
  let newListings = 0;

  console.log("Starting scraping pipeline...");
  console.log(`Target postcodes: ${TARGET_POSTCODES.join(", ")}`);

  let rawListings: (RawListing & { source: string })[] = [];

  try {
    console.log("\n--- Scraping Rightmove ---");
    const rmListings = await scrapeRightmove(TARGET_POSTCODES);
    rawListings.push(...rmListings.map((l) => ({ ...l, source: "rightmove" as const })));
    console.log(`Rightmove total: ${rmListings.length} listings`);
  } catch (err) {
    const msg = `Rightmove scraping failed: ${err}`;
    console.error(msg);
    errors.push(msg);
  }

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

  listingsFound = rawListings.length;
  console.log(`\nTotal raw listings: ${listingsFound}`);

  const allStations = await db.select().from(schema.stations).all();
  console.log(`Loaded ${allStations.length} stations for matching`);

  const now = new Date().toISOString();

  for (const raw of rawListings) {
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
        await db.update(schema.listings)
          .set({ lastSeen: now, isActive: true })
          .where(eq(schema.listings.id, existing.id))
          .run();
        continue;
      }

      let lat: number | null = null;
      let lon: number | null = null;

      if (raw.postcode) {
        const geo = await geocodePostcode(raw.postcode);
        if (geo) {
          lat = geo.lat;
          lon = geo.lon;
        }
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
      });

      await db.insert(schema.listings).values({
        source: raw.source,
        sourceId: raw.sourceId,
        url: raw.url,
        title: raw.title,
        address: raw.address,
        postcode: raw.postcode,
        lat,
        lon,
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

      newListings++;
    } catch (err) {
      errors.push(`Failed to process listing ${raw.sourceId}: ${err}`);
    }
  }

  console.log(`\nPipeline complete: ${listingsFound} found, ${newListings} new`);
  return { listingsFound, newListings, errors };
}
