"use client";

import { useState, useEffect, useCallback } from "react";

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
}

export function useListings(filters: Filters) {
  const [listings, setListings] = useState<ListingData[]>([]);
  const [stats, setStats] = useState<ListingStats>({ totalActive: 0, avgPrice: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.maxPrice < 3000) params.set("maxPrice", String(filters.maxPrice));
    if (filters.hasWasher) params.set("hasWasher", "true");
    if (filters.hasDryer) params.set("hasDryer", "true");
    if (filters.hasDishwasher) params.set("hasDishwasher", "true");
    if (filters.hasModularKitchen) params.set("hasModularKitchen", "true");

    try {
      const res = await fetch(`/api/listings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch listings");
      const data = await res.json();
      setListings(data.listings || []);
      setStats(data.stats || { totalActive: 0, avgPrice: 0, avgScore: 0 });
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [filters.maxPrice, filters.hasWasher, filters.hasDryer, filters.hasDishwasher, filters.hasModularKitchen]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, stats, loading, error, refetch: fetchListings };
}
