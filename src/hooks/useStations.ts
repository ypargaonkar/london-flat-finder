"use client";

import { useState, useEffect } from "react";

export interface StationData {
  id: number;
  name: string;
  lat: number;
  lon: number;
  lines: string;
  zone: string;
  naptan: string;
  transportScore: number | null;
  journeyToOfficeMin: number | null;
  distanceToOfficeM: number | null;
}

export function useStations() {
  const [stations, setStations] = useState<StationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStations() {
      try {
        const res = await fetch("/api/stations");
        if (!res.ok) throw new Error("Failed to fetch stations");
        const data = await res.json();
        setStations(data.stations || []);
      } catch (err) {
        console.error("Failed to load stations:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStations();
  }, []);

  return { stations, loading };
}
