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
    <div className="w-[400px] border-r border-white/[0.06] bg-[#0a0a12]/95 backdrop-blur-xl flex flex-col shrink-0 h-full">
      <Filters filters={filters} onFiltersChange={onFiltersChange} stats={stats} />

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <ScrollArea className="flex-1">
        <div ref={listRef} className="p-3 space-y-2.5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-white/[0.06]" />
                <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
              </div>
              <span className="text-xs text-white/25 font-medium">Loading listings...</span>
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-white/40">No listings yet</p>
                <p className="text-xs text-white/20 max-w-[200px] leading-relaxed">
                  Click Refresh to scrape Rightmove &amp; OpenRent for listings
                </p>
              </div>
            </div>
          )}

          {listings.map((listing, i) => (
            <div
              key={listing.id}
              data-listing-id={listing.id}
              className="animate-slide-up"
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms`, animationFillMode: "backwards" }}
            >
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
