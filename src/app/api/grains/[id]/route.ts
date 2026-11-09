import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
  } catch {
    return NextResponse.json({ error: "Failed to update grain" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Batches keep a link to the inventory item, so block deletes that are still in use
  const usedIn = await prisma.batchGrain.findMany({
    where: { grainId: id },
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
    await prisma.grain.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete grain" }, { status: 500 });
  }
}