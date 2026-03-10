"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MapContainer } from "@/components/map/MapContainer";
import { useListings, type Filters } from "@/hooks/useListings";
import { useStations } from "@/hooks/useStations";

export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>({
    maxPrice: 2200,
    hasWasher: false,
    hasDryer: false,
    hasDishwasher: false,
    hasModularKitchen: false,
  });
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);

  const { listings, stats, loading } = useListings(filters);
  const { stations } = useStations();

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
