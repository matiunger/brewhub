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

  // Batches keep a link to the inventory item, so block deletes that are still in use
  const usedIn = await prisma.batchHop.findMany({
    where: { hopId: id },
    select: { batchId: true, batch: { select: { name: true } } },
  });
  if (usedIn.length > 0) {
    const batchCount = new Set(usedIn.map((u) => u.batchId)).size;
    const names = [...new Set(usedIn.map((u) => u.batch.name))];
    const shown = names.slice(0, 3).join(", ") + (names.length > 3 ? ", …" : "");
    return NextResponse.json(
      { error: `Can't delete: used in ${batchCount} batch${batchCount === 1 ? "" : "es"} (${shown})` },
      { status: 409 }
    );
  }

  try {
    await prisma.hop.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete hop" }, { status: 500 });
  }
}