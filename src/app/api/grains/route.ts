import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const grains = await prisma.grain.findMany();
  return NextResponse.json(grains);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const grain = await prisma.grain.create({
      data: {
        name: body.name,
        type: body.type ?? null,
        origin: body.origin ?? null,
        grainGroup: body.grainGroup ?? null,
        brand: body.brand ?? null,
        maxYield: body.maxYield ?? null,
        colorL: body.colorL ?? null,
        profile: body.profile ?? null,
        uses: body.uses ?? null,
      },
    });
    return NextResponse.json(grain);
  } catch {
    return NextResponse.json({ error: "Failed to create grain" }, { status: 500 });
  }
}