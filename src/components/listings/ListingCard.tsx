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
    case "A": return { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-400" };
    case "B": return { bg: "bg-lime-500/15", text: "text-lime-400", border: "border-lime-500/20", dot: "bg-lime-400" };
    case "C": return { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/20", dot: "bg-amber-400" };
    case "D": return { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/20", dot: "bg-orange-400" };
    default: return { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/20", dot: "bg-red-400" };
  }
}

const AMENITY_ICONS: Record<string, string> = {
  washer: "W",
  dryer: "D",
  dishwasher: "DW",
  kitchen: "K",
};

interface ListingCardProps {
  listing: ListingData;
  selected?: boolean;
  onClick?: () => void;
}

export function ListingCard({ listing, selected, onClick }: ListingCardProps) {
  const score = listing.compositeScore || 0;
  const grade = scoreToGrade(score);
  const gc = gradeConfig(grade);
  const images: string[] = (() => {
    try { return JSON.parse(listing.imageUrls || "[]"); } catch { return []; }
  })();
  const thumbnail = images[0];

  const amenities: string[] = [
    listing.hasWasher ? "Washer" : "",
    listing.hasDryer ? "Dryer" : "",
    listing.hasDishwasher ? "Dishwasher" : "",
    listing.hasModularKitchen ? "Kitchen" : "",
  ].filter(Boolean);

  return (
    <div
      className={`
        group relative rounded-xl border overflow-hidden cursor-pointer
        transition-all duration-300 ease-out
        ${selected
          ? "border-blue-500/40 bg-blue-500/[0.06] shadow-lg shadow-blue-500/10 scale-[1.01]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]"
        }
      `}
      onClick={onClick}
    >
      {/* Image + gradient overlay */}
      {thumbnail ? (
        <div className="relative h-32 overflow-hidden">
          <img
            src={thumbnail}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-[#0c0c14]/40 to-transparent" />

          {/* Score badge on image */}
          <div className={`absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-lg ${gc.bg} border ${gc.border} backdrop-blur-md`}>
            <span className={`text-xs font-bold ${gc.text}`}>{grade}</span>
            <span className={`text-[10px] font-medium ${gc.text} opacity-70`}>{score}</span>
          </div>

          {/* Price on image */}
          <div className="absolute bottom-2.5 right-2.5">
            <span className="text-lg font-bold text-white drop-shadow-lg">
              £{listing.pricePerMonth?.toLocaleString() || "TBC"}
              <span className="text-xs font-normal text-white/60">/mo</span>
            </span>
          </div>
        </div>
      ) : (
        /* No image fallback */
        <div className="flex items-center justify-between px-3.5 pt-3.5">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${gc.bg} border ${gc.border}`}>
            <span className={`text-xs font-bold ${gc.text}`}>{grade}</span>
            <span className={`text-[10px] font-medium ${gc.text} opacity-70`}>{score}</span>
          </div>
          <span className="text-base font-semibold text-white">
            £{listing.pricePerMonth?.toLocaleString() || "TBC"}
            <span className="text-xs font-normal text-white/40">/mo</span>
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-3.5 pt-2.5">
        {/* Title */}
        <p className="text-[13px] font-medium text-white/90 line-clamp-1 leading-snug group-hover:text-white transition-colors duration-300" title={listing.title}>
          {listing.title}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {listing.postcode && (
            <span className="text-[10px] font-semibold text-white/50 bg-white/[0.06] px-1.5 py-0.5 rounded-md">
              {listing.postcode}
            </span>
          )}
          {listing.distanceToStationM != null && (
            <span className="text-[10px] text-white/30 flex items-center gap-0.5">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {listing.distanceToStationM}m
            </span>
          )}
          <span className="text-[10px] text-white/20 capitalize">{listing.source}</span>
        </div>

        {/* Amenity pills */}
        {amenities.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {amenities.map((name) => (
              <span
                key={name}
                className="text-[9px] font-medium text-emerald-400/80 bg-emerald-400/[0.08] px-1.5 py-0.5 rounded-full border border-emerald-400/10 transition-colors duration-300 group-hover:bg-emerald-400/[0.12]"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Selection indicator — left accent bar */}
      {selected && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-blue-400 to-blue-600 rounded-r" />
      )}
    </div>
  );
}
