import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const equipment = await prisma.equipment.findMany();
  return NextResponse.json(equipment);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const equipment = await prisma.equipment.create({
      data: {
        name: body.name,
        brewhouseEfficiency: body.brewhouseEfficiency,
        mashEfficiency: body.mashEfficiency ?? null,
        mashTunVolumeL: body.mashTunVolumeL ?? null,
        mashTunDeadSpaceL: body.mashTunDeadSpaceL ?? null,
        mashTunLossL: body.mashTunLossL ?? null,
        boilPotVolumeL: body.boilPotVolumeL ?? null,
        boilPotDiameter: body.boilPotDiameter ?? null,
        boilEvaporationRateLH: body.boilEvaporationRateLH ?? null,
        heatingEvaporationRateLH: body.heatingEvaporationRateLH ?? null,
        spargeWaterPotDiameter: body.spargeWaterPotDiameter ?? null,
        grainAbsorptionLKg: body.grainAbsorptionLKg ?? null,
        fermenterVolumeL: body.fermenterVolumeL ?? null,
        fermenterWeightKg: body.fermenterWeightKg ?? null,
        fermenterLossL: body.fermenterLossL,
        trubLossL: body.trubLossL,
        systemLossPercent: body.systemLossPercent ?? null,
        tempContractionPercent: body.tempContractionPercent ?? null,
      },
    });
    return NextResponse.json(equipment);
  } catch {
    return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 });
  }
}