"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MapContainer } from "@/components/map/MapContainer";
import { useListings, type Filters } from "@/hooks/useListings";
import { useStations } from "@/hooks/useStations";

export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>({
    maxPrice: 3000,
    hasWasher: false,
    hasDryer: false,
    hasDishwasher: false,
    hasModularKitchen: false,
    showFlats: true,
    showStudios: true,
    showFlatShares: true,
    selectedPostcodes: [],
  });
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);

  const { listings: allListings, stats, loading } = useListings(filters);
  const { stations } = useStations();

  // Filter out studios/flat shares on the map based on toggle
  const listings = allListings.filter((l) => {
    if (!filters.showFlats && (l.listingType === "flat" || !l.listingType)) return false;
    if (!filters.showStudios && l.listingType === "studio") return false;
    if (!filters.showFlatShares && l.listingType === "flatshare") return false;
    return true;
  });

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          listings={listings}
          stats={stats}
          filters={filters}
          onFiltersChange={setFilters}
          selectedListingId={selectedListingId}
          onSelectListing={setSelectedListingId}
          loading={loading}
        />
        <MapContainer
          listings={listings}
          stations={stations}
          selectedListingId={selectedListingId}
          onSelectListing={setSelectedListingId}
        />
      </div>
    </div>
  );
}
