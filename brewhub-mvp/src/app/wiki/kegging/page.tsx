import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function KeggingPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Home
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold">Kegging</h1>
      
      <Card>
        <CardContent className="prose prose-sm max-w-none">
          <h2>Equipment Needed</h2>
          <ul>
            <li>Cornelius (Corny) kegs or Sanke kegs</li>
            <li>CO2 tank and regulator</li>
            <li>Gas and liquid disconnects</li>
            <li>Beverage and gas tubing</li>
            <li>Tap or faucet</li>
          </ul>

          <h2>Keg Preparation</h2>
          <ol>
            <li>Disassemble keg completely</li>
            <li>Clean all parts with PBW</li>
            <li>Replace o-rings if needed</li>
            <li>Sanitize all parts</li>
            <li>Reassemble keg</li>
          </ol>

          <h2>Transferring Beer</h2>
          <ol>
            <li>Sanitize keg and all equipment</li>
            <li>Purge keg with CO2</li>
            <li>Transfer beer from fermenter to keg</li>
            <li>Seal keg and pressurize to 30 PSI</li>
            <li>Check for leaks with soapy water</li>
          </ol>

          <h2>Carbonation Methods</h2>
          <h3>Force Carbonation (Fast)</h3>
          <ul>
            <li>Set regulator to 30-40 PSI</li>
            <li>Shake keg vigorously for 5-10 minutes</li>
            <li>Let settle for 24 hours</li>
            <li>Reduce to serving pressure (8-12 PSI)</li>
          </ul>

          <h3>Set and Forget (Slow)</h3>
          <ul>
            <li>Set regulator to desired carbonation pressure (10-12 PSI)</li>
            <li>Wait 1-2 weeks at serving temperature</li>
            <li>Most consistent results</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}