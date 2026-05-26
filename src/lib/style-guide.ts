import bjcpStyles from "../../styles.json";
import baStyles from "../data/ba_styles.json";

export interface StyleHints {
  appearance: string;
  aroma: string;
  flavor: string;
  mouthfeel: string;
  overall: string;
}

interface StyleEntry {
  name: string;
  number: string;
  aroma: string;
  appearance: string;
  flavor: string;
  mouthfeel: string;
  overallimpression: string;
}

const allStyles = [
  ...bjcpStyles as StyleEntry[],
  ...(baStyles as StyleEntry[]).map((s) => ({ ...s, number: `BA: ${s.name}` })),
];

export function findStyleHints(style: string | null): StyleHints | null {
  if (!style) return null;
  const normalized = style.toLowerCase().trim();
  const entry = allStyles.find((s) =>
    s.number.toLowerCase() === normalized ||
    s.name.toLowerCase() === normalized ||
    `ba: ${s.name}`.toLowerCase() === normalized ||
    s.name.toLowerCase().includes(normalized) ||
    normalized.includes(s.name.toLowerCase())
  );
  if (!entry) return null;
  return {
    appearance: entry.appearance,
    aroma: entry.aroma,
    flavor: entry.flavor,
    mouthfeel: entry.mouthfeel,
    overall: entry.overallimpression,
  };
}
