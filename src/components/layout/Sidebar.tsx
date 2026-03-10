"use client";

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
    <div className="w-[380px] border-r border-white/[0.06] bg-[#0a0a12]/95 backdrop-blur-xl flex flex-col shrink-0 h-full">
      <Filters filters={filters} onFiltersChange={onFiltersChange} stats={stats} />

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Listing count bar */}
      <div className="px-3 py-1.5 flex items-center justify-between border-b border-white/[0.04] bg-white/[0.01]">
        <span className="text-[10px] text-white/25 font-medium">
          Showing {listings.length} of {stats.totalActive} listings
        </span>
        <span className="text-[10px] text-white/15">sorted by score</span>
      </div>

      {/* Scrollable list */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full border-2 border-white/[0.06]" />
              <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
            </div>
            <span className="text-[11px] text-white/25">Loading listings...</span>
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-white/40">No listings found</p>
              <p className="text-[10px] text-white/20 mt-0.5">Try adjusting your filters or click Refresh</p>
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
    </div>
  );
}
