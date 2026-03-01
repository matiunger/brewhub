import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function TipsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Home
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold">Brewing Tips</h1>
      
      <Card>
        <CardContent className="prose prose-sm max-w-none">
          <h2>General Tips</h2>
          
          <ul>
            <li>Keep detailed notes of every batch</li>
            <li>Temperature control is crucial - especially during fermentation</li>
            <li>Patience is key - rushing leads to mistakes</li>
            <li>Start with simple recipes and build complexity gradually</li>
            <li>Always have a backup plan (extra yeast, extra ingredients)</li>
          </ul>

          <h2>Mashing Tips</h2>
          
          <ul>
            <li>Mash temperature affects body: Lower (65°C) = drier, Higher (70°C) = sweeter</li>
            <li>Check mash pH - aim for 5.2-5.6</li>
            <li>Stir mash well to prevent dough balls</li>
            <li>Mash out at 75-78°C for easier sparging</li>
          </ul>

          <h2>Boiling Tips</h2>
          
          <ul>
            <li>Vigorous boil is important for DMS removal</li>
            <li>Don&apos;t overfill - account for hot break foam</li>
            <li>Add Irish Moss or Whirlfloc in last 15 minutes for clarity</li>
            <li>Late hop additions preserve aroma</li>
          </ul>

          <h2>Fermentation Tips</h2>
          
          <ul>
            <li>Pitch adequate yeast - use a starter for high gravity beers</li>
            <li>Oxygenate wort before pitching</li>
            <li>Keep fermentation temperature stable</li>
            <li>Avoid moving fermenter during active fermentation</li>
            <li>Give beer enough time - rushing leads to off-flavors</li>
          </ul>

          <h2>Common Off-Flavors</h2>
          
          <ul>
            <li><strong>Butter/Butterscotch:</strong> Diacetyl - warm fermentation, inadequate yeast health</li>
            <li><strong>Green Apple:</strong> Acetaldehyde - premature racking, incomplete fermentation</li>
            <li><strong>Solvent/Chemical:</strong> Esters - fermentation too warm</li>
            <li><strong>Vinyl/Plastic:</strong> Chlorophenol - using chlorinated water</li>
            <li><strong>Skunky:</strong> Lightstruck - exposure to UV light (use brown bottles)</li>
            <li><strong>Oxidized/Cardboard:</strong> Oxygen exposure - minimize splashing, purge with CO2</li>
          </ul>

          <h2>Record Keeping</h2>
          
          <p>Track these for every batch:</p>
          
          <ul>
            <li>Recipe and ingredient sources</li>
            <li>Mash temperature and duration</li>
            <li>Original gravity (OG)</li>
            <li>Fermentation temperature and duration</li>
            <li>Final gravity (FG)</li>
            <li>Tasting notes after conditioning</li>
            <li>What to improve next time</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}