import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CleaningPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Home
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold">Cleaning & Sanitization</h1>
      
      <Card>
        <CardContent className="prose prose-sm max-w-none">
          <h2>Why Clean & Sanitize?</h2>
          <p>
            Proper cleaning and sanitization are crucial for successful brewing. 
            Cleaning removes dirt, debris, and organic matter, while sanitizing 
            kills microorganisms that can spoil your beer.
          </p>

          <h2>Cleaning</h2>
          <ul>
            <li>Rinse equipment immediately after use</li>
            <li>Use PBW (Powdered Brewery Wash) or similar cleaner</li>
            <li>Soak for 15-30 minutes for stubborn residue</li>
            <li>Scrub with soft brush - avoid scratching plastic</li>
            <li>Rinse thoroughly with hot water</li>
          </ul>

          <h2>Sanitization</h2>
          <ul>
            <li>Clean first, then sanitize</li>
            <li>Use Star San, Iodophor, or similar sanitizer</li>
            <li>Follow manufacturer&apos;s dilution instructions</li>
            <li>Contact time: usually 1-2 minutes</li>
            <li>No rinse needed for most sanitizers</li>
            <li>Sanitize anything that touches wort/beer after boiling</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>Never use abrasive scrubbers on fermenters</li>
            <li>Replace scratched plastic equipment</li>
            <li>Store equipment dry to prevent mold</li>
            <li>Make fresh sanitizer solution for each brew day</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}