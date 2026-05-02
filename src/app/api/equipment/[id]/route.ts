import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const data = await request.json();
  const { id } = await params;
  const equipment = await prisma.equipment.update({
    where: { id },
    data,
  });
  return NextResponse.json(equipment);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.equipment.delete({
    where: { id },
  });
  return NextResponse.json({ success: true });
}