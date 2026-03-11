/**
 * True Monthly Cost calculator.
 * True Cost = Rent + Council Tax + Transport + Utilities (estimated)
 */

// --- Council Tax ---
// Band D rates by borough (2025/26, includes GLA precept)
const BAND_D_RATES: Record<string, number> = {
  "Westminster": 1019,
  "Kensington and Chelsea": 1259,
  "Hammersmith and Fulham": 1451,
  "Tower Hamlets": 1755,
  "Southwark": 1878,
  "Newham": 1856,
  "Hackney": 1962,
  "Islington": 2012,
  "Ealing": 2041,
  "Camden": 2107,
  "Brent": 2133,
  "City of London": 1195,
  "Lambeth": 1907,
  "Wandsworth": 938,
};

// Band ratios (fraction of Band D) — fixed by law
const BAND_RATIOS: Record<string, number> = {
  A: 6 / 9,
  B: 7 / 9,
  C: 8 / 9,
  D: 1,
  E: 11 / 9,
  F: 13 / 9,
  G: 15 / 9,
  H: 18 / 9,
};

// Postcode district → borough mapping for our target postcodes
const POSTCODE_TO_BOROUGH: Record<string, string> = {
  W1: "Westminster",
  W2: "Westminster",
  W3: "Ealing",
  W5: "Ealing",
  W9: "Westminster",
  W10: "Kensington and Chelsea",
  W11: "Kensington and Chelsea",
  W13: "Ealing",
  NW1: "Camden",
  NW6: "Camden",
  NW8: "Westminster",
  NW10: "Brent",
  SW1: "Westminster",
  SW7: "Kensington and Chelsea",
  EC1: "Islington",
  WC1: "Camden",
  WC2: "Westminster",
  E1: "Tower Hamlets",
  E3: "Tower Hamlets",
  E8: "Hackney",
  E9: "Hackney",
  E14: "Tower Hamlets",
  E15: "Newham",
  E16: "Newham",
  E20: "Newham",
  SE1: "Southwark",
  N1: "Islington",
  HA0: "Brent",
  HA9: "Brent",
};

/** Get monthly council tax for a postcode. Assumes Band B for 1-bed flats. */
export function getMonthlyCouncilTax(postcode: string | null, band: string = "B"): number | null {
  if (!postcode) return null;
  const borough = POSTCODE_TO_BOROUGH[postcode];
  if (!borough) return null;
  const bandD = BAND_D_RATES[borough];
  if (!bandD) return null;
  const ratio = BAND_RATIOS[band] || BAND_RATIOS.B;
  return Math.round((bandD * ratio) / 12);
}

export function getBoroughForPostcode(postcode: string | null): string | null {
  if (!postcode) return null;
  return POSTCODE_TO_BOROUGH[postcode] || null;
}

// --- Transport ---
export type CommuteMode = "tube" | "bus" | "bike" | "walk";

// Monthly tube pass by zone (Zone 1-X, 2025 TfL prices)
const TUBE_MONTHLY: Record<string, number> = {
  "1": 150,
  "1-2": 150,
  "2": 150,
  "1-3": 175,
  "3": 175,
  "1-4": 215,
  "4": 215,
  "1-5": 256,
  "5": 256,
  "1-6": 290,
  "6": 290,
};

/** Get monthly transport cost based on commute mode and station zone. */
export function getMonthlyTransport(
  stationZone: string | null,
  distanceToOfficeM: number | null,
  mode: CommuteMode,
): number {
  switch (mode) {
    case "bike":
      return 20; // Santander cycles subscription
    case "walk":
      return 0;
    case "bus":
      return 75; // Monthly bus cap
    case "tube": {
      if (!stationZone) return 150; // Default zone 1-2
      // Zone can be "1", "2", "1-2", "3/4" etc. Normalize to get the outermost zone
      const zones = stationZone.replace(/\//g, "-").split("-").map(Number).filter(Boolean);
      const outerZone = Math.max(...zones);
      if (outerZone <= 2) return 150;
      const key = `1-${outerZone}`;
      return TUBE_MONTHLY[key] || 150;
    }
  }
}

// --- Utilities (estimated without EPC data) ---
// London average for 1-bed flat. Will be replaced with real EPC data in Phase 2.
const DEFAULT_MONTHLY_UTILITIES = 120;

export function getMonthlyUtilities(_epcRating?: string | null): number {
  // Phase 2: use real EPC data. For now, estimate by band if available.
  return DEFAULT_MONTHLY_UTILITIES;
}

// --- True Monthly Cost ---
export interface TrueCostBreakdown {
  rent: number;
  councilTax: number | null;
  transport: number;
  utilities: number;
  total: number;
}

export function calculateTrueCost(
  rent: number | null,
  postcode: string | null,
  stationZone: string | null,
  distanceToOfficeM: number | null,
  commuteMode: CommuteMode,
): TrueCostBreakdown {
  const r = rent || 0;
  const councilTax = getMonthlyCouncilTax(postcode);
  const transport = getMonthlyTransport(stationZone, distanceToOfficeM, commuteMode);
  const utilities = getMonthlyUtilities();

  return {
    rent: r,
    councilTax,
    transport,
    utilities,
    total: r + (councilTax || 0) + transport + utilities,
  };
}
