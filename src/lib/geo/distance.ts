/**
 * Haversine distance between two lat/lon points in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Find the nearest station to a given lat/lon
 */
export function findNearestStation(
  lat: number,
  lon: number,
  stations: Array<{ id: number; lat: number; lon: number }>
): { stationId: number; distanceM: number } | null {
  let nearest: { stationId: number; distanceM: number } | null = null;

  for (const station of stations) {
    const dist = haversineDistance(lat, lon, station.lat, station.lon);
    if (!nearest || dist < nearest.distanceM) {
      nearest = { stationId: station.id, distanceM: Math.round(dist) };
    }
  }

  return nearest;
}

/**
 * Geocode a UK postcode using Nominatim (OpenStreetMap)
 */
export async function geocodePostcode(
  postcode: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const encoded = encodeURIComponent(postcode.trim());
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded},UK&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "LondonFlatFinder/1.0 (personal project)",
        },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}
