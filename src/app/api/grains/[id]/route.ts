import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const data = await request.json();
  const { id } = await params;
  const grain = await prisma.grain.update({
    where: { id },
    data,
  });
  return NextResponse.json(grain);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.grain.delete({
    where: { id },
  });
  return NextResponse.json({ success: true });
}