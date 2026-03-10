"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Filters } from "@/components/listings/Filters";
import { ListingCard } from "@/components/listings/ListingCard";
import type { ListingData, ListingStats, Filters as FilterType } from "@/hooks/useListings";
import { useRef, useEffect } from "react";

interface SidebarProps {
  listings: ListingData[];
  stats: ListingStats;
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  selectedListingId: number | null;
  onSelectListing: (id: number | null) => void;
  loading: boolean;
}

export function Sidebar({
  listings,
  stats,
  filters,
  onFiltersChange,
  selectedListingId,
  onSelectListing,
  loading,
}: SidebarProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedListingId && listRef.current) {
      const el = listRef.current.querySelector(`[data-listing-id="${selectedListingId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedListingId]);

  return (
    <div className="w-[380px] border-r border-white/[0.06] bg-[#0a0a0f] flex flex-col shrink-0 h-full">
      <Filters filters={filters} onFiltersChange={onFiltersChange} stats={stats} />

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <ScrollArea className="flex-1">
        <div ref={listRef} className="p-3 space-y-2">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg className="animate-spin h-5 w-5 text-white/30" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-white/30">Loading listings...</span>
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white/50">No listings yet</p>
                <p className="text-xs text-white/25 mt-1">
                  Hit Refresh to scrape Rightmove & OpenRent
                </p>
              </div>
            </div>
          )}

          {listings.map((listing) => (
            <div key={listing.id} data-listing-id={listing.id}>
              <ListingCard
                listing={listing}
                selected={listing.id === selectedListingId}
                onClick={() =>
                  onSelectListing(
                    listing.id === selectedListingId ? null : listing.id
                  )
                }
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
