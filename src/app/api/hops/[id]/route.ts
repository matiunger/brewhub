import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const hop = await prisma.hop.update({
      where: { id },
      data: {
        name: body.name,
        origin: body.origin ?? null,
        form: body.form ?? null,
        hopType: body.hopType ?? null,
        alphaAcid: body.alphaAcid,
        betaAcid: body.betaAcid ?? null,
        profile: body.profile ?? null,
        styles: body.styles ?? null,
        alternatives: body.alternatives ?? null,
      },
    });
    return NextResponse.json(hop);
  } catch {
    return NextResponse.json({ error: "Failed to update hop" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.hop.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete hop" }, { status: 500 });
  }
}