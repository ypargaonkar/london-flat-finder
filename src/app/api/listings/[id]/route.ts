import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const listing = await db
      .select()
      .from(schema.listings)
      .where(eq(schema.listings.id, numId))
      .get();

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    let station = null;
    if (listing.nearestStationId) {
      station = await db
        .select()
        .from(schema.stations)
        .where(eq(schema.stations.id, listing.nearestStationId))
        .get();
    }

    return NextResponse.json({ listing, station });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
  }
}
