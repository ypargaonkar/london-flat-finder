"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Filters } from "@/components/listings/Filters";
import { ListingCard } from "@/components/listings/ListingCard";
import { Separator } from "@/components/ui/separator";
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

  // Scroll to selected listing
  useEffect(() => {
    if (selectedListingId && listRef.current) {
      const el = listRef.current.querySelector(`[data-listing-id="${selectedListingId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedListingId]);

  return (
    <div className="w-[380px] border-r bg-white flex flex-col shrink-0 h-full">
      <Filters filters={filters} onFiltersChange={onFiltersChange} stats={stats} />
      <Separator />
      <ScrollArea className="flex-1">
        <div ref={listRef} className="p-3 space-y-2">
          {loading && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Loading listings...
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              <p className="font-medium">No listings found</p>
              <p className="mt-1">
                Try adjusting your filters or run a refresh to scrape new listings.
              </p>
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
