const TFL_BASE = "https://api.tfl.gov.uk";

function getAppKey(): string {
  return process.env.TFL_APP_KEY || "";
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${TFL_BASE}${path}`);
  const appKey = getAppKey();
  if (appKey) url.searchParams.set("app_key", appKey);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

export interface TfLStopPoint {
  naptanId: string;
  commonName: string;
  lat: number;
  lon: number;
  lines: Array<{ id: string; name: string }>;
  additionalProperties: Array<{ key: string; value: string }>;
}

export interface TfLJourneyResult {
  journeys: Array<{
    duration: number;
    legs: Array<{
      duration: number;
      instruction: { summary: string; detailed: string };
      mode: { id: string; name: string };
      path: { lineString: string };
      departurePoint: { lat: number; lon: number };
      arrivalPoint: { lat: number; lon: number };
    }>;
  }>;
}

/**
 * Fetch all tube/rail stop points
 */
export async function fetchTubeStations(): Promise<TfLStopPoint[]> {
  const modes = "tube,elizabeth-line,dlr,overground";
  const url = buildUrl(`/StopPoint/Mode/${modes}`, {
    count: "1000",
  });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TfL API error: ${res.status} ${res.statusText}`);

  const data = await res.json();
  return data.stopPoints || [];
}

/**
 * Plan a journey between two coordinates
 */
export async function planJourney(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Promise<TfLJourneyResult | null> {
  const url = buildUrl(
    `/Journey/JourneyResults/${fromLat},${fromLon}/to/${toLat},${toLon}`,
    {
      mode: "tube,elizabeth-line,dlr,overground,walking",
      timeIs: "departing",
      journeyPreference: "leasttime",
    }
  );

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Get tube line route geometry (for drawing on map)
 */
export async function fetchLineRoute(lineId: string): Promise<Array<{ lat: number; lon: number }[]>> {
  const url = buildUrl(`/Line/${lineId}/Route/Sequence/outbound`);

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    const sequences: Array<{ lat: number; lon: number }[]> = [];
    if (data.lineStrings) {
      for (const ls of data.lineStrings) {
        try {
          const coords = JSON.parse(ls);
          sequences.push(
            coords.map((c: number[]) => ({ lat: c[1], lon: c[0] }))
          );
        } catch {
          // skip malformed
        }
      }
    }
    return sequences;
  } catch {
    return [];
  }
}
