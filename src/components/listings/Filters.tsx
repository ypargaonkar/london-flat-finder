"use client";

import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import type { Filters as FilterType } from "@/hooks/useListings";
import type { ListingStats } from "@/hooks/useListings";

interface FiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  stats: ListingStats;
}

export function Filters({ filters, onFiltersChange, stats }: FiltersProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Stats row */}
      <div className="flex items-end justify-between">
        <div>
          <span className="font-serif text-3xl font-bold text-white tracking-tight">{stats.totalActive}</span>
          <span className="text-xs text-white/30 ml-1.5">active listings</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-white/25">avg</span>
          <span className="text-sm font-bold text-white/60 ml-1">£{stats.avgPrice.toLocaleString()}</span>
          <span className="text-xs text-white/25">/mo</span>
        </div>
      </div>

      {/* Budget slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Budget</span>
          <span className="text-sm font-bold text-white tabular-nums">
            £{filters.maxPrice.toLocaleString()}
            <span className="text-[10px] text-white/25 font-normal ml-0.5">/mo</span>
          </span>
        </div>
        <Slider
          value={[filters.maxPrice]}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, maxPrice: Array.isArray(value) ? value[0] : value })
          }
          min={1000}
          max={3000}
          step={50}
        />
        <div className="flex justify-between text-[10px] text-white/15">
          <span>£1,000</span>
          <span>£3,000</span>
        </div>
      </div>

      {/* Map layers */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Show on map</span>
        <div className="flex items-center gap-2 flex-wrap">
          <label
            htmlFor="showFlats"
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-medium transition-all duration-300
              ${filters.showFlats
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                : "bg-white/[0.03] text-white/20 border border-white/[0.06] hover:bg-white/[0.06]"
              }
            `}
          >
            <Checkbox
              id="showFlats"
              checked={filters.showFlats}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, showFlats: !!checked })
              }
              className="hidden"
            />
            <span className={`w-2 h-2 rounded-full ${filters.showFlats ? "bg-emerald-400" : "bg-white/20"}`} />
            1-Bed Flats
          </label>
          <label
            htmlFor="showStudios"
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-medium transition-all duration-300
              ${filters.showStudios
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/25"
                : "bg-white/[0.03] text-white/20 border border-white/[0.06] hover:bg-white/[0.06]"
              }
            `}
          >
            <Checkbox
              id="showStudios"
              checked={filters.showStudios}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, showStudios: !!checked })
              }
              className="hidden"
            />
            <span className={`w-2 h-2 rounded-full ${filters.showStudios ? "bg-purple-400" : "bg-white/20"}`} />
            Studios
          </label>
          <label
            htmlFor="showFlatShares"
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-medium transition-all duration-300
              ${filters.showFlatShares
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                : "bg-white/[0.03] text-white/20 border border-white/[0.06] hover:bg-white/[0.06]"
              }
            `}
          >
            <Checkbox
              id="showFlatShares"
              checked={filters.showFlatShares}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, showFlatShares: !!checked })
              }
              className="hidden"
            />
            <span className={`w-2 h-2 rounded-full ${filters.showFlatShares ? "bg-cyan-400" : "bg-white/20"}`} />
            Flat Shares
          </label>
        </div>
      </div>

      {/* Amenity filters */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Must have</span>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: "washer", label: "Washer", key: "hasWasher" as const },
            { id: "dryer", label: "Dryer", key: "hasDryer" as const },
            { id: "dishwasher", label: "Dishwasher", key: "hasDishwasher" as const },
            { id: "kitchen", label: "Mod. Kitchen", key: "hasModularKitchen" as const },
          ].map(({ id, label, key }) => (
            <label
              key={id}
              htmlFor={id}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-medium transition-all duration-300
                ${filters[key]
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/25 shadow-sm shadow-blue-500/5"
                  : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60"
                }
              `}
            >
              <Checkbox
                id={id}
                checked={filters[key]}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, [key]: !!checked })
                }
                className="hidden"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
