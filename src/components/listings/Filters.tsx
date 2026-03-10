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
    <div className="p-4 space-y-4">
      {/* Stats row */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white tracking-tight">{stats.totalActive}</span>
            <span className="text-xs text-white/30 font-medium">flats</span>
          </div>
          {stats.avgPrice > 0 && (
            <p className="text-[11px] text-white/25 mt-0.5">
              avg £{stats.avgPrice.toLocaleString()}/mo
            </p>
          )}
        </div>
        {stats.avgScore > 0 && (
          <div className="text-right">
            <div className="text-xs text-white/30">avg score</div>
            <div className="text-lg font-bold text-white/70">{stats.avgScore}</div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Budget slider */}
      <div className="glass rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
            Budget
          </Label>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold text-white tabular-nums">
              £{filters.maxPrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-white/25">/mo</span>
          </div>
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
        <div className="flex justify-between text-[9px] text-white/15 mt-1.5 font-medium">
          <span>£1,000</span>
          <span>£3,000</span>
        </div>
      </div>

      {/* Amenity filters */}
      <div className="glass rounded-xl p-3.5">
        <Label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3 block">
          Must have
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "washer", label: "Washer", key: "hasWasher" as const, icon: "🫧" },
            { id: "dryer", label: "Dryer", key: "hasDryer" as const, icon: "🌀" },
            { id: "dishwasher", label: "Dishwasher", key: "hasDishwasher" as const, icon: "🍽" },
            { id: "kitchen", label: "Kitchen", key: "hasModularKitchen" as const, icon: "🔪" },
          ].map(({ id, label, key, icon }) => (
            <label
              key={id}
              htmlFor={id}
              className={`
                flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-200
                ${filters[key]
                  ? "bg-white/[0.08] border border-white/[0.12]"
                  : "bg-transparent border border-transparent hover:bg-white/[0.03]"
                }
              `}
            >
              <Checkbox
                id={id}
                checked={filters[key]}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, [key]: !!checked })
                }
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <span className="text-xs text-white/60 font-medium">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
