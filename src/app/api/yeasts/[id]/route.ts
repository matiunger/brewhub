import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const yeast = await prisma.yeast.update({
      where: { id },
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
    return NextResponse.json({ error: "Failed to update culture" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.yeast.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete culture" }, { status: 500 });
  }
}