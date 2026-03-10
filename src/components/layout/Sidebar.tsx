"use client";

import { Filters } from "@/components/listings/Filters";
import { ListingCard } from "@/components/listings/ListingCard";
import type { ListingData, ListingStats, Filters as FilterType } from "@/hooks/useListings";
import { useRef, useEffect, useMemo } from "react";

interface SidebarProps {
  listings: ListingData[];
  stats: ListingStats;
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  selectedListingId: number | null;
  onSelectListing: (id: number | null) => void;
  loading: boolean;
}

function isOneBedFlat(listing: ListingData): boolean {
  // Use listingType field if available
  if (listing.listingType === "studio" || listing.listingType === "flatshare") return false;
  // Fallback: check title/description keywords
  const title = (listing.title || "").toLowerCase();
  const desc = (listing.description || "").toLowerCase();
  const text = title + " " + desc;
  if (title.includes("studio") || listing.bedrooms === 0) return false;
  if (text.includes("flat share") || text.includes("flatshare") || text.includes("house share")
    || text.includes("houseshare") || text.includes("room in") || text.includes("shared")
    || text.includes("en-suite room") || text.includes("ensuite room")) return false;
  return true;
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

  // Only show top 1-bed flats in sidebar (not studios/flat shares), capped at 50
  const sidebarListings = useMemo(
    () => listings.filter(isOneBedFlat).slice(0, 50),
    [listings]
  );

  useEffect(() => {
    if (selectedListingId && listRef.current) {
      const el = listRef.current.querySelector(`[data-listing-id="${selectedListingId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedListingId]);

  return (
    <div className="w-[400px] border-r border-white/[0.06] bg-[#08080f] flex flex-col shrink-0 h-full">
      <Filters filters={filters} onFiltersChange={onFiltersChange} stats={stats} />

      {/* Listing count */}
      <div className="px-4 py-2 flex items-center justify-between border-t border-b border-white/[0.05]">
        <span className="text-[11px] text-white/35 font-medium">
          Top {sidebarListings.length} flats
          {listings.filter(isOneBedFlat).length > sidebarListings.length && (
            <span className="text-white/20"> &middot; of {listings.filter(isOneBedFlat).length} total</span>
          )}
        </span>
        <span className="text-[10px] text-white/20 font-medium">by score</span>
      </div>

      {/* Scrollable list */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full border-2 border-white/[0.06]" />
              <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
            </div>
            <span className="text-xs text-white/25">Loading listings...</span>
          </div>
        )}

        {!loading && sidebarListings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-serif font-bold text-white/40">No listings found</p>
              <p className="text-xs text-white/20 mt-1">Try adjusting your filters or click Refresh</p>
            </div>
          </div>
        )}

        {sidebarListings.map((listing, i) => (
          <div
            key={listing.id}
            data-listing-id={listing.id}
            className="animate-fade-in"
            style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
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
    </div>
  );
}
