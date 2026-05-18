import styles from "../../styles.json";

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

export function findStyleHints(style: string | null): StyleHints | null {
  if (!style) return null;
  const normalized = style.toLowerCase().trim();
  const entry = (styles as StyleEntry[]).find((s) =>
    s.number.toLowerCase() === normalized ||
    s.name.toLowerCase() === normalized ||
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
