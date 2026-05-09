import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  const { id } = await params;
  const grain = await prisma.grain.update({
    where: { id },
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
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.grain.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete grain" }, { status: 500 });
  }
}