import { PREFERRED_LINES, IDEAL_WALK_DISTANCE_M, MAX_WALK_DISTANCE_M } from "../geo/constants";

/**
 * Transport score for a station (0-100)
 *
 * 4 weighted factors:
 * - Office commute (45%): Journey time to Paddington
 * - Central London access (25%): Avg journey to Bank, Oxford Circus, King's Cross
 * - Line quality (20%): Bonus for preferred lines
 * - Zone (10%): Zone 1 = 100, Zone 2 = 80, etc.
 */
export function computeStationTransportScore(params: {
  journeyToOfficeMin: number | null;
  avgCentralJourneyMin: number | null;
  lines: string[];
  zone: string;
}): number {
  const { journeyToOfficeMin, avgCentralJourneyMin, lines, zone } = params;

  // Office commute score (45%)
  let officeScore = 0;
  if (journeyToOfficeMin !== null) {
    if (journeyToOfficeMin <= 5) officeScore = 100;
    else if (journeyToOfficeMin >= 30) officeScore = 0;
    else officeScore = 100 - ((journeyToOfficeMin - 5) / 25) * 100;
  }

  // Central London access (25%)
  let centralScore = 0;
  if (avgCentralJourneyMin !== null) {
    if (avgCentralJourneyMin <= 10) centralScore = 100;
    else if (avgCentralJourneyMin >= 40) centralScore = 0;
    else centralScore = 100 - ((avgCentralJourneyMin - 10) / 30) * 100;
  }

  // Line quality (20%)
  const preferredCount = lines.filter((l) => PREFERRED_LINES.includes(l)).length;
  const lineScore = Math.min(100, (preferredCount / 3) * 100); // 3+ preferred lines = 100

  // Zone score (10%)
  const zoneNum = parseZone(zone);
  const zoneScore = zoneNum === 1 ? 100 : zoneNum === 2 ? 80 : zoneNum === 3 ? 50 : zoneNum === 4 ? 30 : 10;

  return Math.round(
    officeScore * 0.45 +
    centralScore * 0.25 +
    lineScore * 0.20 +
    zoneScore * 0.10
  );
}

/**
 * Adjust station's transport score based on listing's walking distance to it
 */
export function adjustTransportScoreByDistance(
  stationScore: number,
  distanceToStationM: number
): number {
  if (distanceToStationM <= IDEAL_WALK_DISTANCE_M) {
    return stationScore; // Full score within 400m
  }
  if (distanceToStationM >= MAX_WALK_DISTANCE_M) {
    return 0; // Disqualified beyond 800m
  }
  // Linear degradation between 400m and 800m
  const factor = 1 - (distanceToStationM - IDEAL_WALK_DISTANCE_M) / (MAX_WALK_DISTANCE_M - IDEAL_WALK_DISTANCE_M);
  return Math.round(stationScore * factor);
}

function parseZone(zone: string): number {
  // Zone can be "1", "2", "2/3", "3", etc.
  const parts = zone.split("/").map(Number).filter((n) => !isNaN(n));
  return parts.length > 0 ? Math.min(...parts) : 6;
}
