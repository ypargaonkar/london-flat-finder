"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export interface ListingData {
  id: number;
  source: string;
  sourceId: string;
  url: string;
  title: string;
  address: string | null;
  postcode: string | null;
  lat: number | null;
  lon: number | null;
  pricePerMonth: number | null;
  bedrooms: number | null;
  listingType: string | null;
  description: string | null;
  imageUrls: string;
  furnishing: string | null;
  hasWasher: boolean | null;
  hasDryer: boolean | null;
  hasModularKitchen: boolean | null;
  hasDishwasher: boolean | null;
  nearestStationId: number | null;
  distanceToStationM: number | null;
  transportScore: number | null;
  amenityScore: number | null;
  compositeScore: number | null;
  firstSeen: string;
  lastSeen: string;
  isActive: boolean | null;
  stationName: string | null;
  stationZone: string | null;
  journeyToOfficeMin: number | null;
}

export interface ListingStats {
  totalActive: number;
  avgPrice: number;
  avgScore: number;
}

export interface Filters {
  maxPrice: number;
  hasWasher: boolean;
  hasDryer: boolean;
  hasDishwasher: boolean;
  hasModularKitchen: boolean;
  showFlats: boolean;
  showStudios: boolean;
  showFlatShares: boolean;
}

export function useListings(filters: Filters) {
  const [allListings, setAllListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/listings");
      if (!res.ok) throw new Error("Failed to fetch listings");
      const data = await res.json();
      setAllListings(data.listings || []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Client-side filtering — instant, no network requests
  const listings = useMemo(() => {
    let result = allListings;

    result = result.filter((l) => !l.pricePerMonth || l.pricePerMonth <= filters.maxPrice);
    if (filters.hasWasher) result = result.filter((l) => l.hasWasher);
    if (filters.hasDryer) result = result.filter((l) => l.hasDryer);
    if (filters.hasDishwasher) result = result.filter((l) => l.hasDishwasher);
    if (filters.hasModularKitchen) result = result.filter((l) => l.hasModularKitchen);

    return result;
  }, [allListings, filters.maxPrice, filters.hasWasher, filters.hasDryer, filters.hasDishwasher, filters.hasModularKitchen]);

  const stats = useMemo<ListingStats>(() => {
    const total = listings.length;
    return {
      totalActive: total,
      avgPrice: total > 0
        ? Math.round(listings.reduce((sum, l) => sum + (l.pricePerMonth || 0), 0) / total)
        : 0,
      avgScore: total > 0
        ? Math.round(listings.reduce((sum, l) => sum + (l.compositeScore || 0), 0) / total)
        : 0,
    };
  }, [listings]);

  return { listings, stats, loading, error, refetch: fetchListings };
}
