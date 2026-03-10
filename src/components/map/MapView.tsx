"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  ScaleControl,
  Source,
  Layer,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ListingData } from "@/hooks/useListings";
import type { StationData } from "@/hooks/useStations";
import type { MapRef } from "react-map-gl/maplibre";

const OFFICE = { lat: 51.5191, lon: -0.1765, name: "Dojo (The Brunel Building)" };

const LANDMARKS = [
  { name: "Bank", lat: 51.5133, lon: -0.0886 },
  { name: "Oxford Circus", lat: 51.5152, lon: -0.1418 },
  { name: "King's Cross", lat: 51.5308, lon: -0.1238 },
  { name: "Canary Wharf", lat: 51.5054, lon: -0.0235 },
  { name: "Westminster", lat: 51.501, lon: -0.1246 },
  { name: "Victoria", lat: 51.4965, lon: -0.1444 },
  { name: "Waterloo", lat: 51.5031, lon: -0.1132 },
];

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

function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#84cc16";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
}

interface MapViewProps {
  listings: ListingData[];
  stations: StationData[];
  selectedListingId: number | null;
  onSelectListing: (id: number | null) => void;
  showStations?: boolean;
  showLandmarks?: boolean;
  mapTilerKey?: string;
}

export function MapView({
  listings,
  stations,
  selectedListingId,
  onSelectListing,
  showStations = true,
  showLandmarks = true,
  mapTilerKey,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<{
    type: "listing" | "station" | "landmark" | "office";
    data: ListingData | StationData | { name: string; lat: number; lon: number };
    lat: number;
    lon: number;
  } | null>(null);

  const tileUrl = mapTilerKey
    ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${mapTilerKey}`
    : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

  // Fly to selected listing
  useEffect(() => {
    if (selectedListingId && mapRef.current) {
      const listing = listings.find((l) => l.id === selectedListingId);
      if (listing?.lat && listing?.lon) {
        mapRef.current.flyTo({
          center: [listing.lon, listing.lat],
          zoom: 15,
          duration: 1000,
        });
      }
    }
  }, [selectedListingId, listings]);

  // Classify listing type: "flat" | "studio" | "flatshare"
  function classifyListing(l: ListingData): string {
    const title = (l.title || "").toLowerCase();
    const desc = (l.description || "").toLowerCase();
    const text = title + " " + desc;
    if (text.includes("flat share") || text.includes("flatshare") || text.includes("house share")
      || text.includes("houseshare") || text.includes("room in") || text.includes("shared")
      || text.includes("en-suite room") || text.includes("ensuite room")) {
      return "flatshare";
    }
    if (title.includes("studio") || l.bedrooms === 0) return "studio";
    return "flat";
  }

  // Create GeoJSON for listing markers
  const listingGeoJson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: listings
      .filter((l) => l.lat && l.lon)
      .map((l) => {
        const listingType = classifyListing(l);
        return {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [l.lon!, l.lat!],
          },
          properties: {
            id: l.id,
            score: l.compositeScore || 0,
            price: l.pricePerMonth || 0,
            title: l.title,
            selected: l.id === selectedListingId ? 1 : 0,
            listingType, // "flat" | "studio" | "flatshare"
          },
        };
      }),
  };

  // Station GeoJSON (only show top-scoring stations to avoid clutter)
  const topStations = stations
    .filter((s) => (s.transportScore || 0) >= 50)
    .slice(0, 100);

  const stationGeoJson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: topStations.map((s) => {
      const lines: string[] = JSON.parse(s.lines || "[]");
      const primaryLine = lines[0] || "";
      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [s.lon, s.lat],
        },
        properties: {
          id: s.id,
          name: s.name,
          score: s.transportScore || 0,
          zone: s.zone,
          color: TUBE_LINE_COLORS[primaryLine] || "#666666",
          lines: lines.join(", "),
        },
      };
    }),
  };

  const handleMapClick = useCallback(
    (event: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      // Check if clicked on a listing
      const features = event.features;
      if (features && features.length > 0) {
        const feature = features[0];
        if (feature.properties?.id && feature.layer?.id === "listings-layer") {
          onSelectListing(feature.properties.id);
          return;
        }
      }
      // Clicked on empty area
      setPopupInfo(null);
    },
    [onSelectListing]
  );

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: -0.15,
        latitude: 51.515,
        zoom: 12.5,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={tileUrl}
      interactiveLayerIds={["listings-layer"]}
      onClick={handleMapClick}
    >
      <NavigationControl position="top-right" />
      <ScaleControl position="bottom-right" />

      {/* Station markers layer */}
      {showStations && (
        <Source id="stations" type="geojson" data={stationGeoJson}>
          <Layer
            id="stations-layer"
            type="circle"
            paint={{
              "circle-radius": 4,
              "circle-color": ["get", "color"],
              "circle-stroke-width": 1.5,
              "circle-stroke-color": "#ffffff",
              "circle-opacity": 0.8,
            }}
          />
          <Layer
            id="stations-labels"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-size": 10,
              "text-offset": [0, 1.2],
              "text-anchor": "top",
              "text-optional": true,
            }}
            paint={{
              "text-color": "rgba(255,255,255,0.5)",
              "text-halo-color": "rgba(0,0,0,0.8)",
              "text-halo-width": 1.5,
            }}
            minzoom={13}
          />
        </Source>
      )}

      {/* Listing markers layer */}
      <Source id="listings" type="geojson" data={listingGeoJson}>
        <Layer
          id="listings-layer"
          type="circle"
          paint={{
            "circle-radius": [
              "case",
              ["==", ["get", "selected"], 1],
              10,
              ["==", ["get", "listingType"], "flat"],
              7,
              5,
            ],
            "circle-color": [
              "case",
              ["==", ["get", "listingType"], "studio"],
              "#a78bfa",
              ["==", ["get", "listingType"], "flatshare"],
              "#f59e0b",
              [
                "interpolate",
                ["linear"],
                ["get", "score"],
                0, "#ef4444",
                40, "#eab308",
                60, "#84cc16",
                80, "#22c55e",
              ],
            ],
            "circle-stroke-width": [
              "case",
              ["==", ["get", "selected"], 1],
              3,
              ["==", ["get", "listingType"], "flat"],
              1.5,
              1,
            ],
            "circle-stroke-color": [
              "case",
              ["==", ["get", "selected"], 1],
              "#3b82f6",
              ["==", ["get", "listingType"], "studio"],
              "rgba(167,139,250,0.4)",
              ["==", ["get", "listingType"], "flatshare"],
              "rgba(245,158,11,0.4)",
              "rgba(255,255,255,0.6)",
            ],
            "circle-opacity": [
              "case",
              ["==", ["get", "listingType"], "flat"],
              0.9,
              0.6,
            ],
            "circle-blur": 0.1,
          }}
        />
      </Source>

      {/* Office marker */}
      <Marker
        longitude={OFFICE.lon}
        latitude={OFFICE.lat}
        anchor="bottom"
      >
        <div
          className="flex flex-col items-center cursor-pointer group"
          onClick={() =>
            setPopupInfo({
              type: "office",
              data: OFFICE,
              lat: OFFICE.lat,
              lon: OFFICE.lon,
            })
          }
        >
          <div className="bg-gradient-to-r from-blue-500 to-violet-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-blue-500/30 whitespace-nowrap border border-white/20 transition-all duration-300 group-hover:shadow-blue-500/50 group-hover:scale-105">
            Dojo Office
          </div>
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-violet-500" />
        </div>
      </Marker>

      {/* Landmark markers */}
      {showLandmarks &&
        LANDMARKS.map((lm) => (
          <Marker
            key={lm.name}
            longitude={lm.lon}
            latitude={lm.lat}
            anchor="center"
          >
            <div
              className="bg-black/60 text-white/50 text-[9px] px-1.5 py-0.5 rounded-md border border-white/[0.08] backdrop-blur-sm opacity-60 hover:opacity-100 hover:text-white/80 cursor-pointer whitespace-nowrap transition-all duration-300"
              title={lm.name}
            >
              {lm.name}
            </div>
          </Marker>
        ))}

      {/* Popup for selected listing */}
      {selectedListingId && (() => {
        const listing = listings.find((l) => l.id === selectedListingId);
        if (!listing?.lat || !listing?.lon) return null;
        return (
          <Popup
            longitude={listing.lon}
            latitude={listing.lat}
            anchor="bottom"
            onClose={() => onSelectListing(null)}
            closeOnClick={false}
          >
            <div className="p-3.5 max-w-[260px]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-serif font-bold text-white">
                  £{listing.pricePerMonth?.toLocaleString()}/mo
                </p>
                <div className="flex items-center gap-1">
                  {(() => {
                    const t = classifyListing(listing);
                    if (t === "studio") return (
                      <span className="text-[9px] font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">Studio</span>
                    );
                    if (t === "flatshare") return (
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">Flat Share</span>
                    );
                    return null;
                  })()}
                  <span className="text-[10px] font-bold text-white/40 bg-white/[0.06] px-1.5 py-0.5 rounded">
                    {listing.postcode}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-white/50 mt-0.5 line-clamp-1">{listing.title}</p>
              {listing.stationName && (
                <p className="text-[10px] text-white/30 mt-1">
                  {listing.stationName}
                  {listing.distanceToStationM != null && ` (${listing.distanceToStationM}m)`}
                  {listing.journeyToOfficeMin != null && (
                    <span className="text-blue-400/70 ml-1">
                      ~{Math.round(listing.journeyToOfficeMin)}min to Dojo
                    </span>
                  )}
                </p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-white/25">Score: {listing.compositeScore}</span>
                <a
                  href={listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:text-blue-300 inline-flex items-center gap-0.5 transition-colors font-medium"
                >
                  View Listing
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              </div>
            </div>
          </Popup>
        );
      })()}

      {/* Popup for office/landmark */}
      {popupInfo && popupInfo.type !== "listing" && (
        <Popup
          longitude={popupInfo.lon}
          latitude={popupInfo.lat}
          anchor="bottom"
          onClose={() => setPopupInfo(null)}
        >
          <div className="p-2.5">
            <p className="font-semibold text-sm text-white/90">
              {"name" in popupInfo.data ? popupInfo.data.name : ""}
            </p>
          </div>
        </Popup>
      )}
    </Map>
  );
}
