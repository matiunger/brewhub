// SRM color stops from the evaluation form
const SRM_STOPS: { srm: number; hex: string }[] = [
  { srm: 1,  hex: '#FFD878' },
  { srm: 3,  hex: '#FFCA5A' },
  { srm: 5,  hex: '#FFBF42' },
  { srm: 6,  hex: '#F8A600' },
  { srm: 8,  hex: '#E58500' },
  { srm: 10, hex: '#CF6900' },
  { srm: 12, hex: '#BB5100' },
  { srm: 15, hex: '#A63E00' },
  { srm: 23, hex: '#5E0B00' },
  { srm: 34, hex: '#36080A' },
];

export function srmToHex(srm: number): string {
  if (srm <= SRM_STOPS[0].srm) return SRM_STOPS[0].hex;
  if (srm >= SRM_STOPS[SRM_STOPS.length - 1].srm) return SRM_STOPS[SRM_STOPS.length - 1].hex;
  for (let i = 0; i < SRM_STOPS.length - 1; i++) {
    const lo = SRM_STOPS[i];
    const hi = SRM_STOPS[i + 1];
    if (srm >= lo.srm && srm <= hi.srm) {
      const t = (srm - lo.srm) / (hi.srm - lo.srm);
      return lerpHex(lo.hex, hi.hex, t);
    }
  }
  return SRM_STOPS[SRM_STOPS.length - 1].hex;
}

function lerpHex(a: string, b: string, t: number): string {
  const r = Math.round(lerp(parseInt(a.slice(1, 3), 16), parseInt(b.slice(1, 3), 16), t));
  const g = Math.round(lerp(parseInt(a.slice(3, 5), 16), parseInt(b.slice(3, 5), 16), t));
  const bl = Math.round(lerp(parseInt(a.slice(5, 7), 16), parseInt(b.slice(5, 7), 16), t));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
