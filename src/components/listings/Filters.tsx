"use client";

import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Filters as FilterType } from "@/hooks/useListings";
import type { ListingStats } from "@/hooks/useListings";

interface FiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  stats: ListingStats;
}

export function Filters({ filters, onFiltersChange, stats }: FiltersProps) {
  return (
    <div className="space-y-4 p-4">
      {/* Stats */}
      <div className="flex items-center gap-3 text-sm">
        <Badge variant="secondary">{stats.totalActive} listings</Badge>
        {stats.avgPrice > 0 && (
          <span className="text-muted-foreground">
            Avg: £{stats.avgPrice.toLocaleString()}/mo
          </span>
        )}
      </div>

      <Separator />

      {/* Budget slider */}
      <div>
        <Label className="text-xs font-medium">
          Max Budget: £{filters.maxPrice.toLocaleString()}/mo
        </Label>
        <Slider
          value={[filters.maxPrice]}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, maxPrice: Array.isArray(value) ? value[0] : value })
          }
          min={1000}
          max={3000}
          step={50}
          className="mt-2"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>£1,000</span>
          <span>£3,000</span>
        </div>
      </div>

      <Separator />

      {/* Amenity checkboxes */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Amenities</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="washer"
              checked={filters.hasWasher}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, hasWasher: !!checked })
              }
            />
            <Label htmlFor="washer" className="text-sm cursor-pointer">
              Washing Machine
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="dryer"
              checked={filters.hasDryer}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, hasDryer: !!checked })
              }
            />
            <Label htmlFor="dryer" className="text-sm cursor-pointer">
              Tumble Dryer
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="dishwasher"
              checked={filters.hasDishwasher}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, hasDishwasher: !!checked })
              }
            />
            <Label htmlFor="dishwasher" className="text-sm cursor-pointer">
              Dishwasher
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="kitchen"
              checked={filters.hasModularKitchen}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, hasModularKitchen: !!checked })
              }
            />
            <Label htmlFor="kitchen" className="text-sm cursor-pointer">
              Modern Kitchen
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
