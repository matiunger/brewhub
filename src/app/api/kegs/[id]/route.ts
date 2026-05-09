import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  const { id } = await params;
  const keg = await prisma.keg.update({
    where: { id },
    data: {
      name: body.name,
      type: body.type ?? null,
      label: body.label ?? null,
      capacity: body.capacity,
      tareWeight: body.tareWeight ?? null,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(keg);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.keg.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete keg" }, { status: 500 });
  }
}