import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const equipment = await prisma.equipment.update({
      where: { id },
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
    return NextResponse.json({ error: "Failed to update equipment" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.equipment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete equipment" }, { status: 500 });
  }
}