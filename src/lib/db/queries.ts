import { db, schema } from "./index";
import { eq, and, lt, lte, desc, sql } from "drizzle-orm";
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

// ---- Stale Listing Deactivation ----

export async function deactivateStaleListings(staleDays = 3): Promise<number> {
  const cutoff = new Date(Date.now() - staleDays * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const stale = await db
    .select({ id: schema.listings.id })
    .from(schema.listings)
    .where(
      and(
        eq(schema.listings.isActive, true),
        lt(schema.listings.lastSeen, cutoff)
      )
    )
    .all();

  if (stale.length === 0) return 0;

  for (const row of stale) {
    await db.update(schema.listings)
      .set({ isActive: false, deactivatedAt: now })
      .where(eq(schema.listings.id, row.id))
      .run();
  }

  console.log(`Deactivated ${stale.length} stale listings (not seen in ${staleDays} days)`);
  return stale.length;
}

// ---- Verify active listings are still live on OpenRent ----

/**
 * Verify active listings are still live on OpenRent by checking each page.
 * Deactivates listings marked "Let Agreed" or removed.
 * @param timeBudgetMs - max time to spend verifying (default 25s to fit in cron limits)
 */
export async function verifyActiveListings(timeBudgetMs = 25_000): Promise<number> {
  const active = await db
    .select({
      id: schema.listings.id,
      url: schema.listings.url,
      source: schema.listings.source,
      lastSeen: schema.listings.lastSeen,
    })
    .from(schema.listings)
    .where(eq(schema.listings.isActive, true))
    .all();

  // Sort oldest-verified first so we prioritise checking staler listings
  const openrent = active
    .filter((l) => l.source === "openrent")
    .sort((a, b) => (a.lastSeen || "").localeCompare(b.lastSeen || ""));

  const now = new Date().toISOString();
  const deadline = Date.now() + timeBudgetMs;
  let deactivated = 0;
  let checked = 0;

  for (const listing of openrent) {
    if (Date.now() >= deadline) break;
    try {
      const res = await fetch(listing.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
      });
      checked++;

      if (!res.ok) {
        // 404 or other error — listing removed
        await db
          .update(schema.listings)
          .set({ isActive: false, deactivatedAt: now })
          .where(eq(schema.listings.id, listing.id))
          .run();
        deactivated++;
        continue;
      }

      const html = await res.text();
      const lowerHtml = html.toLowerCase();

      // OpenRent marks let properties with "let agreed" or removes them
      if (
        lowerHtml.includes("let agreed") ||
        lowerHtml.includes("this property has been removed") ||
        lowerHtml.includes("this property is no longer available") ||
        lowerHtml.includes("property no longer available")
      ) {
        await db
          .update(schema.listings)
          .set({ isActive: false, deactivatedAt: now })
          .where(eq(schema.listings.id, listing.id))
          .run();
        deactivated++;
      }

      // Small delay to avoid hammering OpenRent
      await new Promise((r) => setTimeout(r, 400));
    } catch {
      // Network error or timeout — skip, don't deactivate
    }
  }

  console.log(
    `Verified ${checked}/${openrent.length} active listings, deactivated ${deactivated} (let/removed)`
  );
  return deactivated;
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

export async function createRefreshLog(source: "cron" | "manual" = "manual") {
  return db
    .insert(schema.refreshLog)
    .values({ startedAt: new Date().toISOString(), status: "running", source })
    .returning()
    .get();
}

export async function completeRefreshLog(
  id: number,
  data: { status: string; listingsFound?: number; newListings?: number; staleDeactivated?: number; errors?: string }
) {
  await db.update(schema.refreshLog)
    .set({ ...data, completedAt: new Date().toISOString() })
    .where(eq(schema.refreshLog.id, id))
    .run();
}
