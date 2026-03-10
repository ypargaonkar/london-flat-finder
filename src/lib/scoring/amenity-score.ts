/**
 * Detect amenities from listing description text using keyword matching
 */
export function detectAmenities(description: string): {
  hasWasher: boolean;
  hasDryer: boolean;
  hasModularKitchen: boolean;
  hasDishwasher: boolean;
  furnishing: string;
} {
  const text = (description || "").toLowerCase();

  const hasWasher =
    /washing machine|washer|washer[\s-]?dryer|laundry|w\/m/.test(text);

  const hasDryer =
    /tumble\s*dryer|dryer|washer[\s-]?dryer/.test(text);

  const hasModularKitchen =
    /fitted kitchen|modern kitchen|modular kitchen|fully fitted|integrated kitchen|open[- ]plan kitchen|designer kitchen/.test(text);

  const hasDishwasher =
    /dishwasher|dish washer|dish-washer/.test(text);

  let furnishing = "unknown";
  if (/\bunfurnished\b/.test(text)) {
    furnishing = "unfurnished";
  } else if (/\bpart[- ]?furnished\b/.test(text)) {
    furnishing = "part-furnished";
  } else if (/\bfurnished\b/.test(text)) {
    furnishing = "furnished";
  }

  return { hasWasher, hasDryer, hasModularKitchen, hasDishwasher, furnishing };
}

/**
 * Calculate amenity score (0-100)
 * Washer (+30), Dryer (+25), Modern kitchen (+25), Dishwasher (+10), Furnished (+10)
 */
export function computeAmenityScore(amenities: {
  hasWasher: boolean;
  hasDryer: boolean;
  hasModularKitchen: boolean;
  hasDishwasher: boolean;
  furnishing: string;
}): number {
  let score = 0;
  if (amenities.hasWasher) score += 30;
  if (amenities.hasDryer) score += 25;
  if (amenities.hasModularKitchen) score += 25;
  if (amenities.hasDishwasher) score += 10;
  if (amenities.furnishing === "furnished") score += 10;
  return Math.min(100, score);
}
