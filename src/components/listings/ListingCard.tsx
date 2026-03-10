"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ListingData } from "@/hooks/useListings";

function scoreToGrade(score: number): string {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}

function gradeColor(grade: string): string {
  switch (grade) {
    case "A": return "bg-green-500";
    case "B": return "bg-lime-500";
    case "C": return "bg-yellow-500";
    case "D": return "bg-orange-500";
    default: return "bg-red-500";
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

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected ? "ring-2 ring-blue-500 shadow-md" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${gradeColor(grade)} text-white text-xs px-1.5 py-0`}>
                {grade} ({score})
              </Badge>
              {listing.source === "rightmove" && (
                <Badge variant="outline" className="text-xs px-1 py-0">RM</Badge>
              )}
              {listing.source === "openrent" && (
                <Badge variant="outline" className="text-xs px-1 py-0">OR</Badge>
              )}
            </div>

            <p className="text-sm font-medium truncate" title={listing.title}>
              {listing.title}
            </p>

            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {listing.pricePerMonth
                  ? `£${listing.pricePerMonth.toLocaleString()}/mo`
                  : "Price TBC"}
              </span>
              {listing.postcode && (
                <span className="bg-muted px-1 rounded">{listing.postcode}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {listing.distanceToStationM != null && (
                <span className="text-xs text-muted-foreground">
                  {listing.distanceToStationM < 1000
                    ? `${listing.distanceToStationM}m`
                    : `${(listing.distanceToStationM / 1000).toFixed(1)}km`}
                  {" to tube"}
                </span>
              )}
              {listing.hasWasher && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0">Washer</Badge>
              )}
              {listing.hasDryer && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0">Dryer</Badge>
              )}
              {listing.hasDishwasher && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0">Dishwasher</Badge>
              )}
              {listing.hasModularKitchen && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0">Kitchen</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
