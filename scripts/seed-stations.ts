/**
 * Seed tube stations from TfL API into the database.
 * Also computes journey times and transport scores.
 *
 * Usage: npx tsx scripts/seed-stations.ts
 */
import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/lib/db/schema";
import { fetchTubeStations, planJourney } from "../src/lib/tfl/client";
import { computeStationTransportScore } from "../src/lib/scoring/transport-score";
import { haversineDistance } from "../src/lib/geo/distance";
import { OFFICE, CENTRAL_LANDMARKS } from "../src/lib/geo/constants";
import path from "path";
import fs from "fs";
import { eq } from "drizzle-orm";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:./data/db.sqlite",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("Fetching tube stations from TfL API...");

  let stopPoints;
  try {
    stopPoints = await fetchTubeStations();
    console.log(`Fetched ${stopPoints.length} stop points from TfL`);
  } catch (err) {
    console.error("Failed to fetch from TfL API. Using fallback station data.");
    stopPoints = null;
  }

  if (stopPoints && stopPoints.length > 0) {
    const seen = new Set<string>();
    const uniqueStations = stopPoints.filter((sp) => {
      if (seen.has(sp.naptanId)) return false;
      seen.add(sp.naptanId);
      return true;
    });

    console.log(`${uniqueStations.length} unique stations after dedup`);

    for (const sp of uniqueStations) {
      const zone = sp.additionalProperties?.find((p) => p.key === "Zone")?.value || "6";
      const lines = sp.lines?.map((l) => l.name) || [];

      const existing = await db.select().from(schema.stations).where(eq(schema.stations.naptan, sp.naptanId)).get();

      if (existing) {
        await db.update(schema.stations)
          .set({
            name: sp.commonName.replace(" Underground Station", "").replace(" Rail Station", "").replace(" DLR Station", ""),
            lat: sp.lat,
            lon: sp.lon,
            lines: JSON.stringify(lines),
            zone,
            distanceToOfficeM: Math.round(haversineDistance(sp.lat, sp.lon, OFFICE.lat, OFFICE.lon)),
          })
          .where(eq(schema.stations.naptan, sp.naptanId))
          .run();
      } else {
        await db.insert(schema.stations).values({
          name: sp.commonName.replace(" Underground Station", "").replace(" Rail Station", "").replace(" DLR Station", ""),
          lat: sp.lat,
          lon: sp.lon,
          lines: JSON.stringify(lines),
          zone,
          naptan: sp.naptanId,
          distanceToOfficeM: Math.round(haversineDistance(sp.lat, sp.lon, OFFICE.lat, OFFICE.lon)),
        }).run();
      }
    }
  } else {
    console.log("Using fallback station data (no TfL API key)...");
    await seedFallbackStations();
  }

  console.log("\nComputing transport scores...");
  const allStations = await db.select().from(schema.stations).all();
  console.log(`Processing ${allStations.length} stations...`);

  let processed = 0;
  for (const station of allStations) {
    let journeyToOfficeMin: number | null = null;
    let avgCentralMin: number | null = null;

    if (process.env.TFL_APP_KEY) {
      try {
        const officeJourney = await planJourney(station.lat, station.lon, OFFICE.lat, OFFICE.lon);
        if (officeJourney?.journeys?.[0]) {
          journeyToOfficeMin = officeJourney.journeys[0].duration;
        }
        await sleep(300);

        const centralTimes: number[] = [];
        for (const landmark of CENTRAL_LANDMARKS) {
          const j = await planJourney(station.lat, station.lon, landmark.lat, landmark.lon);
          if (j?.journeys?.[0]) {
            centralTimes.push(j.journeys[0].duration);
          }
          await sleep(300);
        }
        if (centralTimes.length > 0) {
          avgCentralMin = centralTimes.reduce((a, b) => a + b, 0) / centralTimes.length;
        }
      } catch {
        // Fall back to distance-based estimation
      }
    }

    if (journeyToOfficeMin === null) {
      const distKm = (station.distanceToOfficeM || haversineDistance(station.lat, station.lon, OFFICE.lat, OFFICE.lon)) / 1000;
      journeyToOfficeMin = Math.round(distKm * 3 + 5);
    }

    if (avgCentralMin === null) {
      const centralDists = CENTRAL_LANDMARKS.map((l) =>
        haversineDistance(station.lat, station.lon, l.lat, l.lon) / 1000
      );
      avgCentralMin = Math.round(
        centralDists.reduce((a, b) => a + b, 0) / centralDists.length * 3 + 5
      );
    }

    const lines: string[] = JSON.parse(station.lines || "[]");
    const transportScore = computeStationTransportScore({
      journeyToOfficeMin,
      avgCentralJourneyMin: avgCentralMin,
      lines,
      zone: station.zone,
    });

    await db.update(schema.stations)
      .set({ journeyToOfficeMin, transportScore })
      .where(eq(schema.stations.id, station.id))
      .run();

    processed++;
    if (processed % 50 === 0) {
      console.log(`  Processed ${processed}/${allStations.length} stations`);
    }
  }

  console.log("\n=== Top 20 Stations by Transport Score ===\n");
  const topStations = [...allStations]
    .sort((a, b) => (b.transportScore || 0) - (a.transportScore || 0))
    .slice(0, 20);

  // Re-fetch to get updated scores
  const updatedTop = [];
  for (const s of topStations) {
    const updated = await db.select().from(schema.stations).where(eq(schema.stations.id, s.id)).get();
    if (updated) updatedTop.push(updated);
  }

  for (const s of updatedTop) {
    const lines = JSON.parse(s.lines || "[]");
    console.log(
      `${String(s.transportScore).padStart(3)} | ${s.name.padEnd(30)} | Zone ${s.zone} | ${Math.round(s.journeyToOfficeMin || 0)} min | ${lines.join(", ")}`
    );
  }

  console.log(`\nDone! ${allStations.length} stations seeded and scored.`);
}

async function seedFallbackStations() {
  const fallbackStations = [
    { name: "Paddington", lat: 51.5154, lon: -0.1755, lines: ["Bakerloo", "Circle", "District", "Hammersmith & City", "Elizabeth line"], zone: "1", naptan: "940GZZLUPAC" },
    { name: "Edgware Road (Circle)", lat: 51.5199, lon: -0.1679, lines: ["Circle", "District", "Hammersmith & City"], zone: "1", naptan: "940GZZLUERC" },
    { name: "Royal Oak", lat: 51.519, lon: -0.1884, lines: ["Circle", "Hammersmith & City"], zone: "2", naptan: "940GZZLURYO" },
    { name: "Warwick Avenue", lat: 51.5235, lon: -0.1835, lines: ["Bakerloo"], zone: "2", naptan: "940GZZLUWKA" },
    { name: "Baker Street", lat: 51.5226, lon: -0.1571, lines: ["Bakerloo", "Circle", "Hammersmith & City", "Jubilee", "Metropolitan"], zone: "1", naptan: "940GZZLUBST" },
    { name: "Bond Street", lat: 51.5142, lon: -0.1494, lines: ["Central", "Jubilee", "Elizabeth line"], zone: "1", naptan: "940GZZLUBND" },
    { name: "Oxford Circus", lat: 51.5152, lon: -0.1418, lines: ["Bakerloo", "Central", "Victoria"], zone: "1", naptan: "940GZZLUOXC" },
    { name: "Notting Hill Gate", lat: 51.5094, lon: -0.1967, lines: ["Central", "Circle", "District"], zone: "1/2", naptan: "940GZZLUNHG" },
    { name: "Bayswater", lat: 51.5122, lon: -0.1877, lines: ["Circle", "District"], zone: "1", naptan: "940GZZLUBWT" },
    { name: "Lancaster Gate", lat: 51.5119, lon: -0.1756, lines: ["Central"], zone: "1", naptan: "940GZZLULGT" },
    { name: "King's Cross St Pancras", lat: 51.5308, lon: -0.1238, lines: ["Circle", "Hammersmith & City", "Metropolitan", "Northern", "Piccadilly", "Victoria"], zone: "1", naptan: "940GZZLUKSX" },
    { name: "Victoria", lat: 51.4965, lon: -0.1444, lines: ["Circle", "District", "Victoria"], zone: "1", naptan: "940GZZLUVIC" },
    { name: "Bank", lat: 51.5133, lon: -0.0886, lines: ["Central", "Northern", "Waterloo & City"], zone: "1", naptan: "940GZZLUBNK" },
    { name: "Liverpool Street", lat: 51.5178, lon: -0.0823, lines: ["Central", "Circle", "Hammersmith & City", "Metropolitan", "Elizabeth line"], zone: "1", naptan: "940GZZLULVT" },
    { name: "Canary Wharf", lat: 51.5054, lon: -0.0235, lines: ["Jubilee", "Elizabeth line"], zone: "2", naptan: "940GZZLUCYF" },
  ];

  for (const s of fallbackStations) {
    const existing = await db.select().from(schema.stations).where(eq(schema.stations.naptan, s.naptan)).get();
    if (!existing) {
      await db.insert(schema.stations).values({
        name: s.name,
        lat: s.lat,
        lon: s.lon,
        lines: JSON.stringify(s.lines),
        zone: s.zone,
        naptan: s.naptan,
        distanceToOfficeM: Math.round(haversineDistance(s.lat, s.lon, OFFICE.lat, OFFICE.lon)),
      }).run();
    }
  }
}

main().catch(console.error);
