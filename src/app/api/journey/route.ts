import { NextRequest, NextResponse } from "next/server";
import { planJourney } from "@/lib/tfl/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fromLat = parseFloat(searchParams.get("fromLat") || "");
  const fromLon = parseFloat(searchParams.get("fromLon") || "");
  const toLat = parseFloat(searchParams.get("toLat") || "");
  const toLon = parseFloat(searchParams.get("toLon") || "");

  if ([fromLat, fromLon, toLat, toLon].some(isNaN)) {
    return NextResponse.json(
      { error: "Missing or invalid coordinates" },
      { status: 400 }
    );
  }

  try {
    const result = await planJourney(fromLat, fromLon, toLat, toLon);

    if (!result || !result.journeys?.length) {
      return NextResponse.json({ error: "No journey found" }, { status: 404 });
    }

    const journey = result.journeys[0];
    return NextResponse.json({
      duration: journey.duration,
      legs: journey.legs.map((leg) => ({
        duration: leg.duration,
        mode: leg.mode?.name || leg.mode?.id,
        summary: leg.instruction?.summary,
        path: leg.path?.lineString,
        from: leg.departurePoint,
        to: leg.arrivalPoint,
      })),
    });
  } catch (error) {
    console.error("Error planning journey:", error);
    return NextResponse.json({ error: "Failed to plan journey" }, { status: 500 });
  }
}
