import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const maxPrice = searchParams.get("maxPrice");
  const hasWasher = searchParams.get("hasWasher");
  const hasDryer = searchParams.get("hasDryer");
  const hasDishwasher = searchParams.get("hasDishwasher");
  const hasModularKitchen = searchParams.get("hasModularKitchen");

  try {
    let results = await db
      .select()
      .from(schema.listings)
      .where(eq(schema.listings.isActive, true))
      .orderBy(desc(schema.listings.compositeScore))
      .all();

    if (maxPrice) {
      const max = parseInt(maxPrice);
      results = results.filter((l) => !l.pricePerMonth || l.pricePerMonth <= max);
    }
    if (hasWasher === "true") results = results.filter((l) => l.hasWasher);
    if (hasDryer === "true") results = results.filter((l) => l.hasDryer);
    if (hasDishwasher === "true") results = results.filter((l) => l.hasDishwasher);
    if (hasModularKitchen === "true") results = results.filter((l) => l.hasModularKitchen);

    const totalActive = results.length;
    const avgPrice = totalActive > 0
      ? Math.round(results.reduce((sum, l) => sum + (l.pricePerMonth || 0), 0) / totalActive)
      : 0;
    const avgScore = totalActive > 0
      ? Math.round(results.reduce((sum, l) => sum + (l.compositeScore || 0), 0) / totalActive)
      : 0;

    return NextResponse.json({
      listings: results,
      stats: { totalActive, avgPrice, avgScore },
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}
