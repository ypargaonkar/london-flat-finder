import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const stations = await db
      .select()
      .from(schema.stations)
      .orderBy(desc(schema.stations.transportScore))
      .all();

    return NextResponse.json({ stations });
  } catch (error) {
    console.error("Error fetching stations:", error);
    return NextResponse.json({ error: "Failed to fetch stations" }, { status: 500 });
  }
}
