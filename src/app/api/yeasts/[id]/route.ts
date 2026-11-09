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

  // Batches keep a link to the inventory item, so block deletes that are still in use
  const usedIn = await prisma.batchYeast.findMany({
    where: { yeastId: id },
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
    await prisma.yeast.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete culture" }, { status: 500 });
  }
}