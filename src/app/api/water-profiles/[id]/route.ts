import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const profile = await prisma.waterProfile.update({
      where: { id },
      data: {
        name: body.name,
        caPpm: body.caPpm,
        mgPpm: body.mgPpm,
        naPpm: body.naPpm,
        clPpm: body.clPpm,
        so4Ppm: body.so4Ppm,
        znPpm: body.znPpm ?? null,
        hco3Ppm: body.hco3Ppm ?? null,
        pH: body.pH ?? null,
      },
    });
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json({ error: "Failed to update water profile" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.waterProfile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete water profile" }, { status: 500 });
  }
}