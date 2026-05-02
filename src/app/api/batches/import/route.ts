import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { beerjsonToBatchData, BeerJson } from "@/lib/beerjson";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const beerjson = body as BeerJson;
  if (!beerjson?.beerjson?.recipes?.length) {
    return NextResponse.json(
      { error: "Invalid BeerJSON: missing beerjson.recipes" },
      { status: 400 }
    );
  }

  const recipe = beerjson.beerjson.recipes[0];
  const data = beerjsonToBatchData(recipe);

  const batch = await prisma.$transaction(async (tx) => {
    // Find-or-create grains (case-insensitive via JS filter)
    const grainIds: { grainId: string; grams: number }[] = [];
    for (const g of data.grains) {
      const allGrains = await tx.grain.findMany();
      const existing = allGrains.find(
        (r) => r.name.toLowerCase() === g.name.toLowerCase()
      );
      const grain = existing ?? (await tx.grain.create({
        data: { name: g.name, brand: g.brand, colorL: g.colorL, maxYield: g.maxYield },
      }));
      grainIds.push({ grainId: grain.id, grams: g.grams });
    }

    // Find-or-create hops
    const hopIds: { hopId: string; grams: number; additionTime: number; use: string }[] = [];
    for (const h of data.hops) {
      const allHops = await tx.hop.findMany();
      const existing = allHops.find(
        (r) => r.name.toLowerCase() === h.name.toLowerCase()
      );
      const hop = existing ?? (await tx.hop.create({
        data: { name: h.name, alphaAcid: h.alphaAcid },
      }));
      hopIds.push({ hopId: hop.id, grams: h.grams, additionTime: h.additionTime, use: h.use });
    }

    // Find-or-create yeasts
    const yeastIds: { yeastId: string; quantity: string; temp: number | null }[] = [];
    for (const y of data.yeasts) {
      const allYeasts = await tx.yeast.findMany();
      const existing = allYeasts.find(
        (r) => r.name.toLowerCase() === y.name.toLowerCase()
      );
      const yeast = existing ?? (await tx.yeast.create({
        data: { name: y.name, brand: y.brand, type: y.type, attenuation: y.attenuation },
      }));
      yeastIds.push({ yeastId: yeast.id, quantity: y.quantity, temp: y.temp });
    }

    // Find-or-create water profile
    let targetWaterProfileId: string | undefined;
    if (data.waterProfile) {
      const allProfiles = await tx.waterProfile.findMany();
      const existing = allProfiles.find(
        (r) => r.name.toLowerCase() === data.waterProfile!.name.toLowerCase()
      );
      const profile = existing ?? (await tx.waterProfile.create({
        data: {
          name: data.waterProfile.name,
          caPpm: data.waterProfile.caPpm,
          mgPpm: data.waterProfile.mgPpm,
          naPpm: data.waterProfile.naPpm,
          clPpm: data.waterProfile.clPpm,
          so4Ppm: data.waterProfile.so4Ppm,
          znPpm: data.waterProfile.znPpm,
          hco3Ppm: data.waterProfile.hco3Ppm,
        },
      }));
      targetWaterProfileId = profile.id;
    }

    // Create batch with all relations
    return tx.batch.create({
      data: {
        ...data.batch,
        targetWaterProfileId,
        grains: { create: grainIds },
        hops: { create: hopIds },
        yeasts: { create: yeastIds },
      },
    });
  });

  return NextResponse.json({ id: batch.id }, { status: 201 });
}
