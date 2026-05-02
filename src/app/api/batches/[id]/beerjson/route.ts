import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { batchToBeerjson } from "@/lib/beerjson";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      equipment: true,
      targetWaterProfile: true,
      grains: { include: { grain: true } },
      hops: { include: { hop: true } },
      yeasts: { include: { yeast: true } },
    },
  });

  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  const beerjson = batchToBeerjson(batch);
  const filename = `${batch.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;

  return new NextResponse(JSON.stringify(beerjson, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
