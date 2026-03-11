// Fetches actual route geometries from TfL API and generates tubeRoutes.ts
import { writeFileSync } from "fs";

const LINES = [
  // Tube
  { id: "bakerloo", name: "Bakerloo", color: "#B36305" },
  { id: "central", name: "Central", color: "#E32017" },
  { id: "circle", name: "Circle", color: "#FFD300" },
  { id: "district", name: "District", color: "#00782A" },
  { id: "hammersmith-city", name: "Hammersmith & City", color: "#F3A9BB" },
  { id: "jubilee", name: "Jubilee", color: "#A0A5A9" },
  { id: "metropolitan", name: "Metropolitan", color: "#9B0056" },
  { id: "northern", name: "Northern", color: "#000000" },
  { id: "piccadilly", name: "Piccadilly", color: "#003688" },
  { id: "victoria", name: "Victoria", color: "#0098D4" },
  { id: "waterloo-city", name: "Waterloo & City", color: "#95CDBA" },
  { id: "elizabeth", name: "Elizabeth line", color: "#6950A1" },
  // DLR
  { id: "dlr", name: "DLR", color: "#00A4A7" },
  // London Overground
  { id: "lioness", name: "Lioness", color: "#FFD200" },
  { id: "mildmay", name: "Mildmay", color: "#005ABA" },
  { id: "windrush", name: "Windrush", color: "#E21836" },
  { id: "weaver", name: "Weaver", color: "#7B2D8B" },
  { id: "suffragette", name: "Suffragette", color: "#00A170" },
  { id: "liberty", name: "Liberty", color: "#6B7278" },
  // National Rail (London-relevant)
  { id: "thameslink", name: "Thameslink", color: "#D693C2" },
  { id: "southern", name: "Southern", color: "#8CC63F" },
  { id: "southeastern", name: "Southeastern", color: "#00AEEF" },
  { id: "south-western-railway", name: "South Western", color: "#E11B22" },
  { id: "great-northern", name: "Great Northern", color: "#6E2585" },
  { id: "c2c", name: "c2c", color: "#B71C4C" },
  { id: "greater-anglia", name: "Greater Anglia", color: "#D70428" },
];

// London bounding box - filter out routes that go far outside London
const LON_BOUNDS = { min: -0.65, max: 0.35 };
const LAT_BOUNDS = { min: 51.25, max: 51.75 };

function isInLondon(coord) {
  return (
    coord[0] >= LON_BOUNDS.min &&
    coord[0] <= LON_BOUNDS.max &&
    coord[1] >= LAT_BOUNDS.min &&
    coord[1] <= LAT_BOUNDS.max
  );
}

// Clip a line to London bounds - split into segments that are within bounds
function clipToLondon(coords) {
  const segments = [];
  let current = [];
  for (const coord of coords) {
    if (isInLondon(coord)) {
      current.push(coord);
    } else {
      if (current.length >= 2) segments.push(current);
      current = [];
    }
  }
  if (current.length >= 2) segments.push(current);
  return segments;
}

async function fetchLine(lineId) {
  const url = `https://api.tfl.gov.uk/Line/${lineId}/Route/Sequence/outbound`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  Failed to fetch ${lineId}: ${res.status}`);
    return null;
  }
  return res.json();
}

async function main() {
  const features = [];

  for (const line of LINES) {
    console.log(`Fetching ${line.name} (${line.id})...`);
    const data = await fetchLine(line.id);
    if (!data) continue;

    const lineStrings = data.lineStrings || [];
    if (lineStrings.length === 0) {
      // Fallback: build from stopPointSequences
      const seqs = data.stopPointSequences || [];
      for (const seq of seqs) {
        const coords = seq.stopPoint.map((sp) => [sp.lon, sp.lat]);
        const clipped = clipToLondon(coords);
        for (const segment of clipped) {
          if (segment.length >= 2) {
            features.push({
              type: "Feature",
              properties: { line: line.name, color: line.color },
              geometry: { type: "LineString", coordinates: segment },
            });
          }
        }
      }
    } else {
      // Use lineStrings (these are the actual route paths)
      for (const ls of lineStrings) {
        const coords = typeof ls === "string" ? JSON.parse(ls) : ls;
        // lineStrings can be nested arrays (MultiLineString-like)
        const lines = Array.isArray(coords[0]?.[0]) ? coords : [coords];
        for (const coordSet of lines) {
          const clipped = clipToLondon(coordSet);
          for (const segment of clipped) {
            if (segment.length >= 2) {
              features.push({
                type: "Feature",
                properties: { line: line.name, color: line.color },
                geometry: { type: "LineString", coordinates: segment },
              });
            }
          }
        }
      }
    }

    // Also fetch inbound for lines with different return routes
    const inboundData = await fetchLine(line.id.replace("outbound", "inbound"));
    // Small delay to be nice to the API
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\nTotal features: ${features.length}`);

  const geojson = {
    type: "FeatureCollection",
    features,
  };

  const output = `// Auto-generated from TfL API — do not edit manually
// Run: node scripts/fetch-routes.mjs

export const TUBE_ROUTES: GeoJSON.FeatureCollection = ${JSON.stringify(geojson, null, 2)};
`;

  writeFileSync(
    new URL("../src/data/tubeRoutes.ts", import.meta.url),
    output
  );
  console.log("Written to src/data/tubeRoutes.ts");
}

main().catch(console.error);
