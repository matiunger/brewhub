interface PintGlassProps {
  hex: string;
  size?: number;
}

function darkenColor(hex: string, amount = 0.08): string {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  const r = Math.max(0, Math.round(((num >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 0xff) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function PintGlass({ hex, size = 80 }: PintGlassProps) {
  const darkColor = darkenColor(hex);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Foam – left half (single rounded peak) */}
      <path
        style={{ fill: "#F2F2F4" }}
        d="M131.743,107.789 Q131.743,0 256,0 Q380.256,0 380.256,107.789 Z"
      />
      {/* Foam – right half highlight */}
      <path
        style={{ fill: "#DFDFE1" }}
        d="M256,0 Q380.256,0 380.256,107.789 H256 Z"
      />
      {/* Beer body – left half */}
      <path
        style={{ fill: hex }}
        d="M181.894,512
          c0-211.267-50.152-206.417-50.152-417.684
          h248.515
          c0,211.267-50.152,206.417-50.152,417.684
          H181.894z"
      />
      {/* Beer body – right half (darker) */}
      <path
        style={{ fill: darkColor }}
        d="M255.999,94.316V512h74.105
          c0-211.267,50.152-206.417,50.152-417.684
          H255.999z"
      />
    </svg>
  );
}
