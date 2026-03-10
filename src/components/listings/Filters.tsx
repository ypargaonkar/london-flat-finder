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
    <div className="p-4 space-y-5">
      {/* Stats bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-white">{stats.totalActive}</span>
          <span className="text-xs text-white/40">flats</span>
        </div>
        {stats.avgPrice > 0 && (
          <div className="text-right">
            <span className="text-sm font-medium text-white/70">
              £{stats.avgPrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-white/30 ml-1">avg/mo</span>
          </div>
        )}
      </div>

      {/* Budget slider */}
      <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
            Budget
          </Label>
          <span className="text-sm font-semibold text-white tabular-nums">
            £{filters.maxPrice.toLocaleString()}
            <span className="text-white/30 font-normal">/mo</span>
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
        <div className="flex justify-between text-[10px] text-white/20 mt-1.5">
          <span>£1k</span>
          <span>£3k</span>
        </div>
      </div>

      {/* Amenity filters */}
      <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
        <Label className="text-[11px] font-medium text-white/50 uppercase tracking-wider mb-3 block">
          Amenities
        </Label>
        <div className="space-y-2.5">
          {[
            { id: "washer", label: "Washing Machine", key: "hasWasher" as const },
            { id: "dryer", label: "Tumble Dryer", key: "hasDryer" as const },
            { id: "dishwasher", label: "Dishwasher", key: "hasDishwasher" as const },
            { id: "kitchen", label: "Modern Kitchen", key: "hasModularKitchen" as const },
          ].map(({ id, label, key }) => (
            <div key={id} className="flex items-center gap-2.5">
              <Checkbox
                id={id}
                checked={filters[key]}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, [key]: !!checked })
                }
              />
              <Label
                htmlFor={id}
                className="text-sm text-white/60 cursor-pointer hover:text-white/80 transition-colors"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
