"use client";

import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Filters as FilterType } from "@/hooks/useListings";
import type { ListingStats } from "@/hooks/useListings";

interface FiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  stats: ListingStats;
}

export function Filters({ filters, onFiltersChange, stats }: FiltersProps) {
  return (
    <div className="p-3 space-y-3">
      {/* Stats + Budget on one row */}
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white tracking-tight">{stats.totalActive}</span>
          <span className="text-[10px] text-white/30">flats</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-white tabular-nums">
            £{filters.maxPrice.toLocaleString()}
            <span className="text-[10px] text-white/25 font-normal">/mo max</span>
          </div>
        </div>
      </div>

      {/* Budget slider */}
      <div>
        <Slider
          value={[filters.maxPrice]}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, maxPrice: Array.isArray(value) ? value[0] : value })
          }
          min={1000}
          max={3000}
          step={50}
        />
        <div className="flex justify-between text-[9px] text-white/15 mt-1">
          <span>£1k</span>
          <span>£3k</span>
        </div>
      </div>

      {/* Amenity filters — single compact row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[9px] text-white/25 font-semibold uppercase tracking-wider mr-1">Must have:</span>
        {[
          { id: "washer", label: "Washer", key: "hasWasher" as const },
          { id: "dryer", label: "Dryer", key: "hasDryer" as const },
          { id: "dishwasher", label: "DW", key: "hasDishwasher" as const },
          { id: "kitchen", label: "Kitchen", key: "hasModularKitchen" as const },
        ].map(({ id, label, key }) => (
          <label
            key={id}
            htmlFor={id}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer text-[10px] font-medium transition-all duration-150
              ${filters[key]
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                : "bg-white/[0.03] text-white/35 border border-white/[0.04] hover:bg-white/[0.06]"
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
  );
}
