import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [equipment, grains, hops, yeasts, waterProfiles, kegs] = await Promise.all([
    prisma.equipment.findMany(),
    prisma.grain.findMany(),
    prisma.hop.findMany(),
    prisma.yeast.findMany(),
    prisma.waterProfile.findMany(),
    prisma.keg.findMany(),
  ]);

  return NextResponse.json({ equipment, grains, hops, yeasts, waterProfiles, kegs });
}