"use client";

import dynamic from "next/dynamic";
import type { ListingData } from "@/hooks/useListings";
import type { StationData } from "@/hooks/useStations";

// Dynamically import MapView with no SSR (MapLibre requires DOM)
const MapView = dynamic(
  () => import("./MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-muted-foreground">
        Loading map...
      </div>
    ),
  }
);

interface MapContainerProps {
  listings: ListingData[];
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
