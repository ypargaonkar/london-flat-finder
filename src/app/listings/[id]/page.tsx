"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

const TUBE_LINE_COLORS: Record<string, string> = {
  Bakerloo: "#B36305",
  Central: "#E32017",
  Circle: "#FFD300",
  District: "#00782A",
  "Elizabeth line": "#6950A1",
  "Hammersmith & City": "#F3A9BB",
  Jubilee: "#A0A5A9",
  Metropolitan: "#9B0056",
  Northern: "#000000",
  Piccadilly: "#003688",
  Victoria: "#0098D4",
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [station, setStation] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

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
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-white/[0.06]" />
          <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <p className="text-white/40 text-sm">Listing not found</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/")}
          className="border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08]"
        >
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

  const amenities = [
    { label: "Washing Machine", has: listing.hasWasher, icon: "🫧" },
    { label: "Tumble Dryer", has: listing.hasDryer, icon: "🌀" },
    { label: "Dishwasher", has: listing.hasDishwasher, icon: "🍽" },
    { label: "Modern Kitchen", has: listing.hasModularKitchen, icon: "🔪" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      {/* Hero header with image */}
      <div className="relative">
        {images.length > 0 ? (
          <div className="relative h-[400px] overflow-hidden">
            <img
              src={images[activeImage]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/50 to-transparent" />

            {/* Image nav dots */}
            {images.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {images.slice(0, 8).map((_, i) => (
                  <button
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      i === activeImage ? "bg-white w-4" : "bg-white/40 hover:bg-white/60"
                    }`}
                    onClick={() => setActiveImage(i)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-[200px] bg-gradient-to-b from-[#12121a] to-[#0a0a12]" />
        )}

        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-xl border border-white/10 text-white/80 hover:text-white hover:bg-black/60 transition-all duration-300 text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Grade badge */}
        <div
          className="absolute top-4 right-4 px-4 py-2 rounded-xl text-white font-bold text-xl backdrop-blur-xl border border-white/10 shadow-lg"
          style={{ backgroundColor: `${gradeColor(grade)}cc` }}
        >
          {grade} <span className="text-sm font-medium opacity-80">{score}</span>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <h1 className="text-2xl font-bold text-white mb-1 line-clamp-2 drop-shadow-lg">
            {listing.title}
          </h1>
          <p className="text-sm text-white/50">
            {listing.address} {listing.postcode && `· ${listing.postcode}`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 -mt-2 pb-12 space-y-6">
        {/* Price + CTA row */}
        <div className="flex items-center justify-between glass rounded-2xl p-5">
          <div>
            <div className="text-3xl font-bold text-white">
              £{listing.pricePerMonth?.toLocaleString()}
              <span className="text-base font-normal text-white/30 ml-1">/month</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-white/30">{listing.bedrooms} bed</span>
              <span className="text-xs text-white/15">·</span>
              <span className="text-xs text-white/30 capitalize">{listing.furnishing || "Unknown"}</span>
              <span className="text-xs text-white/15">·</span>
              <span className="text-xs text-white/30 capitalize">{listing.source}</span>
              <span className="text-xs text-white/15">·</span>
              <span className="text-xs text-white/30">
                Listed {new Date(listing.firstSeen).toLocaleDateString()}
              </span>
            </div>
          </div>
          <a href={listing.url} target="_blank" rel="noopener noreferrer">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/30 hover:scale-[1.02]">
              View on {listing.source === "rightmove" ? "Rightmove" : "OpenRent"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1.5">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery grid */}
            {images.length > 1 && (
              <div className="glass rounded-2xl p-4">
                <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative overflow-hidden rounded-xl aspect-[4/3] transition-all duration-300 ${
                        i === activeImage ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0a0a12]" : "hover:opacity-80"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {amenities.map(({ label, has, icon }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      has
                        ? "bg-emerald-500/[0.08] border border-emerald-500/20"
                        : "bg-white/[0.02] border border-white/[0.04]"
                    }`}
                  >
                    <span className="text-lg">{icon}</span>
                    <div>
                      <p className={`text-sm font-medium ${has ? "text-emerald-400" : "text-white/30 line-through"}`}>
                        {label}
                      </p>
                    </div>
                    {has && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" className="ml-auto">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Description</h3>
                <p className="text-sm text-white/50 whitespace-pre-line leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Score Breakdown */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-4">Score Breakdown</h3>
              <div className="space-y-3 mb-4">
                {scoreBreakdown.map(({ name, score: s, color }) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/50">{name}</span>
                      <span className="text-xs font-bold text-white/70">{s}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${s}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-px bg-white/[0.06] my-4" />
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={scoreBreakdown} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={70} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(12,12,20,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "white",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                    {scoreBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Nearest Station */}
            {station && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Nearest Station</h3>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                      <rect x="4" y="3" width="16" height="18" rx="2" />
                      <path d="M12 21v-4M8 21h8M8 7h8M8 11h8" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/90">{station.name}</p>
                    <p className="text-xs text-white/35 mt-0.5">
                      {listing.distanceToStationM
                        ? `${listing.distanceToStationM}m walk`
                        : "Distance unknown"} · Zone {station.zone}
                    </p>
                    {station.journeyToOfficeMin != null && (
                      <p className="text-xs font-medium text-blue-400 mt-1">
                        ~{Math.round(station.journeyToOfficeMin)} min to Paddington
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {stationLines.map((line) => (
                        <span
                          key={line}
                          className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-white"
                          style={{
                            backgroundColor: (TUBE_LINE_COLORS[line] || "#666") + "cc",
                          }}
                        >
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transport score */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Transport Score</h3>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                  style={{ backgroundColor: `${gradeColor(grade)}22`, border: `1px solid ${gradeColor(grade)}33` }}
                >
                  {listing.transportScore || 0}
                </div>
                <div className="text-xs text-white/30 leading-relaxed">
                  Based on commute time to Paddington, Central London access, line quality, and zone.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
