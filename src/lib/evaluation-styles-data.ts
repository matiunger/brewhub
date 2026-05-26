import type { BeerStyle } from './evaluation-types';
import rawStyles from '@/data/bjcp_styles.json';
import rawBaStyles from '@/data/ba_styles.json';

function sortByStyleNumber(a: BeerStyle, b: BeerStyle): number {
  const parse = (n: string) => { const m = n.match(/^(\d+)([A-Za-z]*)$/); return m ? [parseInt(m[1]), m[2]] as [number, string] : [0, n] as [number, string]; };
  const [an, al] = parse(a.number);
  const [bn, bl] = parse(b.number);
  return an !== bn ? an - bn : al.localeCompare(bl);
}

const bjcpStyles = (rawStyles as BeerStyle[]).map((s) => ({ ...s, source: 'bjcp' as const }));
const baStyles = (rawBaStyles as BeerStyle[]).map((s) => ({ ...s, source: 'ba' as const }));

export const stylesData = bjcpStyles.slice().sort(sortByStyleNumber);
const allStyles = [...bjcpStyles, ...baStyles];

export function searchStyles(query: string): BeerStyle[] {
  if (!query.trim()) return stylesData;
  const q = query.toLowerCase();
  return stylesData.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.number.toLowerCase().includes(q)
  );
}

export function getStyleById(id: string): BeerStyle | undefined {
  return allStyles.find((s) => s.number === id || s.name === id);
}

export function findStyleByName(name: string): BeerStyle | undefined {
  if (!name) return undefined;
  const q = name.toLowerCase().trim();
  // Exact name match first (BJCP then BA)
  return (
    allStyles.find((s) => s.name.toLowerCase() === q) ??
    allStyles.find((s) => s.name.toLowerCase().includes(q) || q.includes(s.name.toLowerCase()))
  );
}
