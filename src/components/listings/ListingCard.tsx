"use client";

import type { ListingData } from "@/hooks/useListings";

function scoreToGrade(score: number): { grade: string; color: string; bg: string } {
  if (score >= 80) return { grade: "A", color: "text-emerald-400", bg: "bg-emerald-500/15" };
  if (score >= 60) return { grade: "B", color: "text-lime-400", bg: "bg-lime-500/15" };
  if (score >= 40) return { grade: "C", color: "text-amber-400", bg: "bg-amber-500/15" };
  if (score >= 20) return { grade: "D", color: "text-orange-400", bg: "bg-orange-500/15" };
  return { grade: "F", color: "text-red-400", bg: "bg-red-500/15" };
}

interface ListingCardProps {
  listing: ListingData;
  selected?: boolean;
  onClick?: () => void;
}

export function ListingCard({ listing, selected, onClick }: ListingCardProps) {
  const score = listing.compositeScore || 0;
  const { grade, color, bg } = scoreToGrade(score);

  const amenities: string[] = [
    listing.hasWasher ? "Washer" : "",
    listing.hasDryer ? "Dryer" : "",
    listing.hasDishwasher ? "DW" : "",
    listing.hasModularKitchen ? "Kitchen" : "",
  ].filter(Boolean);

  const displayTitle = listing.title && !listing.title.includes("1 Bed Flat")
    ? listing.title
    : listing.address && listing.address.length > 5
      ? listing.address
      : `1 Bed Flat in ${listing.postcode || "London"}`;

  return (
    <div
      className={`
        group cursor-pointer transition-all duration-300 rounded-xl overflow-hidden
        ${selected
          ? "bg-blue-500/[0.08] ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/5"
          : "bg-white/[0.03] hover:bg-white/[0.06] hover:shadow-lg hover:shadow-white/[0.02]"
        }
      `}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Top row: Price + Score badge */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="font-serif text-xl font-bold text-white tracking-tight">
              £{listing.pricePerMonth?.toLocaleString() || "TBC"}
            </span>
            <span className="text-xs text-white/30 ml-1">/mo</span>
          </div>
          <div className={`${bg} px-2 py-1 rounded-lg flex items-center gap-1.5`}>
            <span className={`text-xs font-bold ${color}`}>{grade}</span>
            <span className="text-[10px] text-white/40 font-medium">{score}</span>
          </div>
        </div>

        {/* Title — serif, NYT style */}
        <p className="font-serif text-sm font-bold leading-snug text-white/80 group-hover:text-blue-400 transition-colors duration-300 line-clamp-1 mb-2">
          {displayTitle}
        </p>

        {/* Station + journey info */}
        {listing.stationName && (
          <div className="flex items-center gap-1.5 text-[11px] text-white/35 mb-2">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 opacity-50">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
            <span className="truncate">{listing.stationName}</span>
            {listing.distanceToStationM != null && (
              <span className="text-white/20">({listing.distanceToStationM}m)</span>
            )}
            {listing.journeyToOfficeMin != null && (
              <>
                <span className="text-white/10">&middot;</span>
                <span className="text-blue-400/70 font-medium shrink-0">
                  ~{Math.round(listing.journeyToOfficeMin)}min to Dojo
                </span>
              </>
            )}
          </div>
        )}

        {/* Bottom: postcode + amenities */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {listing.postcode && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 bg-white/[0.05] px-2 py-0.5 rounded">
                {listing.postcode}
              </span>
            )}
          </div>
          {amenities.length > 0 && (
            <div className="flex items-center gap-1">
              {amenities.map((name) => (
                <span
                  key={name}
                  className="text-[9px] font-semibold text-emerald-400/70 bg-emerald-400/[0.08] px-1.5 py-0.5 rounded"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selection indicator */}
      {selected && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 rounded-r" />
      )}
    </div>
  );
}
