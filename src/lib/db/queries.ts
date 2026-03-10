import { db, schema } from "./index";
import { eq, and, lte, desc, sql } from "drizzle-orm";
import type { Station, Listing, NewStation, NewListing } from "./schema";

// ---- Stations ----

export async function getAllStations(): Promise<Station[]> {
  return db.select().from(schema.stations).all();
}

export async function getStationById(id: number): Promise<Station | undefined> {
  return db.select().from(schema.stations).where(eq(schema.stations.id, id)).get();
}

export async function getTopStations(limit = 20): Promise<Station[]> {
  return db
    .select()
    .from(schema.stations)
    .orderBy(desc(schema.stations.transportScore))
    .limit(limit)
    .all();
}

// ---- Listings ----

export async function getActiveListings(filters?: {
  maxPrice?: number;
  minScore?: number;
  hasWasher?: boolean;
  hasDryer?: boolean;
  hasDishwasher?: boolean;
  hasModularKitchen?: boolean;
}): Promise<Listing[]> {
  let results = await db
    .select()
    .from(schema.listings)
    .where(eq(schema.listings.isActive, true))
    .orderBy(desc(schema.listings.compositeScore))
    .all();

  return results.filter((listing) => {
    if (filters?.maxPrice && listing.pricePerMonth && listing.pricePerMonth > filters.maxPrice) return false;
    if (filters?.minScore && listing.compositeScore && listing.compositeScore < filters.minScore) return false;
    if (filters?.hasWasher && !listing.hasWasher) return false;
    if (filters?.hasDryer && !listing.hasDryer) return false;
    if (filters?.hasDishwasher && !listing.hasDishwasher) return false;
    if (filters?.hasModularKitchen && !listing.hasModularKitchen) return false;
    return true;
  });
}

export async function getListingById(id: number): Promise<(Listing & { station?: Station }) | undefined> {
  const listing = await db.select().from(schema.listings).where(eq(schema.listings.id, id)).get();
  if (!listing) return undefined;

  let station: Station | undefined;
  if (listing.nearestStationId) {
    station = await getStationById(listing.nearestStationId);
  }

  return { ...listing, station };
}

export async function getListingStats() {
  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.listings)
    .where(eq(schema.listings.isActive, true))
    .get();

  const avgPrice = await db
    .select({ avg: sql<number>`avg(price_per_month)` })
    .from(schema.listings)
    .where(eq(schema.listings.isActive, true))
    .get();

  const avgScore = await db
    .select({ avg: sql<number>`avg(composite_score)` })
    .from(schema.listings)
    .where(eq(schema.listings.isActive, true))
    .get();

  return {
    totalActive: total?.count ?? 0,
    avgPrice: Math.round(avgPrice?.avg ?? 0),
    avgScore: Math.round(avgScore?.avg ?? 0),
  };
}

// ---- Refresh Log ----

export async function getLastRefresh() {
  return db
    .select()
    .from(schema.refreshLog)
    .orderBy(desc(schema.refreshLog.id))
    .limit(1)
    .get();
}

export async function createRefreshLog() {
  return db
    .insert(schema.refreshLog)
    .values({ startedAt: new Date().toISOString(), status: "running" })
    .returning()
    .get();
}

export async function completeRefreshLog(
  id: number,
  data: { status: string; listingsFound?: number; newListings?: number; errors?: string }
) {
  await db.update(schema.refreshLog)
    .set({ ...data, completedAt: new Date().toISOString() })
    .where(eq(schema.refreshLog.id, id))
    .run();
}
