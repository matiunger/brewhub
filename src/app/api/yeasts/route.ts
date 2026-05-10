import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const yeasts = await prisma.yeast.findMany();
  return NextResponse.json(yeasts);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const yeast = await prisma.yeast.create({
      data: {
        name: body.name,
        brand: body.brand ?? null,
        type: body.type ?? null,
        cultureType: body.cultureType ?? null,
        temperatureRange: body.temperatureRange ?? null,
        profile: body.profile ?? null,
        uses: body.uses ?? null,
        attenuation: body.attenuation ?? null,
      },
    });
    return NextResponse.json(yeast);
  } catch {
    return NextResponse.json({ error: "Failed to create culture" }, { status: 500 });
  }
}