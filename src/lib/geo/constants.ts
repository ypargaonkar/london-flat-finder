// Dojo office: The Brunel Building, 2 Canalside Walk, Paddington, W2 1DG
export const OFFICE = {
  name: "Dojo (The Brunel Building)",
  lat: 51.5191,
  lon: -0.1765,
  address: "The Brunel Building, 2 Canalside Walk, Paddington, W2 1DG",
};

// Central London landmarks for scoring "central access"
export const CENTRAL_LANDMARKS = [
  { name: "Bank", lat: 51.5133, lon: -0.0886 },
  { name: "Oxford Circus", lat: 51.5152, lon: -0.1418 },
  { name: "King's Cross", lat: 51.5308, lon: -0.1238 },
];

// Additional map landmarks
export const MAP_LANDMARKS = [
  ...CENTRAL_LANDMARKS,
  { name: "Canary Wharf", lat: 51.5054, lon: -0.0235 },
  { name: "Westminster", lat: 51.501, lon: -0.1246 },
  { name: "Liverpool Street", lat: 51.5178, lon: -0.0823 },
  { name: "Victoria", lat: 51.4965, lon: -0.1444 },
  { name: "Waterloo", lat: 51.5031, lon: -0.1132 },
];

// Target postcodes for scraping
export const TARGET_POSTCODES = [
  // Central & West
  "W2", "W9", "W10", "W11", "W1",
  "W3", "W5", "W13",
  "NW1", "NW6", "NW8", "NW10",
  "SW1", "SW7",
  "EC1", "WC1", "WC2",
  // East London
  "E1", "E3", "E8", "E9", "E14", "E15", "E16", "E20",
  // South & North
  "SE1", "N1",
  // Outer West
  "HA0", "HA9",
];

// Tube line colors
export const TUBE_LINE_COLORS: Record<string, string> = {
  "Bakerloo": "#B36305",
  "Central": "#E32017",
  "Circle": "#FFD300",
  "District": "#00782A",
  "Elizabeth line": "#6950A1",
  "Hammersmith & City": "#F3A9BB",
  "Jubilee": "#A0A5A9",
  "Metropolitan": "#9B0056",
  "Northern": "#000000",
  "Piccadilly": "#003688",
  "Victoria": "#0098D4",
  "Waterloo & City": "#95CDBA",
  "DLR": "#00A4A7",
  "London Overground": "#EE7C0E",
  "TfL Rail": "#0019A8",
};

// "Good" lines for scoring (fast, frequent, reliable)
export const PREFERRED_LINES = [
  "Elizabeth line",
  "Central",
  "Jubilee",
  "Circle",
  "District",
  "Hammersmith & City",
  "Victoria",
  "Bakerloo",
];

// Max walking distance to consider a station
export const MAX_WALK_DISTANCE_M = 800;
export const IDEAL_WALK_DISTANCE_M = 400;

// Postcode to area name mapping
export const POSTCODE_AREAS: Record<string, string> = {
  W1: "Mayfair / Soho",
  W2: "Paddington / Bayswater",
  W3: "Acton",
  W5: "Ealing",
  W9: "Maida Vale",
  W10: "Ladbroke Grove",
  W11: "Notting Hill",
  W13: "West Ealing",
  NW1: "Camden / Regent's Park",
  NW6: "Kilburn / West Hampstead",
  NW8: "St John's Wood",
  NW10: "Kensal Green / Harlesden",
  SW1: "Westminster / Pimlico",
  SW7: "South Kensington",
  EC1: "Clerkenwell / Farringdon",
  WC1: "Bloomsbury / King's Cross",
  WC2: "Covent Garden / Holborn",
  E1: "Whitechapel / Shoreditch",
  E3: "Bow / Mile End",
  E8: "Hackney / Dalston",
  E9: "Homerton / Hackney Wick",
  E14: "Canary Wharf / Limehouse",
  E15: "Stratford",
  E16: "Canning Town",
  E20: "Olympic Park / Stratford",
  SE1: "Southwark / Bermondsey",
  N1: "Islington / Angel",
  HA0: "Wembley",
  HA9: "Wembley Park",
};

// Scraping config
export const MAX_PRICE = 3000;
export const DEFAULT_BEDROOMS = 1;
