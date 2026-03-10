/**
 * Composite listing score (0-100)
 *
 * | Factor    | Weight | Logic |
 * |-----------|--------|-------|
 * | Transport | 40%    | From station score + proximity |
 * | Amenities | 30%    | Washer, dryer, kitchen, dishwasher, furnished |
 * | Price     | 20%    | Cheaper within budget = better |
 * | Recency   | 10%    | Verified today = 100, not seen 7+ days = 0 |
 */
export function computeCompositeScore(params: {
  transportScore: number;
  amenityScore: number;
  pricePerMonth: number | null;
  firstSeenDate: string;
  lastSeenDate?: string;
}): number {
  const { transportScore, amenityScore, pricePerMonth, firstSeenDate, lastSeenDate } = params;

  // Price score: £1500 = 100, £2200 = 50, scale linearly
  let priceScore = 50;
  if (pricePerMonth !== null) {
    if (pricePerMonth <= 1500) priceScore = 100;
    else if (pricePerMonth >= 2200) priceScore = 50 - ((pricePerMonth - 2200) / 300) * 25;
    else priceScore = 100 - ((pricePerMonth - 1500) / 700) * 50;
    priceScore = Math.max(0, Math.min(100, priceScore));
  }

  // Recency score based on lastSeen (when we last verified the listing exists)
  // Verified today = 100, not seen for 7+ days = 0
  let recencyScore = 50;
  const recencyDate = lastSeenDate || firstSeenDate;
  try {
    const daysAgo = Math.floor(
      (Date.now() - new Date(recencyDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysAgo <= 0) recencyScore = 100;
    else if (daysAgo >= 7) recencyScore = 0;
    else recencyScore = 100 - (daysAgo / 7) * 100;
  } catch {
    // keep default
  }

  return Math.round(
    transportScore * 0.4 +
    amenityScore * 0.3 +
    priceScore * 0.2 +
    recencyScore * 0.1
  );
}

/**
 * Convert numeric score to letter grade
 */
export function scoreToGrade(score: number): string {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}

/**
 * Get color for score
 */
export function scoreToColor(score: number): string {
  if (score >= 80) return "#22c55e"; // green
  if (score >= 60) return "#84cc16"; // lime
  if (score >= 40) return "#eab308"; // yellow
  if (score >= 20) return "#f97316"; // orange
  return "#ef4444"; // red
}
