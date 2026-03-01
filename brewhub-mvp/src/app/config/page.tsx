import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getData() {
  const [equipment, grains, hops, yeasts, waterProfiles, kegs] = await Promise.all([
    prisma.equipment.findMany(),
    prisma.grain.findMany(),
    prisma.hop.findMany(),
    prisma.yeast.findMany(),
    prisma.waterProfile.findMany(),
    prisma.keg.findMany(),
  ]);

  return { equipment, grains, hops, yeasts, waterProfiles, kegs };
}

export default async function ConfigPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuration</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Equipment ({data.equipment.length})</CardTitle>
            <Link href="/config/equipment/new">
              <Button size="sm">+ Add</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Brewhouse Efficiency</TableHead>
                  <TableHead>Fermenter Loss</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.equipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.brewhouseEfficiency}%</TableCell>
                    <TableCell>{item.fermenterLossL} L</TableCell>
                    <TableCell>
                      <Link href={`/config/equipment/${item.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {data.equipment.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No equipment yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Grains ({data.grains.length})</CardTitle>
            <Link href="/config/grains/new">
              <Button size="sm">+ Add</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Max Yield</TableHead>
                  <TableHead>Color (L)</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.grains.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.brand || "-"}</TableCell>
                    <TableCell>{item.maxYield || "-"}</TableCell>
                    <TableCell>{item.colorL || "-"}</TableCell>
                    <TableCell>
                      <Link href={`/config/grains/${item.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {data.grains.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No grains yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Hops ({data.hops.length})</CardTitle>
            <Link href="/config/hops/new">
              <Button size="sm">+ Add</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Alpha Acid</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.hops.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.alphaAcid}%</TableCell>
                    <TableCell>{item.profile || "-"}</TableCell>
                    <TableCell>
                      <Link href={`/config/hops/${item.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {data.hops.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hops yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Yeasts ({data.yeasts.length})</CardTitle>
            <Link href="/config/yeasts/new">
              <Button size="sm">+ Add</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Attenuation</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.yeasts.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.brand || "-"}</TableCell>
                    <TableCell>{item.type || "-"}</TableCell>
                    <TableCell>{item.attenuation ? `${item.attenuation}%` : "-"}</TableCell>
                    <TableCell>
                      <Link href={`/config/yeasts/${item.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {data.yeasts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No yeasts yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Water Profiles ({data.waterProfiles.length})</CardTitle>
            <Link href="/config/water-profiles/new">
              <Button size="sm">+ Add</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Ca</TableHead>
                  <TableHead>Mg</TableHead>
                  <TableHead>Na</TableHead>
                  <TableHead>Cl</TableHead>
                  <TableHead>SO4</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.waterProfiles.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.caPpm} ppm</TableCell>
                    <TableCell>{item.mgPpm} ppm</TableCell>
                    <TableCell>{item.naPpm} ppm</TableCell>
                    <TableCell>{item.clPpm} ppm</TableCell>
                    <TableCell>{item.so4Ppm} ppm</TableCell>
                    <TableCell>
                      <Link href={`/config/water-profiles/${item.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {data.waterProfiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No water profiles yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Kegs ({data.kegs.length})</CardTitle>
            <Link href="/config/kegs/new">
              <Button size="sm">+ Add</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Tare Weight</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.kegs.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.number || "-"}</TableCell>
                    <TableCell>{item.capacity} L</TableCell>
                    <TableCell>{item.tareWeight ? `${item.tareWeight} kg` : "-"}</TableCell>
                    <TableCell>
                      <Link href={`/config/kegs/${item.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {data.kegs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No kegs yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}