import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function SaltsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Home
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold">Water Salts</h1>
      
      <Card>
        <CardContent className="prose prose-sm max-w-none">
          <h2>Common Brewing Salts</h2>

          <h3>Calcium Chloride (CaCl₂)</h3>
          <ul>
            <li>Increases Calcium and Chloride</li>
            <li>Enhances malt sweetness and fullness</li>
            <li>Good for: Malty styles, porters, stouts</li>
            <li>Typical use: 1-5 grams per batch</li>
          </ul>

          <h3>Calcium Sulfate (Gypsum) (CaSO₄)</h3>
          <ul>
            <li>Increases Calcium and Sulfate</li>
            <li>Enhances hop bitterness and crispness</li>
            <li>Good for: IPAs, pale ales, hoppy beers</li>
            <li>Typical use: 2-10 grams per batch</li>
          </ul>

          <h3>Magnesium Sulfate (Epsom Salt) (MgSO₄)</h3>
          <ul>
            <li>Increases Magnesium and Sulfate</li>
            <li>Can enhance hop character</li>
            <li>Use sparingly - too much creates harsh bitterness</li>
            <li>Typical use: 0-3 grams per batch</li>
          </ul>

          <h3>Sodium Chloride (Table Salt) (NaCl)</h3>
          <ul>
            <li>Increases Sodium and Chloride</li>
            <li>Rounds out malt flavors</li>
            <li>Use non-iodized salt only</li>
            <li>Typical use: 0-2 grams per batch</li>
          </ul>

          <h3>Baking Soda (NaHCO₃)</h3>
          <ul>
            <li>Increases Sodium and Bicarbonate</li>
            <li>Raises mash pH</li>
            <li>Use when brewing very dark beers</li>
            <li>Typical use: 0-5 grams per batch</li>
          </ul>

          <h2>Target Water Profiles</h2>
          
          <h3>Pale Ale / IPA</h3>
          <ul>
            <li>Ca: 100-150 ppm</li>
            <li>SO4: 200-400 ppm</li>
            <li>Cl: 50-100 ppm</li>
          </ul>

          <h3>Malty Styles (Stout, Porter)</h3>
          <ul>
            <li>Ca: 50-100 ppm</li>
            <li>SO4: 50-100 ppm</li>
            <li>Cl: 100-200 ppm</li>
          </ul>

          <h3>Light Lagers</h3>
          <ul>
            <li>Very soft water</li>
            <li>Minimal adjustments</li>
            <li>Focus on pH control</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}