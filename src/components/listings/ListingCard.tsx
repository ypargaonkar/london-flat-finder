"use client";

import type { ListingData } from "@/hooks/useListings";

function scoreToGrade(score: number): string {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}

function gradeStyle(grade: string): { bg: string; text: string; glow: string } {
  switch (grade) {
    case "A": return { bg: "bg-emerald-500/15", text: "text-emerald-400", glow: "shadow-emerald-500/10" };
    case "B": return { bg: "bg-lime-500/15", text: "text-lime-400", glow: "shadow-lime-500/10" };
    case "C": return { bg: "bg-amber-500/15", text: "text-amber-400", glow: "shadow-amber-500/10" };
    case "D": return { bg: "bg-orange-500/15", text: "text-orange-400", glow: "shadow-orange-500/10" };
    default: return { bg: "bg-red-500/15", text: "text-red-400", glow: "shadow-red-500/10" };
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
  const style = gradeStyle(grade);
  const images: string[] = (() => {
    try { return JSON.parse(listing.imageUrls || "[]"); } catch { return []; }
  })();

  return (
    <div
      className={`
        group relative rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden
        ${selected
          ? "border-blue-500/50 bg-blue-500/[0.06] shadow-lg shadow-blue-500/10"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
        }
      `}
      onClick={onClick}
    >
      <div className="p-3.5">
        {/* Top row: score + price */}
        <div className="flex items-center justify-between mb-2">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${style.bg}`}>
            <span className={`text-sm font-bold ${style.text}`}>{grade}</span>
            <span className={`text-xs font-medium ${style.text} opacity-70`}>{score}</span>
          </div>
          <span className="text-base font-semibold text-white">
            {listing.pricePerMonth
              ? `£${listing.pricePerMonth.toLocaleString()}`
              : "TBC"}
            <span className="text-xs font-normal text-white/40">/mo</span>
          </span>
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-white/90 truncate leading-snug" title={listing.title}>
          {listing.title}
        </p>

        {/* Postcode + distance */}
        <div className="flex items-center gap-2 mt-1.5">
          {listing.postcode && (
            <span className="text-[11px] font-medium text-white/50 bg-white/[0.06] px-1.5 py-0.5 rounded">
              {listing.postcode}
            </span>
          )}
          {listing.distanceToStationM != null && (
            <span className="text-[11px] text-white/35">
              {listing.distanceToStationM}m to tube
            </span>
          )}
          <span className="text-[11px] text-white/25 capitalize">{listing.source}</span>
        </div>

        {/* Amenity pills */}
        {(listing.hasWasher || listing.hasDryer || listing.hasDishwasher || listing.hasModularKitchen) && (
          <div className="flex items-center gap-1 mt-2">
            {listing.hasWasher && (
              <span className="text-[10px] text-emerald-400/70 bg-emerald-400/[0.08] px-1.5 py-0.5 rounded-full">
                Washer
              </span>
            )}
            {listing.hasDryer && (
              <span className="text-[10px] text-emerald-400/70 bg-emerald-400/[0.08] px-1.5 py-0.5 rounded-full">
                Dryer
              </span>
            )}
            {listing.hasDishwasher && (
              <span className="text-[10px] text-emerald-400/70 bg-emerald-400/[0.08] px-1.5 py-0.5 rounded-full">
                Dishwasher
              </span>
            )}
            {listing.hasModularKitchen && (
              <span className="text-[10px] text-emerald-400/70 bg-emerald-400/[0.08] px-1.5 py-0.5 rounded-full">
                Kitchen
              </span>
            )}
          </div>
        )}
      </div>

      {/* Selection indicator */}
      {selected && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 rounded-r" />
      )}
    </div>
  );
}
