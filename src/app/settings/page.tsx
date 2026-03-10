"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const ALL_POSTCODES = [
  "W2", "W9", "W10", "W11", "W1",
  "NW1", "NW6", "NW8",
  "SW1", "SW7",
  "EC1", "WC1", "WC2",
  "E1", "E14",
  "SE1", "N1",
];

const ALL_LINES = [
  "Elizabeth line", "Central", "Jubilee", "Circle",
  "District", "Hammersmith & City", "Victoria", "Bakerloo",
  "Northern", "Piccadilly", "Metropolitan", "DLR",
];

export default function SettingsPage() {
  const router = useRouter();

  const [maxBudget, setMaxBudget] = useState(2200);
  const [transportWeight, setTransportWeight] = useState(40);
  const [amenityWeight, setAmenityWeight] = useState(30);
  const [priceWeight, setPriceWeight] = useState(20);
  const [recencyWeight, setRecencyWeight] = useState(10);
  const [selectedPostcodes, setSelectedPostcodes] = useState<string[]>(ALL_POSTCODES);
  const [selectedLines, setSelectedLines] = useState<string[]>(ALL_LINES.slice(0, 8));

  const totalWeight = transportWeight + amenityWeight + priceWeight + recencyWeight;
  const sv = (v: number | readonly number[]) => (Array.isArray(v) ? v[0] : v as number);

  const togglePostcode = (pc: string) => {
    setSelectedPostcodes((prev) =>
      prev.includes(pc) ? prev.filter((p) => p !== pc) : [...prev, pc]
    );
  };

  const toggleLine = (line: string) => {
    setSelectedLines((prev) =>
      prev.includes(line) ? prev.filter((l) => l !== line) : [...prev, line]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          Back
        </Button>
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-sm">
              Max Monthly Rent: £{maxBudget.toLocaleString()}/mo
            </Label>
            <Slider
              value={[maxBudget]}
              onValueChange={(v) => setMaxBudget(sv(v))}
              min={1000}
              max={3500}
              step={50}
              className="mt-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>£1,000</span>
              <span>£3,500</span>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Weights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Scoring Weights{" "}
              <span
                className={`text-sm font-normal ${
                  totalWeight === 100 ? "text-green-600" : "text-red-500"
                }`}
              >
                (Total: {totalWeight}%)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Transport: {transportWeight}%</Label>
              <Slider
                value={[transportWeight]}
                onValueChange={(v) => setTransportWeight(sv(v))}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm">Amenities: {amenityWeight}%</Label>
              <Slider
                value={[amenityWeight]}
                onValueChange={(v) => setAmenityWeight(sv(v))}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm">Price: {priceWeight}%</Label>
              <Slider
                value={[priceWeight]}
                onValueChange={(v) => setPriceWeight(sv(v))}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm">Recency: {recencyWeight}%</Label>
              <Slider
                value={[recencyWeight]}
                onValueChange={(v) => setRecencyWeight(sv(v))}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Target Postcodes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Target Postcodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ALL_POSTCODES.map((pc) => (
                <Badge
                  key={pc}
                  variant={selectedPostcodes.includes(pc) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => togglePostcode(pc)}
                >
                  {pc}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preferred Lines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferred Tube Lines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ALL_LINES.map((line) => (
                <Badge
                  key={line}
                  variant={selectedLines.includes(line) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleLine(line)}
                >
                  {line}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/")}>
            Cancel
          </Button>
          <Button onClick={() => {
            // TODO: Persist settings to localStorage or DB
            alert("Settings saved! (Currently stored in session only)");
            router.push("/");
          }}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
