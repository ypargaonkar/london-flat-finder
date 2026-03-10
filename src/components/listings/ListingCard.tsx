"use client";

import type { ListingData } from "@/hooks/useListings";

function scoreToGrade(score: number): string {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}

function gradeConfig(grade: string) {
  switch (grade) {
    case "A": return { bg: "bg-emerald-500", ring: "ring-emerald-500/30" };
    case "B": return { bg: "bg-lime-500", ring: "ring-lime-500/30" };
    case "C": return { bg: "bg-amber-500", ring: "ring-amber-500/30" };
    case "D": return { bg: "bg-orange-500", ring: "ring-orange-500/30" };
    default: return { bg: "bg-red-500", ring: "ring-red-500/30" };
  }
}

interface ListingCardProps {
  listing: ListingData;
  selected?: boolean;
  onClick?: () => void;
}

export function ListingCard({ listing, selected, onClick }: ListingCardProps) {
  const score = listing.compositeScore || 0;
  const grade = scoreToGrade(score);
  const gc = gradeConfig(grade);

  const amenities: string[] = [
    listing.hasWasher ? "Washer" : "",
    listing.hasDryer ? "Dryer" : "",
    listing.hasDishwasher ? "DW" : "",
    listing.hasModularKitchen ? "Kitchen" : "",
  ].filter(Boolean);

  // Generate a readable title from what we have
  const displayTitle = listing.title && !listing.title.includes("1 Bed Flat")
    ? listing.title
    : listing.address && listing.address.length > 5
      ? listing.address
      : `1 Bed Flat in ${listing.postcode || "London"}`;

  return (
    <div
      className={`
        group relative flex items-stretch gap-0 rounded-lg border cursor-pointer
        transition-all duration-200 ease-out overflow-hidden
        ${selected
          ? "border-blue-500/50 bg-blue-500/[0.08] ring-1 ring-blue-500/20"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.05]"
        }
      `}
      onClick={onClick}
    >
      {/* Score badge — left strip */}
      <div className={`w-11 shrink-0 ${gc.bg}/15 flex flex-col items-center justify-center gap-0.5 border-r border-white/[0.04]`}>
        <span className={`text-xs font-black ${gc.bg.replace('bg-', 'text-')}`}>{grade}</span>
        <span className="text-[9px] font-bold text-white/40">{score}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 py-2.5 px-3">
        {/* Price row */}
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-white tracking-tight">
            £{listing.pricePerMonth?.toLocaleString() || "TBC"}
            <span className="text-[10px] font-normal text-white/30 ml-0.5">/mo</span>
          </span>
          <div className="flex items-center gap-1.5">
            {listing.postcode && (
              <span className="text-[10px] font-bold text-white/50 bg-white/[0.06] px-1.5 py-0.5 rounded">
                {listing.postcode}
              </span>
            )}
          </div>
        </div>

        {/* Station + journey info */}
        <div className="flex items-center gap-1.5 mt-1">
          {listing.stationName && (
            <span className="text-[10px] text-white/35 flex items-center gap-0.5 truncate">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 opacity-40">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8v8" />
              </svg>
              {listing.stationName}
              {listing.distanceToStationM != null && (
                <span className="text-white/20 ml-0.5">({listing.distanceToStationM}m)</span>
              )}
            </span>
          )}
          {listing.journeyToOfficeMin != null && (
            <>
              <span className="text-white/10">·</span>
              <span className="text-[10px] text-blue-400/70 font-medium shrink-0">
                ~{Math.round(listing.journeyToOfficeMin)}min to Dojo
              </span>
            </>
          )}
        </div>

        {/* Amenities row */}
        {amenities.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {amenities.map((name) => (
              <span
                key={name}
                className="text-[8px] font-semibold text-emerald-400/70 bg-emerald-400/[0.08] px-1 py-px rounded"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Selection indicator */}
      {selected && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500" />
      )}
    </div>
  );
}
