"use client";

import dynamic from "next/dynamic";
import type { ListingWithCost } from "@/hooks/useListings";
import type { StationData } from "@/hooks/useStations";

// Dynamically import MapView with no SSR (MapLibre requires DOM)
const MapView = dynamic(
  () => import("./MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#0d0d14] flex items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-white/20" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    ),
  }
);

interface MapContainerProps {
  listings: ListingWithCost[];
  stations: StationData[];
  selectedListingId: number | null;
  onSelectListing: (id: number | null) => void;
}

export function MapContainer({
  listings,
  stations,
  selectedListingId,
  onSelectListing,
}: MapContainerProps) {
  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || "";

  return (
    <div className="flex-1 h-full relative">
      <MapView
        listings={listings}
        stations={stations}
        selectedListingId={selectedListingId}
        onSelectListing={onSelectListing}
        mapTilerKey={mapTilerKey}
      />
    </div>
  );
}
