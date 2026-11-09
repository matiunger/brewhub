/** Numeric min/max for a style guide field pair (e.g. "ogmin"/"ogmax"); null when missing. */
export function getStyleRange(
  entry: Record<string, string> | null,
  minKey: string,
  maxKey: string
): { min: number | null; max: number | null } {
  if (!entry) return { min: null, max: null };
  const min = parseFloat(entry[minKey]);
  const max = parseFloat(entry[maxKey]);
  return { min: isNaN(min) ? null : min, max: isNaN(max) ? null : max };
}
