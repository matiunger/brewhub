import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const data = await request.json();
  const { id } = await params;
  const keg = await prisma.keg.update({
    where: { id },
    data,
  });
  return NextResponse.json(keg);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.keg.delete({
    where: { id },
  });
  return NextResponse.json({ success: true });
}