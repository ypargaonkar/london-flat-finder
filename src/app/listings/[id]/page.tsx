"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ListingData } from "@/hooks/useListings";
import type { StationData } from "@/hooks/useStations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function scoreToGrade(score: number): string {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}

function gradeColor(grade: string): string {
  switch (grade) {
    case "A": return "#22c55e";
    case "B": return "#84cc16";
    case "C": return "#eab308";
    case "D": return "#f97316";
    default: return "#ef4444";
  }
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [station, setStation] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${params.id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setListing(data.listing);
        setStation(data.station);
      } catch {
        setListing(null);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchListing();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Listing not found</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const score = listing.compositeScore || 0;
  const grade = scoreToGrade(score);
  const images: string[] = JSON.parse(listing.imageUrls || "[]");
  const stationLines: string[] = station ? JSON.parse(station.lines || "[]") : [];

  const scoreBreakdown = [
    { name: "Transport", score: listing.transportScore || 0, color: "#3b82f6" },
    { name: "Amenities", score: listing.amenityScore || 0, color: "#8b5cf6" },
    {
      name: "Price",
      score: listing.pricePerMonth
        ? listing.pricePerMonth <= 1500
          ? 100
          : listing.pricePerMonth >= 2200
          ? 50
          : Math.round(100 - ((listing.pricePerMonth - 1500) / 700) * 50)
        : 50,
      color: "#10b981",
    },
    {
      name: "Recency",
      score: Math.max(
        0,
        Math.round(
          100 -
            (Math.floor(
              (Date.now() - new Date(listing.firstSeen).getTime()) /
                (1000 * 60 * 60 * 24)
            ) /
              14) *
              100
        )
      ),
      color: "#f59e0b",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{listing.title}</h1>
            <p className="text-sm text-muted-foreground">
              {listing.address} {listing.postcode && `| ${listing.postcode}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="text-3xl font-bold px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: gradeColor(grade) }}
          >
            {grade} ({score})
          </div>
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>
              View on {listing.source === "rightmove" ? "Rightmove" : "OpenRent"}
            </Button>
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            {images.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Property image ${i + 1}`}
                        className="w-full h-48 object-cover rounded"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price + Key Info */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="text-2xl text-blue-600">
                    £{listing.pricePerMonth?.toLocaleString()}/mo
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bedrooms:</span>{" "}
                    <span className="font-medium">{listing.bedrooms}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Furnishing:</span>{" "}
                    <span className="font-medium capitalize">{listing.furnishing || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source:</span>{" "}
                    <span className="font-medium capitalize">{listing.source}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">First seen:</span>{" "}
                    <span className="font-medium">
                      {new Date(listing.firstSeen).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <h3 className="font-medium mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={listing.hasWasher ? "default" : "secondary"}>
                      {listing.hasWasher ? "Washer" : "No Washer"}
                    </Badge>
                    <Badge variant={listing.hasDryer ? "default" : "secondary"}>
                      {listing.hasDryer ? "Dryer" : "No Dryer"}
                    </Badge>
                    <Badge variant={listing.hasDishwasher ? "default" : "secondary"}>
                      {listing.hasDishwasher ? "Dishwasher" : "No Dishwasher"}
                    </Badge>
                    <Badge variant={listing.hasModularKitchen ? "default" : "secondary"}>
                      {listing.hasModularKitchen ? "Modern Kitchen" : "No Modern Kitchen"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                {listing.description && (
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {listing.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={scoreBreakdown} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" width={75} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {scoreBreakdown.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Nearest Station */}
            {station && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Nearest Station</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-semibold">{station.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {listing.distanceToStationM
                      ? `${listing.distanceToStationM}m walk`
                      : "Distance unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Zone {station.zone} | Score: {station.transportScore}
                  </p>
                  {station.journeyToOfficeMin != null && (
                    <p className="text-sm font-medium">
                      ~{Math.round(station.journeyToOfficeMin)} min to Paddington
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {stationLines.map((line) => (
                      <Badge key={line} variant="outline" className="text-xs">
                        {line}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
